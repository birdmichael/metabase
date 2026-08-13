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

export function getCandlestickChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const timeCol = findColumn(cols, settings["candlestick.time"]);
  const openCol = findColumn(cols, settings["candlestick.open"]);
  const closeCol = findColumn(cols, settings["candlestick.close"]);
  const lowCol = findColumn(cols, settings["candlestick.low"]);
  const highCol = findColumn(cols, settings["candlestick.high"]);

  if (
    timeCol == null ||
    openCol == null ||
    closeCol == null ||
    lowCol == null ||
    highCol == null
  ) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const timeIdx = cols.indexOf(timeCol);
  const openIdx = cols.indexOf(openCol);
  const closeIdx = cols.indexOf(closeCol);
  const lowIdx = cols.indexOf(lowCol);
  const highIdx = cols.indexOf(highCol);
  const categories: string[] = [];
  const ohlc: number[][] = [];

  for (const row of rows) {
    if (row[timeIdx] == null) {
      continue;
    }
    const open = toFiniteNumber(row[openIdx]);
    const close = toFiniteNumber(row[closeIdx]);
    const low = toFiniteNumber(row[lowIdx]);
    const high = toFiniteNumber(row[highIdx]);
    if (open == null || close == null || low == null || high == null) {
      continue;
    }
    categories.push(String(row[timeIdx]));
    ohlc.push([open, close, low, high]);
  }

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
      right: 16,
      top: 16,
      bottom: 32,
    },
    xAxis: {
      type: "category",
      data: categories,
      name: timeCol.display_name || timeCol.name,
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    series: [
      {
        type: "candlestick",
        name: closeCol.display_name || closeCol.name,
        data: ohlc,
        itemStyle: {
          color: "#88bc50",
          color0: "#ed6e6e",
          borderColor: "#88bc50",
          borderColor0: "#ed6e6e",
        },
      },
    ],
  } as EChartsCoreOption;
}

