import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { buildSunburstTree, getSunburstChartOption } from "./option";

const renderingContext: RenderingContext = {
  getColor: (name) => name,
  measureText: () => 0,
  measureTextHeight: () => 0,
  fontFamily: "",
  theme: DEFAULT_VISUALIZATION_THEME,
};

const columns = [
  createMockColumn({
    name: "Region",
    display_name: "Region",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Country",
    display_name: "Country",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Sales",
    display_name: "Sales",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
];

const rawSeries = [
  {
    card: createMockCard(),
    data: createMockDatasetData({
      rows: [
        ["Americas", "US", 10],
        ["Americas", "Canada", 5],
        ["EMEA", "UK", 8],
      ],
      cols: columns,
    }),
  },
];

describe("getSunburstChartOption", () => {
  it("builds a hierarchical sunburst series from dimensions and a metric", () => {
    expect(buildSunburstTree(rawSeries[0].data.rows, [0, 1], 2)).toEqual([
      {
        name: "Americas",
        value: 15,
        children: [
          { name: "US", value: 10 },
          { name: "Canada", value: 5 },
        ],
      },
      {
        name: "EMEA",
        value: 8,
        children: [{ name: "UK", value: 8 }],
      },
    ]);

    const option = getSunburstChartOption(
      rawSeries,
      {
        "sunburst.dimensions": ["Region", "Country"],
        "sunburst.metric": "Sales",
      },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({
        type: "sunburst",
        data: [
          expect.objectContaining({ name: "Americas", value: 15 }),
          expect.objectContaining({ name: "EMEA", value: 8 }),
        ],
      }),
    ]);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("hides labels when configured", () => {
    const option = getSunburstChartOption(
      rawSeries,
      {
        "sunburst.dimensions": ["Region", "Country"],
        "sunburst.metric": "Sales",
        "sunburst.show_labels": false,
      },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({
        label: expect.objectContaining({ show: false }),
      }),
    ]);
  });

});
