const form = document.querySelector("#dilution-form");
const message = document.querySelector("#message");
const results = document.querySelector("#results");

const initialCellsMlOutput = document.querySelector("#initial-cells-ml");
const targetCellsMlOutput = document.querySelector("#target-cells-ml");
const firstMixOutput = document.querySelector("#first-mix");
const protocolTextOutput = document.querySelector("#protocol-text");
const cautionOutput = document.querySelector("#caution");

function formatSci(value) {
  return Number(value).toExponential(4);
}

function formatUl(value) {
  return Number(value).toFixed(2);
}

function clearOutputs() {
  message.textContent = "";
  results.classList.add("hidden");
  cautionOutput.textContent = "";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const initialCells = Number(formData.get("initialCells"));
  const targetColonies = Number(formData.get("targetColonies"));

  if (!Number.isFinite(initialCells) || !Number.isFinite(targetColonies) || initialCells <= 0 || targetColonies <= 0) {
    clearOutputs();
    message.textContent = "Enter positive numeric values for both inputs.";
    return;
  }

  const initialCellsMl = (initialCells / 4.0) * 10 ** 6;
  const finalCellsMl = targetColonies * 10;
  const dilutionFactor = (initialCellsMl / finalCellsMl) / 1000;

  if (!Number.isFinite(dilutionFactor) || dilutionFactor <= 0) {
    clearOutputs();
    message.textContent = "Could not compute a valid dilution factor with these values.";
    return;
  }

  const firstStepCultureUl = 1000 / dilutionFactor;
  const firstStepWaterUl = 1000 - firstStepCultureUl;

  if (firstStepWaterUl < 0) {
    clearOutputs();
    message.textContent = "Error: Calculated dilution requires negative water volume. The target may require concentrating the sample rather than diluting.";
    return;
  }

  initialCellsMlOutput.textContent = formatSci(initialCellsMl);
  targetCellsMlOutput.textContent = formatSci(finalCellsMl);
  firstMixOutput.textContent = `${formatUl(firstStepCultureUl)}uL culture + ${formatUl(firstStepWaterUl)}uL ddH2O`;

  protocolTextOutput.textContent =
    `Use ${formatUl(firstStepCultureUl)}uL of cell culture with ${formatUl(firstStepWaterUl)}uL ddH2O, ` +
    "then perform three serial dilutions of 100uL diluted culture into 900uL ddH2O. " +
    "Plate 100uL of diluted solution per plate.";

  let warnings = [];
  if (initialCells >= 200) {
    warnings.push("Warning: Cytometer count is very high (>= 200). It is difficult to physically count so many cells; consider counting a different (lower) dilution.");
  }
  if (initialCells <= 10) {
    warnings.push("Warning: Cytometer count is very low (<= 10). It might be better to concentrate the cells or use a different dilution.");
  }
  if (firstStepCultureUl > 0 && firstStepCultureUl < 10) {
    let extraDilutions = 0;
    let temp = firstStepCultureUl;
    while (temp < 10) {
      temp *= 10;
      extraDilutions++;
    }
    const plural = extraDilutions > 1 ? "s" : "";
    warnings.push(`Warning: The first dilution requires < 10uL of original culture. We suggest doing ${extraDilutions} additional 1:10 dilution${plural} such that you will not have to add less than 10uL.`);
  }

  if (warnings.length > 0) {
    cautionOutput.innerHTML = warnings.join("<br>");
  } else {
    cautionOutput.textContent = "";
  }

  message.textContent = "";
  results.classList.remove("hidden");
});

form.addEventListener("reset", () => {
  clearOutputs();
});

clearOutputs();
