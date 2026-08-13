# OSS packaging (v0.63.2)

Pinned to the official Metabase Community Edition tag **v0.63.2** (`9a6cadd7`). Do not build from `master` for a stable image.

This is AGPL / Community Edition only (`MB_EDITION=oss`). Do not copy or ship Enterprise sources.

## Toolchain

From [`mise.toml`](../mise.toml) at this tag:

- JDK: Temurin 25
- Node: 22.13.1
- Clojure CLI: 1.12.3
- Bun (lockfile install)
- Python 3.12 + uv

Or skip the host toolchain and build inside Docker.

## Docker image (recommended)

```bash
chmod +x bin/build-oss-docker.sh
./bin/build-oss-docker.sh
```

That runs the repo root `Dockerfile` with `--build-arg MB_EDITION=oss` and tags `birdmichael/metabase:oss-0.63.2`.

Equivalent one-liner:

```bash
DOCKER_BUILDKIT=1 docker build --build-arg MB_EDITION=oss --build-arg VERSION=v0.63.2 -t birdmichael/metabase:oss-0.63.2 .
```

Jar only (no runtime image):

```bash
DOCKER_BUILDKIT=1 docker build --build-arg MB_EDITION=oss --output container-output/ .
# -> container-output/app/metabase.jar
```

## Host uberjar

```bash
./bin/build.sh
# -> target/uberjar/metabase.jar
```

Default edition is `oss` if `MB_EDITION` is unset. Official docs: [Building Metabase](https://www.metabase.com/docs/latest/developers-guide/build).

## Run with Postgres

Do not use the embedded H2 database in production.

```bash
docker compose -f docker-compose.oss.yml up -d
```

Metabase: http://localhost:3000

Official Docker docs: [Running Metabase on Docker](https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker).

## Pitfalls

- Java must be 25 (not 17/21).
- Frontend deps use `bun install --frozen-lockfile`; a dirty lockfile fails the image build.
- Uberjar / image builds need a lot of RAM; OOM is a common failure.
- Production application DB must be Postgres (or another supported DB), not H2.

## Original OSS visualizations

This fork adds original AGPL / Community Edition charts. They are **not** Enterprise ports and do not live under `enterprise/` or `metabase-enterprise`.

- **Radar** (`display: radar`): one dimension for axis indicators and one or more metrics as series, rendered with ECharts `radar`.
- **Heatmap** (`display: heatmap`): two dimensions (`heatmap.x`, `heatmap.y`) plus a metric (`heatmap.value`), rendered with ECharts `heatmap` and `visualMap`.
- **Sunburst** (`display: sunburst`): hierarchical dimensions plus a metric, rendered with the already-registered ECharts `sunburst` chart.
- **Rose** (`display: rose`): one dimension plus a metric, a nightingale / rose pie (`roseType: "area"`).
- **Calendar heatmap** (`display: calendar`): a date dimension plus a metric, ECharts `calendar` + `heatmap`. Distinct from the matrix heatmap.
- **Donut** (`display: donut`): one dimension plus a metric, ECharts pie with radius `["50%","75%"]` and a center total. Distinct from pie.
- **Bubble** (`display: bubble`): two metrics (x, y), optional size metric, optional category, ECharts scatter with `symbolSize`. Distinct from scatter.
- **Word cloud** (`display: wordcloud`): dimension (word) plus metric (weight), original archimedean spiral of ECharts graphic `text` elements. No third-party wordcloud plugin.
- **Bullet** (`display: bullet`): actual metric plus target metric or target value, horizontal bar with qualitative ranges and a target marker.
- **Histogram** (`display: histogram`): one numeric column binned (~10 Sturges buckets) as bar frequencies. Distinct from a category bar chart.
- **Radial bar** (`display: radialbar`): one dimension plus a metric, ECharts polar/angle axis + bar series.
- **Lollipop** (`display: lollipop`): one dimension plus a metric, bar stems + pictorialBar circle heads.
- **Liquid fill** (`display: liquid`): one metric (0–1 or percent of max), original sine-wave clip in a circle. Not `echarts-liquidfill`.
- **Waffle** (`display: waffle`): one dimension plus a metric, 10×10 grid of squares colored by share.
- **Pareto** (`display: pareto`): one dimension plus a metric, sorted bars plus cumulative percent line.
- **Circle packing** (`display: circlepack`): hierarchical dimensions plus a metric, original packed-circle layout as a custom series (not ECharts graph circular layout).
- **Network / force graph** (`display: graph`): source and target dimensions plus optional value, ECharts `graph` with force layout.
- **Gantt** (`display: gantt`): category plus start and end (date or number), custom bars on a time/value axis.
- **Candlestick** (`display: candlestick`): time dimension plus open/close/low/high metrics, ECharts candlestick.
- **Population pyramid** (`display: pyramid`): category plus two metrics, back-to-back bars.

Shared ECharts animation defaults (cartesian, pie, sankey, treemap, radar, heatmap, sunburst, rose, calendar, and the everyday charts above):

- Animated (interactive UI, unless the user prefers reduced motion): `animationDuration` 500ms, `animationDurationUpdate` 300ms, easing `cubicOut`.
- Not animated (static exports / reduced motion): `animation` false and duration 0.

Do not set `MB_EDITION=ee` for these charts.

