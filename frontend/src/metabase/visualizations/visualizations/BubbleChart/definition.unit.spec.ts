import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { BUBBLE_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(BUBBLE_CHART_DEFINITION.isSensible);

const columns = [
  createMockColumn({
    name: "X",
    display_name: "X",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
  createMockColumn({
    name: "Y",
    display_name: "Y",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
  createMockColumn({
    name: "Size",
    display_name: "Size",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
  createMockColumn({
    name: "Cat",
    display_name: "Cat",
    base_type: "type/Text",
  }),
];

const rows = [[1, 2, 3, "A"], [4, 5, 6, "B"]];

describe("BUBBLE_CHART_DEFINITION", () => {
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
        BUBBLE_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "bubble.x": "X", "bubble.y": "Y" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        BUBBLE_CHART_DEFINITION.checkRenderable(
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

