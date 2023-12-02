import { screen } from "@testing-library/react";

import { renderComponent } from "test/utils";

import AppNavigationBar from "./AppNavigationBar";

test("displays children", () => {
  const children = "Test content";
  renderComponent(<AppNavigationBar>{children}</AppNavigationBar>);
  expect(screen.getByText(children)).toBeInTheDocument();
});
