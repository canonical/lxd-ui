import type { FC, ReactNode } from "react";
import { Form, Input } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import StoragePoolSelector from "../StoragePoolSelector";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import type { LxdStorageBucket } from "types/storage";
import { cephObject, storageDriverLabels } from "util/storageOptions";
import type { StorageBucketFormValues } from "types/forms/storageBucket";

interface Props {
  formik: FormikProps<StorageBucketFormValues>;
  bucket?: LxdStorageBucket;
}

const StorageBucketForm: FC<Props> = ({ formik, bucket }) => {
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
      <StoragePoolSelector
        value={formik.values.pool}
        setValue={(value) => void formik.setFieldValue("pool", value)}
        invalidDrivers={Object.keys(storageDriverLabels).filter((key) => {
          return key !== cephObject;
        })}
        selectProps={{
          id: "bucket-create-pool",
          label: "Storage pool",
          disabled: !!bucketEditRestriction || isEditing,
          help: isEditing
            ? "Storage bucket pool can't be changed"
            : formik.errors.pool
              ? null
              : "Pool must have a Ceph Object driver",
          error: formik.errors.pool,
          onBlur: formik.handleBlur,
          takeFocus: true,
          required: true,
        }}
      />

      <Input
        {...getFormProps("name")}
        type="text"
        label="Name"
        required
        disabled={!!bucketEditRestriction || isEditing}
        help={isEditing && "Storage bucket name can't be changed"}
        title={bucketEditRestriction}
      />

      <DiskSizeSelector
        label="Size"
        value={formik.values.size}
        setMemoryLimit={(val?: string) => {
          formik.setFieldValue("size", val);
        }}
        disabled={!!bucketEditRestriction}
        disabledReason={bucketEditRestriction}
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

export default StorageBucketForm;
