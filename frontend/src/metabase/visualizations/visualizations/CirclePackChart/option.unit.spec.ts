import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getCirclePackChartOption } from "./option";

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
      rows: [["N", "A", 10], ["N", "B", 20]],
      cols: [
        createMockColumn({
          name: "Region",
          display_name: "Region",
          base_type: "type/Text",
        }),
        createMockColumn({
          name: "City",
          display_name: "City",
          base_type: "type/Text",
        }),
        createMockColumn({
          name: "Sales",
          display_name: "Sales",
          base_type: "type/Number",
          semantic_type: "type/Number",
        })
      ],
    }),
  },
];

describe("getCirclePackChartOption", () => {
  it("builds the expected series", () => {
    const option = getCirclePackChartOption(
      rawSeries,
      { "circlepack.dimensions": ["Region", "City"], "circlepack.metric": "Sales" },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({ type: "custom" }),
    ]);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getCirclePackChartOption(
      rawSeries,
      { "circlepack.dimensions": ["Region", "City"], "circlepack.metric": "Sales" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });
});

