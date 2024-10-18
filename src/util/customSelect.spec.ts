import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  adjustDropdownHeightAbove,
  adjustDropdownHeightBelow,
} from "./customSelect";

describe("adjustDropdownHeightAbove", () => {
  let dropdown: HTMLUListElement;
  let search: HTMLInputElement;

  beforeEach(() => {
    dropdown = document.createElement("ul");
    search = document.createElement("input");

    Object.defineProperty(dropdown, "offsetHeight", {
      value: 200,
      writable: true,
    });
    Object.defineProperty(dropdown, "scrollHeight", {
      value: 300,
      writable: true,
    });
    Object.defineProperty(dropdown, "clientHeight", {
      value: 150,
      writable: true,
    });

    vi.spyOn(dropdown, "getBoundingClientRect").mockReturnValue({
      bottom: 400,
      top: 0,
      height: 200,
      width: 200,
      left: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    vi.spyOn(search, "getBoundingClientRect").mockReturnValue({
      bottom: 0,
      top: 0,
      height: 40,
      width: 200,
      left: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  });

  it("should adjust dropdown height when dropdown is taller than viewport top", () => {
    adjustDropdownHeightAbove(dropdown, search);
    expect(dropdown.style.height).toBe("340px");
    expect(dropdown.style.maxHeight).toBe("340px");
  });

  it("should adjust to max height when dropdown is taller than max height", () => {
    vi.spyOn(dropdown, "getBoundingClientRect").mockReturnValue({
      bottom: 1000,
      top: 0,
      height: 200,
      width: 200,
      left: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    adjustDropdownHeightAbove(dropdown, search);
    expect(dropdown.style.height).toBe("480px");
    expect(dropdown.style.maxHeight).toBe("480px");
  });

  it("should fit content when dropdown has no overflow", () => {
    Object.defineProperty(dropdown, "scrollHeight", { value: 150 });
    adjustDropdownHeightAbove(dropdown, search);
    expect(dropdown.style.height).toBe("auto");
    expect(dropdown.style.maxHeight).toBe("");
  });
});

describe("adjustDropdownHeightBelow", () => {
  let dropdown: HTMLUListElement;

  beforeEach(() => {
    dropdown = document.createElement("ul");
    Object.defineProperty(dropdown, "offsetHeight", {
      value: 200,
      writable: true,
    });
    Object.defineProperty(dropdown, "scrollHeight", {
      value: 300,
      writable: true,
    });
    Object.defineProperty(dropdown, "clientHeight", {
      value: 150,
      writable: true,
    });

    vi.spyOn(dropdown, "getBoundingClientRect").mockReturnValue({
      bottom: 600,
      top: 400,
      height: 200,
      width: 200,
      left: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
  });

  it("should adjust dropdown height when it is cut off at bottom of viewport", () => {
    adjustDropdownHeightBelow(dropdown);
    expect(dropdown.style.height).toBe("380px");
    expect(dropdown.style.maxHeight).toBe("380px");
  });

  it("should fit content when dropdown has no overflow", () => {
    Object.defineProperty(dropdown, "scrollHeight", { value: 150 });
    adjustDropdownHeightBelow(dropdown);
    expect(dropdown.style.height).toBe("auto");
    expect(dropdown.style.maxHeight).toBe("");
  });

  it("should adjust to max height when dropdown is taller than max height", () => {
    vi.spyOn(dropdown, "getBoundingClientRect").mockReturnValue({
      bottom: 600,
      top: 100,
      height: 200,
      width: 200,
      left: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    adjustDropdownHeightBelow(dropdown);
    expect(dropdown.style.height).toBe("480px");
    expect(dropdown.style.maxHeight).toBe("480px");
  });
});
