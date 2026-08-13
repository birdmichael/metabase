import type { ComputedVisualizationSettings } from "metabase/visualizations/types";

export const getRadarMetricNames = (
  settings: ComputedVisualizationSettings,
): string[] => {
  const metrics = settings["radar.metrics"];
  if (Array.isArray(metrics)) {
    return metrics.filter((name): name is string => typeof name === "string");
  }
  return typeof metrics === "string" ? [metrics] : [];
};
