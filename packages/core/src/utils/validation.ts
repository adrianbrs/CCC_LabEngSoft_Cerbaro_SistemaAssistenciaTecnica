import { isStrongPassword as _isStrongPassword } from "validator";

export const isValidCPF = (value: string) => {
  if (typeof value !== "string") {
    return false;
  }

  value = value.replace(/[^\d]+/g, "");

  if (value.length !== 11 || !!value.match(/(\d)\1{10}/)) {
    return false;
  }

  const values = value.split("").map((el) => +el);
  const rest = (count: number) =>
    ((values
      .slice(0, count - 12)
      .reduce((soma, el, index) => soma + el * (count - index), 0) *
      10) %
      11) %
    10;

  return rest(10) === values[9] && rest(11) === values[10];
};

export const isStrongPassword = (value: string) => {
  const minChars = 8;
  const score = _isStrongPassword(value, {
    returnScore: true,
    pointsForContainingLower: 1,
    pointsForContainingNumber: 1,
    pointsForContainingSymbol: 1,
    pointsForContainingUpper: 1,
    // Count 1 point if the password is at least `minChars` long
    pointsPerRepeat: 1 / minChars,
    pointsPerUnique: 1 / minChars,
  });
  // Must meet at least 4 of the 5 criteria
  return score >= 4;
};
