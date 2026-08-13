import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getHistogramChartOption } from "./option";

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
      rows: [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12], [13], [14], [15], [16], [17], [18], [19]],
      cols: [
        createMockColumn({
          name: "Value",
          display_name: "Value",
          base_type: "type/Number",
          semantic_type: "type/Number",
        })
      ],
    }),
  },
];

describe("getHistogramChartOption", () => {
  it("builds the expected series", () => {
    const option = getHistogramChartOption(
      rawSeries,
      { "histogram.metric": "Value" },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({ type: "bar", name: "Frequency" }),
    ]);
    const series = option.series as { data: number[] }[];
    expect(series[0].data.reduce((a, b) => a + b, 0)).toBe(20);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getHistogramChartOption(
      rawSeries,
      { "histogram.metric": "Value" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });
});

