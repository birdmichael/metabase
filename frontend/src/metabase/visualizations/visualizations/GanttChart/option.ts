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

const toDateOrNumber = (value: RowValue): number | null => {
  const numeric = toFiniteNumber(value);
  if (numeric != null) {
    return numeric;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  return null;
};

export function getGanttChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const categoryCol = findColumn(cols, settings["gantt.category"]);
  const startCol = findColumn(cols, settings["gantt.start"]);
  const endCol = findColumn(cols, settings["gantt.end"]);

  if (categoryCol == null || startCol == null || endCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const categoryIdx = cols.indexOf(categoryCol);
  const startIdx = cols.indexOf(startCol);
  const endIdx = cols.indexOf(endCol);
  const categories: string[] = [];
  const categoryIndex = new Map<string, number>();
  const items: { category: number; start: number; end: number; name: string }[] = [];
  let isTime = false;

  for (const row of rows) {
    if (row[categoryIdx] == null) {
      continue;
    }
    const start = toDateOrNumber(row[startIdx]);
    const end = toDateOrNumber(row[endIdx]);
    if (start == null || end == null) {
      continue;
    }
    if (typeof row[startIdx] === "string" && Number.isNaN(Number(row[startIdx]))) {
      isTime = true;
    }
    const name = String(row[categoryIdx]);
    let index = categoryIndex.get(name);
    if (index == null) {
      index = categories.length;
      categoryIndex.set(name, index);
      categories.push(name);
    }
    items.push({ category: index, start, end, name });
  }

  const colors = getColorsForValues(categories, settings["series_settings.colors"]);
  const brand = renderingContext.getColor("core-brand");

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
      type: isTime ? "time" : "value",
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    yAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    series: [
      {
        type: "custom",
        renderItem: (_params: unknown, api: { value: (i: number) => number; coord: (v: number[]) => number[]; size: (v: number[]) => number[]; style: () => object }) => {
          const category = api.value(0);
          const start = api.coord([api.value(1), category]);
          const end = api.coord([api.value(2), category]);
          const height = api.size([0, 1])[1] * 0.55;
          return {
            type: "rect",
            shape: {
              x: start[0],
              y: start[1] - height / 2,
              width: Math.max(end[0] - start[0], 2),
              height,
            },
            style: api.style(),
          };
        },
        encode: { x: [1, 2], y: 0 },
        data: items.map((item) => ({
          name: item.name,
          value: [item.category, item.start, item.end],
          itemStyle: { color: colors[item.name] ?? brand },
        })),
      },
    ],
  } as EChartsCoreOption;
}

