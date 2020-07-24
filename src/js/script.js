// Vars
var $calculationModeSelect = $('#calculationModeSelect');
var $calculateButton = $('#calculateButton');
var $calculatedResultLabel = $('#calculatedResultLabel');
var $calculatedResult = $('#calculatedResult');
var $APRInputs = $('#APRInputs');

var $calculateButtonSalary = $('#calculateButtonSalary');

const INSURANCE = 0.1378;
const INSURANCE_LIMIT = 3000;
const INCOME_TAX = 0.1;

// Calculator config
var config = {
  modes: ['accured', 'principal', 'interest', 'years'],
  modeMap: {
    accured: {
      handler: calculateAccuredAmount,
      selectTitle: 'Крайна сума',
      inputContainerId: 'accuredAmountContainer',
      inputFields: [
        'principalAmount',
        'interestRate',
        'compoudingPeriods',
        'years',
      ],
    },
    principal: {
      handler: calculatePrincipalAmount,
      selectTitle: 'Начална сума',
      inputContainerId: 'principalAmountContainer',
      inputFields: [
        'accuredAmount',
        'interestRate',
        'compoudingPeriods',
        'years',
      ],
    },
    interest: {
      handler: calculateInterestRate,
      selectTitle: 'Доходност в %',
      inputContainerId: 'interestRateContainer',
      inputFields: [
        'accuredAmount',
        'principalAmount',
        'compoudingPeriods',
        'years',
      ],
    },
    years: {
      handler: calculateYears,
      selectTitle: 'Години',
      inputContainerId: 'yearsContainer',
      inputFields: [
        'accuredAmount',
        'principalAmount',
        'compoudingPeriods',
        'interestRate',
      ],
    },
  },
};

var initialModeIndex = 0;
var currentMode = config.modes[initialModeIndex];

// App functions
function appInit() {
  $('[data-toggle="tooltip"]').tooltip();

  initModeSelect();
}

function initModeSelect() {
  var selectModeOptions = config.modes
    .map(
      (el) => `<option value="${el}">${config.modeMap[el].selectTitle}</option>`
    )
    .join('');

  $calculationModeSelect.html(selectModeOptions);
}

function resetCalculatedAmountContainer() {
  $calculatedResult.html('0');
}

// Handlers
function handleModeChange() {
  var $this = $(this);
  var value = $this.val();

  currentMode = value;

  // Form updates
  $APRInputs.find('.form-group.d-none').removeClass('d-none');
  $(`#${config.modeMap[currentMode].inputContainerId}`).addClass('d-none');
  $calculatedResultLabel.text(config.modeMap[currentMode].selectTitle);
  resetCalculatedAmountContainer();
}

function handleCalclateButtonClick() {
  // Get field valuеs by mode
  var inputValuesObject = {};

  config.modeMap[currentMode].inputFields.forEach((el) => {
    var elValue = parseFloat($(`#${el}Input`).val().trim(), 10);
    inputValuesObject[el] = elValue;
  });

  var calculatedResult = config.modeMap[currentMode].handler(inputValuesObject);
  $calculatedResult.html(numeral(calculatedResult).format('0,0.00'));
}

function handleCalclateButtonSalaryClick() {
  // Get field valuеs by mode
  var inputValuesObject = {};
  var $grossInput = $('#grossInput');
  var $insuranceInput = $('#insuranceInput');
  var $taxInput = $('#taxInput');
  var $netInput = $('#netInput');

  var grossInputValue = parseInt($grossInput.val().trim(), 10);

  var insuranceInputValue =
    (grossInputValue <= INSURANCE_LIMIT ? grossInputValue : INSURANCE_LIMIT) *
    INSURANCE;
  $insuranceInput.val(insuranceInputValue.toFixed(2));

  var taxInputValue = (grossInputValue - insuranceInputValue) * INCOME_TAX;
  $taxInput.val(taxInputValue.toFixed(2));

  var netInputValue = grossInputValue - insuranceInputValue - taxInputValue;
  $netInput.val(netInputValue.toFixed(2));

  var calculatedResult = config.modeMap[currentMode].handler(inputValuesObject);
  // $calculatedResult.html(numeral(calculatedResult).format('0,0.00'));
}

// Financial functions
/*
A = Accrued Amount (principal + interest)
P = Principal Amount
I = Interest Amount
R = Annual Nominal Interest Rate in percent
r = Annual Nominal Interest Rate as a decimal
n = number of compounding periods per unit t; at the END of each period
t = Time Involved in years, 0.5 years is calculated as 6 months, etc.
*/

function calculateAccuredAmount({
  principalAmount,
  interestRate,
  compoudingPeriods,
  years,
}) {
  var interestRateDec = interestRate / 100;
  // A = P(1 + r/n)nt
  var accuredAmount =
    principalAmount *
    Math.pow(
      1 + interestRateDec / compoudingPeriods,
      compoudingPeriods * years
    );

  return accuredAmount;
}

function calculateInterestRate({
  principalAmount,
  accuredAmount,
  compoudingPeriods,
  years,
}) {
  // r = n[(A/P)1/nt - 1]
  var interestRate =
    compoudingPeriods *
    (Math.pow(
      accuredAmount / principalAmount,
      1 / (compoudingPeriods * years)
    ) -
      1);

  return interestRate * 100;
}

function calculatePrincipalAmount({
  interestRate,
  accuredAmount,
  compoudingPeriods,
  years,
}) {
  var interestRateDec = interestRate / 100;
  // P = A / (1 + r/n)nt
  var principalAmount =
    accuredAmount /
    Math.pow(
      1 + interestRateDec / compoudingPeriods,
      compoudingPeriods * years
    );

  return principalAmount;
}

function calculateYears({
  principalAmount,
  interestRate,
  accuredAmount,
  compoudingPeriods,
}) {
  var interestRateDec = interestRate / 100;
  // t = ln(A/P) / n[ln(1 + r/n)]
  var years =
    Math.log(accuredAmount / principalAmount) /
    (compoudingPeriods * Math.log(1 + interestRateDec / compoudingPeriods));

  return years;
}

function calculateRealInterest(nominalRate, infaltionRate) {
  var rearInterest = (1 + nominalRate) / (1 + infaltionRate) - 1;

  return rearInterest;
}

$(document).ready(function () {
  // Init
  appInit();

  // Bind events
  $calculateButton.on('click', handleCalclateButtonClick);
  $calculateButtonSalary.on('click', handleCalclateButtonSalaryClick);
  $calculationModeSelect.on('change', handleModeChange);
});
