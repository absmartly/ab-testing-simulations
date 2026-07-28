const EXPERIMENTS = {
  aa_posterior: {
    number: 1,
    title: "A/A posterior sign probability",
    question: "Does P(B > A) converge to zero when A and B are identical?",
    fields: [
      { key: "sampleSizes", label: "Sample sizes per arm", type: "text", value: "1000,10000,100000", hint: "Comma-separated" },
      { key: "baselineRate", label: "Baseline conversion rate", type: "number", value: 0.05, min: 0.001, max: 0.999, step: "any" },
      { key: "trials", label: "Repeated A/A tests", type: "number", value: 250, min: 50, max: 2000, step: 50 },
      { key: "posteriorDraws", label: "Posterior draws per test", type: "number", value: 1000, min: 100, max: 5000, step: 100 },
      { key: "threshold", label: "Decision threshold", type: "number", value: 0.95, min: 0.5, max: 0.999, step: "any" },
      { key: "seed", label: "Seed", type: "number", value: 20260728, min: 1, max: 4294967295, step: 1 },
    ],
  },
  fixed_horizon_equivalence: {
    number: 2,
    title: "Fixed-horizon equivalence",
    question: "At one planned analysis, what does a flat prior add to the decision?",
    fields: [
      { key: "sampleSizePerArm", label: "Sample size per arm", type: "number", value: 20000, min: 100, max: 1000000, step: 100 },
      { key: "baselineRate", label: "Baseline conversion rate", type: "number", value: 0.05, min: 0.001, max: 0.999, step: "any" },
      { key: "trials", label: "Repeated A/A tests", type: "number", value: 1000, min: 100, max: 10000, step: 100 },
      { key: "posteriorDraws", label: "Posterior draws per test", type: "number", value: 1000, min: 100, max: 5000, step: 100 },
      { key: "threshold", label: "Posterior threshold", type: "number", value: 0.95, min: 0.5, max: 0.999, step: "any" },
      { key: "seed", label: "Seed", type: "number", value: 20260729, min: 1, max: 4294967295, step: 1 },
    ],
  },
  optional_stopping: {
    number: 3,
    title: "Repeated monitoring",
    question: "Is a flat-prior posterior threshold automatically safe to monitor?",
    fields: [
      { key: "totalSamplePerArm", label: "Maximum sample per arm", type: "number", value: 24000, min: 1000, max: 1000000, step: 1000 },
      { key: "looks", label: "Monitoring looks", type: "number", value: 12, min: 1, max: 100, step: 1 },
      { key: "trials", label: "Repeated A/A tests", type: "number", value: 30000, min: 1000, max: 500000, step: 1000 },
      { key: "threshold", label: "Posterior threshold", type: "number", value: 0.95, min: 0.5, max: 0.999, step: "any" },
      { key: "sd", label: "Outcome standard deviation", type: "number", value: 1, min: 0.001, max: 1000, step: "any" },
      { key: "seed", label: "Seed", type: "number", value: 7, min: 1, max: 4294967295, step: 1 },
    ],
  },
  expected_loss_monitoring: {
    number: 4,
    title: "Expected-loss stopping",
    question: "Does a small posterior expected loss imply a controlled false-positive rate?",
    fields: [
      { key: "totalSamplePerArm", label: "Maximum sample per arm", type: "number", value: 24000, min: 1000, max: 1000000, step: 1000 },
      { key: "looks", label: "Monitoring looks", type: "number", value: 12, min: 1, max: 100, step: 1 },
      { key: "trials", label: "Repeated A/A tests", type: "number", value: 30000, min: 1000, max: 500000, step: 1000 },
      { key: "lossThreshold", label: "Expected-loss threshold", type: "number", value: 0.0015, min: 0.000001, max: 1, step: "any" },
      { key: "sd", label: "Outcome standard deviation", type: "number", value: 1, min: 0.001, max: 1000, step: "any" },
      { key: "seed", label: "Seed", type: "number", value: 8, min: 1, max: 4294967295, step: 1 },
    ],
  },
  informative_prior: {
    number: 5,
    title: "Informative priors and shrinkage",
    question: "When does prior information improve estimation and shipping decisions?",
    fields: [
      { key: "trials", label: "Experiment portfolio size", type: "number", value: 100000, min: 1000, max: 1000000, step: 1000 },
      { key: "truePriorSd", label: "True effect-distribution SD", type: "number", value: 0.01, min: 0.0001, max: 1, step: "any" },
      { key: "assumedPriorSds", label: "Assumed prior SDs", type: "text", value: "flat,0.00333,0.005,0.01,0.02,0.05", hint: "Use flat for no shrinkage" },
      { key: "standardError", label: "Measurement standard error", type: "number", value: 0.01, min: 0.0001, max: 1, step: "any" },
      { key: "decisionProbability", label: "Ship probability threshold", type: "number", value: 0.95, min: 0.5, max: 0.999, step: "any" },
      { key: "seed", label: "Seed", type: "number", value: 11, min: 1, max: 4294967295, step: 1 },
    ],
  },
  threshold_sweep: {
    number: 6,
    title: "Decision speed versus error",
    question: "How much false-positive risk purchases an earlier decision?",
    fields: [
      { key: "thresholds", label: "Posterior thresholds", type: "text", value: "0.8,0.85,0.9,0.925,0.95,0.975,0.99,0.995", hint: "Comma-separated" },
      { key: "totalSamplePerArm", label: "Maximum sample per arm", type: "number", value: 24000, min: 1000, max: 1000000, step: 1000 },
      { key: "looks", label: "Monitoring looks", type: "number", value: 12, min: 1, max: 100, step: 1 },
      { key: "trials", label: "Trials under H0 and H1", type: "number", value: 30000, min: 1000, max: 250000, step: 1000 },
      { key: "trueEffectUnderH1", label: "True effect under H1", type: "number", value: 0.015, min: 0.0001, max: 10, step: "any" },
      { key: "seed", label: "Seed", type: "number", value: 17, min: 1, max: 4294967295, step: 1 },
    ],
  },
};

const SERIES = ["var(--series-1)", "var(--series-2)", "var(--series-3)"];
const state = {
  active: "aa_posterior",
  result: null,
  reference: null,
  worker: null,
  runId: 0,
};

const el = (id) => document.getElementById(id);
const form = el("simulation-form");
const tooltip = el("tooltip");

function fieldValue(field) {
  const input = form.elements.namedItem(field.key);
  if (!input) return field.value;
  if (field.type === "number") return Number(input.value);
  if (field.key === "sampleSizes" || field.key === "thresholds") {
    return input.value.split(",").map((part) => Number(part.trim())).filter(Number.isFinite);
  }
  if (field.key === "assumedPriorSds") {
    return input.value.split(",").map((part) => {
      const value = part.trim().toLowerCase();
      return value === "flat" || value === "none" ? null : Number(value);
    }).filter((value) => value === null || Number.isFinite(value));
  }
  return input.value;
}

function currentConfig() {
  return Object.fromEntries(EXPERIMENTS[state.active].fields.map((field) => [field.key, fieldValue(field)]));
}

function renderForm(configOverride = null) {
  form.replaceChildren();
  for (const field of EXPERIMENTS[state.active].fields) {
    const wrapper = document.createElement("div");
    wrapper.className = "field";
    const label = document.createElement("label");
    label.htmlFor = `field-${field.key}`;
    label.textContent = field.label;
    const input = document.createElement("input");
    input.id = `field-${field.key}`;
    input.name = field.key;
    input.type = field.type;
    input.required = true;
    let value = configOverride?.[field.key] ?? field.value;
    if (Array.isArray(value)) value = value.map((item) => item === null ? "flat" : item).join(",");
    input.value = value;
    for (const key of ["min", "max", "step"]) if (field[key] !== undefined) input[key] = field[key];
    wrapper.append(label, input);
    if (field.hint) {
      const hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = field.hint;
      wrapper.append(hint);
    }
    form.append(wrapper);
  }
}

function setActive(experiment, config = null) {
  if (!EXPERIMENTS[experiment]) return;
  cancelRun();
  state.active = experiment;
  state.result = null;
  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    const selected = tab.dataset.experiment === experiment;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  const metadata = EXPERIMENTS[experiment];
  el("experiment-panel").setAttribute("aria-labelledby", `tab-${{
    aa_posterior: "aa", fixed_horizon_equivalence: "fixed", optional_stopping: "stopping",
    expected_loss_monitoring: "loss", informative_prior: "prior", threshold_sweep: "sweep",
  }[experiment]}`);
  el("experiment-number").textContent = `EXPERIMENT ${metadata.number}`;
  el("experiment-title").textContent = metadata.title;
  el("experiment-question").textContent = metadata.question;
  el("result-placeholder").hidden = false;
  el("result-content").hidden = true;
  el("download-json").disabled = true;
  el("download-csv").disabled = true;
  el("run-status").textContent = "Ready.";
  renderForm(config);
  updateUrl();
}

function updateUrl() {
  const url = new URL(location.href);
  url.searchParams.set("experiment", state.active);
  url.searchParams.delete("config");
  history.replaceState(null, "", url);
}

function shareUrl() {
  const url = new URL(location.href);
  url.searchParams.set("experiment", state.active);
  url.searchParams.set("config", btoa(unescape(encodeURIComponent(JSON.stringify(currentConfig())))));
  return url.toString();
}

function cancelRun() {
  if (state.worker) {
    state.worker.terminate();
    state.worker = null;
  }
  el("cancel-run").hidden = true;
  el("run-progress").hidden = true;
}

function runSimulation() {
  if (!form.reportValidity()) return;
  cancelRun();
  const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
  state.worker = worker;
  const runId = ++state.runId;
  el("run-progress").hidden = false;
  el("run-progress").value = 0;
  el("cancel-run").hidden = false;
  el("run-status").textContent = "Simulating locally…";
  el("run-form").disabled = true;
  worker.addEventListener("message", (event) => {
    if (event.data.id !== runId) return;
    if (event.data.type === "progress") {
      el("run-progress").value = event.data.value;
      el("run-status").textContent = `Simulating locally… ${Math.round(event.data.value * 100)}%`;
    } else if (event.data.type === "result") {
      state.result = event.data.result;
      renderResult(state.result);
      el("run-status").textContent = "Complete.";
      el("run-form").disabled = false;
      cancelRun();
    } else if (event.data.type === "error") {
      el("run-status").textContent = `Error: ${event.data.message}`;
      el("run-form").disabled = false;
      cancelRun();
    }
  });
  worker.postMessage({ id: runId, experiment: state.active, config: currentConfig() });
}

function percent(value, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function number(value, digits = 3) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number(value).toFixed(digits).replace(/\.?0+$/, "");
}

function stat(label, value, detail = "") {
  const node = document.createElement("div");
  node.className = "stat";
  const labelNode = document.createElement("div");
  labelNode.className = "stat-label";
  labelNode.textContent = label;
  const valueNode = document.createElement("div");
  valueNode.className = "stat-value";
  valueNode.textContent = value;
  node.append(labelNode, valueNode);
  if (detail) {
    const detailNode = document.createElement("div");
    detailNode.className = "stat-detail";
    detailNode.textContent = detail;
    node.append(detailNode);
  }
  return node;
}

function showTooltip(event, lines) {
  tooltip.replaceChildren();
  for (const [value, label] of lines) {
    const row = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = value;
    const span = document.createElement("span");
    span.textContent = ` ${label}`;
    row.append(strong, span);
    tooltip.append(row);
  }
  tooltip.hidden = false;
  const box = event.currentTarget.getBoundingClientRect();
  const x = event.clientX || box.left + box.width / 2;
  const y = event.clientY || box.top;
  tooltip.style.left = `${Math.min(innerWidth - 260, x + 12)}px`;
  tooltip.style.top = `${Math.max(8, y - 58)}px`;
}

function hideTooltip() { tooltip.hidden = true; }

function chartCard(title, subtitle) {
  const card = document.createElement("section");
  card.className = "chart-card";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const copy = document.createElement("p");
  copy.textContent = subtitle;
  const wrap = document.createElement("div");
  wrap.className = "chart-wrap";
  card.append(heading, copy, wrap);
  return [card, wrap];
}

function lineChart({ title, subtitle, data, xKey, series, xLabel = "", yLabel = "", yDomain = null, formatY = number }) {
  const [card, wrap] = chartCard(title, subtitle);
  const width = 840;
  const height = 330;
  const margin = { top: 24, right: 80, bottom: 48, left: 58 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xs = data.map((row) => Number(row[xKey]));
  const values = series.flatMap((item) => data.map((row) => Number(item.value(row))));
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = yDomain?.[0] ?? Math.min(0, ...values);
  const yMaxRaw = yDomain?.[1] ?? Math.max(...values);
  const yMax = yMaxRaw === yMin ? yMin + 1 : yMaxRaw;
  const sx = (x) => margin.left + (xMax === xMin ? plotWidth / 2 : (x - xMin) / (xMax - xMin) * plotWidth);
  const sy = (y) => margin.top + plotHeight - (y - yMin) / (yMax - yMin) * plotHeight;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${title}. ${subtitle}`);
  for (let i = 0; i <= 4; i += 1) {
    const y = margin.top + plotHeight * i / 4;
    const value = yMax - (yMax - yMin) * i / 4;
    const line = document.createElementNS(svg.namespaceURI, "line");
    line.setAttribute("x1", margin.left); line.setAttribute("x2", margin.left + plotWidth);
    line.setAttribute("y1", y); line.setAttribute("y2", y); line.setAttribute("class", "chart-grid");
    const label = document.createElementNS(svg.namespaceURI, "text");
    label.setAttribute("x", margin.left - 10); label.setAttribute("y", y + 4); label.setAttribute("text-anchor", "end"); label.setAttribute("class", "chart-label");
    label.textContent = formatY(value);
    svg.append(line, label);
  }
  const axis = document.createElementNS(svg.namespaceURI, "line");
  axis.setAttribute("x1", margin.left); axis.setAttribute("x2", margin.left + plotWidth);
  axis.setAttribute("y1", margin.top + plotHeight); axis.setAttribute("y2", margin.top + plotHeight); axis.setAttribute("class", "chart-axis");
  svg.append(axis);
  const legend = document.createElement("div");
  legend.className = "legend";
  series.forEach((item, seriesIndex) => {
    const points = data.map((row) => [sx(Number(row[xKey])), sy(Number(item.value(row)))]);
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", points.map((point, index) => `${index ? "L" : "M"}${point[0]},${point[1]}`).join(" "));
    path.setAttribute("class", "chart-line"); path.setAttribute("stroke", SERIES[seriesIndex]);
    svg.append(path);
    points.forEach((point, index) => {
      const hit = document.createElementNS(svg.namespaceURI, "circle");
      hit.setAttribute("cx", point[0]); hit.setAttribute("cy", point[1]); hit.setAttribute("r", 12);
      hit.setAttribute("class", "chart-hit"); hit.setAttribute("tabindex", "0");
      hit.setAttribute("aria-label", `${item.label}, ${xLabel} ${data[index][xKey]}, ${formatY(item.value(data[index]))}`);
      const handler = (event) => showTooltip(event, [[formatY(item.value(data[index])), item.label], [String(data[index][xKey]), xLabel]]);
      hit.addEventListener("pointermove", handler); hit.addEventListener("focus", handler); hit.addEventListener("pointerleave", hideTooltip); hit.addEventListener("blur", hideTooltip);
      svg.append(hit);
    });
    const end = points[points.length - 1];
    const label = document.createElementNS(svg.namespaceURI, "text");
    label.setAttribute("x", end[0] + 8); label.setAttribute("y", end[1] + 4); label.setAttribute("class", "chart-direct-label");
    label.textContent = item.shortLabel || item.label;
    svg.append(label);
    const legendItem = document.createElement("span"); legendItem.className = "legend-item";
    const key = document.createElement("span"); key.className = "legend-key"; key.style.background = SERIES[seriesIndex];
    const text = document.createElement("span"); text.textContent = item.label;
    legendItem.append(key, text); legend.append(legendItem);
  });
  const xTicks = [...new Set([0, Math.floor((data.length - 1) / 2), data.length - 1])];
  for (const index of xTicks) {
    const label = document.createElementNS(svg.namespaceURI, "text");
    label.setAttribute("x", sx(Number(data[index][xKey]))); label.setAttribute("y", height - 18); label.setAttribute("text-anchor", "middle"); label.setAttribute("class", "chart-label");
    label.textContent = String(data[index][xKey]); svg.append(label);
  }
  wrap.append(svg, legend);
  return card;
}

function barChart({ title, subtitle, data, label, value, formatValue = number, color = SERIES[0] }) {
  const [card, wrap] = chartCard(title, subtitle);
  const width = 840, height = 320, margin = { top: 20, right: 40, bottom: 70, left: 58 };
  const plotWidth = width - margin.left - margin.right, plotHeight = height - margin.top - margin.bottom;
  const max = Math.max(...data.map((row) => value(row)), 1e-12);
  const band = plotWidth / data.length;
  const barWidth = Math.min(24, Math.max(8, band - 8));
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`); svg.setAttribute("role", "img"); svg.setAttribute("aria-label", `${title}. ${subtitle}`);
  for (let i = 0; i <= 4; i += 1) {
    const y = margin.top + plotHeight * i / 4;
    const tick = max * (1 - i / 4);
    const grid = document.createElementNS(svg.namespaceURI, "line");
    grid.setAttribute("x1", margin.left); grid.setAttribute("x2", margin.left + plotWidth); grid.setAttribute("y1", y); grid.setAttribute("y2", y); grid.setAttribute("class", "chart-grid");
    const text = document.createElementNS(svg.namespaceURI, "text");
    text.setAttribute("x", margin.left - 10); text.setAttribute("y", y + 4); text.setAttribute("text-anchor", "end"); text.setAttribute("class", "chart-label"); text.textContent = formatValue(tick);
    svg.append(grid, text);
  }
  data.forEach((row, index) => {
    const x = margin.left + band * index + (band - barWidth) / 2;
    const raw = value(row); const h = raw / max * plotHeight; const y = margin.top + plotHeight - h;
    const rect = document.createElementNS(svg.namespaceURI, "path");
    const radius = Math.min(4, barWidth / 2, h);
    rect.setAttribute("d", `M${x},${margin.top + plotHeight}V${y + radius}Q${x},${y} ${x + radius},${y}H${x + barWidth - radius}Q${x + barWidth},${y} ${x + barWidth},${y + radius}V${margin.top + plotHeight}Z`);
    rect.setAttribute("fill", color); rect.setAttribute("class", "chart-bar"); rect.setAttribute("tabindex", "0");
    rect.setAttribute("aria-label", `${label(row)}: ${formatValue(raw)}`);
    const handler = (event) => showTooltip(event, [[formatValue(raw), label(row)]]);
    rect.addEventListener("pointermove", handler); rect.addEventListener("focus", handler); rect.addEventListener("pointerleave", hideTooltip); rect.addEventListener("blur", hideTooltip);
    const text = document.createElementNS(svg.namespaceURI, "text");
    text.setAttribute("x", x + barWidth / 2); text.setAttribute("y", height - 35); text.setAttribute("text-anchor", "middle"); text.setAttribute("class", "chart-label"); text.textContent = label(row);
    svg.append(rect, text);
  });
  wrap.append(svg);
  return card;
}

function table(headers, rows) {
  const tableNode = document.createElement("table");
  const thead = document.createElement("thead"); const headRow = document.createElement("tr");
  headers.forEach(([key, label]) => { const th = document.createElement("th"); th.scope = "col"; th.textContent = label; headRow.append(th); });
  thead.append(headRow); const tbody = document.createElement("tbody");
  rows.forEach((row) => { const tr = document.createElement("tr"); headers.forEach(([key]) => { const td = document.createElement("td"); td.textContent = row[key]; tr.append(td); }); tbody.append(tr); });
  tableNode.append(thead, tbody); return tableNode;
}

function setResults({ stats, charts, interpretation, method, headers, rows }) {
  el("stat-grid").replaceChildren(...stats);
  el("chart-region").replaceChildren(...charts);
  el("interpretation-text").textContent = interpretation;
  el("method-note").textContent = method;
  el("table-region").replaceChildren(table(headers, rows));
  el("result-placeholder").hidden = true;
  el("result-content").hidden = false;
  el("download-json").disabled = false;
  el("download-csv").disabled = false;
}

function renderResult(result) {
  if (result.experiment === "aa_posterior") {
    const last = result.rows.at(-1);
    const cards = result.rows.map((row) => barChart({
      title: `${row.sample_size_per_arm.toLocaleString()} users per arm`,
      subtitle: "Distribution across repeated A/A tests",
      data: row.histogram,
      label: (bin) => `${number(bin.low, 2)}–${number(bin.high, 2)}`,
      value: (bin) => bin.count,
      formatValue: (value) => Math.round(value).toString(),
    }));
    const wrapper = document.createElement("div"); wrapper.className = "small-multiples"; wrapper.append(...cards);
    setResults({
      stats: [
        stat("Mean P(B > A), largest n", percent(last.mean_probability), "The boundary remains centered at 50%."),
        stat("Standard deviation", number(last.sd_probability, 3), `Asymptotic target: ${number(result.theory.asymptotic_sd, 3)}`),
        stat(`P(B > A) > ${percent(result.config.threshold, 0)}`, percent(last.above_threshold.rate), `95% CI ${percent(last.above_threshold.ci95[0])}–${percent(last.above_threshold.ci95[1])}`),
      ],
      charts: [wrapper],
      interpretation: "More data does not make a strict posterior sign probability converge to zero when the true effect is exactly zero. Across repeated A/A tests it remains centered around 50%, with a broad distribution. The posterior uncertainty about the magnitude shrinks; the sign probability at the boundary does not.",
      method: `Independent Beta(1,1) priors, exact Binomial data, ${result.config.posterior_draws.toLocaleString()} posterior draws per repeated test.`,
      headers: [["n", "Users per arm"], ["mean", "Mean P(B>A)"], ["sd", "SD"], ["high", `Above ${percent(result.config.threshold, 0)}`], ["ci", "95% CI"]],
      rows: result.rows.map((row) => ({ n: row.sample_size_per_arm.toLocaleString(), mean: percent(row.mean_probability), sd: number(row.sd_probability, 3), high: percent(row.above_threshold.rate), ci: `${percent(row.above_threshold.ci95[0])}–${percent(row.above_threshold.ci95[1])}` })),
    });
  } else if (result.experiment === "fixed_horizon_equivalence") {
    const matrix = result.decision_matrix;
    const rows = [
      { rule: "Both reject", count: matrix.both },
      { rule: "Bayesian only", count: matrix.bayes_only },
      { rule: "Frequentist only", count: matrix.frequentist_only },
      { rule: "Neither rejects", count: matrix.neither },
    ];
    setResults({
      stats: [
        stat("Bayesian false positives", percent(result.bayesian_false_positive.rate), `95% CI ${percent(result.bayesian_false_positive.ci95[0])}–${percent(result.bayesian_false_positive.ci95[1])}`),
        stat("Frequentist false positives", percent(result.frequentist_false_positive.rate), `95% CI ${percent(result.frequentist_false_positive.ci95[0])}–${percent(result.frequentist_false_positive.ci95[1])}`),
        stat("Decision agreement", percent(result.agreement.rate, 2), `${result.agreement.count.toLocaleString()} of ${result.agreement.total.toLocaleString()} tests`),
      ],
      charts: [barChart({ title: "Decision matrix", subtitle: "Where the two fixed-horizon rules agree or differ", data: rows, label: (row) => row.rule, value: (row) => row.count, formatValue: (value) => Math.round(value).toLocaleString() })],
      interpretation: "At one planned analysis, a flat-prior posterior sign threshold and the corresponding one-sided large-sample test make almost all the same decisions. The prior contributes very little here. This result is about one fixed horizon; it does not justify monitoring either unadjusted threshold repeatedly.",
      method: `Beta-Binomial posterior Monte Carlo versus a pooled one-sided z-test at alpha ${number(result.config.alpha, 3)}.`,
      headers: [["rule", "Decision"], ["count", "Count"], ["share", "Share"]],
      rows: rows.map((row) => ({ ...row, count: row.count.toLocaleString(), share: percent(row.count / result.config.trials, 2) })),
    });
  } else if (result.experiment === "optional_stopping") {
    const cumulative = result.posterior_monitoring.cumulative.map((row, index) => ({ ...row, final: result.final_look_only.rate, nominal: result.config.alpha }));
    setResults({
      stats: [
        stat("False positive at any look", percent(result.posterior_monitoring.ever_stopped.rate), `95% CI ${percent(result.posterior_monitoring.ever_stopped.ci95[0])}–${percent(result.posterior_monitoring.ever_stopped.ci95[1])}`),
        stat("Final-look-only false positive", percent(result.final_look_only.rate), `95% CI ${percent(result.final_look_only.ci95[0])}–${percent(result.final_look_only.ci95[1])}`),
        stat("Inflation", `${number(result.posterior_monitoring.ever_stopped.rate / result.final_look_only.rate, 2)}×`, `${result.config.looks} equally spaced looks`),
      ],
      charts: [
        lineChart({ title: "Cumulative probability of a false positive", subtitle: "A/A tests stopped by or at each look", data: cumulative, xKey: "look", xLabel: "Look", yDomain: [0, Math.max(0.2, result.posterior_monitoring.ever_stopped.rate * 1.1)], formatY: percent, series: [{ label: "Repeated posterior threshold", shortLabel: "Repeated", value: (row) => row.rate }, { label: "Final-look-only rate", shortLabel: "Final only", value: (row) => row.final }] }),
        barChart({ title: "First stopping look", subtitle: "Where false-positive decisions first occur", data: result.posterior_monitoring.first_stop_counts, label: (row) => `Look ${row.look}`, value: (row) => row.count, formatValue: (value) => Math.round(value).toLocaleString(), color: SERIES[1] }),
      ],
      interpretation: "For this flat-prior normal model, P(delta > 0 | data) is exactly one minus the one-sided p-value at every look. Repeatedly applying either unadjusted threshold therefore creates the same inflated false-positive procedure. The Bayesian label does not make the stopping rule anytime-valid.",
      method: `Known-variance normal sufficient statistics, ${result.config.looks} equally spaced looks, ${result.config.trials.toLocaleString()} repeated A/A tests.`,
      headers: [["look", "Look"], ["rate", "Cumulative false positive"], ["ci", "95% CI"], ["first", "First stops"]],
      rows: cumulative.map((row, index) => ({ look: row.look, rate: percent(row.rate, 2), ci: `${percent(row.ci95[0], 2)}–${percent(row.ci95[1], 2)}`, first: result.posterior_monitoring.first_stop_counts[index].count.toLocaleString() })),
    });
  } else if (result.experiment === "expected_loss_monitoring") {
    const cumulative = result.stopping.cumulative;
    setResults({
      stats: [
        stat("A/A tests that trigger", percent(result.stopping.ever_stopped.rate), `95% CI ${percent(result.stopping.ever_stopped.ci95[0])}–${percent(result.stopping.ever_stopped.ci95[1])}`),
        stat("Average first stop", number(result.stopping.average_stop_look_given_stop, 1), `Among runs that trigger, of ${result.config.looks} looks`),
        stat("Loss threshold", number(result.config.loss_threshold, 5), "In outcome-standard-deviation units"),
      ],
      charts: [
        lineChart({ title: "Cumulative A/A trigger rate", subtitle: "Share of no-effect tests meeting the expected-loss rule", data: cumulative, xKey: "look", xLabel: "Look", yDomain: [0, Math.min(1, result.stopping.ever_stopped.rate * 1.12)], formatY: percent, series: [{ label: "Expected-loss rule", shortLabel: "Triggered", value: (row) => row.rate }] }),
        barChart({ title: "First trigger look", subtitle: "Where the business rule first fires under A/A", data: result.stopping.first_stop_counts, label: (row) => `Look ${row.look}`, value: (row) => row.count, formatValue: (value) => Math.round(value).toLocaleString(), color: SERIES[1] }),
      ],
      interpretation: "Expected loss can be a coherent business input, but its threshold does not imply a particular false-positive rate. Under A/A, this configuration triggers at the displayed rate. Change the threshold and that operating characteristic changes with it.",
      method: result.formula,
      headers: [["look", "Look"], ["rate", "Cumulative trigger rate"], ["ci", "95% CI"], ["first", "First triggers"]],
      rows: cumulative.map((row, index) => ({ look: row.look, rate: percent(row.rate, 2), ci: `${percent(row.ci95[0], 2)}–${percent(row.ci95[1], 2)}`, first: result.stopping.first_stop_counts[index].count.toLocaleString() })),
    });
  } else if (result.experiment === "informative_prior") {
    const flat = result.rows.find((row) => row.label === "flat");
    const correct = result.rows.find((row) => row.label === "correct");
    const labels = (row) => row.assumed_prior_sd === null ? "Flat" : number(row.assumed_prior_sd, 4);
    setResults({
      stats: [
        stat("RMSE reduction, correct prior", percent(1 - correct.rmse / flat.rmse), `From ${number(flat.rmse, 5)} to ${number(correct.rmse, 5)}`),
        stat("Precision when shipped", percent(correct.precision), `Flat prior: ${percent(flat.precision)}`),
        stat("Winner's curse, flat prior", `${number(flat.winner_curse_ratio, 2)}×`, "Claimed lift divided by true lift among shipped tests"),
      ],
      charts: [
        lineChart({ title: "Prior width versus estimation error", subtitle: "Lower RMSE is better; Flat is shown at the far right", data: result.rows.map((row, index) => ({ ...row, order: index + 1 })), xKey: "order", xLabel: "Prior setting", yDomain: [0, Math.max(...result.rows.map((row) => row.rmse)) * 1.1], formatY: (value) => number(value, 4), series: [{ label: "RMSE", value: (row) => row.rmse }] }),
        barChart({ title: "Decision precision", subtitle: "Share of shipped tests whose true effect is positive", data: result.rows, label: labels, value: (row) => row.precision, formatValue: percent, color: SERIES[2] }),
      ],
      interpretation: "Under the portfolio model used to generate the data, the correctly specified informative prior shrinks noisy estimates and improves both RMSE and the precision of shipping decisions. The sensitivity curve also shows the dependency: Bayesian gains come from prior information, and misspecification changes the result.",
      method: `True effects N(0, ${number(result.config.true_prior_sd, 4)}²); observations have SE ${number(result.config.standard_error, 4)}.`,
      headers: [["prior", "Assumed prior SD"], ["rmse", "RMSE"], ["ship", "Ship rate"], ["precision", "Decision precision"], ["true", "True lift shipped"], ["claimed", "Claimed lift shipped"]],
      rows: result.rows.map((row) => ({ prior: labels(row), rmse: number(row.rmse, 5), ship: percent(row.ship_rate), precision: percent(row.precision), true: percent(row.mean_true_lift_shipped), claimed: percent(row.mean_claimed_lift_shipped) })),
    });
  } else if (result.experiment === "threshold_sweep") {
    const data = result.rows.map((row) => ({ ...row, thresholdPct: row.threshold * 100 }));
    setResults({
      stats: [
        stat("False positives at 95%", percent(data.find((row) => Math.abs(row.threshold - 0.95) < 1e-9)?.false_positive.rate ?? NaN), "Probability of firing at any look under A/A"),
        stat("Fastest H1 decision", number(Math.min(...data.map((row) => row.average_h1_stop_given_stop)), 1), "Average look among runs that stop"),
        stat("Thresholds compared", data.length.toString(), `${result.config.trials.toLocaleString()} trials under each hypothesis`),
      ],
      charts: [
        lineChart({ title: "Threshold versus operating characteristics", subtitle: "Higher thresholds reduce false positives and power together", data, xKey: "thresholdPct", xLabel: "Posterior threshold (%)", yDomain: [0, 1], formatY: percent, series: [{ label: "False-positive probability", shortLabel: "False positive", value: (row) => row.false_positive.rate }, { label: "Power", value: (row) => row.power.rate }] }),
        lineChart({ title: "Threshold versus decision speed", subtitle: "Average first look, conditional on stopping under H1", data, xKey: "thresholdPct", xLabel: "Posterior threshold (%)", yDomain: [0, result.config.looks], formatY: (value) => number(value, 1), series: [{ label: "Average H1 first-stop look", shortLabel: "Stop look", value: (row) => row.average_h1_stop_given_stop }] }),
      ],
      interpretation: "A looser posterior threshold reaches decisions earlier and reports more power, but it also fires more often under A/A. Decision speed is not meaningful without the corresponding error probability. The threshold is part of the procedure, not a cosmetic confidence setting.",
      method: `${result.config.looks} looks; H1 true effect ${number(result.config.true_effect_under_h1, 4)} in outcome-standard-deviation units.`,
      headers: [["threshold", "Threshold"], ["fp", "False positive"], ["fpci", "FP 95% CI"], ["power", "Power"], ["stop", "Average H1 stop"]],
      rows: data.map((row) => ({ threshold: percent(row.threshold, 1), fp: percent(row.false_positive.rate, 2), fpci: `${percent(row.false_positive.ci95[0], 2)}–${percent(row.false_positive.ci95[1], 2)}`, power: percent(row.power.rate, 2), stop: number(row.average_h1_stop_given_stop, 2) })),
    });
  }
}

function rowsForCsv() {
  const tableNode = el("table-region").querySelector("table");
  if (!tableNode) return [];
  return [...tableNode.rows].map((row) => [...row.cells].map((cell) => cell.textContent));
}

function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function loadReference() {
  el("run-status").textContent = "Loading committed publication results…";
  try {
    if (!state.reference) {
      const response = await fetch("results/reference-results.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.reference = await response.json();
    }
    const result = state.reference.results[state.active];
    if (!result) throw new Error("No publication result for this experiment");
    state.result = result;
    const config = Object.fromEntries(EXPERIMENTS[state.active].fields.map((field) => [field.key, result.config[toSnake(field.key)] ?? field.value]));
    renderForm(config);
    renderResult(result);
    el("run-status").textContent = "Loaded committed publication result.";
  } catch (error) {
    el("run-status").textContent = `Could not load publication results: ${error.message}`;
  }
}

function toSnake(value) { return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`); }

function initialize() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  const params = new URLSearchParams(location.search);
  const experiment = EXPERIMENTS[params.get("experiment")] ? params.get("experiment") : "aa_posterior";
  let config = null;
  if (params.get("config")) {
    try { config = JSON.parse(decodeURIComponent(escape(atob(params.get("config"))))); } catch { config = null; }
  }
  setActive(experiment, config);
  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    tab.addEventListener("click", () => setActive(tab.dataset.experiment));
    tab.addEventListener("keydown", (event) => {
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      const current = tabs.indexOf(event.currentTarget);
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const next = (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next].focus(); tabs[next].click();
      }
    });
  });
  form.addEventListener("submit", (event) => { event.preventDefault(); runSimulation(); });
  el("run-active").addEventListener("click", runSimulation);
  el("run-form").addEventListener("click", (event) => { event.preventDefault(); runSimulation(); });
  el("cancel-run").addEventListener("click", () => { cancelRun(); el("run-form").disabled = false; el("run-status").textContent = "Cancelled."; });
  el("reset-form").addEventListener("click", () => renderForm());
  el("load-reference").addEventListener("click", loadReference);
  el("copy-link").addEventListener("click", async () => {
    await navigator.clipboard.writeText(shareUrl());
    el("copy-link").textContent = "Copied";
    setTimeout(() => { el("copy-link").textContent = "Copy configuration"; }, 1500);
  });
  el("download-json").addEventListener("click", () => download(`${JSON.stringify(state.result, null, 2)}\n`, `${state.active}.json`, "application/json"));
  el("download-csv").addEventListener("click", () => download(rowsForCsv().map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n"), `${state.active}.csv`, "text/csv"));
  el("theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next; localStorage.setItem("theme", next);
    el("theme-toggle").setAttribute("aria-label", `Use ${next === "dark" ? "light" : "dark"} theme`);
  });
}

initialize();
