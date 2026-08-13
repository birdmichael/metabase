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

const wavePoints = (phase: number, fill: number, radius: number): number[][] => {
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
  const radius = 90;
  const percent = `${Math.round(ratio * 100)}%`;
  const showPercent = settings["liquid.show_percent"] !== false;

  const wave = {
    type: "polygon",
    shape: { points: wavePoints(0, ratio, radius) },
    style: { fill: brand, opacity: 0.65 },
    clipPath: { type: "circle", shape: { r: radius } },
    ...(isAnimated
      ? {
          keyframeAnimation: {
            duration: 2400,
            loop: true,
            keyframes: [
              { percent: 0, shape: { points: wavePoints(0, ratio, radius) } },
              {
                percent: 100,
                shape: { points: wavePoints(Math.PI * 2, ratio, radius) },
              },
            ],
          },
        }
      : {}),
  };

  return {
    ...getEChartsAnimationOptions(isAnimated),
    textStyle: {
      fontFamily: renderingContext.fontFamily,
      color: renderingContext.getColor("text-primary"),
    },
    tooltip: { show: false },
    graphic: {
      elements: [
        {
          type: "group",
          left: "center",
          top: "center",
          children: [
            {
              type: "circle",
              shape: { r: radius },
              style: {
                stroke: brand,
                lineWidth: 3,
                fill: renderingContext.getColor("background_page-primary"),
              },
            },
            wave,
            ...(showPercent
              ? [
                  {
                    type: "text",
                    style: {
                      text: percent,
                      fill: renderingContext.getColor("text-primary"),
                      fontSize: 28,
                      fontWeight: 600,
                      fontFamily: renderingContext.fontFamily,
                      textAlign: "center",
                      textVerticalAlign: "middle",
                    },
                    z: 10,
                  },
                ]
              : []),
          ],
        },
      ],
    },
    series: [
      {
        type: "custom",
        data: [ratio],
        renderItem: () => ({ type: "group", children: [] }),
      },
    ],
  } as EChartsCoreOption;
}

