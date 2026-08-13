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

export function getBubbleChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const xCol = findColumn(cols, settings["bubble.x"]);
  const yCol = findColumn(cols, settings["bubble.y"]);
  const sizeCol = findColumn(cols, settings["bubble.size"]);
  const categoryCol = findColumn(cols, settings["bubble.dimension"]);

  if (xCol == null || yCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const xIdx = cols.indexOf(xCol);
  const yIdx = cols.indexOf(yCol);
  const sizeIdx = sizeCol == null ? -1 : cols.indexOf(sizeCol);
  const catIdx = categoryCol == null ? -1 : cols.indexOf(categoryCol);
  const sizeValues: number[] = [];
  const points: {
    name: string;
    value: number[];
  }[] = [];

  for (const row of rows) {
    const x = toFiniteNumber(row[xIdx]);
    const y = toFiniteNumber(row[yIdx]);
    if (x == null || y == null) {
      continue;
    }
    const size = sizeIdx >= 0 ? (toFiniteNumber(row[sizeIdx]) ?? 0) : 1;
    sizeValues.push(Math.abs(size));
    const name =
      catIdx >= 0 && row[catIdx] != null ? String(row[catIdx]) : "";
    points.push({ name, value: [x, y, Math.abs(size)] });
  }

  const maxSize = Math.max(1, ...sizeValues);
  const categories = [...new Set(points.map((point) => point.name).filter(Boolean))];
  const colors = getColorsForValues(
    categories.length > 0 ? categories : ["bubble"],
    settings["series_settings.colors"],
  );
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
      type: "value",
      name: xCol.display_name || xCol.name,
      nameLocation: "middle",
      nameGap: 28,
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    yAxis: {
      type: "value",
      name: yCol.display_name || yCol.name,
      nameLocation: "middle",
      nameGap: 40,
      axisLabel: {
        color: renderingContext.getColor("text-secondary"),
        fontFamily: renderingContext.fontFamily,
      },
    },
    series: [
      {
        type: "scatter",
        name: yCol.display_name || yCol.name,
        data: points.map((point) => ({
          name: point.name,
          value: point.value,
          itemStyle: {
            color: point.name ? colors[point.name] : brand,
            opacity: 0.75,
          },
        })),
        symbolSize: (value: number[]) => {
          const size = Array.isArray(value) ? value[2] ?? 1 : 1;
          return 8 + (Math.sqrt(size / maxSize) * 36);
        },
      },
    ],
  } as EChartsCoreOption;
}

