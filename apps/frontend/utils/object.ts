export const assignReset = <S extends object>(target: object, source: S): S => {
  Object.keys(target).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(source, key)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete target[key as keyof typeof target];
    }
  });

  return Object.assign(target, source);
};
