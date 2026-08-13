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

Shared ECharts animation defaults (cartesian, pie, sankey, treemap, radar, heatmap, sunburst, rose, calendar):

- Animated (interactive UI, unless the user prefers reduced motion): `animationDuration` 500ms, `animationDurationUpdate` 300ms, easing `cubicOut`.
- Not animated (static exports / reduced motion): `animation` false and duration 0.

Do not set `MB_EDITION=ee` for these charts.

