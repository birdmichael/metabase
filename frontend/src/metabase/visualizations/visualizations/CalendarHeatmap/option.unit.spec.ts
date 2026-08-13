import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
  createMockDatetimeColumn,
} from "metabase-types/api/mocks/dataset";

import { getCalendarHeatmapOption, toIsoDate } from "./option";

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
        ["2024-01-01", 1],
        ["2024-01-02T12:00:00", 2],
        ["2024-01-01", 3],
      ],
      cols: [
        createMockDatetimeColumn({ name: "Date", display_name: "Date" }),
        createMockColumn({
          name: "Count",
          display_name: "Count",
          base_type: "type/Number",
          semantic_type: "type/Number",
        }),
      ],
    }),
  },
];

describe("getCalendarHeatmapOption", () => {
  it("parses ISO dates", () => {
    expect(toIsoDate("2024-03-15T08:00:00")).toBe("2024-03-15");
    expect(toIsoDate(null)).toBeNull();
  });

  it("builds a calendar heatmap series distinct from the matrix heatmap", () => {
    const option = getCalendarHeatmapOption(
      rawSeries,
      { "calendar.date": "Date", "calendar.value": "Count" },
      renderingContext,
      false,
    );
    expect(option.calendar).toEqual(expect.objectContaining({ range: 2024 }));
    expect(option.series).toEqual([
      expect.objectContaining({
        type: "heatmap",
        coordinateSystem: "calendar",
        data: [
          ["2024-01-01", 4],
          ["2024-01-02", 2],
        ],
      }),
    ]);
    expect(option.animation).toBe(false);
  });

  it("applies visualMap range from settings", () => {
    const option = getCalendarHeatmapOption(
      rawSeries,
      {
        "calendar.date": "Date",
        "calendar.value": "Count",
        "calendar.color_min": 0,
        "calendar.color_max": 20,
      },
      renderingContext,
      false,
    );
    expect(option.visualMap).toEqual(expect.objectContaining({ min: 0, max: 20 }));
  });

});
