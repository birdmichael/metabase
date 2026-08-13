import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getLollipopChartOption } from "./option";

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

describe("getLollipopChartOption", () => {
  it("builds the expected series", () => {
    const option = getLollipopChartOption(
      rawSeries,
      { "lollipop.dimension": "Category", "lollipop.metric": "Sales" },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({ type: "bar", barWidth: 2 }),
      expect.objectContaining({ type: "pictorialBar", symbol: "circle" }),
    ]);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getLollipopChartOption(
      rawSeries,
      { "lollipop.dimension": "Category", "lollipop.metric": "Sales" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });

  it("shows values when configured", () => {
    const option = getLollipopChartOption(
      rawSeries,
      {
        "lollipop.dimension": "Category",
        "lollipop.metric": "Sales",
        "lollipop.show_values": true,
      },
      renderingContext,
      true,
    );
    expect(option.series[0]).toEqual(
      expect.objectContaining({
        label: expect.objectContaining({ show: true }),
      }),
    );
  });

});

