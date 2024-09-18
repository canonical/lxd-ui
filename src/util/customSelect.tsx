const DROPDOWN_MAX_HEIGHT = 16 * 30; // 30rem with base 16px
const DROPDOWN_MARGIN = 20;

export const adjustDropdownHeightBelow = (dropdown: HTMLUListElement) => {
  const dropdownRect = dropdown.getBoundingClientRect();
  const dropdownHeight = dropdown.offsetHeight;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;

  // If the dropdown is cut off at the bottom of the viewport
  // adjust the height to fit within the viewport minus fixed margin.
  // This usually becomes an issue when the dropdown is at the bottom of the viewport or screen getting smaller.
  if (dropdownRect.bottom >= viewportHeight) {
    const adjustedHeight =
      dropdownHeight - dropdownRect.bottom + viewportHeight - DROPDOWN_MARGIN;
    dropdown.style.height = `${adjustedHeight}px`;
    dropdown.style.maxHeight = `${adjustedHeight}px`;
    return;
  }

  // If the dropdown does not have overflow, the dropdown should fit its content.
  const hasOverflow = dropdown.scrollHeight > dropdown.clientHeight;
  if (!hasOverflow) {
    dropdown.style.height = "auto";
    dropdown.style.maxHeight = "";
    return;
  }

  // If the dropdown is not cut off at the bottom of the viewport
  // adjust the height of the dropdown so that its bottom edge is 20px from the bottom of the viewport
  // until the dropdown max height is reached.
  const adjustedHeight = Math.min(
    viewportHeight - dropdownRect.top - DROPDOWN_MARGIN,
    DROPDOWN_MAX_HEIGHT,
  );
  dropdown.style.height = `${adjustedHeight}px`;
  dropdown.style.maxHeight = `${adjustedHeight}px`;
};

export const adjustDropdownHeightAbove = (
  dropdown: HTMLUListElement,
  search: HTMLInputElement | null,
) => {
  // The search height is subtracted (if necessary) so that no options will be hidden behind the search input.
  const searchRect = search?.getBoundingClientRect();
  const searchHeight = searchRect?.height || 0;
  const dropdownRect = dropdown.getBoundingClientRect();

  // If the dropdown does not have overflow, do not adjust.
  const hasOverflow = dropdown.scrollHeight > dropdown.clientHeight;
  if (!hasOverflow) {
    dropdown.style.height = "auto";
    dropdown.style.maxHeight = "";
    return;
  }

  // adjust the height of the dropdown so that its top edge is 20px from the top of the viewport.
  // until the dropdown max height is reached.
  // unlike the case where the dropdown is bellow the toggle, dropdown.bottom represents the available space above the toggle always.
  // this makes the calculation simpler since we only need to work with dropdown.bottom regardless if the element is cut off or not.
  const adjustedHeight = Math.min(
    dropdownRect.bottom - searchHeight - DROPDOWN_MARGIN,
    DROPDOWN_MAX_HEIGHT,
  );
  dropdown.style.height = `${adjustedHeight}px`;
  dropdown.style.maxHeight = `${adjustedHeight}px`;
};

export const dropdownIsAbove = (dropdown: HTMLUListElement) => {
  const toggle = document.querySelector(
    ".p-custom-select__toggle",
  ) as HTMLElement;
  const dropdownRect = dropdown.getBoundingClientRect();
  const toggleRect = toggle.getBoundingClientRect();
  return toggleRect.top >= dropdownRect.bottom;
};

export const adjustDropdownHeight = (
  dropdown: HTMLUListElement | null,
  search: HTMLInputElement | null,
) => {
  if (!dropdown) {
    return;
  }

  if (dropdownIsAbove(dropdown)) {
    adjustDropdownHeightAbove(dropdown, search);
    return;
  }

  adjustDropdownHeightBelow(dropdown);
};
