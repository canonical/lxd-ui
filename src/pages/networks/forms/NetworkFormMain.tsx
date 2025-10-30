import type { FC, ReactNode } from "react";
import { Input, Label } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import UplinkSelector from "pages/networks/forms/UplinkSelector";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import {
  typesWithAcls,
  typesWithParent,
  typesWithStatistics,
  macvlanType,
  ovnType,
  sriovType,
  physicalType,
} from "util/networks";
import NetworkParentSelector from "pages/networks/forms/NetworkParentSelector";
import { ensureEditMode } from "util/instanceEdit";
import { GENERAL } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import NetworkProfiles from "./NetworkProfiles";
import IpAddressSelector from "pages/networks/forms/IpAddressSelector";
import IpAddress from "pages/networks/forms/IpAddress";
import { getConfigurationRow } from "components/ConfigurationRow";
import NetworkStatistics from "pages/networks/forms/NetworkStatistics";
import NetworkDescriptionField from "pages/networks/forms/NetworkDescriptionField";
import { renderNetworkType } from "util/networks";
import NetworkAddresses from "pages/networks/forms/NetworkAddresses";
import NetworkAcls from "pages/networks/forms/NetworkAcls";
import NetworkVlanField from "pages/networks/forms/NetworkVlanField";
import NetworkMTUField from "pages/networks/forms/NetworkMTUField";
import NetworkGVRPField from "pages/networks/forms/NetworkGVRPField";
import NetworkTypeSelector from "pages/networks/forms/NetworkTypeSelector";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  project: string;
  isClustered: boolean;
}

const NetworkFormMain: FC<Props> = ({ formik, project, isClustered }) => {
  const getFormProps = (id: "network" | "name" | "description" | "parent") => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: (e: unknown) => {
        ensureEditMode(formik);
        formik.handleChange(e);
      },
      value: formik.values[id] ?? "",
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `Enter ${id.replaceAll("_", " ")}`,
    };
  };

  const isManagedNetwork = formik.values.bareNetwork?.managed ?? true;
  const hasParent = typesWithParent.includes(formik.values.networkType);

  return (
    <>
      <h2 className="p-heading--4" id={slugify(GENERAL)}>
        General
      </h2>
      <div className="u-sv3">
        <div className="general-field">
          <div className="general-field-label">
            <Label forId="networkType">Type</Label>
          </div>
          <div className="general-field-content">
            {formik.values.isCreating ? (
              <NetworkTypeSelector formik={formik} />
            ) : (
              renderNetworkType(formik.values.networkType)
            )}
          </div>
        </div>
        {!isManagedNetwork && (
          <>
            <div className="general-field">
              <div className="general-field-label">
                <Label forId="networkType">Managed</Label>
              </div>
              <div className="general-field-content">No</div>
            </div>
          </>
        )}
        {formik.values.isCreating && (
          <div className="general-field">
            <div className="general-field-label">
              <Label forId="name" required={formik.values.isCreating}>
                Name
              </Label>
            </div>
            <div className="general-field-content">
              <Input {...getFormProps("name")} type="text" required />
            </div>
          </div>
        )}
        {isManagedNetwork && (
          <NetworkDescriptionField
            formik={formik}
            props={getFormProps("description")}
          />
        )}
        {formik.values.networkType === ovnType && isManagedNetwork && (
          <UplinkSelector
            props={getFormProps("network")}
            project={project}
            formik={formik}
          />
        )}
        {hasParent && isManagedNetwork && (
          <NetworkParentSelector
            props={getFormProps("parent")}
            formik={formik}
            isClustered={isClustered}
          />
        )}
        {formik.values.networkType === physicalType && (
          <>
            <NetworkMTUField formik={formik} />
            <NetworkVlanField formik={formik} />
          </>
        )}
        {formik.values.networkType === macvlanType && (
          <>
            <NetworkMTUField formik={formik} />
            <NetworkVlanField formik={formik} />
            <NetworkGVRPField formik={formik} />
          </>
        )}
        {formik.values.networkType === sriovType && (
          <>
            <NetworkMTUField formik={formik} />
            <NetworkVlanField formik={formik} />
          </>
        )}
        {typesWithAcls.includes(formik.values.networkType) &&
          isManagedNetwork && <NetworkAcls project={project} formik={formik} />}
        {!hasParent && isManagedNetwork && (
          <>
            <IpAddress
              row={getConfigurationRow({
                formik,
                name: "ipv4_address",
                label: "IPv4 address",
                defaultValue: "auto",
                children: (
                  <IpAddressSelector
                    id="ipv4_address"
                    family="IPv4"
                    address={formik.values.ipv4_address}
                    setAddress={(value) => {
                      formik.setFieldValue("ipv4_address", value);

                      if (value === "none") {
                        const nullFields = [
                          "ipv4_nat",
                          "ipv4_dhcp",
                          "ipv4_dhcp_expiry",
                          "ipv4_dhcp_ranges",
                        ];
                        nullFields.forEach(
                          (field) =>
                            void formik.setFieldValue(field, undefined),
                        );
                      }
                    }}
                  />
                ),
              })}
            />

            <IpAddress
              row={getConfigurationRow({
                formik,
                name: "ipv6_address",
                label: "IPv6 address",
                defaultValue: "auto",
                children: (
                  <IpAddressSelector
                    id="ipv6_address"
                    family="IPv6"
                    address={formik.values.ipv6_address}
                    setAddress={(value) => {
                      formik.setFieldValue("ipv6_address", value);

                      if (value === "none") {
                        const nullFields = [
                          "ipv6_nat",
                          "ipv6_dhcp",
                          "ipv6_dhcp_expiry",
                          "ipv6_dhcp_ranges",
                          "ipv6_dhcp_stateful",
                          "ipv6_ovn_ranges",
                        ];
                        nullFields.forEach(
                          (field) =>
                            void formik.setFieldValue(field, undefined),
                        );
                      }
                    }}
                  />
                ),
              })}
            />
          </>
        )}
        {!formik.values.isCreating &&
          typesWithStatistics.includes(formik.values.networkType) && (
            <NetworkStatistics formik={formik} project={project} />
          )}
        {!isManagedNetwork && (
          <NetworkAddresses formik={formik} project={project} />
        )}
        {!formik.values.isCreating && isManagedNetwork && (
          <NetworkProfiles project={project} formik={formik} />
        )}
      </div>
    </>
  );
};

export default NetworkFormMain;
