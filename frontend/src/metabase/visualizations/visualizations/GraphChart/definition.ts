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
  ...dimensionSetting("graph.source", {
    getSection: () => t`Data`,
    get title() {
      return t`Source`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => dimensionColumns(data)[0]?.name,
  }),
  ...dimensionSetting("graph.target", {
    getSection: () => t`Data`,
    get title() {
      return t`Target`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => dimensionColumns(data)[1]?.name,
  }),
  ...metricSetting("graph.value", {
    getSection: () => t`Data`,
    get title() {
      return t`Value`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => metricColumns(data)[0]?.name,
  }),

  "graph.layout": {
    getSection: () => t`Display`,
    get title() {
      return t`Layout`;
    },
    widget: "select",
    persistDefault: true,
    getDefault: () => "force",
    getProps: () => ({
      options: [
        { name: t`Force`, value: "force" },
        { name: t`Circular`, value: "circular" },
      ],
    }),
  },
  "graph.show_labels": {
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

export const GRAPH_CHART_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Network`,
  identifier: "graph",
  iconName: "network",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`network graph`,
  minSize: getMinSize("graph"),
  defaultSize: getDefaultSize("graph"),
  disableVisualizer: true,
  maxMetricsSupported: 1,
  maxDimensionsSupported: 2,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return rows.length >= 1 && dimensionColumns(data).length >= 2;
  },
  checkRenderable: (
    rawSeries: RawSeries,
    settings: ComputedVisualizationSettings,
  ) => {
    const { rows } = rawSeries[0].data;
    if (rows.length === 0) {
      return;
    }
    if (!settings["graph.source"] || !settings["graph.target"]) {
      throw new ChartSettingsError(t`Which columns do you want to use?`, {
        section: `Data`,
      });
    }
    if (settings["graph.source"] === settings["graph.target"]) {
      throw new ChartSettingsError(
        t`Select two different columns for source and target.`,
        { section: "Data" },
      );
    }
  },
  settings: {
    ...SETTINGS_DEFINITIONS,
  },
};

