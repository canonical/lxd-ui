import { Button, Select, useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchPermissions } from "api/auth-permissions";
import { fetchConfigOptions } from "api/server";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { LxdPermission } from "types/permissions";
import {
  generateEntitlementOptions,
  generateResourceOptions,
  getResourceTypeOptions,
  noneAvailableOption,
} from "util/permissions";
import { queryKeys } from "util/queryKeys";

export type LxdPermissionWithID = LxdPermission & { id: string };

interface Props {
  imageNamesLookup: Record<string, string>;
  identityNamesLookup: Record<string, string>;
  onAddPermission: (permission: LxdPermissionWithID) => void;
}

const PermissionSelector: FC<Props> = ({
  imageNamesLookup,
  identityNamesLookup,
  onAddPermission,
}) => {
  const notify = useNotify();
  const [resourceType, setResourceType] = useState("");
  const [resource, setResource] = useState("");
  const [entitlement, setEntitlement] = useState("");
  const { hasMetadataConfiguration } = useSupportedFeatures();

  const {
    data: permissions,
    isLoading: isPermissionsLoading,
    error: permissionsError,
  } = useQuery({
    queryKey: [queryKeys.permissions, resourceType],
    queryFn: () => fetchPermissions({ resourceType }),
    enabled: !!resourceType,
  });

  const { data: metadata, isLoading: isMetadataLoading } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: () => fetchConfigOptions(hasMetadataConfiguration),
  });

  const isLoading = isPermissionsLoading || isMetadataLoading;

  useEffect(() => {
    document.getElementById("resourceType")?.focus();
  }, []);

  useEffect(() => {
    if (!resourceType) {
      document.getElementById("resourceType")?.focus();
      return;
    }

    if (resourceType === "server") {
      document.getElementById("entitlement")?.focus();
      return;
    }
    document.getElementById("resource")?.focus();
  }, [resourceType, permissions]);

  useEffect(() => {
    document.getElementById("entitlement")?.focus();
  }, [resource]);

  useEffect(() => {
    document.getElementById("add-entitlement")?.focus();
  }, [entitlement]);

  const handleResourceTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const resourceType = e.target.value;
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

  const handleResourceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setResource(e.target.value);
  };

  const handleEntitlementChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setEntitlement(e.target.value);
  };

  const handleAddPermission = () => {
    const newPermissionId = resourceType + resource + entitlement;
    const newPermission = {
      id: newPermissionId,
      entity_type: resourceType,
      url: resource,
      entitlement: entitlement,
    };

    onAddPermission(newPermission);

    // after adding a permission, only reset the entitlement selector
    setEntitlement("");
    document.getElementById("entitlement")?.focus();
  };

  if (permissionsError) {
    notify.failure("Loading permissions failed", permissionsError);
  }

  const resourceOptions = generateResourceOptions(
    resourceType,
    permissions ?? [],
    imageNamesLookup,
    identityNamesLookup,
  );

  const entitlementOptions = generateEntitlementOptions(
    resourceType,
    permissions,
    metadata,
  );

  const isServerResourceType = resourceType === "server";
  const hasResourceOptions = resourceOptions.length;

  return (
    <div className="permission-selector">
      <Select
        id="resourceType"
        name="resourceType"
        label={<strong>Resource Type</strong>}
        options={getResourceTypeOptions(metadata)}
        className="u-no-margin--bottom"
        aria-label="Resource type"
        onChange={handleResourceTypeChange}
        value={resourceType}
      />
      <Select
        id="resource"
        name="resource"
        label={<strong>Resource</strong>}
        options={!hasResourceOptions ? [noneAvailableOption] : resourceOptions}
        className="u-no-margin--bottom"
        aria-label="Resource"
        onChange={handleResourceChange}
        value={resource}
        disabled={
          isLoading ||
          !resourceType ||
          isServerResourceType ||
          !hasResourceOptions
        }
      />
      <Select
        id="entitlement"
        name="entitlement"
        label={<strong>Entitlement</strong>}
        options={entitlementOptions}
        className="u-no-margin--bottom"
        aria-label="Entitlement"
        onChange={handleEntitlementChange}
        value={entitlement}
        disabled={isLoading || (!resource && !isServerResourceType)}
      />
      <div className="add-entitlement">
        <Button
          id="add-entitlement"
          appearance="positive"
          onClick={handleAddPermission}
          className="u-no-margin--bottom"
          disabled={!entitlement}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default PermissionSelector;
