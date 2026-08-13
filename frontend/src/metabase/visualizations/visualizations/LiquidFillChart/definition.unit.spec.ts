import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { LIQUID_FILL_DEFINITION } from "./definition";

const isSensible = checkNotNull(LIQUID_FILL_DEFINITION.isSensible);

const columns = [
  createMockColumn({
    name: "Ratio",
    display_name: "Ratio",
    base_type: "type/Number",
    semantic_type: "type/Number",
  })
];

const rows = [[0.65]];

describe("LIQUID_FILL_DEFINITION", () => {
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
        LIQUID_FILL_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "liquid.metric": "Ratio" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        LIQUID_FILL_DEFINITION.checkRenderable(
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

