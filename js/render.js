(() => {
const { formatCurrency, monthName, summarizeFinances } = window.Capital360Finance;
const { LIMITS, state } = window.Capital360State;

const BANKS = [
  "BAC",
  "Banco Nacional",
  "BCR",
  "Banco Popular",
  "Davivienda",
  "Promerica",
  "Coopenae",
  "Other"
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyStaticTranslations(t) {
  document.documentElement.lang = state.language;
  document.getElementById("langEn").classList.toggle("active", state.language === "en");
  document.getElementById("langEs").classList.toggle("active", state.language === "es");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
}

function renderLoans(t) {
  const loanEl = document.getElementById("loans");

  if (!state.loans.length) {
    loanEl.innerHTML = `<div class="empty-state">${t("no_loans")}</div>`;
  } else {
    loanEl.innerHTML = state.loans.map((loan, index) => loanRowTemplate(loan, index, t)).join("");
  }

  loanEl.querySelectorAll("select[data-loan]").forEach((select) => {
    select.value = state.loans[Number(select.dataset.loan)]?.bank || "Other";
  });

  document.getElementById("loanLimit").textContent =
    state.loans.length >= LIMITS.loans ? t("limit_loans") : "";
}

function renderAssets(t) {
  const assetEl = document.getElementById("assets");

  if (!state.assets.length) {
    assetEl.innerHTML = `<div class="empty-state">${t("no_assets")}</div>`;
  } else {
    assetEl.innerHTML = state.assets.map((asset, index) => assetRowTemplate(asset, index, t)).join("");
  }

  document.getElementById("assetLimit").textContent =
    state.assets.length >= LIMITS.assets ? t("limit_assets") : "";
}

function renderAnalysis(t) {
  const summary = summarizeFinances({
    income: state.income,
    expenses: state.expenses,
    loans: state.loans,
    assets: state.assets,
    extraPayment: state.extraPayment
  });

  if (!summary.hasLoans) {
    renderEmptyAnalysis(summary, t);
    return;
  }

  const interestSaved = Math.max(0, summary.baseInterest - summary.extraInterest);
  const timeSaved = Math.max(0, summary.baseMonths - summary.extraMonths);
  const score = Math.round(summary.score);

  document.getElementById("score").textContent = `${score}/100`;
  document.getElementById("debt").textContent = formatCurrency(summary.totalDebt);
  document.getElementById("dti").textContent = `${summary.monthlyDti.toFixed(1)}%`;
  document.getElementById("debtFree").textContent = monthName(summary.extraMonths, state.language);
  document.getElementById("netWorth").textContent = formatCurrency(summary.netWorth);
  document.getElementById("extraLabel").textContent = formatCurrency(state.extraPayment);
  document.getElementById("timeSaved").textContent = `${timeSaved} ${t("mo")}`;
  document.getElementById("interestSaved").textContent = formatCurrency(interestSaved);
  document.getElementById("heroScore").textContent = `${score}/100`;
  document.getElementById("heroDate").textContent = monthName(summary.extraMonths, state.language);
  document.getElementById("heroSave").textContent = formatCurrency(interestSaved);
  document.getElementById("heroCash").textContent = formatCurrency(summary.cashFlow);
  document.getElementById("saveBar").style.width =
    `${Math.min(100, Math.max(5, (interestSaved / Math.max(summary.baseInterest, 1)) * 100))}%`;

  document.getElementById("recommendations").innerHTML = recommendationTemplates(summary, t).join("");
  document.getElementById("loanTable").innerHTML = summary.loanRows.map(({ loan, interest }) => `
    <tr>
      <td>${escapeHtml(loan.name)}<br><small>${escapeHtml(loan.bank)}</small></td>
      <td>${formatCurrency(Number(loan.balance) || 0)}</td>
      <td>${escapeHtml(loan.rate)}%</td>
      <td>${escapeHtml(loan.tenure)} ${t("mo")}</td>
      <td>${formatCurrency(interest || 0)}</td>
    </tr>
  `).join("");
}

function renderApp(t) {
  applyStaticTranslations(t);
  renderLoans(t);
  renderAssets(t);
  renderAnalysis(t);
}

function renderEmptyAnalysis(summary, t) {
  document.getElementById("score").textContent = "-";
  document.getElementById("debt").textContent = formatCurrency(0);
  document.getElementById("dti").textContent = "0.0%";
  document.getElementById("debtFree").textContent = "-";
  document.getElementById("netWorth").textContent = formatCurrency(summary.assetValue);
  document.getElementById("extraLabel").textContent = formatCurrency(state.extraPayment);
  document.getElementById("timeSaved").textContent = `0 ${t("mo")}`;
  document.getElementById("interestSaved").textContent = formatCurrency(0);
  document.getElementById("heroScore").textContent = "-";
  document.getElementById("heroDate").textContent = "-";
  document.getElementById("heroSave").textContent = formatCurrency(0);
  document.getElementById("heroCash").textContent = formatCurrency(summary.cashFlow);
  document.getElementById("saveBar").style.width = "5%";
  document.getElementById("recommendations").innerHTML =
    `<div class="rec"><b>${t("start_here")}</b> ${t("add_loan_prompt")}</div>`;
  document.getElementById("loanTable").innerHTML = `<tr><td colspan="5">${t("no_loan_rows")}</td></tr>`;
}

function recommendationTemplates(summary, t) {
  const high = summary.highestRateLoan;
  const recs = [];

  if (high?.name) {
    recs.push(`<div class="rec"><b>${t("rec_high")}</b> ${t("rec_high2")} ${escapeHtml(high.name)} ${escapeHtml(high.rate)}% ${t("rec_high3")}</div>`);
  }

  if (summary.cashFlow > state.extraPayment) {
    recs.push(`<div class="rec"><b>${t("rec_safe")}</b> ${t("rec_safe2")} ${formatCurrency(summary.cashFlow)}. ${formatCurrency(state.extraPayment)} ${t("rec_safe3")}</div>`);
  } else {
    recs.push(`<div class="rec"><b>${t("rec_warn")}</b> ${t("rec_warn2")}</div>`);
  }

  if (summary.monthlyDti > 35) {
    recs.push(`<div class="rec"><b>${t("rec_dti")}</b> ${t("rec_dti2")}</div>`);
  } else {
    recs.push(`<div class="rec"><b>${t("rec_healthy")}</b> ${t("rec_healthy2")}</div>`);
  }

  recs.push(`<div class="rec"><b>${t("rec_bonus")}</b> ${t("rec_bonus2")} ${escapeHtml(high?.name || t("highest_rate_fallback"))} ${t("rec_bonus3")}</div>`);
  return recs;
}

function loanRowTemplate(loan, index, t) {
  const options = BANKS.map((bank) => `<option>${escapeHtml(bank)}</option>`).join("");

  return `
    <div class="form-row">
      <div class="field">
        <label>${t("loan_name")}</label>
        <input data-loan="${index}" data-key="name" value="${escapeHtml(loan.name)}">
      </div>
      <div class="field">
        <label>${t("bank")}</label>
        <select data-loan="${index}" data-key="bank">${options}</select>
      </div>
      <div class="field">
        <label>${t("balance")}</label>
        <input type="number" data-loan="${index}" data-key="balance" value="${escapeHtml(loan.balance)}">
      </div>
      <div class="field">
        <label>${t("loan_combo")}</label>
        <input type="number" step=".1" data-loan="${index}" data-key="rate" value="${escapeHtml(loan.rate)}">
        <input type="number" data-loan="${index}" data-key="tenure" value="${escapeHtml(loan.tenure)}" placeholder="months">
        <input type="number" data-loan="${index}" data-key="payment" value="${escapeHtml(loan.payment)}">
      </div>
      <button class="remove" type="button" data-remove-loan="${index}">${t("remove")}</button>
    </div>
  `;
}

function assetRowTemplate(asset, index, t) {
  return `
    <div class="form-row asset-row">
      <div class="field">
        <label>${t("asset")}</label>
        <input data-asset="${index}" data-key="name" value="${escapeHtml(asset.name)}">
      </div>
      <div class="field">
        <label>${t("value")}</label>
        <input type="number" data-asset="${index}" data-key="value" value="${escapeHtml(asset.value)}">
      </div>
      <button class="remove" type="button" data-remove-asset="${index}">${t("remove")}</button>
    </div>
  `;
}

window.Capital360Render = {
  applyStaticTranslations,
  renderAnalysis,
  renderApp,
  renderAssets,
  renderLoans
};
})();
