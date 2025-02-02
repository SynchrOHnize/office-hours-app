export function wrap<Args extends any[], Ret>(
  fn: (...args: Args) => Promise<Ret>,
  message: string,
): (...args: Args) => Promise<Ret> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (cause) {
      throw new Error(message, { cause });
    }
  };
}
