export const scrollToElement = (id: string) => {
  document.getElementById(id)?.scrollIntoView();
};

export const activeScrollSection = (
  sections: string[],
  wrapper: HTMLElement | null,
) => {
  const scrollTop = wrapper ? wrapper.scrollTop : 0;
  const offsetTop = wrapper ? wrapper.offsetTop : 0;
  let previousCandidate = sections[0];
  for (const candidate of sections) {
    const element = document.getElementById(candidate.toLowerCase());
    const elementOffset = element?.offsetTop ?? 0;
    if (elementOffset > scrollTop + offsetTop) {
      return previousCandidate;
    }
    previousCandidate = candidate;
  }
  return previousCandidate;
};
