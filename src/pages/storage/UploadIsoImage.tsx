import React, { FC, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { Button, Input, Select, useNotify } from "@canonical/react-components";
import { createIsoStorageVolume, fetchStoragePools } from "api/storage-pools";
import SubmitButton from "components/SubmitButton";
import { useProject } from "context/project";
import Loader from "components/Loader";
import NotificationRow from "components/NotificationRow";
import ProgressBar from "components/ProgressBar";
import { UploadState } from "types/storage";
import { humanFileSize } from "util/helpers";
import UploadIsoImageHint from "pages/storage/UploadIsoImageHint";

interface Props {
  onFinish: (name: string, pool: string) => void;
  onCancel: () => void;
}

const UploadIsoImage: FC<Props> = ({ onCancel, onFinish }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { project } = useProject();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [isLoading, setLoading] = useState(false);
  const [pool, setPool] = useState("");
  const [uploadState, setUploadState] = useState<UploadState | null>(null);

  useEffect(() => {
    notify.clear();
  }, []);

  const {
    data: storagePools = [],
    isLoading: isStorageLoading,
    error: storageError,
  } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(project?.name ?? ""),
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
    notify.clear();
    setLoading(true);
    createIsoStorageVolume(
      pool,
      file,
      name,
      project?.name ?? "",
      setUploadState
    )
      .then(() => {
        onFinish(file.name, pool);
      })
      .catch((e) => {
        notify.failure("ISO import failed", e);
      })
      .finally(() => {
        setLoading(false);
        setUploadState(null);
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
      setName(file.name);
    }
  };

  return (
    <>
      {notify.notification ? <NotificationRow /> : <UploadIsoImageHint />}
      <div className={uploadState === null ? "" : "u-hide"}>
        <Input
          name="iso"
          type="file"
          id="iso-image"
          label="ISO image"
          onChange={changeFile}
        />
        <Input
          name="name"
          type="text"
          id="name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={file === null}
        />
        <Select
          label="Storage pool"
          id="storagePool"
          options={storagePools.map((pool) => ({
            label: pool.name,
            value: pool.name,
          }))}
          onChange={(e) => {
            setPool(e.target.value);
          }}
          value={pool}
          disabled={file === null}
        />
      </div>
      {uploadState && (
        <>
          <ProgressBar percentage={Math.floor(uploadState.percentage)} />
          <p>
            {humanFileSize(uploadState.loaded)} loaded of{" "}
            {humanFileSize(uploadState.total ?? 0)}
          </p>
          {uploadState.loaded === uploadState.total && (
            <Loader text="Validating ISO" />
          )}
        </>
      )}
      <footer className="p-modal__footer">
        <Button onClick={onCancel}>Cancel</Button>
        <SubmitButton
          isSubmitting={isLoading}
          isDisabled={!file}
          buttonLabel="Upload"
          onClick={importIsoFile}
        />
      </footer>
    </>
  );
};

export default UploadIsoImage;
