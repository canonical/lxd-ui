export const scrollToElement = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    inline: "nearest",
    block: "nearest",
  });
};

/**
 * Scrolls the form content wrapper to the given section.
 * Waits for one frame, so the sections are laid out before measuring.
 */
export const scrollToSection = (id: string) => {
  requestAnimationFrame(() => {
    const wrapper = document.getElementById("content-details");
    const target = document.getElementById(id);
    if (!wrapper || !target) {
      return;
    }
    wrapper.scrollTop = target.offsetTop - wrapper.offsetTop;
  });
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
    if (elementOffset > scrollTop + offsetTop + 25) {
      return previousCandidate;
    }
    previousCandidate = candidate;
  }
  return previousCandidate;
};
