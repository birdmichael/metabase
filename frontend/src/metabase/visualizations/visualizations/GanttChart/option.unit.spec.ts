import { DEFAULT_VISUALIZATION_THEME } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";
import { createMockCard } from "metabase-types/api/mocks/card";
import {
  createMockColumn,
  createMockDatasetData,
} from "metabase-types/api/mocks/dataset";

import { getGanttChartOption } from "./option";

const renderingContext: RenderingContext = {
  getColor: (name) => name,
  measureText: () => 0,
  measureTextHeight: () => 0,
  fontFamily: "",
  theme: DEFAULT_VISUALIZATION_THEME,
};

const rawSeries = [
  {
    card: createMockCard(),
    data: createMockDatasetData({
      rows: [["T1", 1, 4], ["T2", 2, 8]],
      cols: [
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
      ],
    }),
  },
];

describe("getGanttChartOption", () => {
  it("builds the expected series", () => {
    const option = getGanttChartOption(
      rawSeries,
      { "gantt.category": "Task", "gantt.start": "Start", "gantt.end": "End" },
      renderingContext,
      true,
    );
    expect(option.series).toEqual([
      expect.objectContaining({ type: "custom" }),
    ]);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(500);
  });

  it("disables motion when not animated", () => {
    const option = getGanttChartOption(
      rawSeries,
      { "gantt.category": "Task", "gantt.start": "Start", "gantt.end": "End" },
      renderingContext,
      false,
    );
    expect(option.animation).toBe(false);
  });

  it("encodes progress onto each bar", () => {
    const option = getGanttChartOption(
      [
        {
          card: createMockCard(),
          data: createMockDatasetData({
            rows: [["T1", 1, 5, 0.4]],
            cols: [
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
              }),
              createMockColumn({
                name: "Done",
                display_name: "Done",
                base_type: "type/Float",
                semantic_type: "type/Number",
              }),
            ],
          }),
        },
      ],
      {
        "gantt.category": "Task",
        "gantt.start": "Start",
        "gantt.end": "End",
        "gantt.progress": "Done",
      },
      renderingContext,
      false,
    );
    const series = option.series as { data: { value: number[] }[] }[];
    expect(series[0].data[0].value).toEqual([0, 1, 5, 0.4]);
  });

});

