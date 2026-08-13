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

const defaultHeatmapColumns = (data: DatasetData) => {
  const dimensions = dimensionColumns(data);
  const metrics = metricColumns(data);
  return {
    x: dimensions[0]?.name,
    y: dimensions[1]?.name,
    value: metrics[0]?.name,
  };
};

export const SETTINGS_DEFINITIONS: VisualizationSettingsDefinitions = {
  ...columnSettings({ getHidden: () => true }),
  ...dimensionSetting("heatmap.x", {
    getSection: () => t`Data`,
    get title() {
      return t`X`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => defaultHeatmapColumns(data).x,
  }),
  ...dimensionSetting("heatmap.y", {
    getSection: () => t`Data`,
    get title() {
      return t`Y`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => defaultHeatmapColumns(data).y,
  }),
  ...metricSetting("heatmap.value", {
    getSection: () => t`Data`,
    get title() {
      return t`Value`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => defaultHeatmapColumns(data).value,
  }),

  "heatmap.color_min": {
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
  "heatmap.color_max": {
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
  "heatmap.show_values": {
    getSection: () => t`Display`,
    get title() {
      return t`Show values`;
    },
    widget: "toggle",
    getDefault: () => false,
    persistDefault: true,
    inline: true,
  },
};

export const HEATMAP_CHART_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Heatmap`,
  identifier: "heatmap",
  iconName: "grid",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`heatmap`,
  minSize: getMinSize("heatmap"),
  defaultSize: getDefaultSize("heatmap"),
  disableVisualizer: true,
  maxMetricsSupported: 1,
  maxDimensionsSupported: 2,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return (
      rows.length >= 1 &&
      dimensionColumns(data).length >= 2 &&
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
    if (
      !settings["heatmap.x"] ||
      !settings["heatmap.y"] ||
      !settings["heatmap.value"]
    ) {
      throw new ChartSettingsError(t`Which columns do you want to use?`, {
        section: `Data`,
      });
    }
    if (settings["heatmap.x"] === settings["heatmap.y"]) {
      throw new ChartSettingsError(
        t`Select two different columns for X and Y.`,
        { section: "Data" },
      );
    }
  },
  settings: {
    ...SETTINGS_DEFINITIONS,
  },
};
