import type { EChartsCoreOption } from "echarts/core";

import { getColorsForValues } from "metabase/ui/colors/charts";
import { getEChartsAnimationOptions } from "metabase/visualizations/echarts/animation";
import type {
  ComputedVisualizationSettings,
  RenderingContext,
} from "metabase/visualizations/types";
import type { DatasetColumn, RawSeries, RowValue } from "metabase-types/api";

import { getSunburstDimensionNames } from "./utils";

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

type TreeNode = {
  name: string;
  value: number;
  children: Map<string, TreeNode>;
};

export type SunburstSeriesNode = {
  name: string;
  value: number;
  itemStyle?: { color?: string };
  children?: SunburstSeriesNode[];
};

export const buildSunburstTree = (
  rows: RowValue[][],
  dimensionIndexes: number[],
  valueIndex: number,
): SunburstSeriesNode[] => {
  const root: TreeNode = { name: "", value: 0, children: new Map() };

  for (const row of rows) {
    const numeric = toFiniteNumber(row[valueIndex]) ?? 0;
    let node = root;
    node.value += numeric;
    for (const dimensionIndex of dimensionIndexes) {
      const raw = row[dimensionIndex];
      if (raw == null) {
        break;
      }
      const name = String(raw);
      let child = node.children.get(name);
      if (child == null) {
        child = { name, value: 0, children: new Map() };
        node.children.set(name, child);
      }
      child.value += numeric;
      node = child;
    }
  }

  const toSeries = (nodes: Map<string, TreeNode>): SunburstSeriesNode[] =>
    Array.from(nodes.values()).map((node) => {
      const seriesNode: SunburstSeriesNode = {
        name: node.name,
        value: node.value,
      };
      if (node.children.size > 0) {
        seriesNode.children = toSeries(node.children);
      }
      return seriesNode;
    });

  return toSeries(root.children);
};

export function getSunburstChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const dimensionCols = getSunburstDimensionNames(settings)
    .map((name) => findColumn(cols, name))
    .filter((col): col is DatasetColumn => col != null);
  const metricCol = findColumn(cols, settings["sunburst.metric"]);

  if (dimensionCols.length === 0 || metricCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const dimensionIndexes = dimensionCols.map((col) => cols.indexOf(col));
  const tree = buildSunburstTree(
    rows,
    dimensionIndexes,
    cols.indexOf(metricCol),
  );
  const colors = getColorsForValues(
    tree.map((node) => node.name),
    settings["series_settings.colors"],
  );
  const coloredTree = tree.map((node) => ({
    ...node,
    itemStyle: { color: colors[node.name] },
  }));

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
        type: "sunburst",
        radius: ["12%", "90%"],
        nodeClick: false,
        sort: undefined,
        data: coloredTree,
        label: {
          rotate: "radial",
          color: renderingContext.getColor("text-primary"),
          fontFamily: renderingContext.fontFamily,
        },
        itemStyle: {
          borderColor: renderingContext.getColor("background_page-primary"),
          borderWidth: 1,
        },
      },
    ],
  } as EChartsCoreOption;
}
