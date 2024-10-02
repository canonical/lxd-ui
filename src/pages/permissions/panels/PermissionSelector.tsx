import { Button, useNotify } from "@canonical/react-components";
import CustomSelect from "../../../components/select/CustomSelect";
import { useQuery } from "@tanstack/react-query";
import { fetchPermissions } from "api/auth-permissions";
import { fetchConfigOptions } from "api/server";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { FC, useEffect, useState } from "react";
import {
  generateEntitlementOptions,
  generateResourceOptions,
  getIdentityNameLookup,
  getImageNameLookup,
  getPermissionId,
  getResourceLabel,
  getResourceTypeOptions,
  noneAvailableOption,
} from "util/permissions";
import { queryKeys } from "util/queryKeys";
import { FormPermission } from "pages/permissions/panels/EditGroupPermissionsForm";
import { fetchImageList } from "api/images";
import { fetchIdentities } from "api/auth-identities";

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

  const imageNamesLookup = getImageNameLookup(images);
  const identityNamesLookup = getIdentityNameLookup(identities);

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
        imageNamesLookup,
        identityNamesLookup,
      ),
    });

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
    <div className="permission-selector">
      <CustomSelect
        id="resourceType"
        name="resourceType"
        label={<strong>Resource Type</strong>}
        options={getResourceTypeOptions(metadata)}
        toggleClassName="u-no-margin--bottom"
        aria-label="Resource type"
        onChange={handleResourceTypeChange}
        value={resourceType}
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
