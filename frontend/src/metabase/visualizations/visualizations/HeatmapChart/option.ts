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

const categoryLabel = (value: RowValue): string | null => {
  if (value == null) {
    return null;
  }
  return String(value);
};

export function getHeatmapChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const xCol = findColumn(cols, settings["heatmap.x"]);
  const yCol = findColumn(cols, settings["heatmap.y"]);
  const valueCol = findColumn(cols, settings["heatmap.value"]);

  if (xCol == null || yCol == null || valueCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const xIdx = cols.indexOf(xCol);
  const yIdx = cols.indexOf(yCol);
  const valueIdx = cols.indexOf(valueCol);

  const xCategories: string[] = [];
  const yCategories: string[] = [];
  const xIndex = new Map<string, number>();
  const yIndex = new Map<string, number>();
  const totals = new Map<string, number>();

  for (const row of rows) {
    const xLabel = categoryLabel(row[xIdx]);
    const yLabel = categoryLabel(row[yIdx]);
    if (xLabel == null || yLabel == null) {
      continue;
    }
    if (!xIndex.has(xLabel)) {
      xIndex.set(xLabel, xCategories.length);
      xCategories.push(xLabel);
    }
    if (!yIndex.has(yLabel)) {
      yIndex.set(yLabel, yCategories.length);
      yCategories.push(yLabel);
    }
    const numeric = toFiniteNumber(row[valueIdx]) ?? 0;
    const key = `${xIndex.get(xLabel)}:${yIndex.get(yLabel)}`;
    totals.set(key, (totals.get(key) ?? 0) + numeric);
  }

  const heatmapData = Array.from(totals.entries()).map(([key, value]) => {
    const [x, y] = key.split(":").map(Number);
    return [x, y, value];
  });
  const values = heatmapData.map((point) => point[2]);
  const dataMin = values.length === 0 ? 0 : Math.min(...values);
  const dataMax = values.length === 0 ? 1 : Math.max(...values);
  const configuredMin = toFiniteNumber(settings["heatmap.color_min"] as RowValue);
  const configuredMax = toFiniteNumber(settings["heatmap.color_max"] as RowValue);
  const minValue = configuredMin ?? dataMin;
  const rawMax = configuredMax ?? dataMax;
  const maxValue = rawMax === minValue ? minValue + 1 : rawMax;
  const showValues = settings["heatmap.show_values"] === true;
  const brand = renderingContext.getColor("core-brand");
  const lightBrand = renderingContext.getColor("background_page-primary");

  return {
    ...getEChartsAnimationOptions(isAnimated),
    textStyle: {
      fontFamily: renderingContext.fontFamily,
      color: renderingContext.getColor("text-primary"),
    },
    tooltip: {
      position: "top",
    },
    grid: {
      containLabel: true,
      left: 16,
      right: 16,
      top: 16,
      bottom: 56,
    },
    xAxis: {
      type: "category",
      data: xCategories,
      name: xCol.display_name || xCol.name,
      nameLocation: "middle",
      nameGap: 28,
      splitArea: { show: true },
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    yAxis: {
      type: "category",
      data: yCategories,
      name: yCol.display_name || yCol.name,
      nameLocation: "middle",
      nameGap: 48,
      splitArea: { show: true },
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    visualMap: {
      min: minValue,
      max: maxValue,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 8,
      inRange: {
        color: [lightBrand, brand],
      },
      textStyle: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    series: [
      {
        type: "heatmap",
        name: valueCol.display_name || valueCol.name,
        data: heatmapData,
        label: {
          show: showValues,
          color: renderingContext.getColor("text-primary"),
          fontFamily: renderingContext.fontFamily,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowColor: "rgba(0, 0, 0, 0.25)",
          },
        },
      },
    ],
  } as EChartsCoreOption;
}
