import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getGraphChartOption } from "./option";

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
      rows: [["A", "B", 1], ["B", "C", 2]],
      cols: [
        createMockColumn({
          name: "Source",
          display_name: "Source",
          base_type: "type/Text",
        }),
        createMockColumn({
          name: "Target",
          display_name: "Target",
          base_type: "type/Text",
        }),
        createMockColumn({
          name: "Weight",
          display_name: "Weight",
          base_type: "type/Number",
          semantic_type: "type/Number",
        })
      ],
    }),
  },
];

describe("getGraphChartOption", () => {
  it("builds the expected series", () => {
    const option = getGraphChartOption(
      rawSeries,
      { "graph.source": "Source", "graph.target": "Target", "graph.value": "Weight" },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({ type: "graph", layout: "force" }),
    ]);
    const series = option.series as { data: unknown[]; links: unknown[] }[];
    expect(series[0].data).toHaveLength(3);
    expect(series[0].links).toHaveLength(2);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getGraphChartOption(
      rawSeries,
      { "graph.source": "Source", "graph.target": "Target", "graph.value": "Weight" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });

  it("applies circular layout and hides labels", () => {
    const option = getGraphChartOption(
      rawSeries,
      {
        "graph.source": "Source",
        "graph.target": "Target",
        "graph.value": "Weight",
        "graph.layout": "circular",
        "graph.show_labels": false,
      },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({
        type: "graph",
        layout: "circular",
        label: expect.objectContaining({ show: false }),
      }),
    ]);
  });

});

