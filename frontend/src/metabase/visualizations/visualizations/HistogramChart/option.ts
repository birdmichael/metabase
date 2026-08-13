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

export function createHistogramBins(
  values: number[],
  requestedBins?: number,
): { label: string; count: number; start: number; end: number }[] {
  if (values.length === 0) {
    return [];
  }
  const sturges = Math.ceil(Math.log2(values.length) + 1);
  const binCount =
    requestedBins != null && Number.isFinite(requestedBins) && requestedBins >= 2
      ? Math.max(2, Math.min(50, Math.round(requestedBins)))
      : Math.max(5, Math.min(15, sturges || 10));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const span = maxValue - minValue || 1;
  const width = span / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => {
    const start = minValue + index * width;
    const end = start + width;
    return { label: `${start.toFixed(1)}–${end.toFixed(1)}`, count: 0, start, end };
  });
  for (const value of values) {
    let index = Math.floor((value - minValue) / width);
    if (index >= binCount) {
      index = binCount - 1;
    }
    if (index < 0) {
      index = 0;
    }
    bins[index].count += 1;
  }
  return bins;
}

export function getHistogramChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const metricCol = findColumn(cols, settings["histogram.metric"]);

  if (metricCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const metricIdx = cols.indexOf(metricCol);
  const values: number[] = [];
  for (const row of rows) {
    const numeric = toFiniteNumber(row[metricIdx]);
    if (numeric != null) {
      values.push(numeric);
    }
  }
  const configuredBins = toFiniteNumber(settings["histogram.bins"] as RowValue);
  const bins = createHistogramBins(
    values,
    configuredBins ?? undefined,
  );
  const brand = renderingContext.getColor("core-brand");

  return {
    ...getEChartsAnimationOptions(isAnimated),
    textStyle: {
      fontFamily: renderingContext.fontFamily,
      color: renderingContext.getColor("text-primary"),
    },
    tooltip: { trigger: "item" },
    grid: {
      containLabel: true,
      left: 16,
      right: 16,
      top: 16,
      bottom: 32,
    },
    xAxis: {
      type: "category",
      data: bins.map((bin) => bin.label),
      name: metricCol.display_name || metricCol.name,
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
        rotate: 30,
      },
    },
    yAxis: {
      type: "value",
      name: "Frequency",
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    series: [
      {
        type: "bar",
        name: "Frequency",
        data: bins.map((bin) => bin.count),
        barCategoryGap: "0%",
        itemStyle: { color: brand },
      },
    ],
  } as EChartsCoreOption;
}

