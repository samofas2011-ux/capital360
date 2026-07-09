(() => {
const { createTranslator } = window.Capital360Translations;
const {
  addAsset,
  addLoan,
  removeAsset,
  removeLoan,
  setHouseholdValue,
  setLanguage,
  state,
  updateAsset,
  updateLoan
} = window.Capital360State;
const { applyStaticTranslations, renderAnalysis, renderApp, renderAssets, renderLoans } = window.Capital360Render;

const t = createTranslator(() => state.language);

function syncControlsFromDom() {
  setHouseholdValue("income", document.getElementById("income").value);
  setHouseholdValue("expenses", document.getElementById("expenses").value);
  setHouseholdValue("extraPayment", document.getElementById("extra").value);
}

function scrollToSection(selector) {
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
}

function changeLanguage(language) {
  setLanguage(language);
  applyStaticTranslations(t);
  renderLoans(t);
  renderAssets(t);
  renderAnalysis(t);
}

function handleInput(event) {
  const { target } = event;

  if (target.dataset.loan !== undefined) {
    updateLoan(Number(target.dataset.loan), target.dataset.key, target.value);
    renderAnalysis(t);
    return;
  }

  if (target.dataset.asset !== undefined) {
    updateAsset(Number(target.dataset.asset), target.dataset.key, target.value);
    renderAnalysis(t);
    return;
  }

  if (["income", "expenses", "extra"].includes(target.id)) {
    syncControlsFromDom();
    renderAnalysis(t);
  }
}

function handleClick(event) {
  const { target } = event;
  const scrollTarget = target.closest("[data-scroll-target]");

  if (scrollTarget) {
    scrollToSection(scrollTarget.dataset.scrollTarget);
    return;
  }

  if (target.id === "addLoan") {
    if (!addLoan()) {
      alert(t("alert_loan"));
      return;
    }

    renderLoans(t);
    renderAnalysis(t);
    return;
  }

  if (target.id === "addAsset") {
    if (!addAsset()) {
      alert(t("alert_asset"));
      return;
    }

    renderAssets(t);
    renderAnalysis(t);
    return;
  }

  if (target.dataset.removeLoan !== undefined) {
    removeLoan(Number(target.dataset.removeLoan));
    renderLoans(t);
    renderAnalysis(t);
    return;
  }

  if (target.dataset.removeAsset !== undefined) {
    removeAsset(Number(target.dataset.removeAsset));
    renderAssets(t);
    renderAnalysis(t);
  }
}

function init() {
  syncControlsFromDom();
  renderApp(t);

  document.addEventListener("input", handleInput);
  document.addEventListener("click", handleClick);
  document.getElementById("langEn").addEventListener("click", () => changeLanguage("en"));
  document.getElementById("langEs").addEventListener("click", () => changeLanguage("es"));
}

init();
})();
