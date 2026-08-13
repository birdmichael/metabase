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

export function getDonutChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const dimensionCol = findColumn(cols, settings["donut.dimension"]);
  const metricCol = findColumn(cols, settings["donut.metric"]);

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
  const total = order.reduce((sum, name) => sum + (totals.get(name) ?? 0), 0);
  const totalLabel = Number.isInteger(total) ? String(total) : total.toFixed(1);

  return {
    ...getEChartsAnimationOptions(isAnimated),
    textStyle: {
      fontFamily: renderingContext.fontFamily,
      color: renderingContext.getColor("text-primary"),
    },
    tooltip: {
      trigger: "item",
    },
    graphic: [
      {
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: totalLabel,
          fill: renderingContext.getColor("text-primary"),
          fontSize: 18,
          fontWeight: 600,
          fontFamily: renderingContext.fontFamily,
          align: "center",
          verticalAlign: "middle",
        },
        z: 100,
      },
    ],
    series: [
      {
        type: "pie",
        radius: ["50%", "75%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: renderingContext.getColor("background_page-primary"),
          borderWidth: 1,
        },
        label: {
          show: false,
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

