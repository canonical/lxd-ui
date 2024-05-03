import {
  generateEntitlementOptions,
  generatePermissionSort,
  generateResourceOptions,
} from "./permissions";

describe("General util functions for permissions feature", () => {
  it("generateResourceOptions", () => {
    const resourceType = "instance";
    const permissions = [
      {
        entity_type: "instance",
        url: "/1.0/instances/instance-1?project=default",
        entitlement: "entitlement-1",
      },
      {
        entity_type: "instance",
        url: "/1.0/instances/instance-1?project=default",
        entitlement: "entitlement-2",
      },
      {
        entity_type: "instance",
        url: "/1.0/instances/instance-1?project=default",
        entitlement: "entitlement-3",
      },
      {
        entity_type: "instance",
        url: "/1.0/instances/instance-2?project=default",
        entitlement: "entitlement-1",
      },
      {
        entity_type: "instance",
        url: "/1.0/instances/instance-2?project=default",
        entitlement: "entitlement-2",
      },
      {
        entity_type: "instance",
        url: "/1.0/instances/instance-2?project=default",
        entitlement: "entitlement-3",
      },
      {
        entity_type: "instance",
        url: "/1.0/instances/instance-3?project=default",
        entitlement: "entitlement-1",
      },
      {
        entity_type: "instance",
        url: "/1.0/instances/instance-3?project=default",
        entitlement: "entitlement-2",
      },
      {
        entity_type: "instance",
        url: "/1.0/instances/instance-3?project=default",
        entitlement: "entitlement-3",
      },
    ];

    const imagesNamesLookup = {};
    const identityNamesLookup = {};

    const resourceOptions = generateResourceOptions(
      resourceType,
      permissions,
      imagesNamesLookup,
      identityNamesLookup,
    );
    expect(resourceOptions).toEqual([
      {
        disabled: true,
        label: "Select an option",
        value: "",
      },
      {
        value: "/1.0/instances/instance-1?project=default",
        label: "instance-1 (project: default) ",
      },
      {
        value: "/1.0/instances/instance-2?project=default",
        label: "instance-2 (project: default) ",
      },
      {
        value: "/1.0/instances/instance-3?project=default",
        label: "instance-3 (project: default) ",
      },
    ]);
  });

  it("generateEntitlementOptions", () => {
    const resourceType = "server";
    const permissions = [
      {
        entity_type: "server",
        url: "/1.0",
        entitlement: "admin",
      },
      {
        entity_type: "server",
        url: "/1.0",
        entitlement: "viewer",
      },
      {
        entity_type: "server",
        url: "/1.0",
        entitlement: "can_edit",
      },
      {
        entity_type: "server",
        url: "/1.0",
        entitlement: "can_view",
      },
    ];

    const entitlementOptions = generateEntitlementOptions(
      resourceType,
      permissions,
    );

    expect(entitlementOptions).toEqual([
      {
        disabled: true,
        label: "Select an option",
        value: "",
      },
      {
        disabled: true,
        label: "Built-in roles",
        value: "",
      },
      {
        label: "admin",
        value: "admin",
      },
      {
        label: "viewer",
        value: "viewer",
      },
      {
        disabled: true,
        label: "Granular entitlements",
        value: "",
      },
      {
        label: "can_edit",
        value: "can_edit",
      },
      {
        label: "can_view",
        value: "can_view",
      },
    ]);
  });

  it("generatePermissionSort", () => {
    const permissions = [
      {
        entity_type: "identity",
        url: "/1.0/auth/identities/oidc/bar@bar.com",
        entitlement: "can_delete",
        id: "identity/1.0/auth/identities/oidc/bar@bar.comcan_delete",
      },
      {
        id: "group/1.0/auth/groups/g-1can_delete",
        entity_type: "group",
        url: "/1.0/auth/groups/g-1",
        entitlement: "can_delete",
      },
      {
        entity_type: "server",
        url: "/1.0",
        entitlement: "admin",
        id: "server/1.0admin",
      },
      {
        entity_type: "project",
        url: "/1.0/projects/default",
        entitlement: "image_alias_manager",
        id: "project/1.0/projects/defaultimage_alias_manager",
      },

      {
        entity_type: "group",
        url: "/1.0/auth/groups/g-1",
        entitlement: "can_view",
        id: "group/1.0/auth/groups/g-1can_view",
      },
      {
        id: "image/1.0/images/a56eb59962b706e727703aaa415ae4c584c8fc6a661fcd3aba83bc9eff237ac0?project=defaultcan_edit",
        entity_type: "image",
        url: "/1.0/images/a56eb59962b706e727703aaa415ae4c584c8fc6a661fcd3aba83bc9eff237ac0?project=default",
        entitlement: "can_edit",
      },
    ];

    const identityNamesLookup = {
      "bar@bar.com": "bar",
    };

    const imagesNamesLookup = {
      a56eb59962b706e727703aaa415ae4c584c8fc6a661fcd3aba83bc9eff237ac0:
        "Alpinelinux 3.16 x86_64 (cloud) (20240415_0234) (project: default)",
    };

    permissions.sort(
      generatePermissionSort(imagesNamesLookup, identityNamesLookup),
    );

    expect(permissions).toEqual([
      {
        entity_type: "server",
        url: "/1.0",
        entitlement: "admin",
        id: "server/1.0admin",
      },
      {
        entity_type: "identity",
        url: "/1.0/auth/identities/oidc/bar@bar.com",
        entitlement: "can_delete",
        id: "identity/1.0/auth/identities/oidc/bar@bar.comcan_delete",
      },
      {
        id: "group/1.0/auth/groups/g-1can_delete",
        entity_type: "group",
        url: "/1.0/auth/groups/g-1",
        entitlement: "can_delete",
      },
      {
        entity_type: "group",
        url: "/1.0/auth/groups/g-1",
        entitlement: "can_view",
        id: "group/1.0/auth/groups/g-1can_view",
      },
      {
        entity_type: "project",
        url: "/1.0/projects/default",
        entitlement: "image_alias_manager",
        id: "project/1.0/projects/defaultimage_alias_manager",
      },
      {
        id: "image/1.0/images/a56eb59962b706e727703aaa415ae4c584c8fc6a661fcd3aba83bc9eff237ac0?project=defaultcan_edit",
        entity_type: "image",
        url: "/1.0/images/a56eb59962b706e727703aaa415ae4c584c8fc6a661fcd3aba83bc9eff237ac0?project=default",
        entitlement: "can_edit",
      },
    ]);
  });
});
