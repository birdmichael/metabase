import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { WAFFLE_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(WAFFLE_CHART_DEFINITION.isSensible);

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

describe("WAFFLE_CHART_DEFINITION", () => {
  describe("isSensible", () => {
    it("should return true for a dimension and a metric", () => {
      expect(isSensible(createMockDatasetData({ rows, cols: columns }))).toBe(
        true,
      );
    });

    it("should return false when there are no rows", () => {
      expect(
        isSensible(createMockDatasetData({ rows: [], cols: columns })),
      ).toBe(false);
    });
  });

  describe("checkRenderable", () => {
    it("should not throw for valid columns", () => {
      expect(() =>
        WAFFLE_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "waffle.dimension": "Category", "waffle.metric": "Sales" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        WAFFLE_CHART_DEFINITION.checkRenderable(
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

