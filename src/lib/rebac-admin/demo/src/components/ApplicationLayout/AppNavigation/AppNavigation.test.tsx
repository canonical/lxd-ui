import { screen } from "@testing-library/react";

import { renderComponent } from "test/utils";

import AppNavigation from "./AppNavigation";

test("displays children", () => {
  const children = "Test content";
  renderComponent(<AppNavigation>{children}</AppNavigation>);
  expect(screen.getByText(children)).toBeInTheDocument();
});

test("displays as collapsed", () => {
  const { result } = renderComponent(<AppNavigation collapsed />);
  expect(result.container.firstChild).toHaveClass("is-collapsed");
});

test("displays as pinned", () => {
  const { result } = renderComponent(<AppNavigation pinned />);
  expect(result.container.firstChild).toHaveClass("is-pinned");
});
