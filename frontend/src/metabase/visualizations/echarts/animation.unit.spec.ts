import {
  ECHARTS_ANIMATION_DURATION,
  ECHARTS_ANIMATION_DURATION_UPDATE,
  ECHARTS_ANIMATION_EASING,
  getEChartsAnimationOptions,
} from "./animation";

describe("getEChartsAnimationOptions", () => {
  it("keeps duration 0 when animation is disabled", () => {
    expect(getEChartsAnimationOptions(false)).toEqual({
      animation: false,
      animationDuration: 0,
      animationDurationUpdate: 1,
    });
  });

  it("uses tasteful cubicOut motion when animation is enabled", () => {
    expect(getEChartsAnimationOptions(true)).toEqual({
      animation: true,
      animationDuration: ECHARTS_ANIMATION_DURATION,
      animationDurationUpdate: ECHARTS_ANIMATION_DURATION_UPDATE,
      animationEasing: ECHARTS_ANIMATION_EASING,
      animationEasingUpdate: ECHARTS_ANIMATION_EASING,
    });
    expect(ECHARTS_ANIMATION_DURATION).toBe(500);
    expect(ECHARTS_ANIMATION_DURATION_UPDATE).toBe(300);
    expect(ECHARTS_ANIMATION_EASING).toBe("cubicOut");
  });
});
