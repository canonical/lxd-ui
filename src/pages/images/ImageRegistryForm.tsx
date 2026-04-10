import { Form, Input, PrefixedInput } from "@canonical/react-components";
import type { FC } from "react";
import type { FormikProps } from "formik/dist/types";
import type { ImageRegistryFormValues } from "types/forms/image";
import { ClusterLinkSelector } from "./ClusterLinkSelector";
import { ImageRegistryProtocolSelector } from "./ImageRegistryProtocolSelector";

interface Props {
  formik: FormikProps<ImageRegistryFormValues>;
  isEdit?: boolean;
}

export const ImageRegistryForm: FC<Props> = ({ formik, isEdit = false }) => {
  const isSimpleStreams = formik.values.protocol === "simplestreams";
  const stripProtocol = (value: string) => value.replace(/^https?:\/\//i, "");

  const getFieldError = (fieldName: keyof ImageRegistryFormValues) => {
    return formik.touched[fieldName] ? formik.errors[fieldName] : undefined;
  };

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        {...formik.getFieldProps("name")}
        type="text"
        autoFocus={!isEdit}
        label="Name"
        required
        error={getFieldError("name")}
        placeholder="Enter name"
      />
      <Input
        {...formik.getFieldProps("description")}
        type="text"
        autoFocus={isEdit}
        label="Description"
        placeholder="Enter description"
        error={getFieldError("description")}
      />
      <ImageRegistryProtocolSelector formik={formik} />
      {isSimpleStreams && (
        <PrefixedInput
          {...formik.getFieldProps("url")}
          immutableText="https://"
          value={formik.values.url ? stripProtocol(formik.values.url) : ""}
          label="Server"
          placeholder="example.org/releases"
          error={getFieldError("url")}
          onChange={(e) => {
            const normalizedUrl = stripProtocol(e.target.value);
            formik.setFieldValue(
              "url",
              normalizedUrl ? `https://${normalizedUrl}` : "",
            );
          }}
          help={
            <>
              Enter the base folder for <code>streams/v1</code>, such as{" "}
              https://cloud-images.ubuntu.com/releases/
            </>
          }
        />
      )}
      {!isSimpleStreams && (
        <>
          <ClusterLinkSelector formik={formik} />
          <Input
            {...formik.getFieldProps("sourceProject")}
            type="text"
            label="Source project"
            placeholder="Enter source project"
            error={getFieldError("sourceProject")}
            help="Project with images on the remote cluster."
          />
        </>
      )}
    </Form>
  );
};
