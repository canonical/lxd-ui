import type { FC, ReactNode } from "react";
import { Form, Input } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import StoragePoolSelector from "../StoragePoolSelector";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import type { LxdStorageBucket } from "types/storage";
import { cephObject, storageDriverLabels } from "util/storageOptions";

export interface StorageBucketFormValues {
  name: string;
  pool: string;
  size?: string;
  description?: string;
  target?: string;
}

interface Props {
  formik: FormikProps<StorageBucketFormValues>;
  isEditing?: boolean;
  bucket?: LxdStorageBucket;
}

const StorageBucketForm: FC<Props> = ({ formik, isEditing = true, bucket }) => {
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
        disabled={!!bucketEditRestriction}
        title={bucketEditRestriction}
      />

      <StoragePoolSelector
        value={formik.values.pool}
        setValue={(value) => void formik.setFieldValue("pool", value)}
        invalidDrivers={Object.keys(storageDriverLabels).filter((key) => {
          return key !== cephObject;
        })}
        selectProps={{
          id: "bucket-create-pool",
          label: "Storage pool",
          disabled: !!bucketEditRestriction,
          help: "Pool must have a Ceph Object driver",
        }}
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
