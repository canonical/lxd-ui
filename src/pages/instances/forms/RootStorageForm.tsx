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
import OverrideTable from "pages/instances/forms/OverrideTable";
import { figureInheritedRootStorage } from "util/formFields";
import { fetchProfiles } from "api/profiles";

interface Props {
  formik: SharedFormikTypes;
  project: string;
}

const RootStorageForm: FC<Props> = ({ formik, project }) => {
  const { data: profiles = [] } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project),
  });

  const { data: storagePools = [] } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStorages(project),
  });

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

  return (
    <OverrideTable
      rows={[
        {
          columns: [
            {
              content: (
                <CheckboxInput
                  label={undefined}
                  checked={hasRootStorage}
                  onChange={hasRootStorage ? removeRootStorage : addRootStorage}
                />
              ),
            },
            {
              content: hasRootStorage ? (
                <Label forId="rootStoragePool">Root storage pool</Label>
              ) : (
                "Root storage pool"
              ),
            },
            {
              content: hasRootStorage ? (
                <div>
                  <Select
                    id="rootStoragePool"
                    name={`devices.${index}.pool`}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={(formik.values.devices[index] as LxdDiskDevice).pool}
                    options={getStoragePoolOptions()}
                    autoFocus
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
              ) : (
                inheritedValue
              ),
            },
            {
              content: hasRootStorage
                ? `Current ${formik.values.type}`
                : inheritSource,
            },
          ],
        },
      ]}
    />
  );
};

export default RootStorageForm;
