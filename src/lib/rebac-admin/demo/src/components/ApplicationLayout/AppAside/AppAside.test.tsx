import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { renderComponent } from "test/utils";

import AppAside from "./AppAside";

test("displays without a close", async () => {
  renderComponent(<AppAside>Content</AppAside>);
  expect(
    screen.queryByRole("button", { name: "Close" }),
  ).not.toBeInTheDocument();
});

test("displays a close button", async () => {
  const onClose = vi.fn();
  renderComponent(<AppAside onClose={onClose} />);
  expect(screen.getByText("Close")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(onClose).toHaveBeenCalled();
});
