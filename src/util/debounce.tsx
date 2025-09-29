export const debounce = (method: () => void, delay: number) => {
  interface DebouncedCallback {
    _timeoutId: NodeJS.Timeout;
  }
  const debouncedMethod = method as unknown as DebouncedCallback;
  clearTimeout(debouncedMethod._timeoutId);
  debouncedMethod._timeoutId = setTimeout(method, delay);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounceAsync<F extends (...args: any[]) => Promise<any>>(
  fn: F,
  delay: number,
  defaultValue: ReturnType<F> = true as ReturnType<F>,
): (...args: Parameters<F>) => Promise<ReturnType<F>> {
  let timeoutId: NodeJS.Timeout;
  let pendingResolve: ((value: ReturnType<F>) => void) | null = null;

  return async (...args: Parameters<F>) => {
    if (timeoutId) clearTimeout(timeoutId);
    if (pendingResolve) {
      pendingResolve(defaultValue);
    }

    return new Promise<ReturnType<F>>((resolve, reject) => {
      pendingResolve = resolve;
      timeoutId = setTimeout(() => {
        try {
          fn(...args).then(resolve);
        } catch (err) {
          reject(err as Error);
        } finally {
          pendingResolve = null;
        }
      }, delay);
    });
  };
}
