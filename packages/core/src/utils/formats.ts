const NON_DIGIT_REGEX = /\D/g;
const CPF_REGEX = /^(\d{3})(\d{3})(\d{3})(\d{2})$/;
const PHONE_REGEX = /^(\d{2})(\d{4,5})(\d{4})$/;

export const formatCpf = (value: string): string =>
  value.replace(NON_DIGIT_REGEX, "").replace(CPF_REGEX, "$1.$2.$3-$4");

export const formatPhone = (value: string): string =>
  value.replace(NON_DIGIT_REGEX, "").replace(PHONE_REGEX, "($1) $2-$3");
