import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getCirclePackChartOption } from "./option";

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
        ["N", "A", 10],
        ["N", "B", 20],
      ],
      cols: [
        createMockColumn({
          name: "Region",
          display_name: "Region",
          base_type: "type/Text",
        }),
        createMockColumn({
          name: "City",
          display_name: "City",
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

describe("getCirclePackChartOption", () => {
  it("builds nested parent and leaf circles on a square data domain", () => {
    const option = getCirclePackChartOption(
      rawSeries,
      {
        "circlepack.dimensions": ["Region", "City"],
        "circlepack.metric": "Sales",
      },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({ type: "custom" }),
    ]);
    const series = option.series as {
      data: { name: string; value: number[]; itemStyle: { opacity: number } }[];
    }[];
    const names = series[0].data.map((item) => item.name).sort();
    expect(names).toEqual(["A", "B", "N"]);
    const parent = series[0].data.find((item) => item.name === "N");
    const leaf = series[0].data.find((item) => item.name === "A");
    expect(parent?.itemStyle.opacity).toBeLessThan(
      leaf?.itemStyle.opacity ?? 1,
    );
    expect(parent?.value[2]).toBeGreaterThan(leaf?.value[2] ?? 0);
    const xSpan =
      (option.xAxis as { max: number }).max -
      (option.xAxis as { min: number }).min;
    const ySpan =
      (option.yAxis as { max: number }).max -
      (option.yAxis as { min: number }).min;
    expect(xSpan).toBeCloseTo(ySpan);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getCirclePackChartOption(
      rawSeries,
      {
        "circlepack.dimensions": ["Region", "City"],
        "circlepack.metric": "Sales",
      },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });
});
