import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { RADAR_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(RADAR_CHART_DEFINITION.isSensible);

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

const rows = [
  ["A", 10, 5],
  ["B", 20, 8],
  ["C", 15, 3],
];

describe("RADAR_CHART_DEFINITION", () => {
  describe("isSensible", () => {
    it("should return true for a dimension, metric, and at least 3 rows", () => {
      expect(
        isSensible(createMockDatasetData({ rows, cols: columns })),
      ).toBe(true);
    });

    it("should return false when there are fewer than 3 rows", () => {
      expect(
        isSensible(
          createMockDatasetData({ rows: rows.slice(0, 2), cols: columns }),
        ),
      ).toBe(false);
    });

    it("should return false when there is no metric column", () => {
      expect(
        isSensible(
          createMockDatasetData({
            rows: [
              ["A", "x"],
              ["B", "y"],
              ["C", "z"],
            ],
            cols: [
              columns[0],
              createMockColumn({
                name: "Label",
                display_name: "Label",
                base_type: "type/Text",
              }),
            ],
          }),
        ),
      ).toBe(false);
    });
  });

  describe("checkRenderable", () => {
    it("should not throw for valid columns", () => {
      expect(() =>
        RADAR_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "radar.dimension": "Category", "radar.metrics": ["Sales"] },
        ),
      ).not.toThrow();
    });

    it("should not throw for empty data", () => {
      expect(() =>
        RADAR_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows: [], cols: columns }),
            },
          ],
          {},
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        RADAR_CHART_DEFINITION.checkRenderable(
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
