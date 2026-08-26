#!/usr/bin/env bash
set -euo pipefail

# Build the AGPL / Community Edition Docker image from this repo.
# Default edition is already oss in the root Dockerfile; pass it explicitly anyway.
#
# Jar-only alternative (official):
#   DOCKER_BUILDKIT=1 docker build --build-arg MB_EDITION=oss --output container-output/ .
#   jar lands at container-output/app/metabase.jar

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

IMAGE="${IMAGE:-birdmichael/metabase:oss-0.63.15}"
VERSION="${VERSION:-v0.63.15.1}"

DOCKER_BUILDKIT=1 docker build \
  --build-arg MB_EDITION=oss \
  --build-arg VERSION="$VERSION" \
  -t "$IMAGE" \
  .

echo "Built $IMAGE"
