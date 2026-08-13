import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { PYRAMID_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(PYRAMID_CHART_DEFINITION.isSensible);

const columns = [
  createMockColumn({
    name: "Age",
    display_name: "Age",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Male",
    display_name: "Male",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
  createMockColumn({
    name: "Female",
    display_name: "Female",
    base_type: "type/Number",
    semantic_type: "type/Number",
  })
];

const rows = [["0-10", 10, 12], ["10-20", 8, 9]];

describe("PYRAMID_CHART_DEFINITION", () => {
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
        PYRAMID_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "pyramid.category": "Age", "pyramid.left": "Male", "pyramid.right": "Female" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        PYRAMID_CHART_DEFINITION.checkRenderable(
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

