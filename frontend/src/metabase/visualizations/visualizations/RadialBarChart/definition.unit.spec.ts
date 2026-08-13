import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { RADIAL_BAR_DEFINITION } from "./definition";

const isSensible = checkNotNull(RADIAL_BAR_DEFINITION.isSensible);

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

describe("RADIAL_BAR_DEFINITION", () => {
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
        RADIAL_BAR_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "radialbar.dimension": "Category", "radialbar.metric": "Sales" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        RADIAL_BAR_DEFINITION.checkRenderable(
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
    it("exposes radialbar.max in Display", () => {
      const settings = RADIAL_BAR_DEFINITION.settings;
      expect(settings["radialbar.max"]?.widget).toBe("number");
      expect(settings["radialbar.max"]?.getSection?.()).toBe("Display");
      expect(settings["radialbar.max"]?.dashboard).toBeUndefined();
    });
  });
});
