import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { renderComponent } from "test/utils";

import AppAside from "./AppAside";
import ApplicationLayout from "./ApplicationLayout";

const logo = {
  icon: "icon.svg",
  href: "http://example.com",
  name: "name.svg",
  nameAlt: "Juju",
};

test("displays a logo", () => {
  renderComponent(<ApplicationLayout logo={logo} navItems={[]} />);
  const link = screen.getAllByRole("link", { name: "Juju" })[0];
  expect(within(link).getByRole("img", { name: "Juju" })).toHaveAttribute(
    "src",
    "name.svg",
  );
});

test("displays as light", () => {
  renderComponent(<ApplicationLayout dark={false} logo={logo} navItems={[]} />);
  expect(document.querySelectorAll(".is-dark")).toHaveLength(0);
  expect(document.querySelectorAll(".is-light")).toHaveLength(0);
});

test("displays as dark", () => {
  renderComponent(<ApplicationLayout dark logo={logo} navItems={[]} />);
  expect(document.querySelectorAll(".is-dark")).toHaveLength(5);
  // Two icons are light so that they appear over the dark background.
  expect(document.querySelectorAll(".is-light")).toHaveLength(2);
});

test("displays main content", () => {
  const content = "Main content";
  renderComponent(
    <ApplicationLayout logo={logo} navItems={[]}>
      {content}
    </ApplicationLayout>,
  );
  expect(screen.getByText(content)).toBeInTheDocument();
});

test("displays a status bar", () => {
  const content = "Main content";
  renderComponent(
    <ApplicationLayout logo={logo} navItems={[]} status={content} />,
  );
  expect(screen.getByText(content)).toBeInTheDocument();
  expect(screen.getByText(content).parentNode).toHaveClass("l-status");
});

test("displays an aside", () => {
  const content = "Aside content";
  renderComponent(
    <ApplicationLayout
      logo={logo}
      navItems={[]}
      aside={<AppAside>{content}</AppAside>}
    />,
  );
  expect(screen.getByText(content)).toBeInTheDocument();
  expect(document.querySelector(".l-aside")).toBeInTheDocument();
});

test("pins the menu", async () => {
  renderComponent(<ApplicationLayout logo={logo} navItems={[]} />);
  expect(document.querySelector(".l-navigation")).not.toHaveClass("is-pinned");
  await userEvent.click(screen.getByRole("button", { name: "Pin menu" }));
  expect(document.querySelector(".l-navigation")).toHaveClass("is-pinned");
});

test("pins the menu using external state", async () => {
  const onPinMenu = vi.fn();
  renderComponent(
    <ApplicationLayout
      logo={logo}
      navItems={[]}
      menuPinned={true}
      onPinMenu={onPinMenu}
    />,
  );
  expect(document.querySelector(".l-navigation")).toHaveClass("is-pinned");
  await userEvent.click(screen.getByRole("button", { name: "Unpin menu" }));
  expect(onPinMenu).toHaveBeenCalledWith(false);
});

test("opens and collapses the menu", async () => {
  renderComponent(<ApplicationLayout logo={logo} navItems={[]} />);
  expect(document.querySelector(".l-navigation")).toHaveClass("is-collapsed");
  await userEvent.click(screen.getByRole("button", { name: "Menu" }));
  expect(document.querySelector(".l-navigation")).not.toHaveClass(
    "is-collapsed",
  );
  await userEvent.click(screen.getByRole("button", { name: "Close menu" }));
  expect(document.querySelector(".l-navigation")).toHaveClass("is-collapsed");
});

test("collapses the menu using external state", async () => {
  const onCollapseMenu = vi.fn();
  renderComponent(
    <ApplicationLayout
      logo={logo}
      navItems={[]}
      menuCollapsed={true}
      onCollapseMenu={onCollapseMenu}
    />,
  );
  expect(document.querySelector(".l-navigation")).toHaveClass("is-collapsed");
  await userEvent.click(screen.getByRole("button", { name: "Menu" }));
  expect(onCollapseMenu).toHaveBeenCalledWith(false);
});
