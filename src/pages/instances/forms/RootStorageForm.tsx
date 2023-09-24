import React, { FC } from "react";
import {
  Button,
  Icon,
  Input,
  Label,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePools } from "api/storage-pools";
import { LxdDiskDevice } from "types/device";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { fetchProfiles } from "api/profiles";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import Loader from "components/Loader";
import { figureInheritedRootStorage } from "util/instanceConfigInheritance";
import classnames from "classnames";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";

interface Props {
  formik: SharedFormikTypes;
  project: string;
}

const RootStorageForm: FC<Props> = ({ formik, project }) => {
  const notify = useNotify();

  const {
    data: profiles = [],
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project),
  });

  if (profileError) {
    notify.failure("Loading profiles failed", profileError);
  }

  const {
    data: storagePools = [],
    isLoading: isStorageLoading,
    error: storageError,
  } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(project),
  });

  if (storageError) {
    notify.failure("Loading storage pools failed", storageError);
  }

  if (isProfileLoading || isStorageLoading) {
    return <Loader />;
  }

  const index = formik.values.devices.findIndex(
    (item) => item.type === "disk" && item.name === "root"
  );
  const hasRootStorage = index !== -1;

  const addRootStorage = () => {
    const copy = [...formik.values.devices];
    copy.push({
      type: "disk",
      name: "root",
      path: "/",
      pool: storagePools[0]?.name ?? undefined,
    });
    formik.setFieldValue("devices", copy);
    setTimeout(() => document.getElementById("rootStoragePool")?.focus(), 100);
  };

  const removeRootStorage = () => {
    const copy = [...formik.values.devices];
    copy.splice(index, 1);
    formik.setFieldValue("devices", copy);
  };

  const figureSizeValue = () => {
    if (!hasRootStorage) {
      return "";
    }
    const size = (formik.values.devices[index] as LxdDiskDevice).size;
    return size ? parseInt(size) : "";
  };

  const [inheritedValue, inheritSource] = figureInheritedRootStorage(
    formik.values,
    profiles
  );

  const isReadOnly = (formik.values as EditInstanceFormValues).readOnly;

  const getInheritedValue = () => {
    return <div>{inheritedValue}</div>;
  };

  const getOverrideValue = () => {
    return hasRootStorage ? (
      <div>{(formik.values.devices[index] as LxdDiskDevice).pool}</div>
    ) : (
      "-"
    );
  };

  const getForm = () => {
    return (
      <div className="override-form">
        <div>
          <StoragePoolSelector
            project={project}
            value={(formik.values.devices[index] as LxdDiskDevice).pool}
            setValue={(value) =>
              formik.setFieldValue(`devices.${index}.pool`, value)
            }
          />
          <Input
            id="sizeLimit"
            label="Size limit in GB"
            onBlur={formik.handleBlur}
            onChange={(e) => {
              formik.setFieldValue(
                `devices.${index}.size`,
                e.target.value + "GB"
              );
            }}
            value={figureSizeValue()}
            type="number"
            placeholder="Enter number"
          />
        </div>
        <div>
          <Button
            onClick={removeRootStorage}
            type="button"
            appearance="base"
            title="Clear override"
          >
            <Icon name="close" className="clear-configuration-icon" />
          </Button>
        </div>
      </div>
    );
  };

  const getLabel = () =>
    hasRootStorage ? (
      <Label forId="rootStoragePool">
        <b>Root storage pool</b>
      </Label>
    ) : (
      <b>Root storage pool</b>
    );

  return (
    <ConfigurationTable
      rows={[
        getConfigurationRowBase({
          configuration: getLabel(),
          inherited: (
            <div
              className={classnames({
                "u-text--muted": hasRootStorage,
                "u-text--line-through": hasRootStorage,
              })}
            >
              <div className="mono-font">
                <b>{getInheritedValue()}</b>
              </div>
              {inheritSource !== "LXD" && (
                <div className="p-text--small u-text--muted">
                  From: {inheritSource}
                </div>
              )}
            </div>
          ),
          override: isReadOnly ? (
            getOverrideValue()
          ) : hasRootStorage ? (
            getForm()
          ) : (
            <Button
              onClick={addRootStorage}
              type="button"
              appearance="base"
              title="Create override"
            >
              <Icon name="edit" />
            </Button>
          ),
        }),
      ]}
    />
  );
};

export default RootStorageForm;
