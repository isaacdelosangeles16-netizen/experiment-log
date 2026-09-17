/* =========================================================
   EXPERIMENT LOG v2.0
   CODEPEN JAVASCRIPT
   ========================================================= */

const G = 6.67430e-11;
const C = 299792458;
const SOLAR_MASS = 1.989e30;

/* =========================================================
   DATA
   ========================================================= */

let experiments = [];
let researcher = "";
let guideStep = 0;

const guideSteps = [
  {
    title: "Step 1 — Define the variables",
    text: "Choose the mass of the object and the closest approach distance."
  },
  {
    title: "Step 2 — Calculate the theoretical value",
    text: "Use the simplified gravitational deflection model to obtain a theoretical deflection."
  },
  {
    title: "Step 3 — Record an observation",
    text: "Enter an experimental deflection and record the experiment."
  },
  {
    title: "Step 4 — Analyze the data",
    text: "Compare theoretical and experimental values and inspect the deviation."
  },
  {
    title: "Step 5 — Look for patterns",
    text: "Use the analysis tools to investigate how mass and distance affect deflection."
  }
];

/* =========================================================
   STORAGE
   ========================================================= */

function saveData() {
  localStorage.setItem(
    "experimentLogData",
    JSON.stringify(experiments)
  );

  localStorage.setItem(
    "experimentLogResearcher",
    researcher
  );

  const notes = document.getElementById("researchNotes");

  if (notes) {
    localStorage.setItem(
      "experimentLogNotes",
      notes.value
    );
  }
}

function loadData() {
  try {
    const stored =
      localStorage.getItem("experimentLogData");

    if (stored) {
      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        experiments = parsed;
      }
    }
  } catch (error) {
    console.error("Data loading error:", error);
    experiments = [];
  }

  const storedResearcher =
    localStorage.getItem("experimentLogResearcher");

  researcher =
    typeof storedResearcher === "string"
      ? storedResearcher
      : "";

  const notes =
    document.getElementById("researchNotes");

  if (notes) {
    notes.value =
      localStorage.getItem("experimentLogNotes") || "";
  }
}

/* =========================================================
   THEORETICAL DEFLECTION
   ========================================================= */

function calculateDeflection(massSolar, distanceKm) {
  const mass = Number(massSolar);
  const distance = Number(distanceKm);

  if (
    !Number.isFinite(mass) ||
    !Number.isFinite(distance) ||
    mass <= 0 ||
    distance <= 0
  ) {
    return NaN;
  }

  const massKg =
    mass * SOLAR_MASS;

  const distanceM =
    distance * 1000;

  const radians =
    (4 * G * massKg) /
    (C * C * distanceM);

  return radians * (180 / Math.PI);
}

/* =========================================================
   HELPERS
   ========================================================= */

function formatNumber(value, digits = 6) {
  if (!Number.isFinite(Number(value))) {
    return "N/A";
  }

  return Number(value).toLocaleString(
    undefined,
    {
      maximumFractionDigits: digits
    }
  );
}

function deviationPercent(theoretical, experimental) {
  if (
    !Number.isFinite(theoretical) ||
    theoretical === 0 ||
    !Number.isFinite(experimental)
  ) {
    return NaN;
  }

  return (
    Math.abs(experimental - theoretical) /
    Math.abs(theoretical)
  ) * 100;
}

function getNextExperimentNumber() {
  if (experiments.length === 0) {
    return 1;
  }

  return (
    Math.max(
      ...experiments.map(
        e => Number(e.number) || 0
      )
    ) + 1
  );
}

/* =========================================================
   NAVIGATION
   ========================================================= */

document
  .querySelectorAll(".nav-button")
  .forEach(button => {

    button.addEventListener("click", () => {

      const pageName =
        button.dataset.page;

      document
        .querySelectorAll(".nav-button")
        .forEach(btn =>
          btn.classList.remove("active")
        );

      button.classList.add("active");

      document
        .querySelectorAll(".page")
        .forEach(page =>
          page.classList.remove("active")
        );

      const target =
        document.getElementById(pageName);

      if (target) {
        target.classList.add("active");
      }

      if (pageName === "analysis") {
        drawExperimentGraph();
      }

      if (pageName === "research") {
        renderTimeline();
      }

      if (pageName === "data") {
        renderExperimentTable();
        populateComparisonSelects();
      }
    });
  });

/* =========================================================
   RESEARCHER
   ========================================================= */

/*
   FIXED:
   The old version could call .trim() on an undefined value.
   Everything is now converted safely to a string first.
*/

const researcherButton =
  document.getElementById("researcherButton");

if (researcherButton) {

  researcherButton.addEventListener("click", () => {

    const input =
      prompt("Enter researcher name:");

    if (input === null) {
      return;
    }

    const name =
      String(input).trim();

    if (name === "") {
      return;
    }

    researcher = name;

    updateResearcherDisplay();
    saveData();
  });
}

function updateResearcherDisplay() {

  const display =
    document.getElementById("researcherDisplay");

  if (!display) return;

  if (
    typeof researcher === "string" &&
    researcher.trim() !== ""
  ) {

    display.innerHTML =
      `👤 Researcher: <strong>${escapeHtml(researcher)}</strong>`;

  } else {

    display.textContent =
      "👤 Researcher: Not selected";
  }
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   CALCULATE
   ========================================================= */

const calculateButton =
  document.getElementById("calculateButton");

if (calculateButton) {
  calculateButton.addEventListener(
    "click",
    calculateExperiment
  );
}

function calculateExperiment() {

  const mass =
    Number(
      document.getElementById("massInput")?.value
    );

  const distance =
    Number(
      document.getElementById("distanceInput")?.value
    );

  const experimental =
    Number(
      document.getElementById("experimentalInput")?.value
    );

  const result =
    document.getElementById("lensingResult");

  if (!result) return;

  if (
    !Number.isFinite(mass) ||
    !Number.isFinite(distance) ||
    mass <= 0 ||
    distance <= 0
  ) {

    result.className =
      "result error";

    result.innerHTML =
      "❌ Please enter a valid positive mass and distance.";

    return;
  }

  const theoretical =
    calculateDeflection(
      mass,
      distance
    );

  let deviationText =
    "Not calculated.";

  if (Number.isFinite(experimental)) {

    const deviation =
      deviationPercent(
        theoretical,
        experimental
      );

    deviationText =
      `${formatNumber(deviation, 4)}%`;
  }

  result.className =
    "result";

  result.innerHTML = `
    <strong>Calculation Result</strong><br><br>

    Mass:
    ${formatNumber(mass, 4)} M☉<br>

    Closest approach:
    ${formatNumber(distance, 4)} km<br>

    Theoretical deflection:
    <strong>${formatNumber(theoretical, 8)}°</strong><br>

    Experimental deflection:
    ${Number.isFinite(experimental)
      ? formatNumber(experimental, 8) + "°"
      : "N/A"}<br>

    Deviation:
    ${deviationText}
  `;

  drawLightPath(
    mass,
    distance
  );
}

/* =========================================================
   RECORD
   ========================================================= */

const recordButton =
  document.getElementById("recordButton");

if (recordButton) {
  recordButton.addEventListener(
    "click",
    recordExperiment
  );
}

function recordExperiment() {

  const mass =
    Number(
      document.getElementById("massInput")?.value
    );

  const distance =
    Number(
      document.getElementById("distanceInput")?.value
    );

  const experimental =
    Number(
      document.getElementById("experimentalInput")?.value
    );

  const result =
    document.getElementById("lensingResult");

  if (
    !Number.isFinite(mass) ||
    !Number.isFinite(distance) ||
    !Number.isFinite(experimental) ||
    mass <= 0 ||
    distance <= 0
  ) {

    if (result) {
      result.innerHTML =
        "❌ Enter valid values before recording.";
    }

    return;
  }

  const theoretical =
    calculateDeflection(
      mass,
      distance
    );

  const deviation =
    deviationPercent(
      theoretical,
      experimental
    );

  const experiment = {

    number:
      getNextExperimentNumber(),

    mass,

    distance,

    theoretical,

    experimental,

    deviation,

    timestamp:
      new Date().toISOString()
  };

  experiments.push(experiment);

  saveData();

  renderDashboard();
  renderExperimentTable();
  populateComparisonSelects();
  renderTimeline();
  drawExperimentGraph();

  if (result) {
    result.innerHTML = `
      <strong>✅ Experiment recorded.</strong><br><br>
      Experiment #${experiment.number}<br>
      Theoretical:
      ${formatNumber(theoretical, 8)}°<br>
      Experimental:
      ${formatNumber(experimental, 8)}°<br>
      Deviation:
      ${formatNumber(deviation, 4)}%
    `;
  }
}

/* =========================================================
   DATA QUALITY
   ========================================================= */

const qualityButton =
  document.getElementById("qualityCheckButton");

if (qualityButton) {
  qualityButton.addEventListener(
    "click",
    checkDataQuality
  );
}

function checkDataQuality() {

  const result =
    document.getElementById("qualityResult");

  if (!result) return;

  if (experiments.length === 0) {

    result.className =
      "result warning";

    result.innerHTML =
      "⚠️ No recorded experiments available.";

    return;
  }

  let problems = [];

  experiments.forEach(experiment => {

    if (
      !Number.isFinite(
        Number(experiment.mass)
      )
    ) {
      problems.push(
        `Experiment #${experiment.number}: invalid mass`
      );
    }

    if (
      !Number.isFinite(
        Number(experiment.distance)
      )
    ) {
      problems.push(
        `Experiment #${experiment.number}: invalid distance`
      );
    }

    if (
      !Number.isFinite(
        Number(experiment.experimental)
      )
    ) {
      problems.push(
        `Experiment #${experiment.number}: invalid experimental value`
      );
    }
  });

  const anomalous =
    experiments.filter(
      e =>
        Number.isFinite(
          Number(e.deviation)
        ) &&
        Number(e.deviation) > 5
    );

  if (
    problems.length === 0 &&
    anomalous.length === 0
  ) {

    result.className =
      "result success";

    result.innerHTML = `
      <strong>✅ Data quality check passed.</strong><br>
      No invalid records or deviations above 5% were detected.
    `;

    return;
  }

  result.className =
    "result warning";

  let html =
    "<strong>⚠️ Data quality warnings</strong><br><br>";

  if (problems.length) {

    html +=
      problems
        .map(
          p => `• ${escapeHtml(p)}`
        )
        .join("<br>");

    html += "<br><br>";
  }

  if (anomalous.length) {

    html +=
      `<strong>Potential anomalies:</strong><br>`;

    html += anomalous
      .map(
        e =>
          `• Experiment #${e.number}: ${formatNumber(e.deviation, 3)}% deviation`
      )
      .join("<br>");
  }

  result.innerHTML = html;
}

/* =========================================================
   UNCERTAINTY
   ========================================================= */

const uncertaintyButton =
  document.getElementById("uncertaintyButton");

if (uncertaintyButton) {

  uncertaintyButton.addEventListener(
    "click",
    () => {

      const value =
        Number(
          document.getElementById(
            "uncertaintyInput"
          )?.value
        );

      const result =
        document.getElementById(
          "uncertaintyResult"
        );

      if (!result) return;

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {

        result.innerHTML =
          "❌ Enter a valid non-negative uncertainty.";

        return;
      }

      result.innerHTML = `
        <strong>Measurement uncertainty</strong><br><br>
        ±${formatNumber(value, 8)}°
      `;
    }
  );
}

/* =========================================================
   OBJECT COMPARISON
   ========================================================= */

const compareObjectsButton =
  document.getElementById(
    "compareObjectsButton"
  );

if (compareObjectsButton) {

  compareObjectsButton.addEventListener(
    "click",
    compareObjects
  );
}

function compareObjects() {

  const massA =
    Number(
      document.getElementById("objectA")?.value
    );

  const massB =
    Number(
      document.getElementById("objectB")?.value
    );

  const distance = 10000;

  const deflectionA =
    calculateDeflection(
      massA,
      distance
    );

  const deflectionB =
    calculateDeflection(
      massB,
      distance
    );

  const ratio =
    deflectionB /
    deflectionA;

  const result =
    document.getElementById(
      "objectComparisonResult"
    );

  if (!result) return;

  result.innerHTML = `
    <strong>Comparison at ${distance.toLocaleString()} km</strong><br><br>

    Object A:
    ${formatNumber(deflectionA, 8)}°<br>

    Object B:
    ${formatNumber(deflectionB, 8)}°<br><br>

    Deflection ratio B/A:
    <strong>${formatNumber(ratio, 4)}</strong>
  `;
}

/* =========================================================
   EXPERIMENT TEMPLATES
   ========================================================= */

document
  .querySelectorAll("[data-template]")
  .forEach(button => {

    button.addEventListener("click", () => {

      const template =
        button.dataset.template;

      const massInput =
        document.getElementById("massInput");

      const distanceInput =
        document.getElementById("distanceInput");

      const experimentalInput =
        document.getElementById(
          "experimentalInput"
        );

      if (
        !massInput ||
        !distanceInput ||
        !experimentalInput
      ) {
        return;
      }

      if (template === "standard") {

        massInput.value = 10;
        distanceInput.value = 1000;
        experimentalInput.value = 0.1;

      } else if (template === "close") {

        massInput.value = 10;
        distanceInput.value = 1000;
        experimentalInput.value = 0.1;

      } else if (template === "distant") {

        massInput.value = 10;
        distanceInput.value = 10000;
        experimentalInput.value = 0.01;
      }

      calculateExperiment();
    });
  });

/* =========================================================
   SIMULATOR
   ========================================================= */

const simMass =
  document.getElementById("simMass");

const simDistance =
  document.getElementById("simDistance");

if (simMass) {
  simMass.addEventListener(
    "input",
    updateSimulator
  );
}

if (simDistance) {
  simDistance.addEventListener(
    "input",
    updateSimulator
  );
}

function updateSimulator() {

  if (!simMass || !simDistance) return;

  const mass =
    Number(simMass.value);

  const distance =
    Number(simDistance.value);

  const massValue =
    document.getElementById("simMassValue");

  const distanceValue =
    document.getElementById("simDistanceValue");

  const simulatorResult =
    document.getElementById("simulatorResult");

  if (massValue) {
    massValue.textContent =
      `${mass} M☉`;
  }

  if (distanceValue) {
    distanceValue.textContent =
      `${distance.toLocaleString()} km`;
  }

  const deflection =
    calculateDeflection(
      mass,
      distance
    );

  if (simulatorResult) {
    simulatorResult.innerHTML = `
      Theoretical deflection:
      <strong>${formatNumber(deflection, 8)}°</strong>
    `;
  }

  drawSimulatorCanvas(
    mass,
    distance
  );
}

/* =========================================================
   SIMULATOR CANVAS
   ========================================================= */

function drawSimulatorCanvas(
  mass,
  distance
) {

  const canvas =
    document.getElementById(
      "simulatorCanvas"
    );

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) return;

  const rect =
    canvas.getBoundingClientRect();

  const width =
    Math.max(
      300,
      Math.floor(rect.width)
    );

  const height =
    canvas.height;

  canvas.width =
    width;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  drawBackground(
    ctx,
    width,
    height
  );

  const cx =
    width / 2;

  const cy =
    height / 2;

  drawGrid(
    ctx,
    width,
    height
  );

  const radius =
    Math.max(
      15,
      Math.min(
        70,
        15 +
        Math.log10(
          Math.max(mass, 1)
        ) * 18
      )
    );

  drawBlackHole(
    ctx,
    cx,
    cy,
    radius
  );

  const deflection =
    calculateDeflection(
      mass,
      distance
    );

  drawCurvedRay(
    ctx,
    width,
    cy,
    deflection
  );

  ctx.fillStyle =
    "#93c5fd";

  ctx.font =
    "14px Arial";

  ctx.fillText(
    `Mass: ${mass} M☉`,
    20,
    30
  );

  ctx.fillText(
    `Distance: ${distance.toLocaleString()} km`,
    20,
    52
  );

  ctx.fillText(
    `Deflection: ${formatNumber(deflection, 6)}°`,
    20,
    74
  );
}

function drawBackground(
  ctx,
  width,
  height
) {

  ctx.fillStyle =
    "#050b14";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );
}

function drawGrid(
  ctx,
  width,
  height
) {

  ctx.strokeStyle =
    "rgba(100,130,170,0.12)";

  ctx.lineWidth = 1;

  const spacing = 40;

  for (
    let x = 0;
    x <= width;
    x += spacing
  ) {

    ctx.beginPath();

    ctx.moveTo(x, 0);

    ctx.lineTo(
      x,
      height
    );

    ctx.stroke();
  }

  for (
    let y = 0;
    y <= height;
    y += spacing
  ) {

    ctx.beginPath();

    ctx.moveTo(0, y);

    ctx.lineTo(
      width,
      y
    );

    ctx.stroke();
  }
}

function drawBlackHole(
  ctx,
  x,
  y,
  radius
) {

  const gradient =
    ctx.createRadialGradient(
      x,
      y,
      radius * 0.2,
      x,
      y,
      radius * 2
    );

  gradient.addColorStop(
    0,
    "#000000"
  );

  gradient.addColorStop(
    0.6,
    "#020617"
  );

  gradient.addColorStop(
    1,
    "rgba(37,99,235,0)"
  );

  ctx.fillStyle =
    gradient;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius * 2,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle =
    "#000000";

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.strokeStyle =
    "#334155";

  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.stroke();
}

function drawCurvedRay(
  ctx,
  width,
  centerY,
  deflection
) {

  const scale =
    Math.min(
      70,
      Math.max(
        3,
        Math.abs(deflection) * 100
      )
    );

  ctx.strokeStyle =
    "#60a5fa";

  ctx.lineWidth = 3;

  ctx.beginPath();

  ctx.moveTo(
    20,
    centerY - scale
  );

  ctx.quadraticCurveTo(
    width / 2,
    centerY - scale * 1.4,
    width - 20,
    centerY
  );

  ctx.stroke();
}

/* =========================================================
   LIGHT PATH
   ========================================================= */

function drawLightPath(
  mass,
  distance
) {

  const canvas =
    document.getElementById(
      "lightCanvas"
    );

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) return;

  const rect =
    canvas.getBoundingClientRect();

  const width =
    Math.max(
      300,
      Math.floor(rect.width)
    );

  const height =
    canvas.height;

  canvas.width =
    width;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  drawBackground(
    ctx,
    width,
    height
  );

  const cx =
    width / 2;

  const cy =
    height / 2;

  const radius = 50;

  drawBlackHole(
    ctx,
    cx,
    cy,
    radius
  );

  const theoretical =
    calculateDeflection(
      mass,
      distance
    );

  const curve =
    Math.min(
      130,
      Math.max(
        10,
        theoretical * 1000
      )
    );

  ctx.strokeStyle =
    "#60a5fa";

  ctx.lineWidth = 3;

  ctx.beginPath();

  ctx.moveTo(
    20,
    cy - 100
  );

  ctx.quadraticCurveTo(
    cx,
    cy - 100 - curve,
    width - 20,
    cy - 10
  );

  ctx.stroke();

  ctx.fillStyle =
    "#cbd5e1";

  ctx.font =
    "14px Arial";

  ctx.fillText(
    "Simplified gravitationally deflected light path",
    20,
    30
  );
}

/* =========================================================
   PARAMETER SWEEP
   ========================================================= */

const sweepButton =
  document.getElementById("sweepButton");

if (sweepButton) {
  sweepButton.addEventListener(
    "click",
    runSweep
  );
}

function runSweep() {

  const start =
    Number(
      document.getElementById("sweepStart")?.value
    );

  const end =
    Number(
      document.getElementById("sweepEnd")?.value
    );

  const steps =
    Number(
      document.getElementById("sweepSteps")?.value
    );

  const mass =
    Number(
      document.getElementById("massInput")?.value
    );

  const result =
    document.getElementById("sweepResult");

  if (!result) return;

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    !Number.isFinite(steps) ||
    start <= 0 ||
    end <= 0 ||
    steps < 2 ||
    end <= start
  ) {

    result.innerHTML =
      "❌ Enter a valid start, end and number of steps.";

    return;
  }

  const rows = [];

  for (
    let i = 0;
    i < steps;
    i++
  ) {

    const distance =
      start +
      (
        (end - start) *
        i /
        (steps - 1)
      );

    const deflection =
      calculateDeflection(
        mass,
        distance
      );

    rows.push({
      distance,
      deflection
    });
  }

  let html = `
    <strong>Parameter Sweep</strong><br><br>
    Mass: ${mass} M☉
    <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Distance (km)</th>
          <th>Deflection (°)</th>
        </tr>
      </thead>
      <tbody>
  `;

  rows.forEach(row => {

    html += `
      <tr>
        <td>${formatNumber(row.distance, 3)}</td>
        <td>${formatNumber(row.deflection, 8)}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    </div>
  `;

  result.innerHTML =
    html;
}

/* =========================================================
   WHAT IF
   ========================================================= */

const whatIfButton =
  document.getElementById("whatIfButton");

if (whatIfButton) {

  whatIfButton.addEventListener(
    "click",
    () => {

      const mass =
        Number(
          document.getElementById(
            "whatIfMass"
          )?.value
        );

      const distance =
        Number(
          document.getElementById(
            "whatIfDistance"
          )?.value
        );

      const result =
        document.getElementById(
          "whatIfResult"
        );

      if (!result) return;

      const deflection =
        calculateDeflection(
          mass,
          distance
        );

      if (
        !Number.isFinite(deflection)
      ) {

        result.innerHTML =
          "❌ Invalid hypothetical parameters.";

        return;
      }

      result.innerHTML = `
        <strong>Hypothetical Scenario</strong><br><br>

        Mass:
        ${formatNumber(mass, 4)} M☉<br>

        Distance:
        ${formatNumber(distance, 4)} km<br>

        Predicted deflection:
        <strong>${formatNumber(deflection, 8)}°</strong>
      `;
    }
  );
}

/* =========================================================
   ANALYSIS BUTTONS
   ========================================================= */

document
  .querySelectorAll("[data-analysis]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {
        runAnalysis(
          button.dataset.analysis
        );
      }
    );
  });

function runAnalysis(type) {

  const result =
    document.getElementById(
      "analysisResult"
    );

  if (!result) return;

  if (experiments.length === 0) {

    result.className =
      "result warning";

    result.innerHTML =
      "⚠️ Record experiments first.";

    return;
  }

  result.className =
    "result";

  if (type === "error") {

    const errors =
      experiments.map(
        e => Number(e.deviation)
      );

    const average =
      errors.reduce(
        (a, b) => a + b,
        0
      ) / errors.length;

    result.innerHTML = `
      <strong>ACT 1–2 — Error & Anomalies</strong><br><br>
      Average absolute percentage deviation:
      <strong>${formatNumber(average, 4)}%</strong>
    `;

    return;
  }

  if (type === "prediction") {

    const latest =
      experiments[
        experiments.length - 1
      ];

    const predicted =
      calculateDeflection(
        latest.mass,
        latest.distance
      );

    result.innerHTML = `
      <strong>ACT 3 — Prediction</strong><br><br>
      For ${latest.mass} M☉ at
      ${latest.distance.toLocaleString()} km,
      the model predicts
      <strong>${formatNumber(predicted, 8)}°</strong>.
    `;

    return;
  }

  if (type === "planner") {

    result.innerHTML = `
      <strong>ACT 4 — Experimental Planner</strong><br><br>
      Recommended comparison:
      keep mass constant while changing closest-approach
      distance across several measurements.
    `;

    return;
  }

  if (type === "trend") {

    const sorted =
      [...experiments].sort(
        (a, b) =>
          Number(a.distance) -
          Number(b.distance)
      );

    let decreasing = true;

    for (
      let i = 1;
      i < sorted.length;
      i++
    ) {

      if (
        Number(sorted[i].theoretical) >
        Number(sorted[i - 1].theoretical)
      ) {
        decreasing = false;
        break;
      }
    }

    result.innerHTML = `
      <strong>ACT 5 — Trend</strong><br><br>
      Theoretical deflection generally
      ${
        decreasing
          ? "<strong>decreases</strong>"
          : "does not consistently decrease"
      }
      as distance increases in the current dataset.
    `;

    return;
  }

  if (type === "consistency") {

    const deviations =
      experiments.map(
        e => Number(e.deviation)
      );

    const mean =
      deviations.reduce(
        (a, b) => a + b,
        0
      ) / deviations.length;

    result.innerHTML = `
      <strong>ACT 6 — Consistency</strong><br><br>
      Mean deviation:
      ${formatNumber(mean, 4)}%
    `;

    return;
  }

  if (type === "conclusion") {

    result.innerHTML = `
      <strong>ACT 7 — Conclusion</strong><br><br>
      The recorded dataset can be compared with
      the simplified gravitational-deflection model.
      Larger masses increase the predicted deflection,
      while larger closest-approach distances decrease it.
    `;

    return;
  }

  if (type === "reliability") {

    const reliable =
      experiments.filter(
        e =>
          Number(e.deviation) <= 5
      ).length;

    const percentage =
      (
        reliable /
        experiments.length
      ) * 100;

    result.innerHTML = `
      <strong>ACT 9 — Reliability</strong><br><br>
      ${reliable} of ${experiments.length}
      experiments have deviations ≤ 5%.<br><br>

      Dataset reliability indicator:
      <strong>${formatNumber(percentage, 2)}%</strong>
    `;

    return;
  }

  if (type === "insights") {

    const masses =
      experiments.map(
        e => Number(e.mass)
      );

    const distances =
      experiments.map(
        e => Number(e.distance)
      );

    const maxMass =
      Math.max(...masses);

    const minDistance =
      Math.min(...distances);

    result.innerHTML = `
      <strong>ACT 10 — Insights</strong><br><br>

      Highest recorded mass:
      ${formatNumber(maxMass, 4)} M☉<br>

      Closest recorded approach:
      ${formatNumber(minDistance, 4)} km<br><br>

      The model predicts stronger deflection
      for larger masses and smaller distances.
    `;
  }
}

/* =========================================================
   CORRELATION
   ========================================================= */

const correlationButton =
  document.getElementById(
    "correlationButton"
  );

if (correlationButton) {

  correlationButton.addEventListener(
    "click",
    calculateCorrelation
  );
}

function calculateCorrelation() {

  const result =
    document.getElementById(
      "correlationResult"
    );

  if (!result) return;

  if (experiments.length < 2) {

    result.innerHTML =
      "⚠️ At least two experiments are required.";

    return;
  }

  const x =
    experiments.map(
      e => Number(e.distance)
    );

  const y =
    experiments.map(
      e => Number(e.theoretical)
    );

  const meanX =
    x.reduce(
      (a, b) => a + b,
      0
    ) / x.length;

  const meanY =
    y.reduce(
      (a, b) => a + b,
      0
    ) / y.length;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (
    let i = 0;
    i < x.length;
    i++
  ) {

    const dx =
      x[i] - meanX;

    const dy =
      y[i] - meanY;

    numerator +=
      dx * dy;

    denomX +=
      dx * dx;

    denomY +=
      dy * dy;
  }

  const r =
    numerator /
    Math.sqrt(
      denomX * denomY
    );

  result.innerHTML = `
    <strong>Pearson correlation</strong><br><br>

    r =
    <strong>${formatNumber(r, 6)}</strong><br><br>

    Interpretation:
    ${interpretCorrelation(r)}
  `;
}

function interpretCorrelation(r) {

  const absolute =
    Math.abs(r);

  if (absolute >= 0.9) {
    return "very strong linear relationship";
  }

  if (absolute >= 0.7) {
    return "strong linear relationship";
  }

  if (absolute >= 0.4) {
    return "moderate linear relationship";
  }

  if (absolute >= 0.2) {
    return "weak linear relationship";
  }

  return "very weak or negligible linear relationship";
}

/* =========================================================
   REGRESSION
   ========================================================= */

const regressionButton =
  document.getElementById(
    "regressionButton"
  );

if (regressionButton) {

  regressionButton.addEventListener(
    "click",
    runRegression
  );
}

function runRegression() {

  const result =
    document.getElementById(
      "regressionResult"
    );

  if (!result) return;

  if (experiments.length < 2) {

    result.innerHTML =
      "⚠️ At least two experiments are required.";

    return;
  }

  const x =
    experiments.map(
      e => Number(e.distance)
    );

  const y =
    experiments.map(
      e => Number(e.theoretical)
    );

  const meanX =
    x.reduce(
      (a, b) => a + b,
      0
    ) / x.length;

  const meanY =
    y.reduce(
      (a, b) => a + b,
      0
    ) / y.length;

  let numerator = 0;
  let denominator = 0;

  for (
    let i = 0;
    i < x.length;
    i++
  ) {

    numerator +=
      (x[i] - meanX) *
      (y[i] - meanY);

    denominator +=
      (x[i] - meanX) ** 2;
  }

  if (denominator === 0) {

    result.innerHTML =
      "⚠️ Regression cannot be calculated when all distances are identical.";

    return;
  }

  const slope =
    numerator /
    denominator;

  const intercept =
    meanY -
    slope * meanX;

  result.innerHTML = `
    <strong>Linear Regression</strong><br><br>

    Slope:
    ${formatNumber(slope, 12)}<br>

    Intercept:
    ${formatNumber(intercept, 12)}<br><br>

    Model:
    <strong>y = ${formatNumber(slope, 8)}x
    + ${formatNumber(intercept, 8)}</strong>
  `;
}

/* =========================================================
   EXPERIMENT GRAPH
   ========================================================= */

function drawExperimentGraph() {

  const canvas =
    document.getElementById(
      "experimentCanvas"
    );

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) return;

  const rect =
    canvas.getBoundingClientRect();

  const width =
    Math.max(
      300,
      Math.floor(rect.width)
    );

  const height =
    canvas.height;

  canvas.width =
    width;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  drawBackground(
    ctx,
    width,
    height
  );

  if (experiments.length === 0) {

    ctx.fillStyle =
      "#94a3b8";

    ctx.font =
      "16px Arial";

    ctx.fillText(
      "No experiments recorded yet.",
      30,
      40
    );

    return;
  }

  const padding = 55;

  const plotWidth =
    width -
    padding * 2;

  const plotHeight =
    height -
    padding * 2;

  const distances =
    experiments.map(
      e => Number(e.distance)
    );

  const values =
    experiments.map(
      e => Number(e.theoretical)
    );

  const minX =
    Math.min(...distances);

  const maxX =
    Math.max(...distances);

  const minY =
    Math.min(...values);

  const maxY =
    Math.max(...values);

  const rangeX =
    maxX - minX || 1;

  const rangeY =
    maxY - minY || 1;

  ctx.strokeStyle =
    "#475569";

  ctx.lineWidth = 1;

  ctx.beginPath();

  ctx.moveTo(
    padding,
    height - padding
  );

  ctx.lineTo(
    width - padding,
    height - padding
  );

  ctx.moveTo(
    padding,
    padding
  );

  ctx.lineTo(
    padding,
    height - padding
  );

  ctx.stroke();

  ctx.fillStyle =
    "#94a3b8";

  ctx.font =
    "12px Arial";

  ctx.fillText(
    "Closest Approach (km)",
    width / 2 - 60,
    height - 15
  );

  ctx.save();

  ctx.translate(
    15,
    height / 2
  );

  ctx.rotate(
    -Math.PI / 2
  );

  ctx.fillText(
    "Theoretical Deflection (°)",
    -70,
    0
  );

  ctx.restore();

  experiments.forEach(
    experiment => {

      const x =
        padding +
        (
          (Number(experiment.distance) -
            minX) /
          rangeX
        ) *
        plotWidth;

      const y =
        height -
        padding -
        (
          (Number(experiment.theoretical) -
            minY) /
          rangeY
        ) *
        plotHeight;

      ctx.fillStyle =
        "#60a5fa";

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        5,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }
  );

  ctx.fillStyle =
    "#eaf2ff";

  ctx.font =
    "14px Arial";

  ctx.fillText(
    "Theoretical Deflection vs Distance",
    padding,
    25
  );
}

/* =========================================================
   MODEL COMPARISON
   ========================================================= */

const modelComparisonButton =
  document.getElementById(
    "modelComparisonButton"
  );

if (modelComparisonButton) {

  modelComparisonButton.addEventListener(
    "click",
    compareModels
  );
}

function compareModels() {

  const result =
    document.getElementById(
      "modelComparisonResult"
    );

  if (!result) return;

  if (experiments.length === 0) {

    result.innerHTML =
      "⚠️ No data available.";

    return;
  }

  let inverseDistanceError = 0;
  let count = 0;

  experiments.forEach(
    e => {

      const prediction =
        Number(e.mass) /
        Number(e.distance);

      if (
        Number.isFinite(prediction)
      ) {

        inverseDistanceError +=
          Math.abs(
            Number(e.theoretical) -
            prediction
          );

        count++;
      }
    }
  );

  const averageError =
    count
      ? inverseDistanceError / count
      : NaN;

  result.innerHTML = `
    <strong>Model Comparison</strong><br><br>

    Model A:
    gravitational deflection
    proportional to mass/distance.<br><br>

    Average comparison error:
    ${formatNumber(averageError, 10)}
  `;
}

/* =========================================================
   RESEARCH QUESTIONS
   ========================================================= */

const researchQuestionsButton =
  document.getElementById(
    "researchQuestionsButton"
  );

if (researchQuestionsButton) {

  researchQuestionsButton.addEventListener(
    "click",
    generateResearchQuestions
  );
}

function generateResearchQuestions() {

  const result =
    document.getElementById(
      "researchQuestionsResult"
    );

  if (!result) return;

  result.innerHTML = `
    <strong>Research Questions</strong><br><br>

    1. How does increasing mass affect theoretical
    gravitational light deflection?<br><br>

    2. How does increasing closest-approach distance
    affect deflection?<br><br>

    3. How closely do the experimental values agree
    with the theoretical model?<br><br>

    4. Which measurements produce the largest deviation?
  `;
}

/* =========================================================
   DATA TABLE
   ========================================================= */

const searchInput =
  document.getElementById(
    "searchInput"
  );

const sortSelect =
  document.getElementById(
    "sortSelect"
  );

if (searchInput) {
  searchInput.addEventListener(
    "input",
    renderExperimentTable
  );
}

if (sortSelect) {
  sortSelect.addEventListener(
    "change",
    renderExperimentTable
  );
}

function renderExperimentTable() {

  const table =
    document.getElementById(
      "experimentTable"
    );

  if (!table) return;

  const search =
    (
      searchInput?.value ||
      ""
    ).toLowerCase();

  let data =
    [...experiments];

  if (search) {

    data =
      data.filter(
        e =>
          String(e.number)
            .toLowerCase()
            .includes(search)
      );
  }

  const sort =
    sortSelect?.value ||
    "number";

  data.sort(
    (a, b) => {

      if (sort === "number") {
        return (
          Number(a.number) -
          Number(b.number)
        );
      }

      if (sort === "mass") {
        return (
          Number(a.mass) -
          Number(b.mass)
        );
      }

      if (sort === "distance") {
        return (
          Number(a.distance) -
          Number(b.distance)
        );
      }

      if (sort === "deviation") {
        return (
          Number(a.deviation) -
          Number(b.deviation)
        );
      }

      return 0;
    }
  );

  if (data.length === 0) {

    table.innerHTML = `
      <tr>
        <td colspan="7">
          No experiments found.
        </td>
      </tr>
    `;

    return;
  }

  table.innerHTML =
    data.map(
      e => `
        <tr>

          <td>
            ${e.number}
          </td>

          <td>
            ${formatNumber(e.mass, 4)} M☉
          </td>

          <td>
            ${formatNumber(e.distance, 4)} km
          </td>

          <td>
            ${formatNumber(e.theoretical, 8)}°
          </td>

          <td>
            ${formatNumber(e.experimental, 8)}°
          </td>

          <td>
            ${formatNumber(e.deviation, 4)}%
          </td>

          <td>
            <button
              class="danger"
              onclick="deleteExperiment(${e.number})"
            >
              Delete
            </button>
          </td>

        </tr>
      `
    ).join("");
}

/* =========================================================
   DELETE
   ========================================================= */

window.deleteExperiment =
  function(number) {

    experiments =
      experiments.filter(
        e =>
          Number(e.number) !==
          Number(number)
      );

    saveData();

    renderDashboard();
    renderExperimentTable();
    populateComparisonSelects();
    renderTimeline();
    drawExperimentGraph();
  };

/* =========================================================
   COMPARISON SELECTS
   ========================================================= */

function populateComparisonSelects() {

  const selectA =
    document.getElementById(
      "comparisonA"
    );

  const selectB =
    document.getElementById(
      "comparisonB"
    );

  const repro =
    document.getElementById(
      "reproducibilitySelect"
    );

  const options =
    experiments.map(
      e =>
        `<option value="${escapeHtml(e.number)}">
          Experiment #${escapeHtml(e.number)}
        </option>`
    ).join("");

  if (selectA) {
    selectA.innerHTML =
      options;
  }

  if (selectB) {
    selectB.innerHTML =
      options;
  }

  if (repro) {
    repro.innerHTML =
      options;
  }
}

/* =========================================================
   COMPARE EXPERIMENTS
   ========================================================= */

const compareExperimentsButton =
  document.getElementById(
    "compareExperimentsButton"
  );

if (compareExperimentsButton) {

  compareExperimentsButton.addEventListener(
    "click",
    compareExperiments
  );
}

function compareExperiments() {

  const aNumber =
    Number(
      document.getElementById(
        "comparisonA"
      )?.value
    );

  const bNumber =
    Number(
      document.getElementById(
        "comparisonB"
      )?.value
    );

  const a =
    experiments.find(
      e =>
        Number(e.number) ===
        aNumber
    );

  const b =
    experiments.find(
      e =>
        Number(e.number) ===
        bNumber
    );

  const result =
    document.getElementById(
      "comparisonResult"
    );

  if (!result) return;

  if (!a || !b) {

    result.innerHTML =
      "⚠️ Select two valid experiments.";

    return;
  }

  result.innerHTML = `
    <strong>Experiment Comparison</strong><br><br>

    Experiment #${a.number}:<br>
    Mass: ${formatNumber(a.mass, 4)} M☉<br>
    Distance: ${formatNumber(a.distance, 4)} km<br>
    Deflection: ${formatNumber(a.theoretical, 8)}°<br><br>

    Experiment #${b.number}:<br>
    Mass: ${formatNumber(b.mass, 4)} M☉<br>
    Distance: ${formatNumber(b.distance, 4)} km<br>
    Deflection: ${formatNumber(b.theoretical, 8)}°
  `;
}

/* =========================================================
   REPRODUCIBILITY
   ========================================================= */

const reproduceButton =
  document.getElementById(
    "reproduceButton"
  );

if (reproduceButton) {

  reproduceButton.addEventListener(
    "click",
    reproduceExperiment
  );
}

function reproduceExperiment() {

  const number =
    Number(
      document.getElementById(
        "reproducibilitySelect"
      )?.value
    );

  const experiment =
    experiments.find(
      e =>
        Number(e.number) ===
        number
    );

  const result =
    document.getElementById(
      "reproducibilityResult"
    );

  if (!result) return;

  if (!experiment) {

    result.innerHTML =
      "⚠️ Select an experiment.";

    return;
  }

  const massInput =
    document.getElementById("massInput");

  const distanceInput =
    document.getElementById("distanceInput");

  const experimentalInput =
    document.getElementById("experimentalInput");

  if (massInput) {
    massInput.value =
      experiment.mass;
  }

  if (distanceInput) {
    distanceInput.value =
      experiment.distance;
  }

  if (experimentalInput) {
    experimentalInput.value =
      experiment.experimental;
  }

  result.innerHTML = `
    <strong>Configuration loaded.</strong><br><br>

    Mass:
    ${formatNumber(experiment.mass, 4)} M☉<br>

    Distance:
    ${formatNumber(experiment.distance, 4)} km<br>

    Experimental:
    ${formatNumber(experiment.experimental, 8)}°
  `;
}

/* =========================================================
   DUPLICATE & PATTERN DETECTOR
   ========================================================= */

const duplicateButton =
  document.getElementById(
    "duplicateButton"
  );

if (duplicateButton) {

  duplicateButton.addEventListener(
    "click",
    detectPatterns
  );
}

function detectPatterns() {

  const result =
    document.getElementById(
      "duplicateResult"
    );

  if (!result) return;

  if (experiments.length < 2) {

    result.innerHTML =
      "⚠️ At least two experiments are required.";

    return;
  }

  const seen =
    new Map();

  const duplicates = [];

  experiments.forEach(
    e => {

      const key =
        `${e.mass}|${e.distance}|${e.experimental}`;

      if (seen.has(key)) {

        duplicates.push(
          e.number
        );

      } else {

        seen.set(
          key,
          e.number
        );
      }
    }
  );

  result.innerHTML = `
    <strong>Pattern Detector</strong><br><br>

    Duplicate configurations:
    ${
      duplicates.length
        ? duplicates.join(", ")
        : "None detected"
    }<br><br>

    Dataset size:
    ${experiments.length} experiments
  `;
}

/* =========================================================
   EXPORT
   ========================================================= */

const exportButton =
  document.getElementById(
    "exportButton"
  );

if (exportButton) {

  exportButton.addEventListener(
    "click",
    exportData
  );
}

function exportData() {

  const data = {

    researcher,

    experiments,

    notes:
      document.getElementById(
        "researchNotes"
      )?.value || "",

    exportedAt:
      new Date().toISOString()
  };

  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    "experiment-log-data.json";

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    url
  );
}

/* =========================================================
   IMPORT
   ========================================================= */

const importButton =
  document.getElementById(
    "importButton"
  );

if (importButton) {

  importButton.addEventListener(
    "click",
    importData
  );
}

function importData() {

  const input =
    document.getElementById(
      "importInput"
    );

  if (
    !input ||
    !input.files ||
    !input.files[0]
  ) {

    alert(
      "Select a JSON file first."
    );

    return;
  }

  const file =
    input.files[0];

  const reader =
    new FileReader();

  reader.onload =
    function(event) {

      try {

        const imported =
          JSON.parse(
            event.target.result
          );

        if (Array.isArray(imported)) {

          experiments =
            imported;

        } else if (
          imported &&
          Array.isArray(
            imported.experiments
          )
        ) {

          experiments =
            imported.experiments;

          if (
            typeof imported.researcher ===
            "string"
          ) {

            researcher =
              imported.researcher;
          }

          const notes =
            document.getElementById(
              "researchNotes"
            );

          if (
            notes &&
            typeof imported.notes ===
              "string"
          ) {

            notes.value =
              imported.notes;
          }

        } else {

          throw new Error(
            "Invalid experiment format."
          );
        }

        saveData();

        updateResearcherDisplay();

        renderDashboard();

        renderExperimentTable();

        populateComparisonSelects();

        renderTimeline();

        drawExperimentGraph();

        alert(
          "Data imported successfully."
        );

      } catch (error) {

        console.error(error);

        alert(
          "Could not import the JSON file."
        );
      }
    };

  reader.readAsText(file);
}

/* =========================================================
   RESET
   ========================================================= */

const resetButton =
  document.getElementById(
    "resetButton"
  );

if (resetButton) {

  resetButton.addEventListener(
    "click",
    resetAll
  );
}

function resetAll() {

  const confirmed =
    confirm(
      "Are you sure you want to delete all recorded experiments?"
    );

  if (!confirmed) {
    return;
  }

  experiments = [];

  localStorage.removeItem(
    "experimentLogData"
  );

  renderDashboard();

  renderExperimentTable();

  populateComparisonSelects();

  renderTimeline();

  drawExperimentGraph();

  const result =
    document.getElementById(
      "lensingResult"
    );

  if (result) {
    result.innerHTML =
      "All recorded experiments have been reset.";
  }
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

  const dashboard =
    document.getElementById(
      "dashboard"
    );

  if (!dashboard) return;

  if (experiments.length === 0) {

    dashboard.innerHTML = `
      <div class="stat">
        <div class="stat-label">
          Experiments
        </div>
        <div class="stat-value">
          0
        </div>
      </div>

      <div class="stat">
        <div class="stat-label">
          Average Deviation
        </div>
        <div class="stat-value">
          N/A
        </div>
      </div>

      <div class="stat">
        <div class="stat-label">
          Best Agreement
        </div>
        <div class="stat-value">
          N/A
        </div>
      </div>
    `;

    return;
  }

  const deviations =
    experiments
      .map(
        e =>
          Number(e.deviation)
      )
      .filter(
        Number.isFinite
      );

  const average =
    deviations.length
      ? deviations.reduce(
          (a, b) => a + b,
          0
        ) / deviations.length
      : NaN;

  const best =
    deviations.length
      ? Math.min(
          ...deviations
        )
      : NaN;

  dashboard.innerHTML = `

    <div class="stat">
      <div class="stat-label">
        Experiments
      </div>

      <div class="stat-value">
        ${experiments.length}
      </div>
    </div>

    <div class="stat">
      <div class="stat-label">
        Average Deviation
      </div>

      <div class="stat-value">
        ${
          Number.isFinite(average)
            ? formatNumber(average, 3) + "%"
            : "N/A"
        }
      </div>
    </div>

    <div class="stat">
      <div class="stat-label">
        Best Agreement
      </div>

      <div class="stat-value">
        ${
          Number.isFinite(best)
            ? formatNumber(best, 3) + "%"
            : "N/A"
        }
      </div>
    </div>

    <div class="stat">
      <div class="stat-label">
        Researcher
      </div>

      <div class="stat-value">
        ${researcher
          ? escapeHtml(researcher)
          : "None"}
      </div>
    </div>
  `;
}

/* =========================================================
   GUIDED RESEARCH
   ========================================================= */

function renderGuide() {

  const container =
    document.getElementById(
      "guidedResearch"
    );

  if (!container) return;

  container.innerHTML =
    guideSteps
      .map(
        (step, index) => `
          <div class="guide-step ${
            index === guideStep
              ? "current"
              : ""
          }">

            <strong>
              ${step.title}
            </strong>

            <p>
              ${step.text}
            </p>

          </div>
        `
      )
      .join("");
}

const nextGuideButton =
  document.getElementById(
    "nextGuideButton"
  );

if (nextGuideButton) {

  nextGuideButton.addEventListener(
    "click",
    () => {

      guideStep++;

      if (
        guideStep >=
        guideSteps.length
      ) {

        guideStep = 0;
      }

      renderGuide();
    }
  );
}

const resetGuideButton =
  document.getElementById(
    "resetGuideButton"
  );

if (resetGuideButton) {

  resetGuideButton.addEventListener(
    "click",
    () => {

      guideStep = 0;

      renderGuide();
    }
  );
}

/* =========================================================
   TIMELINE
   ========================================================= */

function renderTimeline() {

  const timeline =
    document.getElementById(
      "timeline"
    );

  if (!timeline) return;

  if (experiments.length === 0) {

    timeline.innerHTML = `
      <div class="timeline-item">
        No experiments recorded yet.
      </div>
    `;

    return;
  }

  timeline.innerHTML =
    experiments
      .map(
        e => {

          const date =
            e.timestamp
              ? new Date(
                  e.timestamp
                ).toLocaleString()
              : "Unknown date";

          return `
            <div class="timeline-item">

              <strong>
                Experiment #${e.number}
              </strong>

              <br>

              ${escapeHtml(date)}

              <br>

              Mass:
              ${formatNumber(e.mass, 3)} M☉

              <br>

              Distance:
              ${formatNumber(e.distance, 3)} km

            </div>
          `;
        }
      )
      .join("");
}

/* =========================================================
   SCORE
   ========================================================= */

const scoreButton =
  document.getElementById(
    "scoreButton"
  );

if (scoreButton) {

  scoreButton.addEventListener(
    "click",
    evaluateDataset
  );
}

function evaluateDataset() {

  const result =
    document.getElementById(
      "scoreResult"
    );

  if (!result) return;

  if (experiments.length === 0) {

    result.innerHTML =
      "⚠️ No experiments available.";

    return;
  }

  const deviations =
    experiments
      .map(
        e =>
          Number(e.deviation)
      )
      .filter(
        Number.isFinite
      );

  if (deviations.length === 0) {

    result.innerHTML =
      "⚠️ No valid deviation values available.";

    return;
  }

  const average =
    deviations.reduce(
      (a, b) => a + b,
      0
    ) / deviations.length;

  let score;

  if (average <= 1) {
    score = 100;
  } else if (average <= 5) {
    score = 90;
  } else if (average <= 10) {
    score = 75;
  } else if (average <= 20) {
    score = 60;
  } else {
    score = 40;
  }

  result.innerHTML = `
    <strong>Dataset Evaluation</strong><br><br>

    Experiments:
    ${experiments.length}<br>

    Average deviation:
    ${formatNumber(average, 4)}%<br><br>

    Score:
    <strong>${score}/100</strong>
  `;
}

/* =========================================================
   REPORT
   ========================================================= */

const generateReportButton =
  document.getElementById(
    "generateReportButton"
  );

if (generateReportButton) {

  generateReportButton.addEventListener(
    "click",
    generateReport
  );
}

function generateReport() {

  const output =
    document.getElementById(
      "reportOutput"
    );

  if (!output) return;

  if (experiments.length === 0) {

    output.value =
      "No experiments have been recorded.";

    return;
  }

  const deviations =
    experiments
      .map(
        e => Number(e.deviation)
      )
      .filter(
        Number.isFinite
      );

  if (deviations.length === 0) {

    output.value =
      "No valid deviation data available.";

    return;
  }

  const average =
    deviations.reduce(
      (a, b) => a + b,
      0
    ) / deviations.length;

  const best =
    Math.min(
      ...deviations
    );

  const worst =
    Math.max(
      ...deviations
    );

  output.value = `
EXPERIMENT LOG v2.0
Gravitational Deflection Research Laboratory

Researcher:
${researcher || "Not specified"}

Number of experiments:
${experiments.length}

OBJECTIVE

The purpose of this investigation was to explore a simplified
model of gravitational light deflection and compare theoretical
predictions with experimental observations.

METHOD

Each experiment used an object mass and a closest-approach
distance. A theoretical deflection was calculated using the
simplified weak-field gravitational deflection model.

RESULTS

Average deviation:
${formatNumber(average, 6)}%

Best agreement:
${formatNumber(best, 6)}%

Largest deviation:
${formatNumber(worst, 6)}%

CONCLUSION

The dataset can be used to investigate the relationship between
mass, closest-approach distance and predicted gravitational
light deflection.

This simulation is an educational simplified model and does not
represent a complete numerical solution of general relativity.

Generated by Experiment Log v2.0.
  `.trim();
}

/* =========================================================
   COPY REPORT
   ========================================================= */

const copyReportButton =
  document.getElementById(
    "copyReportButton"
  );

if (copyReportButton) {

  copyReportButton.addEventListener(
    "click",
    async () => {

      const output =
        document.getElementById(
          "reportOutput"
        );

      if (!output || !output.value) {

        alert(
          "Generate the report first."
        );

        return;
      }

      try {

        await navigator.clipboard.writeText(
          output.value
        );

        alert(
          "Report copied."
        );

      } catch (error) {

        output.select();

        document.execCommand(
          "copy"
        );

        alert(
          "Report copied."
        );
      }
    }
  );
}

/* =========================================================
   NOTES
   ========================================================= */

const researchNotes =
  document.getElementById(
    "researchNotes"
  );

if (researchNotes) {

  researchNotes.addEventListener(
    "input",
    saveData
  );
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeApp() {

  loadData();

  updateResearcherDisplay();

  renderDashboard();

  renderGuide();

  renderExperimentTable();

  populateComparisonSelects();

  renderTimeline();

  updateSimulator();

  drawExperimentGraph();

  drawLightPath(
    Number(
      document.getElementById(
        "massInput"
      )?.value || 10
    ),
    Number(
      document.getElementById(
        "distanceInput"
      )?.value || 1000
    )
  );
}

initializeApp();
