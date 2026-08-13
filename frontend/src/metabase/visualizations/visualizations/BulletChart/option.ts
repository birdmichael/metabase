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

  if (actualCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const actualIdx = cols.indexOf(actualCol);
  const targetIdx = targetCol == null ? -1 : cols.indexOf(targetCol);
  let actual = 0;
  let targetFromColumn: number | null = null;
  for (const row of rows) {
    actual += toFiniteNumber(row[actualIdx]) ?? 0;
    if (targetIdx >= 0) {
      targetFromColumn = (targetFromColumn ?? 0) + (toFiniteNumber(row[targetIdx]) ?? 0);
    }
  }
  const settingTarget = toFiniteNumber(
    settings["bullet.target_value"] as RowValue,
  );
  const target = targetFromColumn ?? settingTarget;
  const maxValue = Math.max(actual, target ?? 0, 1);
  const poor = maxValue * 0.5;
  const satisfactory = maxValue * 0.8;
  const brand = renderingContext.getColor("core-brand");

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
      data: [actualCol.display_name || actualCol.name],
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    series: [
      {
        type: "bar",
        name: "Poor",
        data: [poor],
        barGap: "-100%",
        barWidth: 22,
        itemStyle: { color: "rgba(234, 84, 85, 0.25)" },
        silent: true,
        z: 1,
      },
      {
        type: "bar",
        name: "Satisfactory",
        data: [satisfactory],
        barGap: "-100%",
        barWidth: 22,
        itemStyle: { color: "rgba(248, 192, 76, 0.25)" },
        silent: true,
        z: 2,
      },
      {
        type: "bar",
        name: "Good",
        data: [maxValue],
        barGap: "-100%",
        barWidth: 22,
        itemStyle: { color: "rgba(136, 188, 80, 0.25)" },
        silent: true,
        z: 3,
      },
      {
        type: "bar",
        name: actualCol.display_name || actualCol.name,
        data: [actual],
        barWidth: 10,
        itemStyle: { color: brand },
        z: 4,
      },
      ...(target == null
        ? []
        : [
            {
              type: "scatter",
              name: "Target",
              symbol: "rect",
              symbolSize: [4, 22],
              data: [[target, 0]],
              itemStyle: {
                color: renderingContext.getColor("text-primary"),
              },
              z: 5,
            },
          ]),
    ],
  } as EChartsCoreOption;
}

