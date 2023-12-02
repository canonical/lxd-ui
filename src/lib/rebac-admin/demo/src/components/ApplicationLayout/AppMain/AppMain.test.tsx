import { screen } from "@testing-library/react";

import { renderComponent } from "test/utils";

import AppMain from "./AppMain";

test("displays children", () => {
  const children = "Test content";
  renderComponent(<AppMain>{children}</AppMain>);
  expect(screen.getByText(children)).toBeInTheDocument();
});
