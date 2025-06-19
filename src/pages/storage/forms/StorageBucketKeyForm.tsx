import type { FC, ReactNode } from "react";
import { Form, Input, Select } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import type { LxdStorageBucket } from "types/storage";

export interface StorageBucketKeyFormValues {
  name: string;
  role?: string;
  description?: string;
}

interface Props {
  formik: FormikProps<StorageBucketKeyFormValues>;
  bucket?: LxdStorageBucket;
}

const StorageBucketKeyForm: FC<Props> = ({ formik, bucket }) => {
  const { canEditBucket } = useStorageBucketEntitlements();
  const getFormProps = (id: "name" | "description") => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id] ?? "",
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `Enter ${id.replaceAll("_", " ")}`,
    };
  };

  const isEditing = !!bucket;

  const bucketEditRestriction =
    !isEditing || canEditBucket(bucket)
      ? ""
      : "You do not have permission to modify this bucket";

  return (
    <Form onSubmit={formik.handleSubmit} className={"bucket-create-form"}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        {...getFormProps("name")}
        type="text"
        label="Name"
        required
        autoFocus
        disabled={!!bucketEditRestriction || isEditing}
        // help={isEditing && "Key name can't be changed"}
        title={bucketEditRestriction}
      />
      <Select
        id="bucketKey"
        label="Role"
        onChange={(e) => {
          formik.setFieldValue("role", e.target.value);
        }}
        value={formik.values.role}
        options={[
          {
            label: "Admin",
            value: "admin",
          },
          {
            label: "Read-only",
            value: "read-only",
          },
        ]}
      />
      <AutoExpandingTextArea
        {...getFormProps("description")}
        label="Description"
        disabled={!!bucketEditRestriction}
        title={bucketEditRestriction}
      />
    </Form>
  );
};

export default StorageBucketKeyForm;
