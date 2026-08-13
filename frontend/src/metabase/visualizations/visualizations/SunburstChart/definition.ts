import { t } from "ttag";

import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { columnSettings } from "metabase/visualizations/lib/settings/column";
import {
  getOptionFromColumn,
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

import { getSunburstDimensionNames } from "./utils";

const dimensionColumns = (data: DatasetData) =>
  data.cols.filter((col) => isDimension(col) && !isMetric(col));

const metricColumns = (data: DatasetData) => data.cols.filter(isMetric);

export const SETTINGS_DEFINITIONS: VisualizationSettingsDefinitions = {
  ...columnSettings({ getHidden: () => true }),
  "sunburst.dimensions": {
    getSection: () => t`Data`,
    get title() {
      return t`Dimensions`;
    },
    widget: "fields",
    persistDefault: true,
    dashboard: false,
    useRawSeries: true,
    getDefault: ([{ data }]: RawSeries) =>
      dimensionColumns(data)
        .slice(0, 3)
        .map((col) => col.name),
    getProps: (
      [{ data }]: RawSeries,
      vizSettings: ComputedVisualizationSettings,
    ) => {
      const options = dimensionColumns(data).map(getOptionFromColumn);
      const added = getSunburstDimensionNames(vizSettings);
      return {
        options,
        addAnother:
          options.length > added.length ? t`Add another level` : null,
        columns: data.cols,
        showColumnSetting: true,
      };
    },
  },
  ...metricSetting("sunburst.metric", {
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
};

export const SUNBURST_CHART_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Sunburst`,
  identifier: "sunburst",
  iconName: "sun",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`sunburst chart`,
  minSize: getMinSize("sunburst"),
  defaultSize: getDefaultSize("sunburst"),
  disableVisualizer: true,
  maxMetricsSupported: 1,
  maxDimensionsSupported: 5,
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
      getSunburstDimensionNames(settings).length === 0 ||
      !settings["sunburst.metric"]
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
