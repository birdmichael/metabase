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

export type WordLayout = {
  name: string;
  value: number;
  x: number;
  y: number;
  fontSize: number;
};

const estimateWidth = (text: string, fontSize: number) =>
  Math.max(fontSize, text.length * fontSize * 0.62);

const overlaps = (a: WordLayout, b: WordLayout) => {
  const aw = estimateWidth(a.name, a.fontSize) / 2 + 4;
  const ah = a.fontSize / 2 + 4;
  const bw = estimateWidth(b.name, b.fontSize) / 2 + 4;
  const bh = b.fontSize / 2 + 4;
  return Math.abs(a.x - b.x) < aw + bw && Math.abs(a.y - b.y) < ah + bh;
};

export function layoutWordCloud(
  items: { name: string; value: number }[],
): WordLayout[] {
  const maxValue = Math.max(1, ...items.map((item) => item.value));
  const placed: WordLayout[] = [];
  const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, 80);

  for (const item of sorted) {
    const fontSize = 12 + Math.sqrt(item.value / maxValue) * 36;
    let found: WordLayout | null = null;
    for (let step = 0; step < 1600; step++) {
      const theta = step * 0.35;
      const radius = step === 0 ? 0 : 8 + 4.2 * theta;
      const candidate: WordLayout = {
        name: item.name,
        value: item.value,
        x: radius * Math.cos(theta),
        y: radius * Math.sin(theta) * 0.72,
        fontSize,
      };
      if (placed.every((other) => !overlaps(candidate, other))) {
        found = candidate;
        break;
      }
    }
    placed.push(
      found ?? {
        name: item.name,
        value: item.value,
        x: placed.length * 12,
        y: 80 + (placed.length % 5) * 18,
        fontSize,
      },
    );
  }
  return placed;
}

export function getWordCloudChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const dimensionCol = findColumn(cols, settings["wordcloud.dimension"]);
  const metricCol = findColumn(cols, settings["wordcloud.metric"]);

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

  const stopwords = new Set(
    String(settings["wordcloud.stopwords"] ?? "")
      .split(/[,\n]/)
      .map((word) => word.trim().toLowerCase())
      .filter(Boolean),
  );
  const kept = order.filter((name) => !stopwords.has(name.toLowerCase()));
  const colors = getColorsForValues(kept, settings["series_settings.colors"]);
  const layout = layoutWordCloud(
    kept.map((name) => ({ name, value: Math.abs(totals.get(name) ?? 0) })),
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
    graphic: {
      elements: [
        {
          type: "group",
          left: "center",
          top: "middle",
          children: layout.map((word) => ({
            type: "text",
            x: word.x,
            y: word.y,
            style: {
              text: word.name,
              fontSize: word.fontSize,
              fontFamily: renderingContext.fontFamily,
              fill: colors[word.name],
              textAlign: "center",
              textVerticalAlign: "middle",
            },
          })),
        },
      ],
    },
    series: [],
  } as EChartsCoreOption;
}
