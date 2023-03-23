import React, { FC } from "react";
import {
  CheckboxInput,
  Input,
  Label,
  Select,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStorages } from "api/storages";
import { LxdDiskDevice } from "types/device";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { figureInheritedRootStorage } from "util/formFields";
import { fetchProfiles } from "api/profiles";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { getConfigurationRowBase } from "pages/instances/forms/ConfigurationRow";
import Loader from "components/Loader";
import { useNotify } from "context/notify";

interface Props {
  formik: SharedFormikTypes;
  project: string;
}

const RootStorageForm: FC<Props> = ({ formik, project }) => {
  const notify = useNotify();

  const {
    data: profiles = [],
    isLoading,
    error: profileError,
  } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project),
  });

  if (profileError) {
    notify.failure("Could not load profiles.", profileError);
  }

  const {
    data: storagePools = [],
    isLoading: isStorageLoading,
    error: storageError,
  } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStorages(project),
  });

  if (storageError) {
    notify.failure("Could not load storages.", storageError);
  }

  if (isLoading || isStorageLoading) {
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
    });
    formik.setFieldValue("devices", copy);
    setTimeout(() => document.getElementById("rootStoragePool")?.focus(), 100);
  };

  const removeRootStorage = () => {
    const copy = [...formik.values.devices];
    copy.splice(index, 1);
    formik.setFieldValue("devices", copy);
  };

  const getStoragePoolOptions = () => {
    const options = storagePools.map((storagePool) => {
      return {
        label: storagePool.name,
        value: storagePool.name,
      };
    });
    options.unshift({
      label:
        storagePools.length === 0
          ? "No storage pool available"
          : "Select option",
      value: "",
    });
    return options;
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

  const getValue = () => {
    if (!hasRootStorage) {
      return <div>{inheritedValue}</div>;
    }
    if (isReadOnly) {
      return <div>{(formik.values.devices[index] as LxdDiskDevice).pool}</div>;
    }
    return (
      <div>
        <Select
          id="rootStoragePool"
          name={`devices.${index}.pool`}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={(formik.values.devices[index] as LxdDiskDevice).pool}
          options={getStoragePoolOptions()}
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
    );
  };

  const getLabel = () =>
    hasRootStorage ? (
      <Label forId="rootStoragePool">
        <b>Root storage pool</b>
      </Label>
    ) : (
      <div>
        <b>Root storage pool</b>
      </div>
    );

  return (
    <ConfigurationTable
      formik={formik}
      rows={[
        getConfigurationRowBase({
          override: (
            <CheckboxInput
              label={undefined}
              checked={hasRootStorage}
              onChange={hasRootStorage ? removeRootStorage : addRootStorage}
            />
          ),
          label: getLabel(),
          value: getValue(),
          defined: hasRootStorage
            ? `Current ${formik.values.type}`
            : inheritSource,
        }),
      ]}
    />
  );
};

export default RootStorageForm;
