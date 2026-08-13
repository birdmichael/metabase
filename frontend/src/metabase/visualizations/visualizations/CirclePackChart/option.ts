import type { EChartsCoreOption } from "echarts/core";

import { getColorsForValues } from "metabase/ui/colors/charts";
import { getEChartsAnimationOptions } from "metabase/visualizations/echarts/animation";
import type {
  ComputedVisualizationSettings,
  RenderingContext,
} from "metabase/visualizations/types";
import type { DatasetColumn, RawSeries, RowValue } from "metabase-types/api";

import { getCirclePackDimensionNames } from "./utils";

const toFiniteNumber = (value: RowValue): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const findColumn = (cols: DatasetColumn[], name: string | undefined) =>
  name == null ? undefined : cols.find((col) => col.name === name);

type PackNode = {
  name: string;
  value: number;
  children: Map<string, PackNode>;
};

export type PackedCircle = {
  name: string;
  value: number;
  x: number;
  y: number;
  r: number;
  depth: number;
  isParent: boolean;
};

const dist = (ax: number, ay: number, bx: number, by: number) =>
  Math.hypot(ax - bx, ay - by);

const radiusFromValue = (value: number) =>
  Math.max(6, Math.sqrt(Math.max(value, 0)) * 6);

const placeTouching = (
  a: PackedCircle,
  b: PackedCircle,
  r: number,
): { x: number; y: number } | null => {
  const d = dist(a.x, a.y, b.x, b.y);
  if (d === 0) {
    return null;
  }
  const ra = a.r + r;
  const rb = b.r + r;
  if (d > ra + rb || d < Math.abs(ra - rb)) {
    return null;
  }
  const mid = (ra * ra - rb * rb + d * d) / (2 * d);
  const h2 = ra * ra - mid * mid;
  if (h2 < 0) {
    return null;
  }
  const h = Math.sqrt(h2);
  const vx = (b.x - a.x) / d;
  const vy = (b.y - a.y) / d;
  return { x: a.x + vx * mid - vy * h, y: a.y + vy * mid + vx * h };
};

export function packSiblings(
  items: {
    name: string;
    value: number;
    depth: number;
    r?: number;
    isParent?: boolean;
  }[],
): PackedCircle[] {
  if (items.length === 0) {
    return [];
  }
  const radii = items.map((item) => item.r ?? radiusFromValue(item.value));
  const circles: PackedCircle[] = [
    {
      name: items[0].name,
      value: items[0].value,
      x: 0,
      y: 0,
      r: radii[0],
      depth: items[0].depth,
      isParent: items[0].isParent === true,
    },
  ];
  if (items.length > 1) {
    circles.push({
      name: items[1].name,
      value: items[1].value,
      x: radii[0] + radii[1],
      y: 0,
      r: radii[1],
      depth: items[1].depth,
      isParent: items[1].isParent === true,
    });
  }
  for (let i = 2; i < items.length; i++) {
    const r = radii[i];
    let placed: PackedCircle | null = null;
    outer: for (let a = 0; a < circles.length; a++) {
      for (let b = a + 1; b < circles.length; b++) {
        const pos = placeTouching(circles[a], circles[b], r);
        if (
          pos &&
          circles.every(
            (circle) =>
              dist(circle.x, circle.y, pos.x, pos.y) >= circle.r + r - 0.01,
          )
        ) {
          placed = {
            name: items[i].name,
            value: items[i].value,
            x: pos.x,
            y: pos.y,
            r,
            depth: items[i].depth,
            isParent: items[i].isParent === true,
          };
          break outer;
        }
      }
    }
    circles.push(
      placed ?? {
        name: items[i].name,
        value: items[i].value,
        x: circles[circles.length - 1].x + circles[circles.length - 1].r + r,
        y: 0,
        r,
        depth: items[i].depth,
        isParent: items[i].isParent === true,
      },
    );
  }
  return circles;
}

type LayoutGroup = {
  circles: PackedCircle[];
  r: number;
};

const layoutNode = (node: PackNode, depth: number): LayoutGroup => {
  if (node.children.size === 0) {
    const r = radiusFromValue(node.value);
    return {
      circles: [
        {
          name: node.name,
          value: node.value,
          x: 0,
          y: 0,
          r,
          depth,
          isParent: false,
        },
      ],
      r,
    };
  }

  const childNodes = Array.from(node.children.values());
  const childLayouts = childNodes.map((child) => layoutNode(child, depth + 1));
  const packed = packSiblings(
    childLayouts.map((layout, index) => ({
      name: childNodes[index].name,
      value: childNodes[index].value,
      depth,
      r: layout.r,
      isParent: childNodes[index].children.size > 0,
    })),
  );

  const circles: PackedCircle[] = [];
  packed.forEach((slot, index) => {
    const child = childLayouts[index];
    for (const circle of child.circles) {
      circles.push({
        ...circle,
        x: circle.x + slot.x,
        y: circle.y + slot.y,
      });
    }
  });

  const cx =
    packed.reduce((sum, slot) => sum + slot.x, 0) / Math.max(packed.length, 1);
  const cy =
    packed.reduce((sum, slot) => sum + slot.y, 0) / Math.max(packed.length, 1);
  const r =
    Math.max(
      0,
      ...packed.map((slot) => Math.hypot(slot.x - cx, slot.y - cy) + slot.r),
    ) + 8;

  const centered = circles.map((circle) => ({
    ...circle,
    x: circle.x - cx,
    y: circle.y - cy,
  }));

  if (node.name !== "") {
    centered.unshift({
      name: node.name,
      value: node.value,
      x: 0,
      y: 0,
      r,
      depth,
      isParent: true,
    });
  }

  return { circles: centered, r };
};

const equalBounds = (circles: PackedCircle[]) => {
  if (circles.length === 0) {
    return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
  }
  const minX = Math.min(...circles.map((circle) => circle.x - circle.r));
  const maxX = Math.max(...circles.map((circle) => circle.x + circle.r));
  const minY = Math.min(...circles.map((circle) => circle.y - circle.r));
  const maxY = Math.max(...circles.map((circle) => circle.y + circle.r));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const half = (Math.max(maxX - minX, maxY - minY, 1) / 2) * 1.12;
  return { minX: cx - half, maxX: cx + half, minY: cy - half, maxY: cy + half };
};

export function getCirclePackChartOption(
  rawSeries: RawSeries,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
  isAnimated: boolean,
): EChartsCoreOption {
  const [{ data }] = rawSeries;
  const { cols, rows } = data;
  const dimensionCols = getCirclePackDimensionNames(settings)
    .map((name) => findColumn(cols, name))
    .filter((col): col is DatasetColumn => col != null);
  const metricCol = findColumn(cols, settings["circlepack.metric"]);

  if (dimensionCols.length === 0 || metricCol == null) {
    return {
      ...getEChartsAnimationOptions(isAnimated),
      series: [],
    } as EChartsCoreOption;
  }

  const dimensionIndexes = dimensionCols.map((col) => cols.indexOf(col));
  const valueIndex = cols.indexOf(metricCol);
  const root: PackNode = { name: "", value: 0, children: new Map() };

  for (const row of rows) {
    const numeric = toFiniteNumber(row[valueIndex]) ?? 0;
    let node = root;
    node.value += numeric;
    for (const dimensionIndex of dimensionIndexes) {
      const raw = row[dimensionIndex];
      if (raw == null) {
        break;
      }
      const name = String(raw);
      let child = node.children.get(name);
      if (child == null) {
        child = { name, value: 0, children: new Map() };
        node.children.set(name, child);
      }
      child.value += numeric;
      node = child;
    }
  }

  const packed = layoutNode(root, -1).circles;
  const names = packed.map((circle) => circle.name);
  const colors = getColorsForValues(names, settings["series_settings.colors"]);
  const bounds = equalBounds(packed);

  return {
    ...getEChartsAnimationOptions(isAnimated),
    textStyle: {
      fontFamily: renderingContext.fontFamily,
      color: renderingContext.getColor("text-primary"),
    },
    tooltip: {
      trigger: "item",
    },
    grid: { left: 8, right: 8, top: 8, bottom: 8 },
    xAxis: {
      show: false,
      min: bounds.minX,
      max: bounds.maxX,
    },
    yAxis: {
      show: false,
      min: bounds.minY,
      max: bounds.maxY,
    },
    series: [
      {
        type: "custom",
        coordinateSystem: "cartesian2d",
        renderItem: (
          _params: unknown,
          api: {
            value: (i: number) => number;
            coord: (v: number[]) => number[];
            style: () => object;
          },
        ) => {
          const point = api.coord([api.value(0), api.value(1)]);
          const edgeX = api.coord([api.value(0) + api.value(2), api.value(1)]);
          const edgeY = api.coord([api.value(0), api.value(1) + api.value(2)]);
          const r = Math.min(
            Math.abs(edgeX[0] - point[0]),
            Math.abs(edgeY[1] - point[1]),
          );
          return {
            type: "circle",
            shape: { cx: point[0], cy: point[1], r },
            style: api.style(),
          };
        },
        data: packed.map((circle) => ({
          name: circle.name,
          value: [circle.x, circle.y, circle.r, circle.value],
          itemStyle: {
            color: colors[circle.name],
            opacity: circle.isParent ? 0.18 : 0.85,
            borderColor: colors[circle.name],
            borderWidth: circle.isParent ? 1.5 : 0,
          },
          label: {
            show:
              settings["circlepack.show_labels"] !== false &&
              circle.r > (circle.isParent ? 22 : 14),
            formatter: circle.name,
            color: renderingContext.getColor("text-primary"),
          },
        })),
      },
    ],
  } as EChartsCoreOption;
}
