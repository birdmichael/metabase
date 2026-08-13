import {
  BarChart,
  BoxplotChart,
  CustomChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  SunburstChart,
  TreemapChart,
} from "echarts/charts";
import {
  BrushComponent,
  CalendarComponent,
  DataZoomComponent,
  DatasetComponent,
  GraphicComponent,
  GridComponent,
  MarkLineComponent,
  RadarComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { LabelLayout } from "echarts/features";
import { SVGRenderer } from "echarts/renderers";

export const registerEChartsModules = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  use([
    LineChart,
    BarChart,
    BoxplotChart,
    ScatterChart,
    CustomChart,
    SunburstChart,
    PieChart,
    RadarChart,
    HeatmapChart,
    GraphicComponent,
    GridComponent,
    RadarComponent,
    VisualMapComponent,
    CalendarComponent,
    BarChart,
    SVGRenderer,
    MarkLineComponent,
    DataZoomComponent,
    ToolboxComponent,
    BrushComponent,
    DatasetComponent,
    SankeyChart,
    TreemapChart,
    LabelLayout,
    TooltipComponent,
  ]);
};
