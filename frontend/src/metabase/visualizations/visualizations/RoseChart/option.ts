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

export function getRoseChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const dimensionCol = findColumn(cols, settings["rose.dimension"]);
  const metricCol = findColumn(cols, settings["rose.metric"]);

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

  return {
    ...getEChartsAnimationOptions(isAnimated),
    textStyle: {
      fontFamily: renderingContext.fontFamily,
      color: renderingContext.getColor("text-primary"),
    },
    tooltip: {
      trigger: "item",
    },
    series: [
      {
        type: "pie",
        roseType: "area",
        radius: ["18%", "75%"],
        itemStyle: {
          borderColor: renderingContext.getColor("background_page-primary"),
          borderWidth: 1,
        },
        label: {
          color: renderingContext.getColor("text-primary"),
          fontFamily: renderingContext.fontFamily,
        },
        data: order.map((name) => ({
          name,
          value: totals.get(name) ?? 0,
          itemStyle: { color: colors[name] },
        })),
      },
    ],
  } as EChartsCoreOption;
}
