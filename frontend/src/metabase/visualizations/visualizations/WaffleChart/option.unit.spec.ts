import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getWaffleChartOption } from "./option";

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

describe("getWaffleChartOption", () => {
  it("builds the expected series", () => {
    const option = getWaffleChartOption(
      rawSeries,
      { "waffle.dimension": "Category", "waffle.metric": "Sales" },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({
        type: "scatter",
        symbol: "rect",
      }),
    ]);
    const series = option.series as { data: unknown[] }[];
    expect(series[0].data).toHaveLength(100);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getWaffleChartOption(
      rawSeries,
      { "waffle.dimension": "Category", "waffle.metric": "Sales" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });

  it("hides the legend when configured", () => {
    const option = getWaffleChartOption(
      rawSeries,
      {
        "waffle.dimension": "Category",
        "waffle.metric": "Sales",
        "waffle.show_legend": false,
      },
      renderingContext,
      true,
    );
    expect(option.legend).toEqual(expect.objectContaining({ show: false }));
  });

});

