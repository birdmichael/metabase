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

const rawSeries = [
  {
    card: createMockCard(),
    data: createMockDatasetData({
      rows: [[80, 100]],
      cols: [
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
        })
      ],
    }),
  },
];

describe("getBulletChartOption", () => {
  it("builds the expected series", () => {
    const option = getBulletChartOption(
      rawSeries,
      { "bullet.actual": "Actual", "bullet.target": "Target" },
      renderingContext,
      true,
    );
    const series = option.series as { type: string; name?: string }[];
    expect(series.some((item) => item.type === "bar" && item.name === "Actual")).toBe(true);
    expect(series.some((item) => item.type === "scatter" && item.name === "Target")).toBe(true);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getBulletChartOption(
      rawSeries,
      { "bullet.actual": "Actual", "bullet.target": "Target" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });

  it("omits qualitative ranges when disabled", () => {
    const option = getBulletChartOption(
      rawSeries,
      {
        "bullet.actual": "Actual",
        "bullet.target": "Target",
        "bullet.show_ranges": false,
      },
      renderingContext,
      true,
    );
    const series = option.series as { name?: string }[];
    expect(series.some((item) => item.name === "Poor")).toBe(false);
    expect(series.some((item) => item.name === "Actual")).toBe(true);
  });

});

