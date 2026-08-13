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

export function getPyramidChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const categoryCol = findColumn(cols, settings["pyramid.category"]);
  const leftCol = findColumn(cols, settings["pyramid.left"]);
  const rightCol = findColumn(cols, settings["pyramid.right"]);

  if (categoryCol == null || leftCol == null || rightCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const categoryIdx = cols.indexOf(categoryCol);
  const leftIdx = cols.indexOf(leftCol);
  const rightIdx = cols.indexOf(rightCol);
  const order: string[] = [];
  const leftTotals = new Map<string, number>();
  const rightTotals = new Map<string, number>();

  for (const row of rows) {
    if (row[categoryIdx] == null) {
      continue;
    }
    const name = String(row[categoryIdx]);
    if (!leftTotals.has(name)) {
      order.push(name);
      leftTotals.set(name, 0);
      rightTotals.set(name, 0);
    }
    leftTotals.set(name, (leftTotals.get(name) ?? 0) + (toFiniteNumber(row[leftIdx]) ?? 0));
    rightTotals.set(name, (rightTotals.get(name) ?? 0) + (toFiniteNumber(row[rightIdx]) ?? 0));
  }

  const colors = getColorsForValues(
    [leftCol.name, rightCol.name],
    settings["series_settings.colors"],
  );
  const absMax = Math.max(
    1,
    ...order.map((name) => Math.abs(leftTotals.get(name) ?? 0)),
    ...order.map((name) => Math.abs(rightTotals.get(name) ?? 0)),
  );

  return {
    ...getEChartsAnimationOptions(isAnimated),
    textStyle: {
      fontFamily: renderingContext.fontFamily,
      color: renderingContext.getColor("text-primary"),
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      show: settings["pyramid.show_legend"] !== false,
      textStyle: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    grid: {
      containLabel: true,
      left: 16,
      right: 16,
      top: 32,
      bottom: 24,
    },
    xAxis: {
      type: "value",
      min: -absMax,
      max: absMax,
      axisLabel: {
        formatter: (value: number) => String(Math.abs(value)),
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    yAxis: {
      type: "category",
      data: order,
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    series: [
      {
        type: "bar",
        name: leftCol.display_name || leftCol.name,
        stack: "pyramid",
        data: order.map((name) => -(leftTotals.get(name) ?? 0)),
        itemStyle: { color: colors[leftCol.name] },
        label: {
          show: settings["pyramid.show_values"] === true,
          formatter: (params: { value: number }) => String(Math.abs(params.value)),
          color: renderingContext.getColor("text-primary"),
          fontFamily: renderingContext.fontFamily,
        },
      },
      {
        type: "bar",
        name: rightCol.display_name || rightCol.name,
        stack: "pyramid",
        data: order.map((name) => rightTotals.get(name) ?? 0),
        itemStyle: { color: colors[rightCol.name] },
        label: {
          show: settings["pyramid.show_values"] === true,
          color: renderingContext.getColor("text-primary"),
          fontFamily: renderingContext.fontFamily,
        },
      },
    ],
  } as EChartsCoreOption;
}

