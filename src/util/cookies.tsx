export const getCookie = (key: string) => {
  const val = document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`);
  return val ? val.pop() : undefined;
};
