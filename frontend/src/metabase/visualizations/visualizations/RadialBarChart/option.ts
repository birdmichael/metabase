import type { EChartsCoreOption } from "echarts/core";

import { getColorsForValues } from "metabase/ui/colors/charts";
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

export function getRadialBarChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const dimensionCol = findColumn(cols, settings["radialbar.dimension"]);
  const metricCol = findColumn(cols, settings["radialbar.metric"]);

  if (dimensionCol == null || metricCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const dimensionIdx = cols.indexOf(dimensionCol);
  const metricIdx = cols.indexOf(metricCol);
  const totals = new Map<string, number>();
  const order: string[] = [];

  for (const row of rows) {
    const rawDimension = row[dimensionIdx];
    if (rawDimension == null) {
      continue;
    }
    const name = String(rawDimension);
    if (!totals.has(name)) {
      order.push(name);
      totals.set(name, 0);
    }
    totals.set(
      name,
      (totals.get(name) ?? 0) + (toFiniteNumber(row[metricIdx]) ?? 0),
    );
  }


  const colors = getColorsForValues(order, settings["series_settings.colors"]);
  const values = order.map((name) => totals.get(name) ?? 0);
  const configuredMax = toFiniteNumber(settings["radialbar.max"] as RowValue);
  const maxValue =
    configuredMax != null && configuredMax > 0
      ? configuredMax
      : Math.max(1, ...values);
  const showLabels = settings["radialbar.show_labels"] !== false;

  return {
    ...getEChartsAnimationOptions(isAnimated),
    textStyle: {
      fontFamily: renderingContext.fontFamily,
      color: renderingContext.getColor("text-primary"),
    },
    tooltip: {
      trigger: "item",
    },
    polar: {
      radius: ["18%", "78%"],
    },
    angleAxis: {
      type: "value",
      min: 0,
      max: maxValue,
      startAngle: 90,
      axisLine: { show: false },
      splitLine: {
        lineStyle: {
          color: renderingContext.getColor("border-neutral-strong"),
        },
      },
    },
    radiusAxis: {
      type: "category",
      data: order,
      axisLabel: {
        show: showLabels,
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    series: [
      {
        type: "bar",
        coordinateSystem: "polar",
        data: order.map((name) => ({
          name,
          value: totals.get(name) ?? 0,
          itemStyle: { color: colors[name] },
        })),
      },
    ],
  } as EChartsCoreOption;
}

