import { useMemo } from "react";

import { isReducedMotionPreferred } from "metabase/utils/dom";
import { extractRemappings } from "metabase/visualizations";
import { ResponsiveEChartsRenderer } from "metabase/visualizations/components/EChartsRenderer";
import { useBrowserRenderingContext } from "metabase/visualizations/hooks/use-browser-rendering-context";
import type { VisualizationProps } from "metabase/visualizations/types";

import { BUBBLE_CHART_DEFINITION } from "./definition";
import { getBubbleChartOption } from "./option";

export const BubbleChart = ({
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
      getBubbleChartOption(
        rawSeriesWithRemappings,
        settings,
        renderingContext,
        isAnimated,
      ),
    [rawSeriesWithRemappings, settings, renderingContext, isAnimated],
  );

  return <ResponsiveEChartsRenderer display="bubble" option={option} />;
};

Object.assign(BubbleChart, BUBBLE_CHART_DEFINITION);

