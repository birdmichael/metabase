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
  }),
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

  describe("settings", () => {
    it("exposes liquid.max in Display so it is editable in question settings", () => {
      const settings = LIQUID_FILL_DEFINITION.settings;
      expect(settings["liquid.max"]?.widget).toBe("number");
      expect(settings["liquid.max"]?.getSection?.()).toBe("Display");
      expect(settings["liquid.max"]?.dashboard).toBeUndefined();
      expect(settings["liquid.show_percent"]?.getDefault?.()).toBe(true);
    });
  });
});
