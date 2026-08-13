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

import { getCirclePackDimensionNames } from "./utils";

const dimensionColumns = (data: DatasetData) =>
  data.cols.filter((col) => isDimension(col) && !isMetric(col));

const metricColumns = (data: DatasetData) => data.cols.filter(isMetric);

export const SETTINGS_DEFINITIONS: VisualizationSettingsDefinitions = {
  ...columnSettings({ getHidden: () => true }),
  "circlepack.dimensions": {
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
      const added = getCirclePackDimensionNames(vizSettings);
      return {
        options,
        addAnother:
          options.length > added.length ? t`Add another level` : null,
        columns: data.cols,
        showColumnSetting: true,
      };
    },
  },
  ...metricSetting("circlepack.metric", {
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

  "circlepack.show_labels": {
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

export const CIRCLE_PACK_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Circle packing`,
  identifier: "circlepack",
  iconName: "group",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`circle packing chart`,
  minSize: getMinSize("circlepack"),
  defaultSize: getDefaultSize("circlepack"),
  disableVisualizer: true,
  maxMetricsSupported: 1,
  maxDimensionsSupported: 5,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return (
      rows.length >= 1 &&
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
    if (
      getCirclePackDimensionNames(settings).length === 0 ||
      !settings["circlepack.metric"]
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

