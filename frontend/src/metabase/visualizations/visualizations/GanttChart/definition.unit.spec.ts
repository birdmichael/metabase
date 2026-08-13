import { checkNotNull } from "metabase/utils/types";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { GANTT_CHART_DEFINITION } from "./definition";

const isSensible = checkNotNull(GANTT_CHART_DEFINITION.isSensible);

const columns = [
  createMockColumn({
    name: "Task",
    display_name: "Task",
    base_type: "type/Text",
  }),
  createMockColumn({
    name: "Start",
    display_name: "Start",
    base_type: "type/Integer",
    semantic_type: "type/Number",
  }),
  createMockColumn({
    name: "End",
    display_name: "End",
    base_type: "type/Integer",
    semantic_type: "type/Number",
  })
];

const rows = [["T1", 1, 4], ["T2", 2, 8]];

describe("GANTT_CHART_DEFINITION", () => {
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
        GANTT_CHART_DEFINITION.checkRenderable(
          [
            {
              card: createMockCard(),
              data: createMockDatasetData({ rows, cols: columns }),
            },
          ],
          { "gantt.category": "Task", "gantt.start": "Start", "gantt.end": "End" },
        ),
      ).not.toThrow();
    });

    it("should throw when columns are unset", () => {
      expect(() =>
        GANTT_CHART_DEFINITION.checkRenderable(
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

