import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { CIRCLE_PACK_DEFINITION } from "./definition";

const isSensible = checkNotNull(CIRCLE_PACK_DEFINITION.isSensible);

const columns = [
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
  })
];

const rows = [["N", "A", 10], ["N", "B", 20]];

describe("CIRCLE_PACK_DEFINITION", () => {
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
        CIRCLE_PACK_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "circlepack.dimensions": ["Region"], "circlepack.metric": "Sales" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        CIRCLE_PACK_DEFINITION.checkRenderable(
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

