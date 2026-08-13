import { useMemo } from "react";

import { isReducedMotionPreferred } from "metabase/utils/dom";
import { extractRemappings } from "metabase/visualizations";
import { ResponsiveEChartsRenderer } from "metabase/visualizations/components/EChartsRenderer";
import { useBrowserRenderingContext } from "metabase/visualizations/hooks/use-browser-rendering-context";
import type { VisualizationProps } from "metabase/visualizations/types";

import { CANDLESTICK_CHART_DEFINITION } from "./definition";
import { getCandlestickChartOption } from "./option";

export const CandlestickChart = ({
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
      getCandlestickChartOption(
        rawSeriesWithRemappings,
        settings,
        renderingContext,
        isAnimated,
      ),
    [rawSeriesWithRemappings, settings, renderingContext, isAnimated],
  );

  return <ResponsiveEChartsRenderer display="candlestick" option={option} />;
};

Object.assign(CandlestickChart, CANDLESTICK_CHART_DEFINITION);

