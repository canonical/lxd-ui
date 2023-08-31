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
import UploadCustomImageHint from "pages/storage/UploadCustomImageHint";

interface Props {
  onFinish: (name: string, pool: string) => void;
  onCancel: () => void;
}

const UploadCustomIso: FC<Props> = ({ onCancel, onFinish }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { project } = useProject();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [isLoading, setLoading] = useState(false);
  const [pool, setPool] = useState("");
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [uploadAbort, setUploadAbort] = useState<AbortController | null>(null);

  useEffect(() => {
    notify.clear();
  }, []);

  const projectName = project?.name ?? "";

  const {
    data: pools = [],
    isLoading: arePoolsLoading,
    error: poolError,
  } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(projectName),
  });

  if (poolError) {
    notify.failure("Loading storage pools failed", poolError);
    onCancel();
  }

  if (arePoolsLoading) {
    return <Loader />;
  }

  if (pools.length > 0 && !pool) {
    setPool(pools[0].name);
  }

  const handleCancel = () => {
    uploadAbort?.abort();
    onCancel();
  };

  const importFile = () => {
    if (!file) {
      return;
    }
    notify.clear();
    setLoading(true);
    const uploadController = new AbortController();
    setUploadAbort(uploadController);
    createIsoStorageVolume(
      pool,
      file,
      name,
      projectName,
      setUploadState,
      uploadController
    )
      .then(() => {
        onFinish(name, pool);
      })
      .catch((e) => {
        notify.failure("Image import failed", e);
      })
      .finally(() => {
        setLoading(false);
        setUploadState(null);
        void queryClient.invalidateQueries([
          queryKeys.storage,
          pool,
          queryKeys.volumes,
          projectName,
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
      {notify.notification ? <NotificationRow /> : <UploadCustomImageHint />}
      <div className={uploadState === null ? "" : "u-hide"}>
        <Input
          name="iso"
          type="file"
          id="iso-image"
          label="Local file"
          onChange={changeFile}
          stacked
        />
        <Input
          name="name"
          type="text"
          id="name"
          label="Alias"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={file === null}
          stacked
        />
        <Select
          label="Storage pool"
          id="storagePool"
          options={pools.map((pool) => ({
            label: pool.name,
            value: pool.name,
          }))}
          onChange={(e) => {
            setPool(e.target.value);
          }}
          value={pool}
          disabled={file === null}
          stacked
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
        <Button onClick={handleCancel} className="u-no-margin--bottom">
          Cancel
        </Button>
        <SubmitButton
          isSubmitting={isLoading}
          isDisabled={!file}
          buttonLabel="Upload"
          className="u-no-margin--bottom"
          onClick={importFile}
        />
      </footer>
    </>
  );
};

export default UploadCustomIso;
