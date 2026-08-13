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
  ...dimensionSetting("donut.dimension", {
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
  ...metricSetting("donut.metric", {
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

  "donut.show_legend": {
    getSection: () => t`Display`,
    get title() {
      return t`Show legend`;
    },
    widget: "toggle",
    getDefault: () => true,
    persistDefault: true,
    inline: true,
  },
  "donut.show_labels": {
    getSection: () => t`Display`,
    get title() {
      return t`Show labels`;
    },
    widget: "toggle",
    getDefault: () => false,
    persistDefault: true,
    inline: true,
  },
  "donut.show_total": {
    getSection: () => t`Display`,
    get title() {
      return t`Show total`;
    },
    widget: "toggle",
    getDefault: () => true,
    persistDefault: true,
    inline: true,
  },
};

export const DONUT_CHART_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Donut`,
  identifier: "donut",
  iconName: "pie",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`donut chart`,
  minSize: getMinSize("donut"),
  defaultSize: getDefaultSize("donut"),
  disableVisualizer: true,
  maxMetricsSupported: 1,
  maxDimensionsSupported: 1,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return (
      rows.length >= 2 &&
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
    if (!settings["donut.dimension"] || !settings["donut.metric"]) {
      throw new ChartSettingsError(t`Which columns do you want to use?`, {
        section: `Data`,
      });
    }
  },
  settings: {
    ...SETTINGS_DEFINITIONS,
  },
};

