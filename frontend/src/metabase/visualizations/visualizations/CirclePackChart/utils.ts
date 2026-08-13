import type { ComputedVisualizationSettings } from "metabase/visualizations/types";

export const getCirclePackDimensionNames = (
  settings: ComputedVisualizationSettings,
): string[] => {
  const dimensions = settings["circlepack.dimensions"];
  if (Array.isArray(dimensions)) {
    return dimensions.filter((name): name is string => typeof name === "string");
  }
  return typeof dimensions === "string" ? [dimensions] : [];
};

