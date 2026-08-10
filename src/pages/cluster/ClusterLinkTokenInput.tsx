import type { FC } from "react";
import type { FormikProps } from "formik/dist/types";
import type { ClusterLinkFormValues } from "types/forms/clusterLink";
import { Input, Select } from "@canonical/react-components";

interface Props {
  formik: FormikProps<ClusterLinkFormValues>;
}

const ClusterLinkTokenInput: FC<Props> = ({ formik }) => {
  const getTokenHelp = () => {
    if (formik.values.type === "unidirectional") {
      return (
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
      );
    }

    if (formik.values.tokenType === "generate") {
      return "Token will be generated";
    }

    if (formik.values.tokenType === "consume") {
      return (
        <>
          Paste the token you have generated on the target cluster.
          <br />
          To create one, open the LXD UI on the <b>target cluster</b>, then go
          to{" "}
          <b>
            Clustering {">"} Links {">"} Create cluster link
          </b>{" "}
          and generate a token for the bidirectional link.
        </>
      );
    }

    return null;
  };

  const tokenInput = (
    <Input
      {...formik.getFieldProps("token")}
      type="text"
      label="Token"
      placeholder="Enter token (e.g. eyJhbGciOiJIUzI1Ni...)"
      autoFocus={formik.values.type === "unidirectional"}
      disabled={
        formik.values.tokenType !== "consume" &&
        formik.values.type === "bidirectional"
      }
      required
      help={getTokenHelp()}
    />
  );

  if (formik.values.type === "unidirectional") {
    return <>{tokenInput}</>;
  } else {
    return (
      <>
        <div className="u-sv1">
          <Select
            label="Token setup"
            options={[
              {
                label: "Select an option...",
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
            autoFocus
            onChange={(e) => {
              formik.setFieldValue("tokenType", e.target.value);
              if (e.target.value === "generate") {
                formik.setFieldValue("token", "");
              }
            }}
          />
        </div>
        {tokenInput}
      </>
    );
  }
};

export default ClusterLinkTokenInput;
