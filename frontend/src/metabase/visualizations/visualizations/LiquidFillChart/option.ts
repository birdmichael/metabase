import type { EChartsCoreOption } from "echarts/core";

import { getEChartsAnimationOptions } from "metabase/visualizations/echarts/animation";
import type {
  ComputedVisualizationSettings,
  RenderingContext,
} from "metabase/visualizations/types";
import type { DatasetColumn, RawSeries, RowValue } from "metabase-types/api";

const toFiniteNumber = (value: RowValue): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const findColumn = (cols: DatasetColumn[], name: string | undefined) =>
  name == null ? undefined : cols.find((col) => col.name === name);

const wavePoints = (
  phase: number,
  fill: number,
  radius: number,
): number[][] => {
  const points: number[][] = [];
  const waterY = radius * (1 - 2 * fill);
  for (let i = 0; i <= 40; i++) {
    const x = -radius + (2 * radius * i) / 40;
    const y = waterY + Math.sin(i / 3 + phase) * (radius * 0.08);
    points.push([x, y]);
  }
  points.push([radius, radius]);
  points.push([-radius, radius]);
  return points;
};

export function getLiquidFillOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const metricCol = findColumn(cols, settings["liquid.metric"]);

  if (metricCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const metricIdx = cols.indexOf(metricCol);
  let value = 0;
  for (const row of rows) {
    value += toFiniteNumber(row[metricIdx]) ?? 0;
  }
  const configuredMax = toFiniteNumber(settings["liquid.max"] as RowValue);
  let max = configuredMax;
  if (max == null || max <= 0) {
    if (value <= 1) {
      max = 1;
    } else if (value <= 100) {
      max = 100;
    } else {
      max = value;
    }
  }
  const ratio = Math.max(0, Math.min(1, value / max));
  const brand = renderingContext.getColor("core-brand");
  const background = renderingContext.getColor("background_page-primary");
  const textColor = renderingContext.getColor("text-primary");
  const showPercent = settings["liquid.show_percent"] !== false;

  return {
    ...getEChartsAnimationOptions(isAnimated),
    textStyle: {
      fontFamily: renderingContext.fontFamily,
      color: textColor,
    },
    tooltip: { show: false },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: "value", min: -1, max: 1, show: false },
    yAxis: { type: "value", min: -1, max: 1, show: false },
    series: [
      {
        type: "custom",
        coordinateSystem: "cartesian2d",
        data: [[0, 0, ratio]],
        renderItem: (
          _params: unknown,
          api: {
            getWidth: () => number;
            getHeight: () => number;
            value: (i: number) => number;
          },
        ) => {
          const fill = Math.max(0, Math.min(1, api.value(2)));
          const cx = api.getWidth() / 2;
          const cy = api.getHeight() / 2;
          const radius = Math.max(
            24,
            Math.min(api.getWidth(), api.getHeight()) * 0.42,
          );
          const points = wavePoints(0, fill, radius).map(([x, y]) => [
            x + cx,
            y + cy,
          ]);
          const children: Record<string, unknown>[] = [
            {
              type: "circle",
              shape: { cx, cy, r: radius },
              style: {
                stroke: brand,
                lineWidth: 3,
                fill: background,
              },
            },
            {
              type: "polygon",
              shape: { points },
              style: { fill: brand, opacity: 0.65 },
              clipPath: {
                type: "circle",
                shape: { cx, cy, r: radius },
              },
            },
          ];
          if (showPercent) {
            children.push({
              type: "text",
              style: {
                text: `${Math.round(fill * 100)}%`,
                x: cx,
                y: cy,
                fill: textColor,
                fontSize: Math.max(16, Math.round(radius * 0.32)),
                fontWeight: 600,
                fontFamily: renderingContext.fontFamily,
                textAlign: "center",
                textVerticalAlign: "middle",
              },
              z2: 10,
            });
          }
          return { type: "group", children };
        },
      },
    ],
  } as EChartsCoreOption;
}
