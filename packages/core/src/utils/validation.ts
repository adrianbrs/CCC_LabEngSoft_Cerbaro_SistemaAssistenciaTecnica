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
  return _isStrongPassword(value, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};

export const isTechnician = (user: any) => {
  return user?.roles?.some((role: any) => role.name === "technician");
}
/*
export const isClient = (user: any) => {
  return user?.roles?.some((role: any) => role.name === "client");
}
export const isAdmin = (user: any) => {
  return user?.roles?.some((role: any) => role.name === "admin");
}*/
