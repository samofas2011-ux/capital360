(() => {
const CURRENCY_LOCALE = "es-CR";

function formatCurrency(value) {
  return `₡${Math.round(value || 0).toLocaleString(CURRENCY_LOCALE)}`;
}

function monthName(monthsFromNow, language) {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date.toLocaleDateString(language === "es" ? "es-CR" : "en-US", {
    month: "short",
    year: "numeric"
  });
}

function paymentInterest(balance, rate, payment, extra = 0) {
  let remainingBalance = Number(balance) || 0;
  const monthlyRate = (Number(rate) || 0) / 100 / 12;
  const monthlyPayment = (Number(payment) || 0) + (Number(extra) || 0);
  let months = 0;
  let interest = 0;

  if (remainingBalance <= 0) {
    return { months: 0, interest: 0 };
  }

  if (monthlyPayment <= remainingBalance * monthlyRate) {
    return { months: 999, interest: Infinity };
  }

  while (remainingBalance > 1 && months < 600) {
    const monthlyInterest = remainingBalance * monthlyRate;
    const principal = Math.min(remainingBalance, monthlyPayment - monthlyInterest);
    interest += monthlyInterest;
    remainingBalance -= principal;
    months += 1;
  }

  return { months, interest };
}

function summarizeFinances({ income, expenses, loans, investments, assets, extraPayment }) {
  const totalDebt = loans.reduce((sum, loan) => sum + (Number(loan.balance) || 0), 0);
  const totalPayments = loans.reduce((sum, loan) => sum + (Number(loan.payment) || 0), 0);
  const investmentCapital = investments.reduce((sum, investment) => sum + (Number(investment.capital) || 0), 0);
  const annualInvestmentIncome = investments.reduce((sum, investment) => {
    const capital = Number(investment.capital) || 0;
    const rate = Number(investment.rate) || 0;
    return sum + capital * (rate / 100);
  }, 0);
  const assetValue = assets.reduce((sum, asset) => sum + (Number(asset.value) || 0), 0);
  const monthlyDti = income ? (totalPayments / income) * 100 : 0;
  const cashFlow = income - expenses - totalPayments;
  const totalProfileAssets = assetValue + investmentCapital;

  if (!loans.length) {
    return {
      hasLoans: false,
      totalDebt,
      totalPayments,
      investmentCapital,
      annualInvestmentIncome,
      assetValue,
      totalProfileAssets,
      monthlyDti,
      cashFlow,
      netWorth: totalProfileAssets,
      baseMonths: 0,
      extraMonths: 0,
      baseInterest: 0,
      extraInterest: 0,
      highestRateLoan: null,
      score: null,
      loanRows: []
    };
  }

  const baseResults = loans.map((loan) => paymentInterest(loan.balance, loan.rate, loan.payment));
  const baseMonths = Math.max(0, ...baseResults.map((result) => result.months));
  const baseInterest = baseResults.reduce((sum, result) => sum + result.interest, 0);
  const highestRateLoan = [...loans].sort((a, b) => (Number(b.rate) || 0) - (Number(a.rate) || 0))[0] || null;
  const extraResults = loans.map((loan) => {
    const loanExtra = loan === highestRateLoan ? extraPayment : 0;
    return paymentInterest(loan.balance, loan.rate, loan.payment, loanExtra);
  });
  const extraMonths = Math.max(0, ...extraResults.map((result) => result.months));
  const extraInterest = extraResults.reduce((sum, result) => sum + result.interest, 0);
  const interestRatio = baseInterest / Math.max(totalDebt, 1);
  const investmentLift = Math.min(6, (investmentCapital / Math.max(totalDebt, 1)) * 3);
  const score = Math.max(35, Math.min(98, 100 - monthlyDti * 0.9 - interestRatio * 18 + (cashFlow > 0 ? 8 : -10) + investmentLift));

  return {
    hasLoans: true,
    totalDebt,
    totalPayments,
    investmentCapital,
    annualInvestmentIncome,
    assetValue,
    totalProfileAssets,
    monthlyDti,
    cashFlow,
    netWorth: totalProfileAssets - totalDebt,
    baseMonths,
    extraMonths,
    baseInterest,
    extraInterest,
    highestRateLoan,
    score,
    loanRows: loans.map((loan, index) => ({
      loan,
      interest: baseResults[index].interest
    }))
  };
}

function summarizeAguinaldo(salaries) {
  const salaryRows = salaries.map((salary) => ({
    ...salary,
    amount: Number(salary.amount) || 0
  }));
  const totalSalary = salaryRows.reduce((sum, salary) => sum + salary.amount, 0);
  const monthsWithSalary = salaryRows.filter((salary) => salary.amount > 0).length;
  const aguinaldo = totalSalary / 12;
  const averageWorkedMonth = monthsWithSalary ? totalSalary / monthsWithSalary : 0;

  return {
    salaryRows: salaryRows.map((salary) => ({
      ...salary,
      contribution: totalSalary ? (salary.amount / totalSalary) * 100 : 0
    })),
    totalSalary,
    monthsWithSalary,
    missingMonths: Math.max(0, 12 - monthsWithSalary),
    averageWorkedMonth,
    aguinaldo
  };
}

window.Capital360Finance = {
  formatCurrency,
  monthName,
  paymentInterest,
  summarizeAguinaldo,
  summarizeFinances
};
})();
