import ClusterSpecificInput from "components/forms/ClusterSpecificInput";
import type { FormikProps } from "formik";
import type { FC } from "react";
import { useClusterMembers } from "context/useClusterMembers";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  helpText?: string;
  disabled?: boolean;
  placeholder?: string;
}

const ClusteredBridgeInterfaceInput: FC<Props> = ({
  formik,
  helpText,
  disabled,
  placeholder,
}) => {
  const { data: clusterMembers = [] } = useClusterMembers();
  const memberNames = clusterMembers.map((member) => member.server_name);

  return (
    <ClusterSpecificInput
      values={formik.values.bridge_external_interfaces_per_member}
      id="bridge_external_interfaces_per_member"
      isReadOnly={formik.values.readOnly}
      onChange={(value) => {
        formik.setFieldValue("bridge_external_interfaces_per_member", value);
      }}
      toggleReadOnly={() => {
        ensureEditMode(formik);
        formik.setFieldValue("bridge_external_interfaces", "");
        focusField("bridge_external_interfaces_per_member");
      }}
      memberNames={memberNames}
      disabled={disabled}
      helpText={helpText}
      placeholder={placeholder}
      classname=""
      disabledReason={formik.values.editRestriction}
    />
  );
};

export default ClusteredBridgeInterfaceInput;
