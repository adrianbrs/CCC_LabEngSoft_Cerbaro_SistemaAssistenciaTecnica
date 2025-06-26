export abstract class AbstractEmailTemplate<T extends object = object> {
  protected constructor(
    readonly name: string,
    readonly variables: T,
  ) {}

  static create<
    TArgs extends any[],
    TVars extends object,
    TRes extends AbstractEmailTemplate<TVars>,
  >(
    this: new (...args: TArgs) => TRes,
    ...args: TArgs
  ): AbstractEmailTemplate<TVars> {
    return new this(...args);
  }
}
