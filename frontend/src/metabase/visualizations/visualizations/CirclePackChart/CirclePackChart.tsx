import { useMemo } from "react";

import { isReducedMotionPreferred } from "metabase/utils/dom";
import { extractRemappings } from "metabase/visualizations";
import { ResponsiveEChartsRenderer } from "metabase/visualizations/components/EChartsRenderer";
import { useBrowserRenderingContext } from "metabase/visualizations/hooks/use-browser-rendering-context";
import type { VisualizationProps } from "metabase/visualizations/types";

import { CIRCLE_PACK_DEFINITION } from "./definition";
import { getCirclePackChartOption } from "./option";

export const CirclePackChart = ({
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
      getCirclePackChartOption(
        rawSeriesWithRemappings,
        settings,
        renderingContext,
        isAnimated,
      ),
    [rawSeriesWithRemappings, settings, renderingContext, isAnimated],
  );

  return <ResponsiveEChartsRenderer display="circlepack" option={option} />;
};

Object.assign(CirclePackChart, CIRCLE_PACK_DEFINITION);

