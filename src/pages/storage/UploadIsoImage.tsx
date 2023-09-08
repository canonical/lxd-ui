import React, { FC, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  Input,
  Modal,
  Notification,
  Select,
  useNotify,
} from "@canonical/react-components";
import { createIsoStorageVolume, fetchStoragePools } from "api/storage-pools";
import SubmitButton from "components/SubmitButton";
import { useProject } from "context/project";
import Loader from "components/Loader";

interface Props {
  onFinish: (name: string, pool: string) => void;
  onCancel: () => void;
}

const UploadIsoImage: FC<Props> = ({ onCancel, onFinish }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { project } = useProject();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [pool, setPool] = useState("");

  const {
    data: storagePools = [],
    isLoading: isStorageLoading,
    error: storageError,
  } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(project?.name || ""),
  });

  if (storageError) {
    notify.failure("Loading storage pools failed", storageError);
    onCancel();
  }

  if (isStorageLoading) {
    return <Loader />;
  }

  if (storagePools.length > 0 && !pool) {
    setPool(storagePools[0].name);
  }

  const importIsoFile = () => {
    if (!file) {
      return;
    }
    setLoading(true);
    createIsoStorageVolume(pool, file, project?.name ?? "")
      .then(() => {
        onFinish(file.name, pool);
      })
      .catch((e) => {
        notify.failure("ISO import failed", e);
        onCancel();
      })
      .finally(() => {
        setLoading(false);
        void queryClient.invalidateQueries([
          queryKeys.storage,
          pool,
          queryKeys.volumes,
        ]);
      });
  };

  const changeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setFile(file);
    }
  };

  return (
    <Modal
      close={onCancel}
      title="Upload ISO image"
      className="upload-iso-image"
    >
      <Notification severity="caution" title="Custom ISO images">
        Image must be prepared with distrobuilder.{" "}
        <a
          href="https://discourse.ubuntu.com/t/how-to-install-a-windows-11-vm-using-lxd/28940"
          target="_blank"
          rel="noreferrer"
        >
          Learn more
        </a>
      </Notification>
      <Input
        name="iso"
        type="file"
        id="iso-image"
        label="ISO image"
        onChange={changeFile}
      />
      <Select
        label="Storage target"
        id="storagePool"
        options={storagePools.map((pool) => ({
          label: pool.name,
          value: pool.name,
        }))}
        onChange={(e) => {
          setPool(e.target.value);
        }}
        value={pool}
      />
      <SubmitButton
        isSubmitting={isLoading}
        isDisabled={!file}
        buttonLabel="Upload"
        onClick={importIsoFile}
      />
    </Modal>
  );
};

export default UploadIsoImage;
