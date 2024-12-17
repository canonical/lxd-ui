import { FC, ReactNode } from "react";
import { Input } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import UplinkSelector from "pages/networks/forms/UplinkSelector";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import NetworkTypeSelector from "pages/networks/forms/NetworkTypeSelector";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import NetworkParentSelector from "pages/networks/forms/NetworkParentSelector";
import { ensureEditMode } from "util/instanceEdit";
import { GENERAL } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  project: string;
  isClustered: boolean;
}

const NetworkFormMain: FC<Props> = ({ formik, project, isClustered }) => {
  const getFormProps = (id: "network" | "name" | "description" | "parent") => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: (e: unknown) => {
        ensureEditMode(formik);
        formik.handleChange(e);
      },
      value: formik.values[id] ?? "",
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `Enter ${id.replaceAll("_", " ")}`,
    };
  };

  return (
    <>
      <h2 className="p-heading--4" id={slugify(GENERAL)}>
        General
      </h2>
      <div className="u-sv3">
        <NetworkTypeSelector formik={formik} />
        <Input
          {...getFormProps("name")}
          type="text"
          label="Name"
          required
          disabled={formik.values.readOnly || !formik.values.isCreating}
          help={
            !formik.values.isCreating
              ? "Click the name in the header to rename the network"
              : undefined
          }
        />
        <AutoExpandingTextArea
          {...getFormProps("description")}
          label="Description"
        />
        {formik.values.networkType === "ovn" && (
          <UplinkSelector props={getFormProps("network")} project={project} />
        )}
        {formik.values.networkType === "physical" &&
          (formik.values.isCreating || !isClustered) && (
            <NetworkParentSelector props={getFormProps("parent")} />
          )}
      </div>
    </>
  );
};

export default NetworkFormMain;
