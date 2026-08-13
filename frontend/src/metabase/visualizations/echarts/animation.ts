/**
 * Shared ECharts animation defaults for OSS charts.
 *
 * Static exports and `prefers-reduced-motion` keep duration at 0 (the existing
 * isAnimated=false path). Interactive charts use a short cubicOut motion.
 */
export const ECHARTS_ANIMATION_DURATION = 500;
export const ECHARTS_ANIMATION_DURATION_UPDATE = 300;
export const ECHARTS_ANIMATION_EASING = "cubicOut" as const;

export function getEChartsAnimationOptions(isAnimated: boolean) {
  if (!isAnimated) {
    return {
      animation: false,
      animationDuration: 0,
      // 1ms keeps opacity fades without visible shape tweening
      animationDurationUpdate: 1,
    };
  }

  return {
    animation: true,
    animationDuration: ECHARTS_ANIMATION_DURATION,
    animationDurationUpdate: ECHARTS_ANIMATION_DURATION_UPDATE,
    animationEasing: ECHARTS_ANIMATION_EASING,
    animationEasingUpdate: ECHARTS_ANIMATION_EASING,
  };
}
