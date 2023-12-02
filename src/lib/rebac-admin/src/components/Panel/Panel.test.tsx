import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ButtonHTMLAttributes } from "react";
import { vi } from "vitest";

import { renderComponent } from "test/utils";

import Panel from "./Panel";

test("displays a title", () => {
  const title = "Test Panel";
  renderComponent(<Panel title={title} />);
  expect(screen.getByText(title)).toHaveClass("p-panel__title");
});

test("displays a logo", () => {
  renderComponent(
    <Panel
      logo={{
        href: "http://example.com",
        icon: "icon.svg",
        iconAlt: "Icon SVG",
        name: "name.svg",
        nameAlt: "Name SVG",
      }}
    />,
  );
  const link = screen.getByRole("link", { name: "Icon SVG Name SVG" });
  expect(link).toHaveAttribute("href", "http://example.com");
  expect(within(link).getByRole("img", { name: "Icon SVG" })).toHaveAttribute(
    "src",
    "icon.svg",
  );
  expect(within(link).getByRole("img", { name: "Name SVG" })).toHaveAttribute(
    "src",
    "name.svg",
  );
});

test("logo handles different components", () => {
  const Link = ({ ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  );
  renderComponent(
    <Panel
      logo={{
        title: "http://example.com",
        component: Link,
        icon: "icon.svg",
        iconAlt: "Icon SVG",
        name: "name.svg",
        nameAlt: "Name SVG",
      }}
    />,
  );
  expect(
    screen.getByRole("button", { name: "Icon SVG Name SVG" }),
  ).toHaveAttribute("title", "http://example.com");
});

test("displays a toggle", async () => {
  const onClick = vi.fn();
  renderComponent(
    <Panel title="Test panel" toggle={{ label: "Toggle", onClick }} />,
  );
  const toggle = screen.getByRole("button", { name: "Toggle" });
  await userEvent.click(toggle);
  expect(onClick).toHaveBeenCalled();
});

test("displays a panel with no header", async () => {
  renderComponent(<Panel>Content</Panel>);
  expect(screen.getByText("Content")).toBeInTheDocument();
});
