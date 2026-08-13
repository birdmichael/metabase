import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getRadialBarChartOption } from "./option";

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

describe("getRadialBarChartOption", () => {
  it("builds the expected series", () => {
    const option = getRadialBarChartOption(
      rawSeries,
      { "radialbar.dimension": "Category", "radialbar.metric": "Sales" },
      renderingContext,
      true,
    );
    expect(option.polar).toEqual(expect.objectContaining({ radius: ["18%", "78%"] }));
    expect(option.series).toEqual([
      expect.objectContaining({
        type: "bar",
        coordinateSystem: "polar",
      }),
    ]);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getRadialBarChartOption(
      rawSeries,
      { "radialbar.dimension": "Category", "radialbar.metric": "Sales" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });

  it("applies scale max and label visibility", () => {
    const option = getRadialBarChartOption(
      rawSeries,
      {
        "radialbar.dimension": "Category",
        "radialbar.metric": "Sales",
        "radialbar.max": 100,
        "radialbar.show_labels": false,
      },
      renderingContext,
      true,
    );
    expect(option.angleAxis).toEqual(expect.objectContaining({ max: 100 }));
    expect(option.radiusAxis).toEqual(
      expect.objectContaining({
        axisLabel: expect.objectContaining({ show: false }),
      }),
    );
  });

});

