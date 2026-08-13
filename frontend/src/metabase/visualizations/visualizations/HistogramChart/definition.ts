import { t } from "ttag";

import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { columnSettings } from "metabase/visualizations/lib/settings/column";
import { fieldSetting } from "metabase/visualizations/lib/settings/utils";
import {
  getDefaultSize,
  getMinSize,
} from "metabase/visualizations/shared/utils/sizes";
import type {
  ComputedVisualizationSettings,
  VisualizationDefinition,
  VisualizationSettingsDefinitions,
} from "metabase/visualizations/types";
import { isDate, isNumeric } from "metabase-lib/v1/types/utils/isa";
import type { DatasetData, RawSeries } from "metabase-types/api";

const numericColumns = (data: DatasetData) =>
  data.cols.filter((col) => isNumeric(col) && !isDate(col));

export const SETTINGS_DEFINITIONS: VisualizationSettingsDefinitions = {
  ...columnSettings({ getHidden: () => true }),
  ...fieldSetting("histogram.metric", {
    getSection: () => t`Data`,
    get title() {
      return t`Column`;
    },
    fieldFilter: (col) => isNumeric(col) && !isDate(col),
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => numericColumns(data)[0]?.name,
  }),
};

export const HISTOGRAM_CHART_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Histogram`,
  identifier: "histogram",
  iconName: "bar",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`histogram`,
  minSize: getMinSize("histogram"),
  defaultSize: getDefaultSize("histogram"),
  disableVisualizer: true,
  maxMetricsSupported: 1,
  maxDimensionsSupported: 0,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return rows.length >= 5 && numericColumns(data).length >= 1;
  },
  checkRenderable: (
    rawSeries: RawSeries,
    settings: ComputedVisualizationSettings,
  ) => {
    const { rows } = rawSeries[0].data;
    if (rows.length === 0) {
      return;
    }
    if (!settings["histogram.metric"]) {
      throw new ChartSettingsError(t`Which columns do you want to use?`, {
        section: `Data`,
      });
    }
  },
  settings: {
    ...SETTINGS_DEFINITIONS,
  },
};

