import { t } from "ttag";

import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { columnSettings } from "metabase/visualizations/lib/settings/column";
import {
  dimensionSetting,
  getOptionFromColumn,
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

import { getRadarMetricNames } from "./utils";

const dimensionColumns = (data: DatasetData) =>
  data.cols.filter((col) => isDimension(col) && !isMetric(col));

const metricColumns = (data: DatasetData) => data.cols.filter(isMetric);

export const SETTINGS_DEFINITIONS: VisualizationSettingsDefinitions = {
  ...columnSettings({ getHidden: () => true }),
  ...dimensionSetting("radar.dimension", {
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
  "radar.metrics": {
    getSection: () => t`Data`,
    get title() {
      return t`Metrics`;
    },
    widget: "fields",
    persistDefault: true,
    dashboard: false,
    useRawSeries: true,
    getDefault: ([{ data }]: RawSeries) =>
      metricColumns(data).map((col) => col.name),
    getProps: ([{ data }]: RawSeries, vizSettings: ComputedVisualizationSettings) => {
      const options = metricColumns(data).map(getOptionFromColumn);
      const added = getRadarMetricNames(vizSettings);
      return {
        options,
        addAnother:
          options.length > added.length ? t`Add another metric` : null,
        columns: data.cols,
        showColumnSetting: true,
      };
    },
  },

  "radar.scale_max": {
    getSection: () => t`Display`,
    get title() {
      return t`Scale max`;
    },
    widget: "number",
    dashboard: true,
    getProps: () => ({
      get placeholder() {
        return t`Auto`;
      },
      options: { isNonNegative: true },
    }),
  },
  "radar.show_legend": {
    getSection: () => t`Display`,
    get title() {
      return t`Show legend`;
    },
    widget: "toggle",
    getDefault: () => true,
    persistDefault: true,
    inline: true,
  },
  "radar.show_labels": {
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

export const RADAR_CHART_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Radar`,
  identifier: "radar",
  iconName: "star",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`radar chart`,
  minSize: getMinSize("radar"),
  defaultSize: getDefaultSize("radar"),
  disableVisualizer: true,
  maxMetricsSupported: 20,
  maxDimensionsSupported: 1,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return (
      rows.length >= 3 &&
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
    const dimension = settings["radar.dimension"];
    const metrics = getRadarMetricNames(settings);
    if (!dimension || metrics.length === 0) {
      throw new ChartSettingsError(t`Which columns do you want to use?`, {
        section: `Data`,
      });
    }
  },
  settings: {
    ...SETTINGS_DEFINITIONS,
  },
};
