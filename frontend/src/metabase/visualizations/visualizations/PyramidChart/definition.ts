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
  ...dimensionSetting("pyramid.category", {
    getSection: () => t`Data`,
    get title() {
      return t`Category`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => dimensionColumns(data)[0]?.name,
  }),
  ...metricSetting("pyramid.left", {
    getSection: () => t`Data`,
    get title() {
      return t`Left`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => metricColumns(data)[0]?.name,
  }),
  ...metricSetting("pyramid.right", {
    getSection: () => t`Data`,
    get title() {
      return t`Right`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => metricColumns(data)[1]?.name,
  }),
};

export const PYRAMID_CHART_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Pyramid`,
  identifier: "pyramid",
  iconName: "arrow_split",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`population pyramid`,
  minSize: getMinSize("pyramid"),
  defaultSize: getDefaultSize("pyramid"),
  disableVisualizer: true,
  maxMetricsSupported: 2,
  maxDimensionsSupported: 1,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return (
      rows.length >= 1 &&
      dimensionColumns(data).length >= 1 &&
      metricColumns(data).length >= 2
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
    if (
      !settings["pyramid.category"] ||
      !settings["pyramid.left"] ||
      !settings["pyramid.right"]
    ) {
      throw new ChartSettingsError(t`Which columns do you want to use?`, {
        section: `Data`,
      });
    }
  },
  settings: {
    ...SETTINGS_DEFINITIONS,
  },
};

