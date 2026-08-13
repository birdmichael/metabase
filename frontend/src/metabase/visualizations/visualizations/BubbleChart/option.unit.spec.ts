import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getBubbleChartOption } from "./option";

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
        [1, 2, 3, "A"],
        [4, 5, 6, "B"],
      ],
      cols: [
        createMockColumn({
          name: "X",
          display_name: "X",
          base_type: "type/Number",
          semantic_type: "type/Number",
        }),
        createMockColumn({
          name: "Y",
          display_name: "Y",
          base_type: "type/Number",
          semantic_type: "type/Number",
        }),
        createMockColumn({
          name: "Size",
          display_name: "Size",
          base_type: "type/Number",
          semantic_type: "type/Number",
        }),
        createMockColumn({
          name: "Cat",
          display_name: "Cat",
          base_type: "type/Text",
        }),
      ],
    }),
  },
];

describe("getBubbleChartOption", () => {
  it("builds one scatter series per category so the legend can show", () => {
    const option = getBubbleChartOption(
      rawSeries,
      {
        "bubble.x": "X",
        "bubble.y": "Y",
        "bubble.size": "Size",
        "bubble.dimension": "Cat",
      },
      renderingContext,
      true,
    );
    const series = option.series as { type: string; name: string }[];
    expect(series.map((item) => item.name).sort()).toEqual(["A", "B"]);
    expect(series.every((item) => item.type === "scatter")).toBe(true);
    expect(option.legend).toEqual(
      expect.objectContaining({ show: true, data: ["A", "B"] }),
    );
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getBubbleChartOption(
      rawSeries,
      {
        "bubble.x": "X",
        "bubble.y": "Y",
        "bubble.size": "Size",
        "bubble.dimension": "Cat",
      },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });

  it("hides the legend when configured", () => {
    const option = getBubbleChartOption(
      rawSeries,
      {
        "bubble.x": "X",
        "bubble.y": "Y",
        "bubble.size": "Size",
        "bubble.dimension": "Cat",
        "bubble.show_legend": false,
      },
      renderingContext,
      true,
    );
    expect(option.legend).toEqual(expect.objectContaining({ show: false }));
  });
});
