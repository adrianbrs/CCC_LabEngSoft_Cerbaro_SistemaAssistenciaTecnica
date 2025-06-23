import { format as _format, type DateArg, type FormatOptions } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Just a type-safe helper to wrap date-fns functions.
 */
const wrap = <T extends (...args: never[]) => unknown>(_: T, patch: T) => patch;

export default defineNuxtPlugin(() => {
  const locale = ref(ptBR);

  const format = wrap(_format, (date, formatString, options) =>
    _format(date, formatString, {
      locale: locale.value,
      ...options,
    })
  );

  const formatDate = (date: DateArg<Date>, options?: FormatOptions) =>
    format(date, "P", options);
  const formatTime = (date: DateArg<Date>, options?: FormatOptions) =>
    format(date, "p", options);
  const formatDateTime = (date: DateArg<Date>, options?: FormatOptions) =>
    format(date, "Pp", options);

  const provider = {
    locale,
    format,
    formatDate,
    formatTime,
    formatDateTime,
  };

  return {
    provide: {
      dfns: provider,
    },
  };
});
