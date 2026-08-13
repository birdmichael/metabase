import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { HISTOGRAM_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(HISTOGRAM_CHART_DEFINITION.isSensible);

const columns = [
  createMockColumn({
    name: "Value",
    display_name: "Value",
    base_type: "type/Number",
    semantic_type: "type/Number",
  })
];

const rows = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12], [13], [14], [15], [16], [17], [18], [19]];

describe("HISTOGRAM_CHART_DEFINITION", () => {
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
        HISTOGRAM_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "histogram.metric": "Value" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        HISTOGRAM_CHART_DEFINITION.checkRenderable(
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
    it("defaults to 10 bins", () => {
      const settings = HISTOGRAM_CHART_DEFINITION.settings;
      expect(settings["histogram.metric"]).toBeDefined();
      expect(settings["histogram.bins"]?.getDefault?.()).toBe(10);
    });
  });

});

