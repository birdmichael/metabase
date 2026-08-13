(() => {
  const ANIM = {
    animationDuration: 500,
    animationDurationUpdate: 300,
    animationEasing: "cubicOut",
  };
  const FONT = "'PingFang SC','Hiragino Sans GB','Noto Sans SC','Microsoft YaHei',sans-serif";
  function isLight() {
    return document.documentElement.getAttribute("data-theme") !== "dark";
  }
  function T() {
    if (isLight()) {
      return {
        ink: "#1c2433",
        muted: "#5c6b80",
        legend: "#334155",
        split: "rgba(15,23,42,0.08)",
        axisLine: "rgba(15,23,42,0.18)",
        tooltipBg: "rgba(255,255,255,0.96)",
        tooltipBorder: "rgba(15,23,42,0.12)",
        tooltipText: "#1c2433",
        pieBorder: "#ffffff",
        calBorder: "#ffffff",
        heat: ["#e7f1f6", "#8fd0cc", "#2a8f8a", "#e39b16"],
        cal: ["#eef4f8", "#8fd0cc", "#2a8f8a", "#e39b16"],
        target: "#1c2433",
      };
    }
    return {
      ink: "#e8eef6",
      muted: "#8b9cb0",
      legend: "#c5d0dc",
      split: "rgba(148,163,184,0.12)",
      axisLine: "rgba(148,163,184,0.25)",
      tooltipBg: "rgba(16,24,32,0.94)",
      tooltipBorder: "rgba(148,163,184,0.22)",
      tooltipText: "#e8eef6",
      pieBorder: "#101820",
      calBorder: "#0c131c",
      heat: ["#12202c", "#1d4e6e", "#3dccc7", "#fcc419"],
      cal: ["#12202c", "#1a5f73", "#3dccc7", "#fcc419"],
      target: "#e8eef6",
    };
  }
  const C = ["#5aa6e8", "#3dccc7", "#69db7c", "#fcc419", "#ff922b", "#f783ac", "#b197fc", "#ff6b6b"];
  const REGIONS = ["华东", "华南", "华北", "西南"];
  const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const PRODUCTS = ["专业版", "基础版", "增值服务", "硬件套装", "培训"];
  const WEEK = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = mulberry32(20260813);

  function tooltip() {
    const th = T();
    return {
      trigger: "axis",
      backgroundColor: th.tooltipBg,
      borderColor: th.tooltipBorder,
      textStyle: { color: th.tooltipText, fontFamily: FONT, fontSize: 12 },
    };
  }
  function axisLabel() {
    return { color: T().muted, fontFamily: FONT, fontSize: 11 };
  }
  function splitLine() {
    return { lineStyle: { color: T().split } };
  }
  function withAnim(opt) {
    return Object.assign(
      { backgroundColor: "transparent", textStyle: { fontFamily: FONT, color: T().legend } },
      ANIM,
      opt
    );
  }

  const revenue = {
    华东: [86, 91, 88, 97, 112, 108, 121, 118, 129, 134, 141, 156],
    华南: [72, 70, 76, 81, 90, 94, 101, 99, 108, 112, 118, 126],
    华北: [64, 68, 66, 71, 78, 82, 86, 84, 91, 95, 99, 108],
    西南: [48, 51, 49, 55, 61, 64, 70, 68, 74, 79, 83, 91],
  };
  const orders = {
    华东: [420, 438, 410, 455, 510, 498, 560, 544, 590, 612, 640, 705],
    华南: [360, 352, 378, 401, 444, 460, 492, 481, 520, 538, 566, 604],
    华北: [310, 328, 318, 340, 372, 388, 404, 396, 428, 446, 462, 501],
    西南: [240, 252, 246, 270, 298, 312, 338, 330, 356, 378, 394, 430],
  };

  const charts = [];
  function mount(id, option) {
    const el = document.getElementById(id);
    if (!el) return null;
    const chart = echarts.init(el, null, { renderer: "canvas" });
    chart.setOption(withAnim(option));
    charts.push({ chart, relayout: null });
    return chart;
  }

  function initBar() {
    mount("chart-bar", {
      tooltip: tooltip(),
      legend: { top: 0, textStyle: { color: T().legend, fontSize: 11 }, itemWidth: 10, itemHeight: 8 },
      grid: { left: 44, right: 12, top: 32, bottom: 28 },
      xAxis: { type: "category", data: MONTHS, axisLabel: axisLabel(), axisLine: { lineStyle: { color: T().axisLine } } },
      yAxis: { type: "value", name: "万元", nameTextStyle: { color: T().muted, fontSize: 11 }, axisLabel: axisLabel(), splitLine: splitLine() },
      series: REGIONS.map((r, i) => ({
        name: r,
        type: "bar",
        data: revenue[r],
        barMaxWidth: 10,
        itemStyle: { color: C[i], borderRadius: [3, 3, 0, 0] },
      })),
    });
  }

  function initLine() {
    mount("chart-line", {
      tooltip: tooltip(),
      legend: { top: 0, textStyle: { color: T().legend, fontSize: 11 }, itemWidth: 16, itemHeight: 8 },
      grid: { left: 48, right: 12, top: 32, bottom: 28 },
      xAxis: { type: "category", data: MONTHS, boundaryGap: false, axisLabel: axisLabel(), axisLine: { lineStyle: { color: T().axisLine } } },
      yAxis: { type: "value", name: "单", nameTextStyle: { color: T().muted, fontSize: 11 }, axisLabel: axisLabel(), splitLine: splitLine() },
      series: REGIONS.map((r, i) => ({
        name: r,
        type: "line",
        data: orders[r],
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2, color: C[i] },
        itemStyle: { color: C[i] },
        areaStyle: { color: C[i], opacity: 0.08 },
      })),
    });
  }

  function initPie() {
    const data = [
      { name: "专业版", value: 486 },
      { name: "基础版", value: 312 },
      { name: "增值服务", value: 198 },
      { name: "硬件套装", value: 146 },
      { name: "培训", value: 88 },
    ];
    mount("chart-pie", {
      tooltip: Object.assign(tooltip(), { trigger: "item", formatter: "{b}<br/>{c} 万 ({d}%)" }),
      legend: { bottom: 0, textStyle: { color: T().legend, fontSize: 11 } },
      series: [{
        type: "pie",
        radius: ["0%", "62%"],
        center: ["50%", "46%"],
        data: data.map((d, i) => Object.assign({}, d, { itemStyle: { color: C[i], borderColor: T().pieBorder, borderWidth: 2 } })),
        label: { color: T().ink, fontSize: 11, formatter: "{b}\n{d}%" },
        labelLine: { lineStyle: { color: "rgba(148,163,184,0.4)" } },
      }],
    });
  }

  function initRadar() {
    mount("chart-radar", {
      tooltip: Object.assign(tooltip(), { trigger: "item" }),
      legend: { bottom: 0, textStyle: { color: T().legend, fontSize: 11 } },
      radar: {
        indicator: [
          { name: "营收", max: 100 },
          { name: "订单", max: 100 },
          { name: "转化", max: 100 },
          { name: "留存", max: 100 },
          { name: "NPS", max: 100 },
          { name: "履约", max: 100 },
        ],
        center: ["50%", "46%"],
        radius: "58%",
        axisName: { color: T().muted, fontSize: 11 },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.16)" } },
        splitArea: { areaStyle: { color: ["rgba(90,166,232,0.04)", "rgba(90,166,232,0.01)"] } },
        axisLine: { lineStyle: { color: "rgba(148,163,184,0.2)" } },
      },
      series: [{
        type: "radar",
        data: [
          { name: "华东", value: [92, 88, 76, 81, 74, 90], lineStyle: { color: C[0] }, itemStyle: { color: C[0] }, areaStyle: { color: C[0], opacity: 0.18 } },
          { name: "华南", value: [80, 84, 82, 70, 69, 86], lineStyle: { color: C[1] }, itemStyle: { color: C[1] }, areaStyle: { color: C[1], opacity: 0.14 } },
          { name: "华北", value: [71, 68, 64, 78, 72, 81], lineStyle: { color: C[2] }, itemStyle: { color: C[2] }, areaStyle: { color: C[2], opacity: 0.1 } },
        ],
      }],
    });
  }

  function initHeatmap() {
    const hours = [];
    for (let i = 0; i < 24; i++) hours.push(i + "时");
    const data = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        let v = 8;
        if (h >= 9 && h <= 12) v += 42;
        if (h >= 19 && h <= 21) v += 55;
        if (h >= 13 && h <= 18) v += 22;
        if (d >= 5) v *= 0.62;
        if (h < 7 || h > 23) v *= 0.2;
        v += (rng() - 0.5) * 18;
        data.push([h, d, Math.max(1, Math.round(v))]);
      }
    }
    mount("chart-heatmap", {
      tooltip: Object.assign(tooltip(), { trigger: "item", formatter: (p) => WEEK[p.value[1]] + " " + p.value[0] + "时<br/>强度 " + p.value[2] }),
      grid: { left: 44, right: 18, top: 16, bottom: 36 },
      xAxis: { type: "category", data: hours, axisLabel: Object.assign(axisLabel(), { interval: 2 }), splitArea: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
      yAxis: { type: "category", data: WEEK, axisLabel: axisLabel(), splitArea: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
      visualMap: {
        min: 0, max: 80, calculable: true, orient: "horizontal", left: "center", bottom: 0,
        inRange: { color: T().heat },
        textStyle: { color: T().muted, fontSize: 10 },
        itemWidth: 10, itemHeight: 80,
      },
      series: [{
        type: "heatmap",
        data,
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: "rgba(61,204,199,0.45)" } },
      }],
    });
  }

  function initSunburst() {
    const children = (arr) => arr.map((x) => ({ name: x[0], value: x[1] }));
    mount("chart-sunburst", {
      tooltip: Object.assign(tooltip(), { trigger: "item" }),
      series: [{
        type: "sunburst",
        radius: ["12%", "88%"],
        center: ["50%", "50%"],
        data: [
          { name: "华东", itemStyle: { color: C[0] }, children: children([["专业版", 180], ["基础版", 120], ["增值服务", 70], ["硬件", 50]]) },
          { name: "华南", itemStyle: { color: C[1] }, children: children([["专业版", 140], ["基础版", 110], ["增值服务", 55], ["硬件", 40]]) },
          { name: "华北", itemStyle: { color: C[2] }, children: children([["专业版", 110], ["基础版", 90], ["增值服务", 48], ["硬件", 32]]) },
          { name: "西南", itemStyle: { color: C[3] }, children: children([["专业版", 80], ["基础版", 72], ["增值服务", 36], ["硬件", 28]]) },
        ],
        label: { color: T().ink, fontSize: 11, minAngle: 8 },
        itemStyle: { borderColor: T().pieBorder, borderWidth: 2 },
        levels: [
          {},
          { r0: "12%", r: "42%", label: { rotate: "tangential" } },
          { r0: "42%", r: "88%", label: { align: "right" } },
        ],
      }],
    });
  }

  function initRose() {
    const data = [
      { name: "直销", value: 42 },
      { name: "官网", value: 28 },
      { name: "渠道伙伴", value: 22 },
      { name: "市场活动", value: 16 },
      { name: "转介绍", value: 12 },
      { name: "电商", value: 9 },
    ];
    mount("chart-rose", {
      tooltip: Object.assign(tooltip(), { trigger: "item", formatter: "{b}<br/>{c}%" }),
      legend: { bottom: 0, textStyle: { color: T().legend, fontSize: 11 } },
      series: [{
        type: "pie",
        roseType: "area",
        radius: ["12%", "64%"],
        center: ["50%", "46%"],
        data: data.map((d, i) => Object.assign({}, d, { itemStyle: { color: C[i], borderColor: T().pieBorder, borderWidth: 2 } })),
        label: { color: T().ink, fontSize: 11 },
      }],
    });
  }

  function initCalendar() {
    const data = [];
    const start = new Date(2026, 0, 1);
    for (let i = 0; i < 365; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      const day = d.getDay();
      let v = 42 + Math.sin(i / 18) * 16 + (rng() - 0.5) * 14;
      if (day === 0 || day === 6) v *= 0.55;
      if (i === 99 || i === 180 || i === 273) v += 48;
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      data.push(["2026-" + m + "-" + dd, Math.max(6, Math.round(v))]);
    }
    mount("chart-calendar", {
      tooltip: Object.assign(tooltip(), { trigger: "item", formatter: (p) => p.value[0] + "<br/>日活指数 " + p.value[1] }),
      visualMap: {
        min: 10, max: 100, calculable: true, orient: "horizontal", left: "center", bottom: 2,
        inRange: { color: T().cal },
        textStyle: { color: T().muted, fontSize: 10 },
        itemWidth: 10, itemHeight: 110,
      },
      calendar: {
        top: 28, left: 46, right: 16, bottom: 42,
        range: "2026",
        cellSize: ["auto", 13],
        itemStyle: { borderWidth: 0.5, borderColor: T().calBorder },
        yearLabel: { show: false },
        dayLabel: { color: T().muted, nameMap: ["日", "一", "二", "三", "四", "五", "六"], fontSize: 11 },
        monthLabel: { color: T().legend, nameMap: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"], fontSize: 11 },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.18)" } },
      },
      series: [{ type: "heatmap", coordinateSystem: "calendar", data }],
    });
  }

  function initDonut() {
    const data = [
      { name: "专业版", value: 486 },
      { name: "基础版", value: 312 },
      { name: "增值服务", value: 198 },
      { name: "硬件套装", value: 146 },
      { name: "培训", value: 88 },
    ];
    const total = data.reduce((s, d) => s + d.value, 0);
    mount("chart-donut", {
      tooltip: Object.assign(tooltip(), { trigger: "item", formatter: "{b}<br/>{c} 万 ({d}%)" }),
      legend: { bottom: 0, textStyle: { color: T().legend, fontSize: 11 } },
      title: {
        text: total.toLocaleString() + " 万",
        subtext: "本季营收",
        left: "center",
        top: "38%",
        textStyle: { color: T().ink, fontSize: 20, fontWeight: 650, fontFamily: FONT },
        subtextStyle: { color: T().muted, fontSize: 12, fontFamily: FONT },
      },
      series: [{
        type: "pie",
        radius: ["50%", "72%"],
        center: ["50%", "46%"],
        avoidLabelOverlap: true,
        label: { show: false },
        data: data.map((d, i) => Object.assign({}, d, { itemStyle: { color: C[i], borderColor: T().pieBorder, borderWidth: 2 } })),
      }],
    });
  }

  function initBubble() {
    const rows = [
      { name: "华东·专业版", x: 2860, y: 0.38, s: 420 },
      { name: "华东·基础版", x: 980, y: 0.44, s: 510 },
      { name: "华南·专业版", x: 2640, y: 0.33, s: 360 },
      { name: "华南·基础版", x: 920, y: 0.41, s: 448 },
      { name: "华北·专业版", x: 2410, y: 0.29, s: 280 },
      { name: "华北·增值", x: 1680, y: 0.36, s: 190 },
      { name: "西南·专业版", x: 2190, y: 0.31, s: 210 },
      { name: "西南·培训", x: 1320, y: 0.22, s: 96 },
      { name: "华北·硬件", x: 1880, y: 0.18, s: 140 },
      { name: "华南·增值", x: 1540, y: 0.4, s: 220 },
    ];
    mount("chart-bubble", {
      tooltip: Object.assign(tooltip(), {
        trigger: "item",
        formatter: (p) => p.data[3] + "<br/>客单 ¥" + p.data[0] + "<br/>复购 " + Math.round(p.data[1] * 100) + "%<br/>订单 " + p.data[2],
      }),
      grid: { left: 52, right: 18, top: 24, bottom: 40 },
      xAxis: { name: "客单价", nameLocation: "middle", nameGap: 26, nameTextStyle: { color: T().muted }, axisLabel: axisLabel(), splitLine: splitLine() },
      yAxis: { name: "复购率", nameTextStyle: { color: T().muted }, axisLabel: Object.assign(axisLabel(), { formatter: (v) => Math.round(v * 100) + "%" }), splitLine: splitLine(), min: 0.1, max: 0.5 },
      series: [{
        type: "scatter",
        data: rows.map((r, i) => ({
          value: [r.x, r.y, r.s, r.name],
          itemStyle: { color: C[i % C.length], opacity: 0.82 },
        })),
        symbolSize: (v) => 12 + Math.sqrt(v[2]) * 1.15,
      }],
    });
  }

  function layoutWordCloud(words, width, height) {
    const placed = [];
    const cx = width / 2;
    const cy = height / 2;
    const sorted = words.slice().sort((a, b) => b.weight - a.weight);
    for (let w = 0; w < sorted.length; w++) {
      const word = sorted[w];
      const fontSize = 12 + word.weight * 26;
      const boxW = word.text.length * fontSize * 0.92;
      const boxH = fontSize * 1.25;
      let ok = false;
      for (let i = 0; i < 900 && !ok; i++) {
        const theta = i * 0.32;
        const rad = 3 + 2.8 * theta;
        const x = cx + rad * Math.cos(theta);
        const y = cy + rad * Math.sin(theta) * 0.68;
        const box = { x: x - boxW / 2, y: y - boxH / 2, w: boxW, h: boxH };
        if (box.x < 6 || box.y < 8 || box.x + box.w > width - 6 || box.y + box.h > height - 8) continue;
        let hit = false;
        for (let p = 0; p < placed.length; p++) {
          const o = placed[p];
          if (!(box.x + box.w < o.x || o.x + o.w < box.x || box.y + box.h < o.y || o.y + o.h < box.y)) {
            hit = true;
            break;
          }
        }
        if (!hit) {
          placed.push(Object.assign({}, box, { text: word.text, fontSize: fontSize, color: word.color }));
          ok = true;
        }
      }
    }
    return placed;
  }

  function initWordcloud() {
    const el = document.getElementById("chart-wordcloud");
    if (!el) return;
    const chart = echarts.init(el, null, { renderer: "canvas" });
    const words = [
      { text: "营收", weight: 1, color: C[0] },
      { text: "订单", weight: 0.92, color: C[1] },
      { text: "转化", weight: 0.84, color: C[2] },
      { text: "留存", weight: 0.8, color: C[3] },
      { text: "复购", weight: 0.72, color: C[4] },
      { text: "客单", weight: 0.66, color: C[5] },
      { text: "活跃", weight: 0.6, color: C[6] },
      { text: "渠道", weight: 0.56, color: C[7] },
      { text: "华东", weight: 0.52, color: C[0] },
      { text: "华南", weight: 0.48, color: C[1] },
      { text: "华北", weight: 0.44, color: C[2] },
      { text: "西南", weight: 0.4, color: C[3] },
      { text: "专业版", weight: 0.5, color: C[0] },
      { text: "基础版", weight: 0.42, color: C[1] },
      { text: "履约", weight: 0.38, color: C[4] },
      { text: "库存", weight: 0.34, color: C[5] },
      { text: "促销", weight: 0.36, color: C[3] },
      { text: "会员", weight: 0.4, color: C[6] },
      { text: "GMV", weight: 0.46, color: C[0] },
      { text: "毛利", weight: 0.33, color: C[2] },
      { text: "NPS", weight: 0.3, color: C[7] },
      { text: "口碑", weight: 0.28, color: C[4] },
      { text: "折扣", weight: 0.26, color: C[5] },
      { text: "培训", weight: 0.24, color: C[6] },
    ];
    function render() {
      const placed = layoutWordCloud(words, chart.getWidth(), chart.getHeight());
      chart.setOption(withAnim({
        graphic: placed.map((p) => ({
          type: "text",
          x: p.x + p.w / 2,
          y: p.y + p.h / 2,
          style: {
            text: p.text,
            fill: p.color,
            font: "600 " + p.fontSize + "px " + FONT,
            textAlign: "center",
            textVerticalAlign: "middle",
          },
        })),
      }), true);
    }
    render();
    charts.push({ chart, relayout: render });
  }

  function initBullet() {
    const items = [
      { name: "营收完成率", actual: 86, target: 100 },
      { name: "订单完成率", actual: 74, target: 100 },
      { name: "转化率目标", actual: 91, target: 80 },
      { name: "NPS 目标", actual: 68, target: 75 },
    ];
    mount("chart-bullet", {
      tooltip: Object.assign(tooltip(), { trigger: "axis", axisPointer: { type: "shadow" } }),
      grid: { left: 92, right: 24, top: 12, bottom: 24 },
      xAxis: { type: "value", max: 120, axisLabel: Object.assign(axisLabel(), { formatter: "{value}%" }), splitLine: splitLine() },
      yAxis: { type: "category", data: items.map((x) => x.name), axisLabel: axisLabel(), axisTick: { show: false }, axisLine: { show: false } },
      series: [
        { name: "差", type: "bar", stack: "range", silent: true, barWidth: 18, data: items.map(() => 60), itemStyle: { color: "rgba(255,107,107,0.16)" } },
        { name: "中", type: "bar", stack: "range", silent: true, data: items.map(() => 25), itemStyle: { color: "rgba(252,196,25,0.2)" } },
        { name: "好", type: "bar", stack: "range", silent: true, data: items.map(() => 35), itemStyle: { color: "rgba(105,219,124,0.18)" } },
        { name: "实际", type: "bar", data: items.map((x) => x.actual), barWidth: 8, barGap: "-165%", z: 3, itemStyle: { color: "#5aa6e8", borderRadius: 2 } },
        { name: "目标", type: "scatter", symbol: "rect", symbolSize: [3, 22], data: items.map((x) => [x.target, x.name]), itemStyle: { color: T().ink }, z: 4 },
      ],
    });
  }

  function initHistogram() {
    const bins = [];
    const edges = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 480, 600];
    const counts = edges.slice(0, -1).map(() => 0);
    for (let i = 0; i < 480; i++) {
      const u = rng();
      const v = rng();
      const g = Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
      const amt = 168 + g * 78 + (rng() > 0.88 ? rng() * 260 : 0);
      const x = Math.max(0, amt);
      for (let b = 0; b < counts.length; b++) {
        if (x >= edges[b] && x < edges[b + 1]) { counts[b]++; break; }
      }
    }
    for (let b = 0; b < counts.length; b++) bins.push(edges[b] + "-" + edges[b + 1]);
    mount("chart-histogram", {
      tooltip: Object.assign(tooltip(), { formatter: (p) => "金额 " + p.name + " 元<br/>" + p.value + " 单" }),
      grid: { left: 44, right: 12, top: 20, bottom: 36 },
      xAxis: { type: "category", data: bins, axisLabel: Object.assign(axisLabel(), { rotate: 32, fontSize: 10 }), axisLine: { lineStyle: { color: T().axisLine } } },
      yAxis: { type: "value", name: "单数", nameTextStyle: { color: T().muted, fontSize: 11 }, axisLabel: axisLabel(), splitLine: splitLine() },
      series: [{
        type: "bar",
        data: counts,
        barMaxWidth: 22,
        itemStyle: { color: "#3dccc7", borderRadius: [3, 3, 0, 0] },
      }],
    });
  }

  function initRadial() {
    const cats = ["华东", "华南", "华北", "西南", "海外"];
    const vals = [92, 81, 74, 68, 55];
    mount("chart-radial", {
      tooltip: Object.assign(tooltip(), { trigger: "item" }),
      polar: { radius: ["16%", "78%"] },
      angleAxis: { type: "category", data: cats, startAngle: 90, axisLabel: { color: T().legend, fontSize: 11 }, axisLine: { lineStyle: { color: T().axisLine } } },
      radiusAxis: { min: 0, max: 100, axisLabel: { color: T().muted, fontSize: 10 }, splitLine: splitLine() },
      series: [{
        type: "bar",
        coordinateSystem: "polar",
        data: vals.map((v, i) => ({ value: v, itemStyle: { color: C[i] } })),
        barWidth: "42%",
        roundCap: true,
      }],
    });
  }

  function initLollipop() {
    const cats = ["专业版", "基础版", "增值服务", "硬件套装", "培训", "渠道包"];
    const vals = [6.8, 5.4, 4.1, 3.2, 2.6, 1.9];
    mount("chart-lollipop", {
      tooltip: Object.assign(tooltip(), { formatter: (p) => p.name + "<br/>转化 " + p.value + "%" }),
      grid: { left: 72, right: 24, top: 16, bottom: 28 },
      xAxis: { type: "value", axisLabel: Object.assign(axisLabel(), { formatter: "{value}%" }), splitLine: splitLine() },
      yAxis: { type: "category", data: cats, axisLabel: axisLabel(), axisTick: { show: false }, axisLine: { show: false } },
      series: [
        { type: "bar", data: vals, barWidth: 2, itemStyle: { color: "rgba(90,166,232,0.55)" }, silent: true, z: 1 },
        { type: "scatter", data: cats.map(function (name, i) { return [vals[i], name]; }), symbolSize: 14, itemStyle: { color: "#3dccc7", borderColor: T().ink, borderWidth: 1 }, z: 2 },
      ],
    });
  }

  function initLiquid() {
    const el = document.getElementById("chart-liquid");
    if (!el) return;
    const chart = echarts.init(el, null, { renderer: "canvas" });
    let phase = 0;
    const fill = 0.72;
    function wavePoints(cx, cy, r, phaseOff, amp) {
      const level = cy + r - 2 * r * fill;
      const pts = [];
      pts.push([cx - r - 2, cy + r + 2]);
      pts.push([cx - r - 2, level]);
      for (let x = cx - r; x <= cx + r; x += 4) {
        const y =
          level +
          Math.sin((x / Math.max(r, 1)) * Math.PI * 2 + phase + phaseOff) * amp +
          Math.sin((x / Math.max(r, 1)) * Math.PI * 3.1 + phase * 1.35) * amp * 0.32;
        pts.push([x, y]);
      }
      pts.push([cx + r + 2, level]);
      pts.push([cx + r + 2, cy + r + 2]);
      return pts;
    }
    function render() {
      const w = Math.max(chart.getWidth(), 10);
      const h = Math.max(chart.getHeight(), 10);
      const cx = w / 2;
      const cy = h / 2 - 4;
      const r = Math.min(w, h) * 0.36;
      chart.setOption(
        {
          animation: false,
          backgroundColor: "transparent",
          xAxis: { show: false, min: 0, max: 1 },
          yAxis: { show: false, min: 0, max: 1 },
          grid: { left: 0, right: 0, top: 0, bottom: 0 },
          series: [
            {
              type: "custom",
              renderItem: function () {
                return {
                  type: "group",
                  children: [
                    {
                      type: "circle",
                      shape: { cx: cx, cy: cy, r: r },
                      style: { fill: "rgba(61,204,199,0.08)", stroke: "rgba(61,204,199,0.75)", lineWidth: 2 },
                    },
                    {
                      type: "group",
                      clipPath: { type: "circle", shape: { cx: cx, cy: cy, r: r - 1 } },
                      children: [
                        { type: "polygon", shape: { points: wavePoints(cx, cy, r, 0, 6) }, style: { fill: "rgba(61,204,199,0.38)" } },
                        { type: "polygon", shape: { points: wavePoints(cx, cy, r, 1.15, 4.5) }, style: { fill: "rgba(90,166,232,0.5)" } },
                      ],
                    },
                    {
                      type: "text",
                      style: {
                        x: cx,
                        y: cy - 8,
                        text: "72%",
                        fill: T().ink,
                        font: "bold 32px sans-serif",
                        textAlign: "center",
                        textVerticalAlign: "middle",
                      },
                    },
                    {
                      type: "text",
                      style: {
                        x: cx,
                        y: cy + 22,
                        text: "季度目标完成",
                        fill: T().muted,
                        font: "12px sans-serif",
                        textAlign: "center",
                        textVerticalAlign: "middle",
                      },
                    },
                  ],
                };
              },
              data: [fill],
            },
          ],
        },
        true
      );
    }
    render();
    const timer = setInterval(function () {
      phase += 0.12;
      render();
    }, 80);
    charts.push({ chart: chart, relayout: render, timer: timer });
  }

  function initWaffle() {
    const shares = [
      { name: "订阅", value: 52, color: C[0] },
      { name: "增值", value: 31, color: C[1] },
      { name: "硬件", value: 17, color: C[3] },
    ];
    const cells = [];
    let idx = 0;
    shares.forEach((s) => {
      for (let i = 0; i < s.value; i++) {
        cells.push({ value: [idx % 10, 9 - Math.floor(idx / 10)], name: s.name, itemStyle: { color: s.color } });
        idx++;
      }
    });
    mount("chart-waffle", {
      tooltip: Object.assign(tooltip(), { trigger: "item", formatter: (p) => p.data.name + " · 1%" }),
      legend: {
        bottom: 0,
        data: shares.map((s) => s.name),
        textStyle: { color: T().legend, fontSize: 11 },
      },
      grid: { left: "18%", right: "18%", top: 12, bottom: 36 },
      xAxis: { type: "category", data: [0,1,2,3,4,5,6,7,8,9], show: false, min: -0.5, max: 9.5 },
      yAxis: { type: "category", data: [0,1,2,3,4,5,6,7,8,9], show: false, min: -0.5, max: 9.5 },
      series: shares.map((s) => ({
        name: s.name,
        type: "scatter",
        symbol: "roundRect",
        symbolSize: 18,
        data: cells.filter((c) => c.name === s.name).map((c) => ({ value: c.value, name: c.name, itemStyle: c.itemStyle })),
      })),
    });
  }

  function initPareto() {
    const rows = [
      ["支付失败", 126],
      ["物流延误", 98],
      ["库存缺货", 74],
      ["账号登录", 51],
      ["发票问题", 33],
      ["促销规则", 22],
      ["其他", 18],
    ].sort((a, b) => b[1] - a[1]);
    const total = rows.reduce((s, r) => s + r[1], 0);
    let acc = 0;
    const cum = rows.map((r) => {
      acc += r[1];
      return Math.round((acc / total) * 1000) / 10;
    });
    mount("chart-pareto", {
      tooltip: tooltip(),
      legend: { top: 0, textStyle: { color: T().legend, fontSize: 11 } },
      grid: { left: 44, right: 44, top: 32, bottom: 48 },
      xAxis: { type: "category", data: rows.map((r) => r[0]), axisLabel: Object.assign(axisLabel(), { rotate: 24 }), axisLine: { lineStyle: { color: T().axisLine } } },
      yAxis: [
        { type: "value", axisLabel: axisLabel(), splitLine: splitLine() },
        { type: "value", min: 0, max: 100, axisLabel: Object.assign(axisLabel(), { formatter: "{value}%" }), splitLine: { show: false } },
      ],
      series: [
        { name: "工单量", type: "bar", data: rows.map((r) => r[1]), barMaxWidth: 22, itemStyle: { color: "#5aa6e8", borderRadius: [3, 3, 0, 0] } },
        { name: "累计占比", type: "line", yAxisIndex: 1, data: cum, smooth: true, symbol: "circle", symbolSize: 7, lineStyle: { color: "#fcc419", width: 2 }, itemStyle: { color: "#fcc419" } },
      ],
    });
  }

  function packCircles(nodes) {
    const circles = nodes.map((n) => Object.assign({}, n));
    circles.sort((a, b) => b.r - a.r);
    if (!circles.length) return { r: 1, nodes: [] };
    circles[0].x = 0;
    circles[0].y = 0;
    for (let i = 1; i < circles.length; i++) {
      let best = { x: 0, y: 0, d: Infinity };
      for (let j = 0; j < i; j++) {
        for (let k = 0; k < 48; k++) {
          const ang = (k / 48) * Math.PI * 2;
          const x = circles[j].x + (circles[j].r + circles[i].r) * Math.cos(ang);
          const y = circles[j].y + (circles[j].r + circles[i].r) * Math.sin(ang);
          let clash = false;
          for (let m = 0; m < i; m++) {
            if (Math.hypot(x - circles[m].x, y - circles[m].y) < circles[m].r + circles[i].r - 0.05) {
              clash = true;
              break;
            }
          }
          if (!clash) {
            const d = x * x + y * y;
            if (d < best.d) best = { x: x, y: y, d: d };
          }
        }
      }
      if (!isFinite(best.d)) {
        const ang = i * 1.7;
        best.x = (circles[0].r + circles[i].r) * Math.cos(ang);
        best.y = (circles[0].r + circles[i].r) * Math.sin(ang);
      }
      circles[i].x = best.x;
      circles[i].y = best.y;
    }
    let R = 0;
    circles.forEach((c) => {
      R = Math.max(R, Math.hypot(c.x, c.y) + c.r);
    });
    return { r: R, nodes: circles };
  }

  function initPack() {
    const el = document.getElementById("chart-pack");
    if (!el) return;
    const chart = echarts.init(el, null, { renderer: "canvas" });
    const tree = REGIONS.map((r, i) => ({
      name: r,
      color: C[i],
      children: [
        { name: "专业版", value: [180, 140, 110, 80][i] },
        { name: "基础版", value: [120, 110, 90, 72][i] },
        { name: "增值", value: [70, 55, 48, 36][i] },
      ],
    }));
    function render() {
      const w = chart.getWidth();
      const h = chart.getHeight();
      const regions = tree.map((reg) => {
        const kids = reg.children.map((c) => ({ name: c.name, r: Math.sqrt(c.value) * 2.2, value: c.value, color: reg.color }));
        const packed = packCircles(kids);
        packed.nodes.forEach((n) => { n.parent = reg.name; });
        return { name: reg.name, color: reg.color, inner: packed, r: packed.r + 10, value: reg.children.reduce((s, c) => s + c.value, 0) };
      });
      const outer = packCircles(regions);
      const scale = (Math.min(w, h) * 0.46) / (outer.r || 1);
      const cx = w / 2;
      const cy = h / 2 + 4;
      const graphics = [];
      outer.nodes.forEach((reg) => {
        const px = cx + reg.x * scale;
        const py = cy + reg.y * scale;
        graphics.push({
          type: "circle",
          shape: { cx: px, cy: py, r: reg.r * scale },
          style: { fill: reg.color, opacity: 0.16, stroke: reg.color, lineWidth: 1.2 },
        });
        graphics.push({
          type: "text",
          x: px,
          y: py - reg.r * scale + 12,
          style: { text: reg.name, fill: T().ink, font: "12px " + FONT, textAlign: "center", textVerticalAlign: "middle" },
        });
        reg.inner.nodes.forEach((ch) => {
          const x = px + ch.x * scale;
          const y = py + ch.y * scale;
          const rr = ch.r * scale;
          graphics.push({
            type: "circle",
            shape: { cx: x, cy: y, r: rr },
            style: { fill: ch.color, opacity: 0.55 },
          });
          if (rr > 14) {
            graphics.push({
              type: "text",
              x: x,
              y: y,
              style: { text: ch.name, fill: T().ink, font: "10px " + FONT, textAlign: "center", textVerticalAlign: "middle" },
            });
          }
        });
      });
      chart.setOption(withAnim({ graphic: graphics }), true);
    }
    render();
    charts.push({ chart, relayout: render });
  }

  function initForce() {
    const nodes = [
      { name: "总部", category: 0, symbolSize: 42 },
      { name: "华东仓", category: 1, symbolSize: 28 },
      { name: "华南仓", category: 1, symbolSize: 26 },
      { name: "华北仓", category: 1, symbolSize: 24 },
      { name: "西南仓", category: 1, symbolSize: 22 },
      { name: "专业版", category: 2, symbolSize: 22 },
      { name: "基础版", category: 2, symbolSize: 20 },
      { name: "增值服务", category: 2, symbolSize: 18 },
      { name: "硬件", category: 2, symbolSize: 16 },
      { name: "直销", category: 3, symbolSize: 18 },
      { name: "官网", category: 3, symbolSize: 16 },
      { name: "渠道", category: 3, symbolSize: 16 },
    ];
    const links = [
      { source: "总部", target: "华东仓" },
      { source: "总部", target: "华南仓" },
      { source: "总部", target: "华北仓" },
      { source: "总部", target: "西南仓" },
      { source: "华东仓", target: "专业版" },
      { source: "华南仓", target: "基础版" },
      { source: "华北仓", target: "增值服务" },
      { source: "西南仓", target: "硬件" },
      { source: "直销", target: "华东仓" },
      { source: "官网", target: "华南仓" },
      { source: "渠道", target: "华北仓" },
      { source: "直销", target: "专业版" },
      { source: "官网", target: "基础版" },
      { source: "渠道", target: "西南仓" },
      { source: "专业版", target: "增值服务" },
    ];
    mount("chart-force", {
      tooltip: Object.assign(tooltip(), { trigger: "item" }),
      legend: { data: ["中枢", "仓网", "产品", "渠道"], bottom: 0, textStyle: { color: T().legend, fontSize: 11 } },
      series: [{
        type: "graph",
        layout: "force",
        roam: true,
        categories: [{ name: "中枢" }, { name: "仓网" }, { name: "产品" }, { name: "渠道" }],
        data: nodes.map((n, i) => Object.assign({}, n, { id: n.name, itemStyle: { color: C[n.category] } })),
        links: links,
        label: { show: true, color: T().ink, fontSize: 11 },
        lineStyle: { color: "rgba(90,166,232,0.35)", curveness: 0.12, width: 1.4 },
        force: { repulsion: 220, edgeLength: [50, 120], gravity: 0.12 },
      }],
    });
  }

  function initGantt() {
    const tasks = [
      { name: "华东春季上线", start: "2026-04-01", end: "2026-04-18" },
      { name: "华南会员周", start: "2026-04-10", end: "2026-04-28" },
      { name: "华北仓扩容", start: "2026-04-20", end: "2026-05-22" },
      { name: "西南渠道招募", start: "2026-05-04", end: "2026-05-30" },
      { name: "全国年中大促", start: "2026-06-01", end: "2026-06-18" },
      { name: "专业版 2.0", start: "2026-05-12", end: "2026-06-26" },
    ];
    const cats = tasks.map((t) => t.name);
    mount("chart-gantt", {
      tooltip: Object.assign(tooltip(), {
        trigger: "item",
        formatter: (p) => {
          const name = Array.isArray(p.value) ? p.value[0] : p.name;
          const t = tasks.find((x) => x.name === name);
          if (!t) return name || "";
          return t.name + "<br/>" + t.start + " ~ " + t.end;
        },
      }),
      grid: { left: 110, right: 24, top: 18, bottom: 28 },
      xAxis: {
        type: "time",
        min: "2026-04-01",
        max: "2026-06-30",
        axisLabel: axisLabel(),
        splitLine: splitLine(),
      },
      yAxis: { type: "category", data: cats, axisLabel: axisLabel(), axisTick: { show: false }, axisLine: { show: false } },
      series: [{
        type: "custom",
        renderItem: function (params, api) {
          const cat = api.value(0);
          const start = api.coord([api.value(1), cat]);
          const end = api.coord([api.value(2), cat]);
          const height = 14;
          return {
            type: "rect",
            shape: { x: start[0], y: start[1] - height / 2, width: Math.max(end[0] - start[0], 2), height: height, r: 4 },
            style: { fill: C[(cats.indexOf(cat) >= 0 ? cats.indexOf(cat) : 0) % C.length] },
          };
        },
        encode: { x: [1, 2], y: 0 },
        data: tasks.map((t) => [t.name, Date.parse(t.start + "T00:00:00"), Date.parse(t.end + "T00:00:00")]),
      }],
    });
  }

  function initKline() {
    const days = [];
    const ohlc = [];
    const vols = [];
    let p = 128.4;
    for (let d = 1; d <= 31; d++) {
      const dt = new Date(2026, 2, d);
      if (dt.getDay() === 0 || dt.getDay() === 6) continue;
      const o = p;
      const ch = (rng() - 0.48) * 5.4;
      const c = Math.max(90, o + ch);
      const h = Math.max(o, c) + rng() * 2.1;
      const l = Math.min(o, c) - rng() * 2.1;
      const label = "03-" + String(d).padStart(2, "0");
      days.push(label);
      ohlc.push([+o.toFixed(2), +c.toFixed(2), +l.toFixed(2), +h.toFixed(2)]);
      vols.push(Math.round(8200 + rng() * 14000));
      p = c;
    }
    mount("chart-kline", {
      tooltip: tooltip(),
      grid: { left: 48, right: 12, top: 16, bottom: 28 },
      xAxis: { type: "category", data: days, axisLabel: Object.assign(axisLabel(), { interval: 3 }), axisLine: { lineStyle: { color: T().axisLine } } },
      yAxis: { scale: true, axisLabel: axisLabel(), splitLine: splitLine() },
      series: [{
        type: "candlestick",
        data: ohlc,
        itemStyle: {
          color: "#69db7c",
          color0: "#ff6b6b",
          borderColor: "#69db7c",
          borderColor0: "#ff6b6b",
        },
      }],
    });
  }

  function initPyramid() {
    const ages = ["18-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55+"];
    const male = [8.2, 12.6, 15.1, 13.4, 10.8, 7.9, 5.4, 3.1];
    const female = [9.1, 13.8, 14.6, 12.2, 9.7, 7.1, 5.8, 3.6];
    mount("chart-pyramid", {
      tooltip: Object.assign(tooltip(), { formatter: (p) => p.seriesName + " " + p.name + "<br/>" + Math.abs(p.value) + "%" }),
      legend: { top: 0, textStyle: { color: T().legend, fontSize: 11 } },
      grid: { left: 52, right: 24, top: 32, bottom: 24 },
      xAxis: {
        type: "value",
        axisLabel: Object.assign(axisLabel(), { formatter: (v) => Math.abs(v) + "%" }),
        splitLine: splitLine(),
      },
      yAxis: { type: "category", data: ages, inverse: true, axisLabel: axisLabel(), axisTick: { show: false }, axisLine: { show: false } },
      series: [
        { name: "男", type: "bar", data: male.map((v) => -v), barWidth: 12, itemStyle: { color: "#5aa6e8", borderRadius: [0, 0, 0, 0] } },
        { name: "女", type: "bar", data: female, barWidth: 12, itemStyle: { color: "#f783ac" } },
      ],
    });
  }

  function initAll() {
    [
      initBar, initLine, initPie, initRadar, initHeatmap, initSunburst, initRose, initCalendar,
      initDonut, initBubble, initWordcloud, initBullet, initHistogram, initRadial, initLollipop,
      initLiquid, initWaffle, initPareto, initPack, initForce, initGantt, initKline, initPyramid,
    ].forEach((fn) => {
      try { fn(); } catch (err) { console.error("chart init failed", fn.name, err); }
    });
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      charts.forEach((c) => {
        c.chart.resize();
        if (c.relayout) c.relayout();
      });
    }, 80);
  });

  function destroyCharts() {
    charts.forEach((c) => {
      if (c.timer) clearInterval(c.timer);
      try { c.chart.dispose(); } catch (e) {}
    });
    charts.length = 0;
  }

  function applyTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = mode === "light" ? "深色模式" : "浅色模式";
    destroyCharts();
    initAll();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        charts.forEach((c) => {
          c.chart.resize();
          if (c.relayout) c.relayout();
        });
      });
    });
  }

  function boot() {
    if (typeof echarts === "undefined") {
      setTimeout(boot, 40);
      return;
    }
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        applyTheme(isLight() ? "dark" : "light");
      });
    }
    initAll();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        charts.forEach((c) => {
          c.chart.resize();
          if (c.relayout) c.relayout();
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
