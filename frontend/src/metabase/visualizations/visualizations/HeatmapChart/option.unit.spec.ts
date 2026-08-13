import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getHeatmapChartOption } from "./option";

const renderingContext: RenderingContext = {
  getColor: (name) => name,
  measureText: () => 0,
  measureTextHeight: () => 0,
  fontFamily: "",
  theme: DEFAULT_VISUALIZATION_THEME,
};

const columns = [
  createMockColumn({
    name: "X",
    display_name: "X",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Y",
    display_name: "Y",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Value",
    display_name: "Value",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
];

const rawSeries = [
  {
    card: createMockCard(),
    data: createMockDatasetData({
      rows: [
        ["A", "P", 1],
        ["B", "Q", 4],
        ["A", "P", 2],
      ],
      cols: columns,
    }),
  },
];

describe("getHeatmapChartOption", () => {
  it("builds category axes, visualMap, and aggregated heatmap cells", () => {
    const option = getHeatmapChartOption(
      rawSeries,
      { "heatmap.x": "X", "heatmap.y": "Y", "heatmap.value": "Value" },
      renderingContext,
      false,
    );

    expect(option.xAxis).toEqual(
      expect.objectContaining({ type: "category", data: ["A", "B"] }),
    );
    expect(option.yAxis).toEqual(
      expect.objectContaining({ type: "category", data: ["P", "Q"] }),
    );
    expect(option.visualMap).toEqual(
      expect.objectContaining({ min: 3, max: 4 }),
    );
    expect(option.series).toEqual([
      expect.objectContaining({
        type: "heatmap",
        data: [
          [0, 0, 3],
          [1, 1, 4],
        ],
      }),
    ]);
    expect(option.animation).toBe(false);
  });

  it("enables motion when animated", () => {
    const option = getHeatmapChartOption(
      rawSeries,
      { "heatmap.x": "X", "heatmap.y": "Y", "heatmap.value": "Value" },
      renderingContext,
      true,
    );
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });
});
