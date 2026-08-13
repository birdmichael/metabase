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

type BulletRow = {
  name: string;
  actual: number;
  target: number | null;
};

export function getBulletChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const actualCol = findColumn(cols, settings["bullet.actual"]);
  const targetCol = findColumn(cols, settings["bullet.target"]);
  const dimensionCol = findColumn(cols, settings["bullet.dimension"]);

  if (actualCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const actualIdx = cols.indexOf(actualCol);
  const targetIdx = targetCol == null ? -1 : cols.indexOf(targetCol);
  const dimensionIdx = dimensionCol == null ? -1 : cols.indexOf(dimensionCol);
  const settingTarget = toFiniteNumber(
    settings["bullet.target_value"] as RowValue,
  );
  const grouped = new Map<string, BulletRow>();
  const order: string[] = [];

  for (const row of rows) {
    const name =
      dimensionIdx >= 0 && row[dimensionIdx] != null
        ? String(row[dimensionIdx])
        : actualCol.display_name || actualCol.name;
    if (!grouped.has(name)) {
      order.push(name);
      grouped.set(name, { name, actual: 0, target: null });
    }
    const item = grouped.get(name);
    if (item == null) {
      continue;
    }
    item.actual += toFiniteNumber(row[actualIdx]) ?? 0;
    if (targetIdx >= 0) {
      item.target = (item.target ?? 0) + (toFiniteNumber(row[targetIdx]) ?? 0);
    } else if (settingTarget != null) {
      item.target = settingTarget;
    }
  }

  const items = order
    .map((name) => grouped.get(name))
    .filter((item): item is BulletRow => item != null);
  const maxValue = Math.max(
    1,
    ...items.map((item) => Math.max(item.actual, item.target ?? 0)),
  );
  const poor = maxValue * 0.5;
  const satisfactory = maxValue * 0.8;
  const brand = renderingContext.getColor("core-brand");
  const showRanges = settings["bullet.show_ranges"] !== false;
  const categories = items.map((item) => item.name);

  return {
    ...getEChartsAnimationOptions(isAnimated),
    textStyle: {
      fontFamily: renderingContext.fontFamily,
      color: renderingContext.getColor("text-primary"),
    },
    tooltip: { trigger: "axis" },
    grid: {
      containLabel: true,
      left: 16,
      right: 24,
      top: 24,
      bottom: 24,
    },
    xAxis: {
      type: "value",
      min: 0,
      max: maxValue * 1.1,
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    yAxis: {
      type: "category",
      data: categories,
      inverse: true,
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    series: [
      ...(showRanges
        ? [
            {
              type: "bar",
              name: "Poor",
              data: items.map(() => poor),
              barGap: "-100%",
              barWidth: 22,
              itemStyle: {
                color: renderingContext.getColor("error"),
                opacity: 0.25,
              },
              silent: true,
              z: 1,
            },
            {
              type: "bar",
              name: "Satisfactory",
              data: items.map(() => satisfactory),
              barGap: "-100%",
              barWidth: 22,
              itemStyle: {
                color: renderingContext.getColor("warning"),
                opacity: 0.25,
              },
              silent: true,
              z: 2,
            },
            {
              type: "bar",
              name: "Good",
              data: items.map(() => maxValue),
              barGap: "-100%",
              barWidth: 22,
              itemStyle: {
                color: renderingContext.getColor("success"),
                opacity: 0.25,
              },
              silent: true,
              z: 3,
            },
          ]
        : []),
      {
        type: "bar",
        name: actualCol.display_name || actualCol.name,
        data: items.map((item) => item.actual),
        barWidth: 10,
        itemStyle: { color: brand },
        z: 4,
      },
      ...(items.some((item) => item.target != null)
        ? [
            {
              type: "scatter",
              name: "Target",
              symbol: "rect",
              symbolSize: [4, 22],
              data: items.map((item, index) =>
                item.target == null ? null : [item.target, index],
              ),
              itemStyle: {
                color: renderingContext.getColor("text-primary"),
              },
              z: 5,
            },
          ]
        : []),
    ],
  } as EChartsCoreOption;
}
