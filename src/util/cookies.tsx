export const getCookie = (key: string): string | undefined => {
  const val = document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`);
  return val ? val.pop() : undefined;
};
