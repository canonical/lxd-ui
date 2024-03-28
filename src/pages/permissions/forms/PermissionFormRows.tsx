import { FC } from "react";
import { Label } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { PermissionGroupFormValues } from "./PermissionGroupForm";
import PermissionRow from "./PermissionRow";

export interface PermissionRowValues {
  entityType: string;
  url: string;
  entitlement: string;
}

interface Props {
  formik: FormikProps<PermissionGroupFormValues>;
  disabled: boolean;
}

const PermissionFormRows: FC<Props> = ({ formik, disabled }) => {
  return (
    <table className="u-no-margin--bottom permissions">
      <thead>
        <tr>
          <th className="entity-type">
            <Label
              required
              forId="permissions.0.entityType"
              className="u-no-margin--bottom"
            >
              Entity type
            </Label>
          </th>
          <th className="entitlement">
            <Label
              required
              forId="ports.0.protocol"
              className="u-no-margin--bottom"
            >
              Entitlement
            </Label>
          </th>
          <th className="entity-reference">
            <Label
              required
              forId="ports.0.targetAddress"
              className="u-no-margin--bottom"
            >
              Entities
            </Label>
          </th>
          <th className="u-off-screen">Actions</th>
        </tr>
      </thead>
      <tbody>
        {formik.values.permissions.map((_permission, index) => {
          return (
            <PermissionRow
              formik={formik}
              index={index}
              key={index}
              disabled={disabled}
            />
          );
        })}
      </tbody>
    </table>
  );
};

export default PermissionFormRows;
