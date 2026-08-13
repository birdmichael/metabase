import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getDonutChartOption } from "./option";

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

describe("getDonutChartOption", () => {
  it("builds the expected series", () => {
    const option = getDonutChartOption(
      rawSeries,
      { "donut.dimension": "Category", "donut.metric": "Sales" },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({
        type: "pie",
        radius: ["50%", "75%"],
        data: [
          expect.objectContaining({ name: "A", value: 15 }),
          expect.objectContaining({ name: "B", value: 20 }),
        ],
      }),
    ]);
    expect(option.graphic).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "text" }),
      ]),
    );
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getDonutChartOption(
      rawSeries,
      { "donut.dimension": "Category", "donut.metric": "Sales" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });
});

