# OSS 可视化：新增图表、样式与用法

本 fork 在 AGPL Community Edition（`MB_EDITION=oss`，基线 `v0.63.2`）上**从零**加的图表和动效。不是企业版移植，不涉及 `enterprise/`。

效果预览（不需要打 Metabase 包）：[oss-viz-gallery](./oss-viz-gallery/README.md)。

在 Metabase 里使用：提问跑出结果后，点可视化选择器，选对应类型。下列 `display` 是写入问题/卡片的标识。

## 改了哪些样式

### 共享动效

文件：`frontend/src/metabase/visualizations/echarts/animation.ts`

原先笛卡尔图把 `animationDuration` 设成 `0`，看起来像没动画。现在统一：

| 场景                                 | 行为                                    |
| ------------------------------------ | --------------------------------------- |
| 交互界面（未开系统「减少动态效果」） | 时长 500ms，更新 300ms，缓动 `cubicOut` |
| 静态导出 / `prefers-reduced-motion`  | `animation: false`，时长 0              |

已接到：柱/线/面积/组合/条形/瀑布/散点、饼图、桑基、矩形树，以及下面所有新图。

### 预览页浅色 / 深色

文件：`docs/oss-viz-gallery/styles.css`、`app.js`

- 默认浅色：浅灰底、白卡片、深色轴标签
- 右上角切换深色：原深色仪表盘配色
- 热力/日历色带、图例、提示框随主题变化

Metabase 产品本身的浅色/深色仍走应用主题，这一套只作用于预览图库。

## 新图用法

问号列名按你的查询来。设置项在可视化「数据 / 显示」里，写入 `card.visualization_settings`，保存问题、加到仪表盘、刷新后仍然生效。

### 雷达图 `radar`

适合：多指标对比（营收、转化、留存…）。

- 数据：1 个分类维度 + 1 个或多个数值指标；行数建议 ≥ 3
- 数据设置：`radar.dimension`（轴），`radar.metrics`（系列）
- 显示设置：`radar.scale_max`（可选，轴最大值；空则按数据自动），`radar.show_legend`（默认开），`radar.show_labels`（默认开）

### 矩阵热力图 `heatmap`

适合：两个分类交叉的强度（星期 × 小时）。

- 数据：2 个维度 + 1 个指标
- 数据设置：`heatmap.x`、`heatmap.y`、`heatmap.value`
- 显示设置：`heatmap.color_min` / `heatmap.color_max`（色带范围，空则按数据），`heatmap.show_values`（默认关）

### 旭日图 `sunburst`

适合：层级占比（区域 → 产品）。

- 数据：2 个及以上分类维度 + 1 个指标；从内环到外环是层级
- 数据设置：`sunburst.dimensions`、`sunburst.metric`
- 显示设置：`sunburst.show_labels`（默认开）

### 玫瑰图 `rose`

适合：少量分类的占比，用半径强调差异。

- 数据：1 个维度 + 1 个指标
- 数据设置：`rose.dimension`、`rose.metric`
- 显示设置：`rose.rose_type`（`area` 南丁格尔 / `radius`），`rose.show_legend`（默认开），`rose.show_labels`（默认开）

### 日历热力 `calendar`

适合：按天看指标（日活、GMV）。和矩阵热力不是同一种图。

- 数据：1 个日期列 + 1 个指标
- 数据设置：`calendar.date`、`calendar.value`
- 显示设置：`calendar.color_min` / `calendar.color_max`（色带范围，空则按数据）

### 环形图 `donut`

适合：构成比，圆心看总计。和饼图分开入口。

- 数据：1 个维度 + 1 个指标
- 数据设置：`donut.dimension`、`donut.metric`
- 显示设置：`donut.show_legend`（默认开），`donut.show_labels`（默认关），`donut.show_total`（默认开）

### 气泡图 `bubble`

适合：两个数值的相关，第三维用大小。

- 数据：X 指标、Y 指标，可选大小指标、分类维度
- 数据设置：`bubble.x`、`bubble.y`、`bubble.size`、`bubble.dimension`
- 显示设置：`bubble.show_legend`（有分类时默认开）

### 词云 `wordcloud`

适合：关键词权重。自写螺线排布，没有第三方 wordcloud 插件。

- 数据：词（维度）+ 权重（指标）
- 数据设置：`wordcloud.dimension`、`wordcloud.metric`
- 显示设置：`wordcloud.stopwords`（逗号分隔，这些词不画）

### 子弹图 `bullet`

适合：实际 vs 目标。

- 数据：可选分类维度 + 实际值指标；目标可以是第二指标或设置里的目标值。有分类时每一类一根子弹。
- 数据设置：`bullet.dimension`（分类，可选）、`bullet.actual`、`bullet.target`、`bullet.target_value`
- 显示设置：`bullet.show_ranges`（差/中/好背景带，默认开）

### 直方图 `histogram`

适合：一个数值列的分布。不是分类柱状图。

- 数据：1 个数值列，前端分桶
- 数据设置：`histogram.metric`
- 显示设置：`histogram.bins`（默认 10；未设时按 Sturges）

### 径向柱图 `radialbar`

适合：少量分类的完成率，极坐标柱。

- 数据：1 个维度 + 1 个指标
- 数据设置：`radialbar.dimension`、`radialbar.metric`
- 显示设置：`radialbar.max`（角度轴最大值，空则按数据），`radialbar.show_labels`（默认开）

### 棒棒糖图 `lollipop`

适合：分类对比，比柱状更轻。

- 数据：1 个维度 + 1 个指标
- 数据设置：`lollipop.dimension`、`lollipop.metric`
- 显示设置：`lollipop.show_values`（默认关）

### 水球图 `liquid`

适合：单个完成率（0–1 或占最大值的百分比）。自写正弦液面，不是 `echarts-liquidfill`。

- 数据：1 个数值
- 数据设置：`liquid.metric`
- 显示设置：`liquid.max`（分母；空则 1 / 100 / 实际值）、`liquid.show_percent`（默认开）

### 华夫图 `waffle`

适合：用 100 格看份额。

- 数据：1 个维度 + 1 个指标
- 数据设置：`waffle.dimension`、`waffle.metric`
- 显示设置：`waffle.show_legend`（默认开）

### 帕累托图 `pareto`

适合：按量排序 + 累计占比。

- 数据：1 个维度 + 1 个指标（柱 + 累计折线）
- 数据设置：`pareto.dimension`、`pareto.metric`
- 显示设置：`pareto.show_legend`（默认开），`pareto.show_values`（默认关）

### 气泡树 `circlepack`

适合：层级体量。自写圆堆积，不是官方企业实现。

- 数据：层级维度 + 指标
- 数据设置：`circlepack.dimensions`、`circlepack.metric`
- 显示设置：`circlepack.show_labels`（默认开；半径过小的圆仍不标）

### 关系图 `graph`

适合：来源 → 去向（仓网、渠道）。

- 数据：源维度、目标维度，可选边权重
- 数据设置：`graph.source`、`graph.target`、`graph.value`
- 显示设置：`graph.layout`（`force` / `circular`），`graph.show_labels`（默认开）

### 甘特图 `gantt`

适合：排期。

- 数据：类别 + 开始 + 结束（日期或数值）；可选进度（0–1 或 0–100）
- 数据设置：`gantt.category`、`gantt.start`、`gantt.end`、`gantt.progress`

### K 线 `candlestick`

适合：OHLC。

- 数据：时间维度 + 开、收、低、高四个指标
- 数据设置：`candlestick.time`、`candlestick.open`、`candlestick.close`、`candlestick.low`、`candlestick.high`
- 显示设置：`candlestick.increase_color`、`candlestick.decrease_color`

### 人口金字塔 `pyramid`

适合：两个方向的分布（男/女 × 年龄段）。

- 数据：1 个分类 + 两个指标（左右柱）
- 数据设置：`pyramid.category`、`pyramid.left`、`pyramid.right`
- 显示设置：`pyramid.show_legend`（默认开），`pyramid.show_values`（默认关）

## 在可视化选择器里找它们

图标复用现有 Icon，没有加新 SVG：

| display     | 图标        |
| ----------- | ----------- |
| radar       | star        |
| heatmap     | grid        |
| sunburst    | sun         |
| rose        | pie_slice   |
| calendar    | calendar    |
| donut       | pie         |
| bubble      | bubble      |
| wordcloud   | quote       |
| bullet      | compare     |
| histogram   | bar         |
| radialbar   | curved      |
| lollipop    | pin         |
| liquid      | beaker      |
| waffle      | grid_2x2    |
| pareto      | lineandbar  |
| circlepack  | group       |
| graph       | network     |
| gantt       | clock       |
| candlestick | straight    |
| pyramid     | arrow_split |

卡片默认尺寸走 `DEFAULT_CARD_SIZE`（未改 Clojure 仪表盘常量）。新文案还没跑 i18n 抽取。

## 代码入口

- 注册：`frontend/src/metabase/visualizations/register.js`
- 类型：`frontend/src/metabase-types/api` 的 `cardDisplayTypes`（`radar` … `pyramid`）
- 各图：`frontend/src/metabase/visualizations/visualizations/{RadarChart,HeatmapChart,…}/`
- ECharts 模块：`frontend/src/metabase/visualizations/echarts/index.ts`（Radar、Heatmap、Graph、Candlestick、Polar、VisualMap、Calendar 等）

## 不要做的事

- 不要设 `MB_EDITION=ee` 来「打开」这些图
- 不要从官方企业版拷实现
