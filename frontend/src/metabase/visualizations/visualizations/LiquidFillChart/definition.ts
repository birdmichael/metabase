import { t } from "ttag";

import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { columnSettings } from "metabase/visualizations/lib/settings/column";
import { metricSetting } from "metabase/visualizations/lib/settings/utils";
import {
  getDefaultSize,
  getMinSize,
} from "metabase/visualizations/shared/utils/sizes";
import type {
  ComputedVisualizationSettings,
  VisualizationDefinition,
  VisualizationSettingsDefinitions,
} from "metabase/visualizations/types";
import { isMetric } from "metabase-lib/v1/types/utils/isa";
import type { DatasetData, RawSeries } from "metabase-types/api";

const metricColumns = (data: DatasetData) => data.cols.filter(isMetric);

export const SETTINGS_DEFINITIONS: VisualizationSettingsDefinitions = {
  ...columnSettings({ getHidden: () => true }),
  ...metricSetting("liquid.metric", {
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
  "liquid.max": {
    getSection: () => t`Data`,
    get title() {
      return t`Maximum`;
    },
    widget: "number",
    persistDefault: true,
    dashboard: true,
  },
};

export const LIQUID_FILL_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Liquid`,
  identifier: "liquid",
  iconName: "beaker",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`liquid fill`,
  minSize: getMinSize("liquid"),
  defaultSize: getDefaultSize("liquid"),
  disableVisualizer: true,
  maxMetricsSupported: 1,
  maxDimensionsSupported: 0,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return rows.length >= 1 && metricColumns(data).length >= 1;
  },
  checkRenderable: (
    rawSeries: RawSeries,
    settings: ComputedVisualizationSettings,
  ) => {
    const { rows } = rawSeries[0].data;
    if (rows.length === 0) {
      return;
    }
    if (!settings["liquid.metric"]) {
      throw new ChartSettingsError(t`Which columns do you want to use?`, {
        section: `Data`,
      });
    }
  },
  settings: {
    ...SETTINGS_DEFINITIONS,
  },
};

