import { screen } from "@testing-library/react";
import type { ButtonHTMLAttributes } from "react";

import { renderComponent } from "test/utils";

import SideNavigationLink from "./SideNavigationLink";

test("displays a link", () => {
  const label = "Test content";
  renderComponent(<SideNavigationLink label={label} href="#" />);
  expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
});

test("displays an icon", () => {
  renderComponent(<SideNavigationLink icon="user" label="Test content" />);
  expect(document.querySelector(".p-icon--user")).toBeInTheDocument();
});

test("displays a light icon", () => {
  renderComponent(<SideNavigationLink icon="user" label="Test content" />);
  expect(document.querySelector(".p-icon--user")).toHaveClass("is-light");
});

test("displays a dark icon", () => {
  renderComponent(<SideNavigationLink dark icon="user" label="Test content" />);
  expect(document.querySelector(".p-icon--user")).not.toHaveClass("is-light");
});

test("can use a custom link component", () => {
  const Link = ({ ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  );
  const label = "Test content";
  renderComponent(<SideNavigationLink label={label} component={Link} />);
  expect(screen.getByRole("button", { name: label })).toHaveClass(
    "p-side-navigation__link",
  );
});
