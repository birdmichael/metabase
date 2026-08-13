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

const pad2 = (value: number) => String(value).padStart(2, "0");

export const toIsoDate = (value: RowValue): string | null => {
  if (value == null) {
    return null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
};

export function getCalendarHeatmapOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const dateCol = findColumn(cols, settings["calendar.date"]);
  const valueCol = findColumn(cols, settings["calendar.value"]);

  if (dateCol == null || valueCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const dateIdx = cols.indexOf(dateCol);
  const valueIdx = cols.indexOf(valueCol);
  const totals = new Map<string, number>();

  for (const row of rows) {
    const isoDate = toIsoDate(row[dateIdx]);
    if (isoDate == null) {
      continue;
    }
    totals.set(
      isoDate,
      (totals.get(isoDate) ?? 0) + (toFiniteNumber(row[valueIdx]) ?? 0),
    );
  }

  const calendarData = Array.from(totals.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, value]) => [date, value] as [string, number]);
  const dates = calendarData.map(([date]) => date);
  const values = calendarData.map(([, value]) => value);
  const dataMin = values.length === 0 ? 0 : Math.min(...values);
  const dataMax = values.length === 0 ? 1 : Math.max(...values);
  const configuredMin = toFiniteNumber(settings["calendar.color_min"] as RowValue);
  const configuredMax = toFiniteNumber(settings["calendar.color_max"] as RowValue);
  const minValue = configuredMin ?? dataMin;
  const rawMax = configuredMax ?? dataMax;
  const maxValue = rawMax === minValue ? minValue + 1 : rawMax;
  const range =
    dates.length === 0
      ? new Date().getFullYear()
      : dates[0].slice(0, 4) === dates[dates.length - 1].slice(0, 4)
        ? Number(dates[0].slice(0, 4))
        : [dates[0], dates[dates.length - 1]];

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
    calendar: {
      top: 40,
      left: 40,
      right: 16,
      bottom: 56,
      range,
      itemStyle: {
        borderWidth: 1,
        borderColor: renderingContext.getColor("border-neutral-strong"),
      },
      dayLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
      monthLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
      yearLabel: {
        color: renderingContext.getColor("text-primary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    series: [
      {
        type: "heatmap",
        coordinateSystem: "calendar",
        name: valueCol.display_name || valueCol.name,
        data: calendarData,
      },
    ],
  } as EChartsCoreOption;
}
