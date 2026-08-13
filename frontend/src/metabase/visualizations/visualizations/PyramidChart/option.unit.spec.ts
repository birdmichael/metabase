import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getPyramidChartOption } from "./option";

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
      rows: [["0-10", 10, 12], ["10-20", 8, 9]],
      cols: [
        createMockColumn({
          name: "Age",
          display_name: "Age",
          base_type: "type/Text",
        }),
        createMockColumn({
          name: "Male",
          display_name: "Male",
          base_type: "type/Number",
          semantic_type: "type/Number",
        }),
        createMockColumn({
          name: "Female",
          display_name: "Female",
          base_type: "type/Number",
          semantic_type: "type/Number",
        })
      ],
    }),
  },
];

describe("getPyramidChartOption", () => {
  it("builds the expected series", () => {
    const option = getPyramidChartOption(
      rawSeries,
      { "pyramid.category": "Age", "pyramid.left": "Male", "pyramid.right": "Female" },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({ type: "bar", name: "Male", data: [-10, -8] }),
      expect.objectContaining({ type: "bar", name: "Female", data: [12, 9] }),
    ]);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getPyramidChartOption(
      rawSeries,
      { "pyramid.category": "Age", "pyramid.left": "Male", "pyramid.right": "Female" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });

  it("hides the legend and shows values when configured", () => {
    const option = getPyramidChartOption(
      rawSeries,
      {
        "pyramid.category": "Age",
        "pyramid.left": "Male",
        "pyramid.right": "Female",
        "pyramid.show_legend": false,
        "pyramid.show_values": true,
      },
      renderingContext,
      true,
    );
    expect(option.legend).toEqual(expect.objectContaining({ show: false }));
    expect(option.series[0]).toEqual(
      expect.objectContaining({
        label: expect.objectContaining({ show: true }),
      }),
    );
  });

});

