// TODO: design of this should change drastically!

import { Button, Icon, Select } from "@canonical/react-components";
import { FormikProps } from "formik";
import { FC, useEffect } from "react";
import { PermissionGroupFormValues } from "./PermissionGroupForm";
import {
  entityTypeOptions,
  generateEntitlementsFromPermissions,
} from "util/permissions";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchPermissions } from "api/permissions";
import Loader from "components/Loader";

type Props = {
  formik: FormikProps<PermissionGroupFormValues>;
  index: number;
  disabled: boolean;
};

const PermissionRow: FC<Props> = ({ formik, index, disabled }) => {
  const permisionForRow = formik.values.permissions[index];
  const entityType = permisionForRow.entityType;

  // carefully consider how queries should be cached
  const { data: permissions, isLoading } = useQuery({
    // TODO: invalidate cached permissions when adding / deleting entities of specific entity type
    queryKey: [queryKeys.permissions, entityType],
    queryFn: () => fetchPermissions({ entityType }),
  });

  const { entitlementEntities, entitlementOptions } =
    generateEntitlementsFromPermissions(entityType, permissions);

  useEffect(() => {
    if (entityType && permissions) {
      // If entity type changed for a permission row,
      // first set entitlement and entity selection to first entry returned by server
      const newPermissions = [...formik.values.permissions];
      const entitlements = generateEntitlementsFromPermissions(
        entityType,
        permissions,
      );

      const entitlement = entitlements.entitlementEntities[
        permisionForRow.entitlement
      ]
        ? permisionForRow.entitlement
        : entitlements.entitlementOptions[0]?.value || "";
      const url = entitlement
        ? (entitlements.entitlementEntities[entitlement][0]?.value as string)
        : "";
      newPermissions[index] = {
        entityType,
        entitlement,
        url,
      };
      void formik.setFieldValue("permissions", newPermissions);
    }
  }, [entityType, permissions]);

  if (isLoading) {
    return <Loader text="Loading permissions" />;
  }

  return (
    <tr>
      <td className="entity-type">
        <Select
          {...formik.getFieldProps(`permissions.${index}.entityType`)}
          id={`permissions.${index}.entityType`}
          options={entityTypeOptions}
          aria-label={`Permission ${index} entity type`}
          disabled={disabled}
        />
      </td>
      <td className="entitlement">
        <Select
          {...formik.getFieldProps(`permissions.${index}.entitlement`)}
          id={`permissions.${index}.entitlement`}
          options={entitlementOptions}
          aria-label={`Permission ${index} entitlement`}
          disabled={disabled || !entitlementOptions.length}
        />
      </td>
      <td className="entity-reference">
        <Select
          {...formik.getFieldProps(`permissions.${index}.url`)}
          id={`permissions.${index}.url`}
          options={entitlementEntities[permisionForRow.entitlement]}
          aria-label={`Permission ${index} url`}
          disabled={
            disabled ||
            !entitlementEntities[permisionForRow.entitlement]?.length ||
            entityType === "server"
          }
        />
      </td>
      <td>
        <Button
          onClick={() =>
            formik.setFieldValue("permissions", [
              ...formik.values.permissions.slice(0, index),
              ...formik.values.permissions.slice(index + 1),
            ])
          }
          hasIcon
          className="u-no-margin--bottom"
          type="button"
          aria-label={`Delete permission ${index}`}
          disabled={disabled}
        >
          <Icon name="delete" />
        </Button>
      </td>
    </tr>
  );
};

export default PermissionRow;
