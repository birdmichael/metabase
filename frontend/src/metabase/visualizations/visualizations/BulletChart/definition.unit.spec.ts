import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { BULLET_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(BULLET_CHART_DEFINITION.isSensible);

const columns = [
  createMockColumn({
    name: "name",
    display_name: "Name",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Actual",
    display_name: "Actual",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
  createMockColumn({
    name: "Target",
    display_name: "Target",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
];

const rows = [["North", 80, 100]];

describe("BULLET_CHART_DEFINITION", () => {
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
        BULLET_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "bullet.actual": "Actual", "bullet.target": "Target" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        BULLET_CHART_DEFINITION.checkRenderable(
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
    it("exposes a dimension mapping in Data", () => {
      const settings = BULLET_CHART_DEFINITION.settings;
      expect(settings["bullet.dimension"]?.widget).toBe("field");
      expect(settings["bullet.dimension"]?.getSection?.()).toBe("Data");
      expect(settings["bullet.actual"]).toBeDefined();
      expect(settings["bullet.target"]).toBeDefined();
      expect(settings["bullet.show_ranges"]?.getDefault?.()).toBe(true);
    });
  });
});
