import type { FormikProps } from "formik";
import type { FC } from "react";
import type { NetworkFormValues } from "./NetworkForm";

const NetworkDefaultACLReadOnly: FC<{
  formik: FormikProps<NetworkFormValues>;
}> = ({ formik }) => {
  const egress = formik.values.security_acls_default_egress;
  const ingress = formik.values.security_acls_default_ingress;

  const conjugateAction = (action: string) => {
    return action === "drop" ? "dropped" : action + "ed";
  };

  if (formik.values.security_acls.length === 0) {
    //When no value is set, LXD ACLs default to "reject"
    return (
      <div className="u-text--muted">
        When no ACL rule matches, <b>egress</b> and <b>ingress</b> traffic will
        be <code>Rejected.</code>
      </div>
    );
  } else if (egress === ingress) {
    return (
      <div className="u-text--muted">
        When no ACL rule matches, <b>egress</b> and <b>ingress</b> traffic will
        be <code>{conjugateAction(egress ?? "")}</code>
      </div>
    );
  } else {
    return (
      <div>
        <div className="u-text--muted">
          When no ACL rule matches:
          <br /> &nbsp; &nbsp; <b>egress</b> traffic will be{" "}
          <code>{conjugateAction(egress ?? "")}</code>.
        </div>
        <div className="u-text--muted">
          &nbsp; &nbsp; <b>ingress</b> traffic will be{" "}
          <code>{conjugateAction(ingress ?? "")}</code>.
        </div>
        <br />
      </div>
    );
  }
};
export default NetworkDefaultACLReadOnly;
