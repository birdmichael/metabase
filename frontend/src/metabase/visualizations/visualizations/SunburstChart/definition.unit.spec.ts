import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { SUNBURST_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(SUNBURST_CHART_DEFINITION.isSensible);

const columns = [
  createMockColumn({
    name: "Region",
    display_name: "Region",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Country",
    display_name: "Country",
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
  ["Americas", "US", 10],
  ["Americas", "Canada", 5],
  ["EMEA", "UK", 8],
];

describe("SUNBURST_CHART_DEFINITION", () => {
  describe("isSensible", () => {
    it("should return true for hierarchical dimensions and a metric", () => {
      expect(isSensible(createMockDatasetData({ rows, cols: columns }))).toBe(
        true,
      );
    });

    it("should return false with only one dimension", () => {
      expect(
        isSensible(
          createMockDatasetData({
            rows: [["US", 10]],
            cols: [columns[1], columns[2]],
          }),
        ),
      ).toBe(false);
    });
  });

  describe("checkRenderable", () => {
    it("should not throw for valid columns", () => {
      expect(() =>
        SUNBURST_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          {
            "sunburst.dimensions": ["Region", "Country"],
            "sunburst.metric": "Sales",
          },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        SUNBURST_CHART_DEFINITION.checkRenderable(
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
