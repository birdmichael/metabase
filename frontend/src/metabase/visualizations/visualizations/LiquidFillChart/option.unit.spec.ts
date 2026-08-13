import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getLiquidFillOption } from "./option";

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
      rows: [[0.65]],
      cols: [
        createMockColumn({
          name: "Ratio",
          display_name: "Ratio",
          base_type: "type/Number",
          semantic_type: "type/Number",
        }),
      ],
    }),
  },
];

type LiquidGraphic = {
  type: string;
  children: { type: string }[];
};

type LiquidRenderApi = {
  getWidth: () => number;
  getHeight: () => number;
  value: (i: number) => number;
};

type LiquidSeries = {
  type: string;
  coordinateSystem: string;
  data: number[][];
  renderItem: (_params: unknown, api: LiquidRenderApi) => LiquidGraphic;
};

const renderApi = (series: LiquidSeries): LiquidRenderApi => ({
  getWidth: () => 400,
  getHeight: () => 400,
  value: (i: number) => series.data[0][i],
});

describe("getLiquidFillOption", () => {
  it("builds a custom series water-ball from the metric value", () => {
    const option = getLiquidFillOption(
      rawSeries,
      { "liquid.metric": "Ratio" },
      renderingContext,
      true,
    );
    const series = (option.series as LiquidSeries[])[0];
    expect(series.type).toBe("custom");
    expect(series.coordinateSystem).toBe("cartesian2d");
    expect(series.data[0][2]).toBeCloseTo(0.65);
    const view = series.renderItem(null, renderApi(series));
    expect(view.type).toBe("group");
    expect(view.children.some((child) => child.type === "circle")).toBe(true);
    expect(view.children.some((child) => child.type === "polygon")).toBe(true);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("scales the fill by liquid.max", () => {
    const option = getLiquidFillOption(
      rawSeries,
      { "liquid.metric": "Ratio", "liquid.max": 2 },
      renderingContext,
      false,
    );
    const series = option.series as { data: number[][] }[];
    expect(series[0].data[0][2]).toBeCloseTo(0.325);
  });

  it("disables motion when not animated", () => {
    const option = getLiquidFillOption(
      rawSeries,
      { "liquid.metric": "Ratio" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });

  it("hides the percent label when configured", () => {
    const option = getLiquidFillOption(
      rawSeries,
      { "liquid.metric": "Ratio", "liquid.show_percent": false },
      renderingContext,
      false,
    );
    const series = (option.series as LiquidSeries[])[0];
    const view = series.renderItem(null, renderApi(series));
    expect(view.children.some((child) => child.type === "text")).toBe(false);
  });
});
