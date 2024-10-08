import { Button, useNotify } from "@canonical/react-components";
import CustomSelect, {
  SelectRef,
} from "../../../components/select/CustomSelect";
import { useQuery } from "@tanstack/react-query";
import { fetchPermissions } from "api/auth-permissions";
import { fetchConfigOptions } from "api/server";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { FC, useEffect, useRef, useState } from "react";
import {
  generateEntitlementOptions,
  generateResourceOptions,
  getIdentityNameLookup,
  getImageLookup,
  getPermissionId,
  getResourceLabel,
  getResourceTypeOptions,
  moveToFocusable,
  noneAvailableOption,
} from "util/permissions";
import { queryKeys } from "util/queryKeys";
import { FormPermission } from "pages/permissions/panels/EditGroupPermissionsForm";
import { fetchImageList } from "api/images";
import { fetchIdentities } from "api/auth-identities";
import ResourceOptionHeader from "./ResourceOptionHeader";
import useEventListener from "@use-it/event-listener";

interface Props {
  onAddPermission: (permission: FormPermission) => void;
}

const PermissionSelector: FC<Props> = ({ onAddPermission }) => {
  const notify = useNotify();
  const [resourceType, setResourceType] = useState("");
  const [resource, setResource] = useState("");
  const [entitlement, setEntitlement] = useState("");
  const { hasMetadataConfiguration, hasEntityTypeMetadata } =
    useSupportedFeatures();
  const permissionSelectorRef = useRef<HTMLDivElement>(null);

  // Handle tab keyboard events so that when the user presses tab, the focusable permission selector will be focused and openned authomatically
  // Also close the currently open permission selector
  const resourceTypeRef = useRef<SelectRef["current"]>();
  const resourceRef = useRef<SelectRef["current"]>();
  const entitlementRef = useRef<SelectRef["current"]>();
  const handleTabbingForSelectors = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      const focusDirection = event.shiftKey ? "prev" : "next";
      if (resourceTypeRef.current?.isOpen) {
        event.preventDefault();
        resourceTypeRef.current.close();
        moveToFocusable(
          document.getElementById("resourceType"),
          focusDirection,
        );
      }

      if (resourceRef.current?.isOpen) {
        event.preventDefault();
        resourceRef.current.close();
        moveToFocusable(document.getElementById("resource"), focusDirection);
      }

      if (entitlementRef.current?.isOpen) {
        event.preventDefault();
        entitlementRef.current.close();
        moveToFocusable(document.getElementById("entitlement"), focusDirection);
      }
    }
  };

  useEventListener("keydown", handleTabbingForSelectors);

  const {
    data: permissions,
    isLoading: isPermissionsLoading,
    error: permissionsError,
  } = useQuery({
    queryKey: [queryKeys.permissions, resourceType],
    queryFn: () => fetchPermissions({ resourceType }),
    enabled: !!resourceType,
  });

  const { data: images = [] } = useQuery({
    queryKey: [queryKeys.images],
    queryFn: () => fetchImageList(),
  });

  const { data: identities = [] } = useQuery({
    queryKey: [queryKeys.identities],
    queryFn: fetchIdentities,
  });

  const imageLookup = getImageLookup(images);
  const identityNamesLookup = getIdentityNameLookup(identities);

  const { data: metadata, isLoading: isMetadataLoading } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: () => fetchConfigOptions(hasMetadataConfiguration),
  });

  const isLoading = isPermissionsLoading || isMetadataLoading;

  // focus permission selector container on first render so tabbing will consistently navigate to resource type selector first
  useEffect(() => {
    setTimeout(() => {
      if (permissionSelectorRef.current) {
        permissionSelectorRef.current.focus();
        permissionSelectorRef.current.tabIndex = -1;
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (resourceType) {
      if (resourceType === "server") {
        document.getElementById("entitlement")?.focus();
        return;
      }

      if (permissions?.length) {
        document.getElementById("resource")?.focus();
        return;
      }

      moveToFocusable(document.getElementById("resourceType"), "next");
    }
  }, [resourceType, permissions]);

  useEffect(() => {
    if (resource) {
      document.getElementById("entitlement")?.focus();
    }
  }, [resource]);

  useEffect(() => {
    if (entitlement) {
      document.getElementById("add-entitlement")?.focus();
    }
  }, [entitlement]);

  const handleResourceTypeChange = (value: string) => {
    const resourceType = value;
    setEntitlement("");
    setResourceType(resourceType);

    // for server resource type we can select a resource, so automatically set it
    // label for resource will show "server" if resource type is set to server
    if (resourceType === "server") {
      setResource("/1.0");
    } else {
      setResource("");
    }
  };

  const handleResourceChange = (value: string) => {
    setResource(value);
  };

  const handleEntitlementChange = (value: string) => {
    setEntitlement(value);
  };

  const handleAddPermission = () => {
    const permission = {
      entity_type: resourceType,
      url: resource,
      entitlement: entitlement,
    };

    onAddPermission({
      ...permission,
      id: getPermissionId(permission),
      resourceLabel: getResourceLabel(
        permission,
        imageLookup,
        identityNamesLookup,
      ),
    });

    // after adding a permission, only reset the entitlement selector
    setEntitlement("");
  };

  if (permissionsError) {
    notify.failure("Loading permissions failed", permissionsError);
  }

  const resourceOptions = generateResourceOptions(
    resourceType,
    permissions ?? [],
    imageLookup,
    identityNamesLookup,
  );

  // if we have metadata api extension, but no entity type metadata, we can't show entitlement descriptions
  const validMetadata = hasEntityTypeMetadata ? metadata : null;
  const entitlementOptions = generateEntitlementOptions(
    resourceType,
    permissions,
    validMetadata,
  );

  const isServerResourceType = resourceType === "server";
  const hasResourceOptions = resourceOptions.length;

  return (
    <div
      className="permission-selector"
      tabIndex={0}
      ref={permissionSelectorRef}
    >
      <CustomSelect
        id="resourceType"
        name="resourceType"
        label={<strong>Resource Type</strong>}
        options={getResourceTypeOptions(metadata)}
        toggleClassName="u-no-margin--bottom"
        aria-label="Resource type"
        onChange={handleResourceTypeChange}
        value={resourceType}
        selectRef={resourceTypeRef}
        onFocus={resourceTypeRef.current?.open}
        searchable="always"
      />
      <CustomSelect
        id="resource"
        name="resource"
        label={<strong>Resource</strong>}
        options={!hasResourceOptions ? [noneAvailableOption] : resourceOptions}
        toggleClassName="u-no-margin--bottom"
        aria-label="Resource"
        onChange={handleResourceChange}
        value={resource}
        disabled={
          isLoading ||
          !resourceType ||
          isServerResourceType ||
          !hasResourceOptions
        }
        dropdownClassName="permissions-select-dropdown"
        header={<ResourceOptionHeader resourceType={resourceType} />}
        selectRef={resourceRef}
        onFocus={resourceRef.current?.open}
        searchable="always"
      />
      <CustomSelect
        id="entitlement"
        name="entitlement"
        label={<strong>Entitlement</strong>}
        options={entitlementOptions}
        toggleClassName="u-no-margin--bottom"
        aria-label="Entitlement"
        onChange={handleEntitlementChange}
        value={entitlement}
        disabled={isLoading || (!resource && !isServerResourceType)}
        dropdownClassName="permissions-select-dropdown"
        selectRef={entitlementRef}
        onFocus={entitlementRef.current?.open}
        searchable="always"
        initialPosition="right"
      />
      <div className="add-entitlement">
        <Button
          id="add-entitlement"
          appearance="positive"
          onClick={handleAddPermission}
          className="u-no-margin--bottom"
          disabled={!entitlement}
          tabIndex={!entitlement ? -1 : undefined}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default PermissionSelector;
