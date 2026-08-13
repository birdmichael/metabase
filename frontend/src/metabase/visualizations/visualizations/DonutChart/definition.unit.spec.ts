import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { DONUT_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(DONUT_CHART_DEFINITION.isSensible);

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
];

const rows = [
  ["A", 10],
  ["B", 20],
  ["C", 15],
];

describe("DONUT_CHART_DEFINITION", () => {
  describe("isSensible", () => {
    it("should return true for a dimension and a metric", () => {
      expect(isSensible(createMockDatasetData({ rows, cols: columns }))).toBe(
        true,
      );
    });

    it("should return false with fewer than 2 row(s)", () => {
      expect(
        isSensible(
          createMockDatasetData({ rows: rows.slice(0, 1), cols: columns }),
        ),
      ).toBe(false);
    });
  });

  describe("checkRenderable", () => {
    it("should not throw for valid columns", () => {
      expect(() =>
        DONUT_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "donut.dimension": "Category", "donut.metric": "Sales" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        DONUT_CHART_DEFINITION.checkRenderable(
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

