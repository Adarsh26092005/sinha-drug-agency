// Truncates to 2 decimal places (does NOT round up) - e.g. 5666.0999999 -> 5666.09
const roundMoney = (num) => Math.floor(Number(num) * 100) / 100;

module.exports = roundMoney;