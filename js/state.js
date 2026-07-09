(() => {
const LIMITS = {
  loans: 3,
  investments: 2,
  assets: 2
};

const DEFAULT_LOAN = {
  name: "New Loan",
  bank: "Other",
  balance: 1000000,
  rate: 12,
  tenure: 24,
  payment: 50000
};

const DEFAULT_ASSET = {
  name: "New Asset",
  value: 1000000
};

const DEFAULT_INVESTMENT = {
  name: "New Investment",
  capital: 1000000,
  rate: 6
};

const state = {
  language: "es",
  income: 0,
  expenses: 0,
  extraPayment: 100000,
  loans: [],
  investments: [],
  assets: []
};

function setLanguage(language) {
  state.language = language;
}

function setHouseholdValue(key, value) {
  state[key] = Number(value) || 0;
}

function addLoan() {
  if (state.loans.length >= LIMITS.loans) {
    return false;
  }

  state.loans.push({ ...DEFAULT_LOAN });
  return true;
}

function updateLoan(index, key, value) {
  if (!state.loans[index]) {
    return;
  }

  state.loans[index][key] = ["balance", "rate", "tenure", "payment"].includes(key)
    ? Number(value) || 0
    : value;
}

function removeLoan(index) {
  state.loans.splice(index, 1);
}

function addInvestment() {
  if (state.investments.length >= LIMITS.investments) {
    return false;
  }

  state.investments.push({ ...DEFAULT_INVESTMENT });
  return true;
}

function updateInvestment(index, key, value) {
  if (!state.investments[index]) {
    return;
  }

  state.investments[index][key] = ["capital", "rate"].includes(key) ? Number(value) || 0 : value;
}

function removeInvestment(index) {
  state.investments.splice(index, 1);
}

function addAsset() {
  if (state.assets.length >= LIMITS.assets) {
    return false;
  }

  state.assets.push({ ...DEFAULT_ASSET });
  return true;
}

function updateAsset(index, key, value) {
  if (!state.assets[index]) {
    return;
  }

  state.assets[index][key] = key === "value" ? Number(value) || 0 : value;
}

function removeAsset(index) {
  state.assets.splice(index, 1);
}

window.Capital360State = {
  LIMITS,
  state,
  addAsset,
  addInvestment,
  addLoan,
  removeAsset,
  removeInvestment,
  removeLoan,
  setHouseholdValue,
  setLanguage,
  updateAsset,
  updateInvestment,
  updateLoan
};
})();
