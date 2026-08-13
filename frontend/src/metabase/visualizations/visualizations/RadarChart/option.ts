import type { EChartsCoreOption } from "echarts/core";

import { getColorsForValues } from "metabase/ui/colors/charts";
import { getEChartsAnimationOptions } from "metabase/visualizations/echarts/animation";
import type {
  ComputedVisualizationSettings,
  RenderingContext,
} from "metabase/visualizations/types";
import type { DatasetColumn, RawSeries, RowValue } from "metabase-types/api";

import { getRadarMetricNames } from "./utils";

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

export function getRadarChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const dimensionCol = findColumn(cols, settings["radar.dimension"]);
  const metricCols = getRadarMetricNames(settings)
    .map((name) => findColumn(cols, name))
    .filter((col): col is DatasetColumn => col != null);

  if (dimensionCol == null || metricCols.length === 0) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const dimensionIdx = cols.indexOf(dimensionCol);
  const metricIndexes = metricCols.map((col) => cols.indexOf(col));

  const indicatorOrder: string[] = [];
  const indicatorIndex = new Map<string, number>();
  const valuesByMetric = metricCols.map(() => [] as number[]);

  for (const row of rows) {
    const rawDimension = row[dimensionIdx];
    if (rawDimension == null) {
      continue;
    }
    const indicator = String(rawDimension);
    let index = indicatorIndex.get(indicator);
    if (index == null) {
      index = indicatorOrder.length;
      indicatorIndex.set(indicator, index);
      indicatorOrder.push(indicator);
      for (const seriesValues of valuesByMetric) {
        seriesValues.push(0);
      }
    }
    metricIndexes.forEach((colIndex, metricIndex) => {
      const numeric = toFiniteNumber(row[colIndex]);
      if (numeric != null) {
        valuesByMetric[metricIndex][index] += numeric;
      }
    });
  }

  const globalMax = Math.max(0, ...valuesByMetric.flat());
  const configuredMax = toFiniteNumber(settings["radar.scale_max"] as RowValue);
  const indicatorMax =
    configuredMax != null && configuredMax > 0
      ? configuredMax
      : globalMax === 0
        ? 1
        : globalMax * 1.05;
  const showLegend = settings["radar.show_legend"] !== false;
  const showLabels = settings["radar.show_labels"] !== false;
  const colors = getColorsForValues(
    metricCols.map((col) => col.name),
    settings["series_settings.colors"],
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
      show: showLegend,
      textStyle: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    radar: {
      indicator: indicatorOrder.map((name) => ({
        name,
        max: indicatorMax,
      })),
      axisName: {
        show: showLabels,
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
      splitLine: {
        lineStyle: {
          color: renderingContext.getColor("border-neutral-strong"),
        },
      },
    },
    series: [
      {
        type: "radar",
        data: metricCols.map((col, index) => ({
          name: col.display_name || col.name,
          value: valuesByMetric[index],
          itemStyle: {
            color: colors[col.name],
          },
          lineStyle: {
            color: colors[col.name],
          },
          areaStyle: {
            color: colors[col.name],
            opacity: 0.15,
          },
        })),
      },
    ],
  } as EChartsCoreOption;
}
