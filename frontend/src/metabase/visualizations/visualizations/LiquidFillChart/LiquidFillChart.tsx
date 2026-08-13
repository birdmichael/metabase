import { useMemo } from "react";

import { isReducedMotionPreferred } from "metabase/utils/dom";
import { extractRemappings } from "metabase/visualizations";
import { ResponsiveEChartsRenderer } from "metabase/visualizations/components/EChartsRenderer";
import { useBrowserRenderingContext } from "metabase/visualizations/hooks/use-browser-rendering-context";
import type { VisualizationProps } from "metabase/visualizations/types";

import { LIQUID_FILL_DEFINITION } from "./definition";
import { getLiquidFillOption } from "./option";

export const LiquidFillChart = ({
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
      getLiquidFillOption(
        rawSeriesWithRemappings,
        settings,
        renderingContext,
        isAnimated,
      ),
    [rawSeriesWithRemappings, settings, renderingContext, isAnimated],
  );

  return <ResponsiveEChartsRenderer display="liquid" option={option} />;
};

Object.assign(LiquidFillChart, LIQUID_FILL_DEFINITION);

