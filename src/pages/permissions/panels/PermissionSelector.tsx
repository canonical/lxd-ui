import { Button, useNotify } from "@canonical/react-components";
import CustomSelect, { SelectRef } from "components/select/CustomSelect";
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
  noneAvailableOption,
} from "util/permissions";
import { queryKeys } from "util/queryKeys";
import { FormPermission } from "pages/permissions/panels/EditGroupPermissionsForm";
import { fetchImageList } from "api/images";
import { fetchIdentities } from "api/auth-identities";
import ResourceOptionHeader from "./ResourceOptionHeader";
import { LxdPermission } from "types/permissions";

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

  // Refs for select components, these contain methods to open/close the dropdown programmatically
  const resourceTypeRef = useRef<SelectRef["current"]>();
  const resourceRef = useRef<SelectRef["current"]>();
  const entitlementRef = useRef<SelectRef["current"]>();

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

  const focusAfterResourceTypeChange = (
    previous: string,
    current: string,
    permissions?: LxdPermission[],
  ) => {
    // for server, there will be no resources to select
    // skip to entitlement selector
    if (current === "server") {
      entitlementRef.current?.open();
      return current;
    }

    const wasChanged = !previous && current;
    const wasReselected = previous && current === previous;
    if (wasChanged || wasReselected) {
      // open the resource dropdown if there are permissions for the resource type
      if (permissions?.length) {
        resourceRef.current?.open();
        return current;
      }
      // if there are no permissions, we can't select a resource
      // keep focus on the resource type selector
      resourceTypeRef.current?.focus();
    }

    return current;
  };

  useEffect(() => {
    focusAfterResourceTypeChange("", resourceType, permissions);
  }, [resourceType, permissions]);

  const handleResourceTypeChange = (value: string) => {
    const resourceType = value;
    setEntitlement("");
    setResourceType((prev) => {
      return focusAfterResourceTypeChange(prev, resourceType, permissions);
    });

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
    entitlementRef.current?.open();
  };

  const handleEntitlementChange = (value: string) => {
    setEntitlement(value);
    document.getElementById("add-entitlement")?.focus();
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
