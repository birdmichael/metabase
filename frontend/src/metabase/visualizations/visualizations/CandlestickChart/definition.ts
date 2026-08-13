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
import { isDate, isDimension, isMetric } from "metabase-lib/v1/types/utils/isa";
import type { DatasetData, RawSeries } from "metabase-types/api";

const dimensionColumns = (data: DatasetData) =>
  data.cols.filter((col) => isDimension(col) && !isMetric(col));

const metricColumns = (data: DatasetData) => data.cols.filter(isMetric);

const defaultTime = (data: DatasetData) =>
  data.cols.find(isDate)?.name ?? dimensionColumns(data)[0]?.name;

export const SETTINGS_DEFINITIONS: VisualizationSettingsDefinitions = {
  ...columnSettings({ getHidden: () => true }),
  ...dimensionSetting("candlestick.time", {
    getSection: () => t`Data`,
    get title() {
      return t`Time`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => defaultTime(data),
  }),
  ...metricSetting("candlestick.open", {
    getSection: () => t`Data`,
    get title() {
      return t`Open`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => metricColumns(data)[0]?.name,
  }),
  ...metricSetting("candlestick.close", {
    getSection: () => t`Data`,
    get title() {
      return t`Close`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => metricColumns(data)[1]?.name,
  }),
  ...metricSetting("candlestick.low", {
    getSection: () => t`Data`,
    get title() {
      return t`Low`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => metricColumns(data)[2]?.name,
  }),
  ...metricSetting("candlestick.high", {
    getSection: () => t`Data`,
    get title() {
      return t`High`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => metricColumns(data)[3]?.name,
  }),

  "candlestick.increase_color": {
    getSection: () => t`Display`,
    get title() {
      return t`Increase color`;
    },
    widget: "color",
    persistDefault: true,
    getDefault: () => "#88bc50",
  },
  "candlestick.decrease_color": {
    getSection: () => t`Display`,
    get title() {
      return t`Decrease color`;
    },
    widget: "color",
    persistDefault: true,
    getDefault: () => "#ed6e6e",
  },
};

export const CANDLESTICK_CHART_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Candlestick`,
  identifier: "candlestick",
  iconName: "straight",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`candlestick chart`,
  minSize: getMinSize("candlestick"),
  defaultSize: getDefaultSize("candlestick"),
  disableVisualizer: true,
  maxMetricsSupported: 4,
  maxDimensionsSupported: 1,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return rows.length >= 1 && metricColumns(data).length >= 4;
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
      !settings["candlestick.time"] ||
      !settings["candlestick.open"] ||
      !settings["candlestick.close"] ||
      !settings["candlestick.low"] ||
      !settings["candlestick.high"]
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

