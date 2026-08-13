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

export function getParetoChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const dimensionCol = findColumn(cols, settings["pareto.dimension"]);
  const metricCol = findColumn(cols, settings["pareto.metric"]);

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
  const sorted = [...order].sort(
    (a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0),
  );
  const values = sorted.map((name) => totals.get(name) ?? 0);
  const grand = values.reduce((sum, value) => sum + value, 0);
  let running = 0;
  const cumulative = values.map((value) => {
    running += value;
    return grand === 0 ? 0 : (running / grand) * 100;
  });
  const brand = renderingContext.getColor("core-brand");
  const showLegend = settings["pareto.show_legend"] !== false;
  const showValues = settings["pareto.show_values"] === true;

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
      textStyle: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    grid: {
      containLabel: true,
      left: 16,
      right: 48,
      top: 16,
      bottom: 32,
    },
    xAxis: {
      type: "category",
      data: sorted,
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    yAxis: [
      {
        type: "value",
        axisLabel: {
          color: renderingContext.getColor("text-secondary"),
          fontFamily: renderingContext.fontFamily,
        },
      },
      {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: {
          formatter: "{value}%",
          color: renderingContext.getColor("text-secondary"),
          fontFamily: renderingContext.fontFamily,
        },
      },
    ],
    series: [
      {
        type: "bar",
        name: metricCol.display_name || metricCol.name,
        data: sorted.map((name) => ({
          value: totals.get(name) ?? 0,
          itemStyle: { color: colors[name] },
        })),
        label: {
          show: showValues,
          position: "top",
          color: renderingContext.getColor("text-primary"),
          fontFamily: renderingContext.fontFamily,
        },
      },
      {
        type: "line",
        name: "Cumulative",
        yAxisIndex: 1,
        data: cumulative,
        itemStyle: { color: brand },
        lineStyle: { color: brand },
      },
    ],
  } as EChartsCoreOption;
}

