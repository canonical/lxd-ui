import { screen } from "@testing-library/react";

import { renderComponent } from "test/utils";
import urls from "urls";

import {
  IndexLink,
  UsersLink,
  AccessGovernanceLink,
  AuthenticationLink,
  EntitlementsLink,
  GroupsLink,
  ResourcesLink,
  RolesLink,
} from "./Links";

test("links to the index", () => {
  renderComponent(<IndexLink baseURL="/permissions" />);
  expect(
    screen.getByRole("link", { name: "Canonical ReBAC Admin" }),
  ).toHaveAttribute("href", `/permissions/`);
});

test("links to access governance", () => {
  renderComponent(<AccessGovernanceLink baseURL="/permissions" />);
  expect(
    screen.getByRole("link", { name: "Access Governance" }),
  ).toHaveAttribute("href", `/permissions${urls.accessGovernance.index}`);
});

test("links to authentication", () => {
  renderComponent(<AuthenticationLink baseURL="/permissions" />);
  expect(screen.getByRole("link", { name: "Authentication" })).toHaveAttribute(
    "href",
    `/permissions${urls.authentication.index}`,
  );
});

test("links to entitlements", () => {
  renderComponent(<EntitlementsLink baseURL="/permissions" />);
  expect(screen.getByRole("link", { name: "Entitlements" })).toHaveAttribute(
    "href",
    `/permissions${urls.entitlements}`,
  );
});

test("links to groups", () => {
  renderComponent(<GroupsLink baseURL="/permissions" />);
  expect(screen.getByRole("link", { name: "Groups" })).toHaveAttribute(
    "href",
    `/permissions${urls.groups.index}`,
  );
});

test("links to resources", () => {
  renderComponent(<ResourcesLink baseURL="/permissions" />);
  expect(screen.getByRole("link", { name: "Resources" })).toHaveAttribute(
    "href",
    `/permissions${urls.resources.index}`,
  );
});

test("links to roles", () => {
  renderComponent(<RolesLink baseURL="/permissions" />);
  expect(screen.getByRole("link", { name: "Roles" })).toHaveAttribute(
    "href",
    `/permissions${urls.roles.index}`,
  );
});

test("links to users", () => {
  renderComponent(<UsersLink baseURL="/permissions" />);
  expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute(
    "href",
    `/permissions${urls.users.index}`,
  );
});
