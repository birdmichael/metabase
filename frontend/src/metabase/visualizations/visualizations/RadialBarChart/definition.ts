import { t } from "ttag";

import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { columnSettings } from "metabase/visualizations/lib/settings/column";
import {
  dimensionSetting,
  metricSetting,
} from "metabase/visualizations/lib/settings/utils";
import {
  getDefaultSize,
  getMinSize,
} from "metabase/visualizations/shared/utils/sizes";
import type {
  ComputedVisualizationSettings,
  VisualizationDefinition,
  VisualizationSettingsDefinitions,
} from "metabase/visualizations/types";
import { isDimension, isMetric } from "metabase-lib/v1/types/utils/isa";
import type { DatasetData, RawSeries } from "metabase-types/api";

const dimensionColumns = (data: DatasetData) =>
  data.cols.filter((col) => isDimension(col) && !isMetric(col));

const metricColumns = (data: DatasetData) => data.cols.filter(isMetric);

export const SETTINGS_DEFINITIONS: VisualizationSettingsDefinitions = {
  ...columnSettings({ getHidden: () => true }),
  ...dimensionSetting("radialbar.dimension", {
    getSection: () => t`Data`,
    get title() {
      return t`Dimension`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => dimensionColumns(data)[0]?.name,
  }),
  ...metricSetting("radialbar.metric", {
    getSection: () => t`Data`,
    get title() {
      return t`Metric`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => metricColumns(data)[0]?.name,
  }),

  "radialbar.max": {
    getSection: () => t`Display`,
    get title() {
      return t`Scale max`;
    },
    widget: "number",
    getProps: () => ({
      get placeholder() {
        return t`Auto`;
      },
      options: { isNonNegative: true },
    }),
  },
  "radialbar.show_labels": {
    getSection: () => t`Display`,
    get title() {
      return t`Show labels`;
    },
    widget: "toggle",
    getDefault: () => true,
    persistDefault: true,
    inline: true,
  },
};

export const RADIAL_BAR_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Radial bar`,
  identifier: "radialbar",
  iconName: "curved",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`radial bar chart`,
  minSize: getMinSize("radialbar"),
  defaultSize: getDefaultSize("radialbar"),
  disableVisualizer: true,
  maxMetricsSupported: 1,
  maxDimensionsSupported: 1,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return (
      rows.length >= 1 &&
      dimensionColumns(data).length >= 1 &&
      metricColumns(data).length >= 1
    );
  },
  checkRenderable: (
    rawSeries: RawSeries,
    settings: ComputedVisualizationSettings,
  ) => {
    const { rows } = rawSeries[0].data;
    if (rows.length === 0) {
      return;
    }
    if (!settings["radialbar.dimension"] || !settings["radialbar.metric"]) {
      throw new ChartSettingsError(t`Which columns do you want to use?`, {
        section: `Data`,
      });
    }
  },
  settings: {
    ...SETTINGS_DEFINITIONS,
  },
};
