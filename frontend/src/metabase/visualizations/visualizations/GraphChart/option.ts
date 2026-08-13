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

export function getGraphChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const sourceCol = findColumn(cols, settings["graph.source"]);
  const targetCol = findColumn(cols, settings["graph.target"]);
  const valueCol = findColumn(cols, settings["graph.value"]);

  if (sourceCol == null || targetCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const sourceIdx = cols.indexOf(sourceCol);
  const targetIdx = cols.indexOf(targetCol);
  const valueIdx = valueCol == null ? -1 : cols.indexOf(valueCol);
  const nodes = new Map<string, number>();
  const links: { source: string; target: string; value: number }[] = [];

  for (const row of rows) {
    if (row[sourceIdx] == null || row[targetIdx] == null) {
      continue;
    }
    const source = String(row[sourceIdx]);
    const target = String(row[targetIdx]);
    const value = valueIdx >= 0 ? (toFiniteNumber(row[valueIdx]) ?? 1) : 1;
    nodes.set(source, (nodes.get(source) ?? 0) + value);
    nodes.set(target, (nodes.get(target) ?? 0) + value);
    links.push({ source, target, value });
  }

  const names = [...nodes.keys()];
  const colors = getColorsForValues(names, settings["series_settings.colors"]);
  const maxValue = Math.max(1, ...nodes.values());
  const layout = settings["graph.layout"] === "circular" ? "circular" : "force";
  const showLabels = settings["graph.show_labels"] !== false;

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
        type: "graph",
        layout,
        roam: true,
        draggable: true,
        force: {
          repulsion: 180,
          edgeLength: [40, 120],
          gravity: 0.08,
        },
        label: {
          show: showLabels,
          color: renderingContext.getColor("text-primary"),
          fontFamily: renderingContext.fontFamily,
        },
        lineStyle: {
          color: renderingContext.getColor("border-neutral-strong"),
          curveness: 0.15,
        },
        data: names.map((name) => ({
          name,
          value: nodes.get(name) ?? 0,
          symbolSize: 12 + (Math.sqrt((nodes.get(name) ?? 0) / maxValue) * 28),
          itemStyle: { color: colors[name] },
        })),
        links,
      },
    ],
  } as EChartsCoreOption;
}

