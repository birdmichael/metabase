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
        })
      ],
    }),
  },
];

describe("getLiquidFillOption", () => {
  it("builds the expected series", () => {
    const option = getLiquidFillOption(
      rawSeries,
      { "liquid.metric": "Ratio" },
      renderingContext,
      true,
    );
    const graphic = option.graphic as { elements: { type: string; children: { type: string }[] }[] };
    expect(graphic.elements[0].type).toBe("group");
    expect(graphic.elements[0].children.some((child) => child.type === "circle")).toBe(true);
    expect(graphic.elements[0].children.some((child) => child.type === "polygon")).toBe(true);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
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
});

