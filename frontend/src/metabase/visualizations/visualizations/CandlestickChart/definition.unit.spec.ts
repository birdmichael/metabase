import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { CANDLESTICK_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(CANDLESTICK_CHART_DEFINITION.isSensible);

const columns = [
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
];

const rows = [["d1", 10, 12, 9, 13]];

describe("CANDLESTICK_CHART_DEFINITION", () => {
  describe("isSensible", () => {
    it("should return true for matching columns", () => {
      expect(isSensible(createMockDatasetData({ rows, cols: columns }))).toBe(
        true,
      );
    });
  });

  describe("checkRenderable", () => {
    it("should not throw for valid columns", () => {
      expect(() =>
        CANDLESTICK_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "candlestick.time": "Day", "candlestick.open": "Open", "candlestick.close": "Close", "candlestick.low": "Low", "candlestick.high": "High" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        CANDLESTICK_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          {},
        ),
      ).toThrow(
        new ChartSettingsError("Which columns do you want to use?", {
          section: "Data",
        }),
      );
    });
  });
});

