import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getBulletChartOption } from "./option";

const renderingContext: RenderingContext = {
  getColor: (name) => name,
  measureText: () => 0,
  measureTextHeight: () => 0,
  fontFamily: "",
  theme: DEFAULT_VISUALIZATION_THEME,
};

const columns = [
  createMockColumn({
    name: "name",
    display_name: "Name",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Actual",
    display_name: "Actual",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
  createMockColumn({
    name: "Target",
    display_name: "Target",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
];

const rawSeries = [
  {
    card: createMockCard(),
    data: createMockDatasetData({
      rows: [
        ["North", 80, 100],
        ["South", 60, 90],
        ["East", 40, 70],
      ],
      cols: columns,
    }),
  },
];

describe("getBulletChartOption", () => {
  it("builds one bullet row per category", () => {
    const option = getBulletChartOption(
      rawSeries,
      {
        "bullet.dimension": "name",
        "bullet.actual": "Actual",
        "bullet.target": "Target",
      },
      renderingContext,
      true,
    );
    expect(option.yAxis).toEqual(
      expect.objectContaining({ data: ["North", "South", "East"] }),
    );
    const series = option.series as {
      type: string;
      name?: string;
      data: unknown[];
    }[];
    const actual = series.find(
      (item) => item.type === "bar" && item.name === "Actual",
    );
    expect(actual?.data).toEqual([80, 60, 40]);
    expect(
      series.some((item) => item.type === "scatter" && item.name === "Target"),
    ).toBe(true);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("keeps the same axis max when ranges are toggled", () => {
    const settings = {
      "bullet.dimension": "name",
      "bullet.actual": "Actual",
      "bullet.target": "Target",
    };
    const withRanges = getBulletChartOption(
      rawSeries,
      { ...settings, "bullet.show_ranges": true },
      renderingContext,
      true,
    );
    const withoutRanges = getBulletChartOption(
      rawSeries,
      { ...settings, "bullet.show_ranges": false },
      renderingContext,
      true,
    );
    expect((withRanges.xAxis as { max: number }).max).toBe(
      (withoutRanges.xAxis as { max: number }).max,
    );
    const series = withoutRanges.series as { name?: string }[];
    expect(series.some((item) => item.name === "Poor")).toBe(false);
    expect(series.some((item) => item.name === "Actual")).toBe(true);
  });

  it("falls back to a single row without a dimension", () => {
    const option = getBulletChartOption(
      [
        {
          card: createMockCard(),
          data: createMockDatasetData({
            rows: [[80, 100]],
            cols: [columns[1], columns[2]],
          }),
        },
      ],
      { "bullet.actual": "Actual", "bullet.target": "Target" },
      renderingContext,
      false,
    );
    expect((option.yAxis as { data: string[] }).data).toEqual(["Actual"]);
    expect(option.animation).toBe(false);
  });
});
