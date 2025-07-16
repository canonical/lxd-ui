export const scrollToElement = (id: string) => {
  document.getElementById(id)?.scrollIntoView();
};

/**
 * Returns the first section that is in the viewport.
 */
export const getFirstVisibleSection = (
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
