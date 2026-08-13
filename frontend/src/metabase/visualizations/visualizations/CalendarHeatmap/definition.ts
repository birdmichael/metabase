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

const defaultCalendarColumns = (data: DatasetData) => {
  const dateColumn = data.cols.find(isDate) ?? dimensionColumns(data)[0];
  return {
    date: dateColumn?.name,
    value: metricColumns(data)[0]?.name,
  };
};

export const SETTINGS_DEFINITIONS: VisualizationSettingsDefinitions = {
  ...columnSettings({ getHidden: () => true }),
  ...dimensionSetting("calendar.date", {
    getSection: () => t`Data`,
    get title() {
      return t`Date`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => defaultCalendarColumns(data).date,
  }),
  ...metricSetting("calendar.value", {
    getSection: () => t`Data`,
    get title() {
      return t`Value`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => defaultCalendarColumns(data).value,
  }),

  "calendar.color_min": {
    getSection: () => t`Display`,
    get title() {
      return t`Color scale min`;
    },
    widget: "number",
    dashboard: true,
    getProps: () => ({
      get placeholder() {
        return t`Auto`;
      },
    }),
  },
  "calendar.color_max": {
    getSection: () => t`Display`,
    get title() {
      return t`Color scale max`;
    },
    widget: "number",
    dashboard: true,
    getProps: () => ({
      get placeholder() {
        return t`Auto`;
      },
    }),
  },
};

export const CALENDAR_HEATMAP_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Calendar`,
  identifier: "calendar",
  iconName: "calendar",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`calendar heatmap`,
  minSize: getMinSize("calendar"),
  defaultSize: getDefaultSize("calendar"),
  disableVisualizer: true,
  maxMetricsSupported: 1,
  maxDimensionsSupported: 1,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return (
      rows.length >= 1 &&
      data.cols.some(isDate) &&
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
    if (!settings["calendar.date"] || !settings["calendar.value"]) {
      throw new ChartSettingsError(t`Which columns do you want to use?`, {
        section: `Data`,
      });
    }
  },
  settings: {
    ...SETTINGS_DEFINITIONS,
  },
};
