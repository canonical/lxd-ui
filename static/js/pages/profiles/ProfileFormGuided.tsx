import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, Col, Form, Input, Row } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import Aside from "components/Aside";
import NotificationRow from "components/NotificationRow";
import PanelHeader from "components/PanelHeader";
import useNotification from "util/useNotification";
import { createProfile } from "api/profiles";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import NetworkSelector from "pages/networks/NetworkSelector";
import { LxdDevices } from "types/device";
import StorageSelector from "pages/storages/StorageSelector";
import CpuLimitSelector from "./CpuLimitSelector";
import CloudInitConfig from "./CloudInitConfig";
import { LxdConfigPair } from "types/config";
import { LxdProfile } from "types/profile";
import MemoryLimitSelector from "./MemoryLimitSelector";
import { CpuLimit, CPU_LIMIT_TYPE } from "types/limits";
import {
  DEFAULT_CPU_LIMIT,
  DEFAULT_DISK_DEVICE,
  DEFAULT_MEM_LIMIT,
  DEFAULT_NIC_DEVICE,
} from "util/defaults";

const getCpuLimit = (cpuLimit: CpuLimit) => {
  switch (cpuLimit.selectedType) {
    case CPU_LIMIT_TYPE.DYNAMIC:
      if (cpuLimit.dynamicValue) {
        return `${cpuLimit.dynamicValue}`;
      }
      return null;
    case CPU_LIMIT_TYPE.FIXED_RANGE:
      if (!cpuLimit.rangeValue) return null;
      if (
        cpuLimit.rangeValue.from !== null &&
        cpuLimit.rangeValue.to !== null
      ) {
        return `${cpuLimit.rangeValue.from}-${cpuLimit.rangeValue.to}`;
      }
      return null;
    case CPU_LIMIT_TYPE.FIXED_SET:
      if (cpuLimit.setValue) {
        if (cpuLimit.setValue.includes(",")) {
          return cpuLimit.setValue;
        }
        const singleValue = +cpuLimit.setValue;
        return `${singleValue}-${singleValue}`;
      }
      return null;
  }
};

const ProfileFormGuided: FC = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const queryClient = useQueryClient();

  const ProfileSchema = Yup.object().shape({
    name: Yup.string().required("This field is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      nicDevice: DEFAULT_NIC_DEVICE,
      rootDiskDevice: DEFAULT_DISK_DEVICE,
      cpuLimit: DEFAULT_CPU_LIMIT,
      memoryLimit: DEFAULT_MEM_LIMIT,
      userDataConfig: "\n\n",
      vendorDataConfig: "\n\n",
      networkConfig: "\n\n",
    },
    validationSchema: ProfileSchema,
    onSubmit: ({
      name,
      description,
      nicDevice,
      rootDiskDevice,
      cpuLimit,
      memoryLimit,
      userDataConfig,
      vendorDataConfig,
      networkConfig,
    }) => {
      const config: LxdConfigPair = {};
      const limitsCpu = getCpuLimit(cpuLimit);
      if (limitsCpu) {
        config["limits.cpu"] = limitsCpu;
      }
      if (memoryLimit.value) {
        config["limits.memory"] = `${memoryLimit.value}${memoryLimit.unit}`;
      }
      if (userDataConfig.trim()) {
        config["cloud-init.user-data"] = `|\n${userDataConfig.trim()}`;
      }
      if (vendorDataConfig.trim()) {
        config["cloud-init.vendor-data"] = `|\n${vendorDataConfig.trim()}`;
      }
      if (networkConfig.trim()) {
        config["cloud-init.network-config"] = `|\n${networkConfig.trim()}`;
      }

      const devices: LxdDevices = {};
      if (nicDevice.network) {
        devices[
          nicDevice.name && nicDevice.name !== ""
            ? nicDevice.name
            : nicDevice.network
        ] = nicDevice;
      }
      if (rootDiskDevice.pool) {
        devices.root = rootDiskDevice;
      }

      const profile: LxdProfile = {
        config: config,
        description: description,
        devices: devices,
        name: name,
      };

      createProfile(profile)
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.profiles],
          });
          navigate("/profiles");
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Error on profile creation.", e);
        });
    },
  });

  return (
    <Aside>
      <div className="p-panel">
        <PanelHeader title={<h4>Create profile</h4>} />
        <div className="p-panel__content">
          <NotificationRow notify={notify} />
          <Row>
            <Form onSubmit={formik.handleSubmit} stacked>
              <Input
                id="name"
                name="name"
                type="text"
                label="Profile name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.name}
                error={formik.touched.name ? formik.errors.name : null}
                required
                stacked
              />
              <Input
                id="description"
                name="description"
                type="text"
                label="Description"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.description}
                error={
                  formik.touched.description ? formik.errors.description : null
                }
                stacked
              />
              <Accordion
                titleElement="h5"
                sections={[
                  {
                    content: (
                      <NetworkSelector
                        notify={notify}
                        nicDevice={formik.values.nicDevice}
                        setNicDevice={(nicDevice) =>
                          void formik.setFieldValue("nicDevice", nicDevice)
                        }
                      />
                    ),
                    title: "Network",
                  },
                  {
                    content: (
                      <StorageSelector
                        notify={notify}
                        diskDevice={formik.values.rootDiskDevice}
                        setDiskDevice={(diskDevice) =>
                          void formik.setFieldValue(
                            "rootDiskDevice",
                            diskDevice
                          )
                        }
                        hasPathInput={false}
                      />
                    ),
                    title: "Root storage",
                  },
                  {
                    content: (
                      <>
                        <MemoryLimitSelector
                          notify={notify}
                          memoryLimit={formik.values.memoryLimit}
                          setMemoryLimit={(memoryLimit) =>
                            void formik.setFieldValue(
                              "memoryLimit",
                              memoryLimit
                            )
                          }
                        />
                        <hr />
                        <CpuLimitSelector
                          notify={notify}
                          cpuLimit={formik.values.cpuLimit}
                          setCpuLimit={(cpuLimit) =>
                            void formik.setFieldValue("cpuLimit", cpuLimit)
                          }
                        />
                      </>
                    ),
                    title: "Resource limits",
                  },
                  {
                    content: (
                      <>
                        <CloudInitConfig
                          title="cloud-init.user-data"
                          config={formik.values.userDataConfig}
                          setConfig={(config) =>
                            void formik.setFieldValue("userDataConfig", config)
                          }
                        />
                        <CloudInitConfig
                          title="cloud-init.vendor-data"
                          config={formik.values.vendorDataConfig}
                          setConfig={(config) =>
                            void formik.setFieldValue(
                              "vendorDataConfig",
                              config
                            )
                          }
                        />
                        <CloudInitConfig
                          title="cloud-init.network-config"
                          config={formik.values.networkConfig}
                          setConfig={(config) =>
                            void formik.setFieldValue("networkConfig", config)
                          }
                        />
                      </>
                    ),
                    title: "cloud-init config",
                  },
                ]}
              />
              <hr />
              <Row className="u-align--right">
                <Col size={12}>
                  <SubmitButton
                    isSubmitting={formik.isSubmitting}
                    isDisabled={!formik.isValid}
                    buttonLabel="Create profile"
                  />
                </Col>
              </Row>
            </Form>
          </Row>
        </div>
      </div>
    </Aside>
  );
};

export default ProfileFormGuided;
