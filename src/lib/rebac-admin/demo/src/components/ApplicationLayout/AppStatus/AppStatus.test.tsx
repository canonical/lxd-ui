import { screen } from "@testing-library/react";

import { renderComponent } from "test/utils";

import AppStatus from "./AppStatus";

test("displays children", () => {
  const children = "Test content";
  renderComponent(<AppStatus>{children}</AppStatus>);
  expect(screen.getByText(children)).toBeInTheDocument();
});
