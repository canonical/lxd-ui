import { screen } from "@testing-library/react";

import { renderComponent } from "test/utils";

import Application from "./Application";

test("displays children", () => {
  const children = "Test content";
  renderComponent(<Application>{children}</Application>);
  expect(screen.getByText(children)).toBeInTheDocument();
});
