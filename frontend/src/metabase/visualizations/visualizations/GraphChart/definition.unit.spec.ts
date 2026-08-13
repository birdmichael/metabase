import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { GRAPH_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(GRAPH_CHART_DEFINITION.isSensible);

const columns = [
  createMockColumn({
    name: "Source",
    display_name: "Source",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Target",
    display_name: "Target",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Weight",
    display_name: "Weight",
    base_type: "type/Number",
    semantic_type: "type/Number",
  })
];

const rows = [["A", "B", 1], ["B", "C", 2]];

describe("GRAPH_CHART_DEFINITION", () => {
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
        GRAPH_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "graph.source": "Source", "graph.target": "Target" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        GRAPH_CHART_DEFINITION.checkRenderable(
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

