export const debounce = (method: () => void, delay: number) => {
  interface DebouncedCallback {
    _timeoutId: NodeJS.Timeout;
  }
  const debouncedMethod = method as unknown as DebouncedCallback;
  clearTimeout(debouncedMethod._timeoutId);
  debouncedMethod._timeoutId = setTimeout(method, delay);
};
