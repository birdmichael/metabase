import { t } from "ttag";

import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import { columnSettings } from "metabase/visualizations/lib/settings/column";
import {
  dimensionSetting,
  fieldSetting,
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
import { isDate, isDimension, isMetric, isNumeric } from "metabase-lib/v1/types/utils/isa";
import type { DatasetColumn, DatasetData, RawSeries } from "metabase-types/api";

const dimensionColumns = (data: DatasetData) =>
  data.cols.filter((col) => isDimension(col) && !isMetric(col));

const startEndFilter = (col: DatasetColumn) => isDate(col) || isNumeric(col);

const startEndColumns = (data: DatasetData) => data.cols.filter(startEndFilter);

export const SETTINGS_DEFINITIONS: VisualizationSettingsDefinitions = {
  ...columnSettings({ getHidden: () => true }),
  ...dimensionSetting("gantt.category", {
    getSection: () => t`Data`,
    get title() {
      return t`Category`;
    },
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => dimensionColumns(data)[0]?.name,
  }),
  ...fieldSetting("gantt.start", {
    getSection: () => t`Data`,
    get title() {
      return t`Start`;
    },
    fieldFilter: startEndFilter,
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => startEndColumns(data)[0]?.name,
  }),
  ...fieldSetting("gantt.end", {
    getSection: () => t`Data`,
    get title() {
      return t`End`;
    },
    fieldFilter: startEndFilter,
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }]) => startEndColumns(data)[1]?.name ?? startEndColumns(data)[0]?.name,
  }),

  ...fieldSetting("gantt.progress", {
    getSection: () => t`Data`,
    get title() {
      return t`Progress`;
    },
    fieldFilter: isNumeric,
    showColumnSetting: true,
    persistDefault: true,
    dashboard: false,
    autoOpenWhenUnset: false,
    getDefault: ([{ data }], settings) => {
      const used = new Set([settings["gantt.start"], settings["gantt.end"]]);
      return data.cols.find((col) => isNumeric(col) && !used.has(col.name))?.name;
    },
    readDependencies: ["gantt.start", "gantt.end"],
  }),
};

export const GANTT_CHART_DEFINITION: VisualizationDefinition = {
  getUiName: () => t`Gantt`,
  identifier: "gantt",
  iconName: "clock",
  usesEChartsRenderer: true,
  // eslint-disable-next-line ttag/no-module-declaration -- see metabase#55045
  noun: t`gantt chart`,
  minSize: getMinSize("gantt"),
  defaultSize: getDefaultSize("gantt"),
  disableVisualizer: true,
  maxMetricsSupported: 0,
  maxDimensionsSupported: 3,
  hasEmptyState: true,
  isSensible: (data: DatasetData) => {
    const { rows } = data;
    return (
      rows.length >= 1 &&
      dimensionColumns(data).length >= 1 &&
      startEndColumns(data).length >= 2
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
      !settings["gantt.category"] ||
      !settings["gantt.start"] ||
      !settings["gantt.end"]
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

