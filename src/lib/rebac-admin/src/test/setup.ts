import type { Window as HappyDOMWindow } from "happy-dom";
import "@testing-library/jest-dom/vitest";

declare global {
  interface Window extends HappyDOMWindow {}
}
