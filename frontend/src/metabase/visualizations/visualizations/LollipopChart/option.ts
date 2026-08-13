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

export function getLollipopChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const dimensionCol = findColumn(cols, settings["lollipop.dimension"]);
  const metricCol = findColumn(cols, settings["lollipop.metric"]);

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
  const brand = renderingContext.getColor("core-brand");
  const values = order.map((name) => totals.get(name) ?? 0);
  const showValues = settings["lollipop.show_values"] === true;

  return {
    ...getEChartsAnimationOptions(isAnimated),
    textStyle: {
      fontFamily: renderingContext.fontFamily,
      color: renderingContext.getColor("text-primary"),
    },
    tooltip: {
      trigger: "item",
    },
    grid: {
      containLabel: true,
      left: 16,
      right: 16,
      top: 16,
      bottom: 32,
    },
    xAxis: {
      type: "category",
      data: order,
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    series: [
      {
        type: "bar",
        name: metricCol.display_name || metricCol.name,
        data: order.map((name) => ({
          value: totals.get(name) ?? 0,
          itemStyle: { color: colors[name] ?? brand },
        })),
        barWidth: 2,
        label: {
          show: showValues,
          position: "top",
          color: renderingContext.getColor("text-primary"),
          fontFamily: renderingContext.fontFamily,
        },
        z: 1,
      },
      {
        type: "pictorialBar",
        name: metricCol.display_name || metricCol.name,
        symbol: "circle",
        symbolSize: 12,
        symbolPosition: "end",
        data: values,
        itemStyle: { color: brand },
        z: 2,
      },
    ],
  } as EChartsCoreOption;
}

