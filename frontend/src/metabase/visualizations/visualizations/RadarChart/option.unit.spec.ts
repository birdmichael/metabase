import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getRadarChartOption } from "./option";

const renderingContext: RenderingContext = {
  getColor: (name) => name,
  measureText: () => 0,
  measureTextHeight: () => 0,
  fontFamily: "",
  theme: DEFAULT_VISUALIZATION_THEME,
};

const columns = [
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
  createMockColumn({
    name: "Profit",
    display_name: "Profit",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
];

const rawSeries = [
  {
    card: createMockCard(),
    data: createMockDatasetData({
      rows: [
        ["A", 10, 1],
        ["B", 20, 2],
        ["A", 5, 3],
      ],
      cols: columns,
    }),
  },
];

describe("getRadarChartOption", () => {
  it("builds radar indicators from the dimension and series from metrics", () => {
    const option = getRadarChartOption(
      rawSeries,
      { "radar.dimension": "Category", "radar.metrics": ["Sales", "Profit"] },
      renderingContext,
      false,
    );

    expect(option.radar).toEqual(
      expect.objectContaining({
        indicator: [
          expect.objectContaining({ name: "A" }),
          expect.objectContaining({ name: "B" }),
        ],
      }),
    );
    expect(option.series).toEqual([
      expect.objectContaining({
        type: "radar",
        data: [
          expect.objectContaining({ name: "Sales", value: [15, 20] }),
          expect.objectContaining({ name: "Profit", value: [4, 2] }),
        ],
      }),
    ]);
    expect(option.animation).toBe(false);
    expect(option.animationDuration).toBe(0);
  });

  it("enables motion when animated", () => {
    const option = getRadarChartOption(
      rawSeries,
      { "radar.dimension": "Category", "radar.metrics": ["Sales"] },
      renderingContext,
      true,
    );
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
    expect(option.animationDurationUpdate).toBe(300);
    expect(option.animationEasing).toBe("cubicOut");
  });

  it("applies scale max, legend, and label settings", () => {
    const option = getRadarChartOption(
      rawSeries,
      {
        "radar.dimension": "Category",
        "radar.metrics": ["Sales"],
        "radar.scale_max": 50,
        "radar.show_legend": false,
        "radar.show_labels": false,
      },
      renderingContext,
      false,
    );
    expect(option.radar).toEqual(
      expect.objectContaining({
        indicator: expect.arrayContaining([
          expect.objectContaining({ max: 50 }),
        ]),
        axisName: expect.objectContaining({ show: false }),
      }),
    );
    expect(option.legend).toEqual(expect.objectContaining({ show: false }));
  });

});
