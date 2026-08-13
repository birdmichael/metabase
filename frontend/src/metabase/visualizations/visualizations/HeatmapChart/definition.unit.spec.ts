import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { HEATMAP_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(HEATMAP_CHART_DEFINITION.isSensible);

const columns = [
  createMockColumn({
    name: "X",
    display_name: "X",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Y",
    display_name: "Y",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Value",
    display_name: "Value",
    base_type: "type/Number",
    semantic_type: "type/Number",
  }),
];

const rows = [
  ["A", "P", 1],
  ["B", "Q", 2],
];

describe("HEATMAP_CHART_DEFINITION", () => {
  describe("isSensible", () => {
    it("should return true for two dimensions and a metric", () => {
      expect(
        isSensible(createMockDatasetData({ rows, cols: columns })),
      ).toBe(true);
    });

    it("should return false when there is only one dimension", () => {
      expect(
        isSensible(
          createMockDatasetData({
            rows: [["A", 1]],
            cols: [columns[0], columns[2]],
          }),
        ),
      ).toBe(false);
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
        HEATMAP_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "heatmap.x": "X", "heatmap.y": "Y", "heatmap.value": "Value" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        HEATMAP_CHART_DEFINITION.checkRenderable(
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

    it("should throw when X and Y are the same column", () => {
      expect(() =>
        HEATMAP_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "heatmap.x": "X", "heatmap.y": "X", "heatmap.value": "Value" },
        ),
      ).toThrow(
        new ChartSettingsError("Select two different columns for X and Y.", {
          section: "Data",
        }),
      );
    });
  });

  describe("settings", () => {
    it("exposes column mappings and display settings", () => {
      const settings = HEATMAP_CHART_DEFINITION.settings;
      expect(settings["heatmap.x"]).toBeDefined();
      expect(settings["heatmap.y"]).toBeDefined();
      expect(settings["heatmap.value"]).toBeDefined();
      expect(settings["heatmap.color_min"]).toBeDefined();
      expect(settings["heatmap.color_max"]).toBeDefined();
      expect(settings["heatmap.show_values"]?.getDefault?.()).toBe(false);
    });
  });

});
