import { useMemo } from "react";

import { isReducedMotionPreferred } from "metabase/utils/dom";
import { extractRemappings } from "metabase/visualizations";
import { ResponsiveEChartsRenderer } from "metabase/visualizations/components/EChartsRenderer";
import { useBrowserRenderingContext } from "metabase/visualizations/hooks/use-browser-rendering-context";
import type { VisualizationProps } from "metabase/visualizations/types";

import { ROSE_CHART_DEFINITION } from "./definition";
import { getRoseChartOption } from "./option";

export const RoseChart = ({
  rawSeries,
  settings,
  fontFamily,
  isDashboard,
  isFullscreen,
}: VisualizationProps) => {
  const rawSeriesWithRemappings = useMemo(
    () => extractRemappings(rawSeries),
    [rawSeries],
  );
  const renderingContext = useBrowserRenderingContext({
    fontFamily,
    isDashboard,
    isFullscreen,
  });
  const isAnimated = !isReducedMotionPreferred();
  const option = useMemo(
    () =>
      getRoseChartOption(
        rawSeriesWithRemappings,
        settings,
        renderingContext,
        isAnimated,
      ),
    [rawSeriesWithRemappings, settings, renderingContext, isAnimated],
  );

  return <ResponsiveEChartsRenderer display="rose" option={option} />;
};

Object.assign(RoseChart, ROSE_CHART_DEFINITION);
