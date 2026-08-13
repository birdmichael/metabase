import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getWordCloudChartOption, layoutWordCloud } from "./option";

const renderingContext: RenderingContext = {
  getColor: (name) => name,
  measureText: () => 0,
  measureTextHeight: () => 0,
  fontFamily: "",
  theme: DEFAULT_VISUALIZATION_THEME,
};

const rawSeries = [
  {
    card: createMockCard(),
    data: createMockDatasetData({
      rows: [
        ["A", 10],
        ["B", 20],
        ["A", 5],
      ],
      cols: [
        createMockColumn({
          name: "Category",
          display_name: "Category",
          base_type: "type/Text",
        }),
        createMockColumn({
          name: "Sales",
          display_name: "Sales",
          base_type: "type/Number",
          semantic_type: "type/Number",
        }),
      ],
    }),
  },
];

describe("layoutWordCloud", () => {
  it("spreads words across distinct positions", () => {
    const layout = layoutWordCloud([
      { name: "alpha", value: 40 },
      { name: "beta", value: 20 },
      { name: "gamma", value: 10 },
      { name: "delta", value: 8 },
    ]);
    const xs = new Set(layout.map((word) => Math.round(word.x)));
    const ys = new Set(layout.map((word) => Math.round(word.y)));
    expect(layout).toHaveLength(4);
    expect(xs.size).toBeGreaterThan(1);
    expect(ys.size).toBeGreaterThan(1);
  });
});

describe("getWordCloudChartOption", () => {
  it("builds the expected series", () => {
    const option = getWordCloudChartOption(
      rawSeries,
      { "wordcloud.dimension": "Category", "wordcloud.metric": "Sales" },
      renderingContext,
      true,
    );
    const graphic = option.graphic as {
      elements: {
        type: string;
        children: {
          type: string;
          x: number;
          y: number;
          style: { text: string };
        }[];
      }[];
    };
    expect(graphic.elements[0].type).toBe("group");
    expect(graphic.elements[0].children.every((el) => el.type === "text")).toBe(
      true,
    );
    const texts = graphic.elements[0].children
      .map((el) => el.style.text)
      .sort();
    expect(texts).toEqual(["A", "B"]);
    const xs = new Set(
      graphic.elements[0].children.map((el) => Math.round(el.x)),
    );
    expect(xs.size).toBeGreaterThan(1);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getWordCloudChartOption(
      rawSeries,
      { "wordcloud.dimension": "Category", "wordcloud.metric": "Sales" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });

  it("filters stopwords from the layout", () => {
    const option = getWordCloudChartOption(
      rawSeries,
      {
        "wordcloud.dimension": "Category",
        "wordcloud.metric": "Sales",
        "wordcloud.stopwords": "A",
      },
      renderingContext,
      true,
    );
    const graphic = option.graphic as {
      elements: { children: { style: { text: string } }[] }[];
    };
    expect(graphic.elements[0].children.map((el) => el.style.text)).toEqual([
      "B",
    ]);
  });
});
