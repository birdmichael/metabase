import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getCandlestickChartOption } from "./option";

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
      rows: [["d1", 10, 12, 9, 13], ["d2", 12, 11, 10, 13]],
      cols: [
        createMockColumn({
          name: "Day",
          display_name: "Day",
          base_type: "type/Text",
        }),
        createMockColumn({
          name: "Open",
          display_name: "Open",
          base_type: "type/Number",
          semantic_type: "type/Number",
        }),
        createMockColumn({
          name: "Close",
          display_name: "Close",
          base_type: "type/Number",
          semantic_type: "type/Number",
        }),
        createMockColumn({
          name: "Low",
          display_name: "Low",
          base_type: "type/Number",
          semantic_type: "type/Number",
        }),
        createMockColumn({
          name: "High",
          display_name: "High",
          base_type: "type/Number",
          semantic_type: "type/Number",
        })
      ],
    }),
  },
];

describe("getCandlestickChartOption", () => {
  it("builds the expected series", () => {
    const option = getCandlestickChartOption(
      rawSeries,
      { "candlestick.time": "Day", "candlestick.open": "Open", "candlestick.close": "Close", "candlestick.low": "Low", "candlestick.high": "High" },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({
        type: "candlestick",
        data: [
          [10, 12, 9, 13],
          [12, 11, 10, 13],
        ],
      }),
    ]);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getCandlestickChartOption(
      rawSeries,
      { "candlestick.time": "Day", "candlestick.open": "Open", "candlestick.close": "Close", "candlestick.low": "Low", "candlestick.high": "High" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });

  it("applies increase and decrease colors", () => {
    const option = getCandlestickChartOption(
      rawSeries,
      {
        "candlestick.time": "Day",
        "candlestick.open": "Open",
        "candlestick.close": "Close",
        "candlestick.low": "Low",
        "candlestick.high": "High",
        "candlestick.increase_color": "#00ff00",
        "candlestick.decrease_color": "#ff0000",
      },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({
        itemStyle: expect.objectContaining({
          color: "#00ff00",
          color0: "#ff0000",
        }),
      }),
    ]);
  });

});

