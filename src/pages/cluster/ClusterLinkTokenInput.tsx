import type { FC } from "react";
import type { FormikProps } from "formik/dist/types";
import type { ClusterLinkFormValues } from "types/forms/clusterLink";
import { Input, Select } from "@canonical/react-components";
import { isUnidirectional } from "util/clusterLink";

interface Props {
  formik: FormikProps<ClusterLinkFormValues>;
}

const ClusterLinkTokenInput: FC<Props> = ({ formik }) => {
  const tokenInput = (
    <Input
      {...formik.getFieldProps("token")}
      type="text"
      label="Token"
      placeholder="Enter token (for example eyJhbGciOiJIUzI1Ni...)"
      disabled={formik.isSubmitting}
      required
      help={
        isUnidirectional(formik.values.type) ? (
          <>
            Paste the token you have generated on the target cluster.
            <br />
            To create one, open the LXD UI on the <b>target cluster</b>, then go
            to{" "}
            <b>
              Permissions {">"} Identities {">"} Create identity
            </b>{" "}
            and select <b>Cluster link</b>.
          </>
        ) : undefined
      }
      helpAfterLabel
      error={formik.touched.token ? formik.errors.token : null}
    />
  );

  if (isUnidirectional(formik.values.type)) {
    return <>{tokenInput}</>;
  } else {
    return (
      <>
        <div className="u-sv1">
          <Select
            label="Token setup"
            help="Generate a token here to paste in a link you will create on the target, or paste here the token generated from a link already created on the target."
            options={[
              {
                label: "Select an option...",
                value: "",
              },
              {
                label: "Generate a token for the target LXD cluster",
                value: "generate",
              },
              {
                label: "I have a token",
                value: "consume",
              },
            ]}
            {...formik.getFieldProps("tokenType")}
            value={formik.values.tokenType ?? ""}
            disabled={formik.isSubmitting}
            error={formik.touched.tokenType ? formik.errors.tokenType : null}
            onChange={(e) => {
              formik.setFieldValue("tokenType", e.target.value);
              if (e.target.value === "generate") {
                formik.setFieldValue("token", "");
              }
            }}
          />
        </div>
        {formik.values.tokenType === "consume" && tokenInput}
      </>
    );
  }
};

export default ClusterLinkTokenInput;
