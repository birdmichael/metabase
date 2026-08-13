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

export function getWaffleChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const dimensionCol = findColumn(cols, settings["waffle.dimension"]);
  const metricCol = findColumn(cols, settings["waffle.metric"]);

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
  const total = order.reduce(
    (sum, name) => sum + Math.abs(totals.get(name) ?? 0),
    0,
  );
  const gridSize = 10;
  const cellCount = gridSize * gridSize;
  const shares = order.map((name) => {
    const value = Math.abs(totals.get(name) ?? 0);
    const exact = total === 0 ? 0 : (value / total) * cellCount;
    return {
      name,
      value,
      floor: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });
  let remaining = cellCount - shares.reduce((sum, item) => sum + item.floor, 0);
  const sorted = [...shares].sort((a, b) => b.remainder - a.remainder);
  const extra = new Map<string, number>();
  for (const item of sorted) {
    if (remaining <= 0) {
      break;
    }
    extra.set(item.name, 1);
    remaining -= 1;
  }
  const cells: { name: string; value: number }[] = [];
  for (const item of shares) {
    const count = item.floor + (extra.get(item.name) ?? 0);
    for (let i = 0; i < count; i++) {
      cells.push({ name: item.name, value: item.value });
    }
  }
  while (cells.length < cellCount) {
    cells.push({ name: order[0] ?? "", value: 0 });
  }

  const scatterData = cells.slice(0, cellCount).map((cell, index) => ({
    value: [index % gridSize, gridSize - 1 - Math.floor(index / gridSize)],
    name: cell.name,
    itemStyle: { color: colors[cell.name] },
  }));
  const showLegend = settings["waffle.show_legend"] !== false;

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
      show: showLegend,
      data: order,
      textStyle: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    grid: {
      left: 12,
      right: 12,
      top: showLegend ? 36 : 12,
      bottom: 12,
    },
    xAxis: {
      type: "value",
      min: -0.5,
      max: gridSize - 0.5,
      show: false,
    },
    yAxis: {
      type: "value",
      min: -0.5,
      max: gridSize - 0.5,
      show: false,
    },
    series: order.map((name) => ({
      type: "scatter",
      name,
      symbol: "rect",
      symbolSize: 18,
      data: scatterData.filter((cell) => cell.name === name),
      itemStyle: { color: colors[name] },
    })),
  } as EChartsCoreOption;
}
