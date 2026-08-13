import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
  createMockDatetimeColumn,
} from "metabase-types/api/mocks/dataset";

import { CALENDAR_HEATMAP_DEFINITION } from "./definition";

const isSensible = checkNotNull(CALENDAR_HEATMAP_DEFINITION.isSensible);

const columns = [
  createMockDatetimeColumn({
    name: "Date",
    display_name: "Date",
  }),
  createMockColumn({
    name: "Count",
    display_name: "Count",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
];

const rows = [
  ["2024-01-01", 3],
  ["2024-01-02", 5],
];

describe("CALENDAR_HEATMAP_DEFINITION", () => {
  describe("isSensible", () => {
    it("should return true for a date column and a metric", () => {
      expect(isSensible(createMockDatasetData({ rows, cols: columns }))).toBe(
        true,
      );
    });

    it("should return false without a date column", () => {
      expect(
        isSensible(
          createMockDatasetData({
            rows: [["A", 1]],
            cols: [
              createMockColumn({
                name: "Category",
                display_name: "Category",
                base_type: "type/Text",
              }),
              columns[1],
            ],
          }),
        ),
      ).toBe(false);
    });
  });

  describe("checkRenderable", () => {
    it("should not throw for valid columns", () => {
      expect(() =>
        CALENDAR_HEATMAP_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "calendar.date": "Date", "calendar.value": "Count" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        CALENDAR_HEATMAP_DEFINITION.checkRenderable(
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
