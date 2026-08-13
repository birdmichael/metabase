import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getWordCloudChartOption } from "./option";

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

describe("getWordCloudChartOption", () => {
  it("builds the expected series", () => {
    const option = getWordCloudChartOption(
      rawSeries,
      { "wordcloud.dimension": "Category", "wordcloud.metric": "Sales" },
      renderingContext,
      true,
    );
    const graphic = option.graphic as { elements: { type: string; style: { text: string } }[] };
    expect(graphic.elements.length).toBeGreaterThan(0);
    expect(graphic.elements.every((el) => el.type === "text")).toBe(true);
    const texts = graphic.elements.map((el) => el.style.text).sort();
    expect(texts).toEqual(["A", "B"]);
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
    const graphic = option.graphic as { elements: { style: { text: string } }[] };
    expect(graphic.elements.map((el) => el.style.text)).toEqual(["B"]);
  });

});

