import type { ComputedVisualizationSettings } from "metabase/visualizations/types";

export const getSunburstDimensionNames = (
  settings: ComputedVisualizationSettings,
): string[] => {
  const dimensions = settings["sunburst.dimensions"];
  if (Array.isArray(dimensions)) {
    return dimensions.filter((name): name is string => typeof name === "string");
  }
  return typeof dimensions === "string" ? [dimensions] : [];
};
