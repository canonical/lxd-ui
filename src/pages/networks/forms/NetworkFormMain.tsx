import { FC, ReactNode } from "react";
import { Col, Input, Row, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import IpAddressSelector from "pages/networks/forms/IpAddressSelector";
import ConfigurationTable from "components/ConfigurationTable";
import { getConfigurationRow } from "components/ConfigurationRow";
import UplinkSelector from "pages/networks/forms/UplinkSelector";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import NetworkTypeSelector from "pages/networks/forms/NetworkTypeSelector";
import { optionTrueFalse } from "util/instanceOptions";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";
import NetworkParentSelector from "pages/networks/forms/NetworkParentSelector";
import { ensureEditMode } from "util/instanceEdit";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  project: string;
}

const NetworkFormMain: FC<Props> = ({ formik, project }) => {
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

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <NetworkTypeSelector formik={formik} />
          <Input
            {...getFormProps("name")}
            type="text"
            label="Name"
            required
            disabled={formik.values.readOnly || !formik.values.isCreating}
            help={
              !formik.values.isCreating
                ? "Click the name in the header to rename the network"
                : undefined
            }
          />
          <AutoExpandingTextArea
            {...getFormProps("description")}
            label="Description"
            dynamicHeight
          />
          {formik.values.networkType === "ovn" && (
            <UplinkSelector props={getFormProps("network")} project={project} />
          )}
          {formik.values.networkType === "physical" &&
            formik.values.isCreating && (
              <NetworkParentSelector props={getFormProps("parent")} />
            )}
        </Col>
      </Row>
      {formik.values.networkType !== "physical" && (
        <ConfigurationTable
          rows={[
            getConfigurationRow({
              formik,
              name: "ipv4_address",
              label: "IPv4 address",
              defaultValue: "auto",
              children: (
                <IpAddressSelector
                  id="ipv4_address"
                  address={formik.values.ipv4_address}
                  setAddress={(value) => {
                    void formik.setFieldValue("ipv4_address", value);

                    if (value === "none") {
                      const nullFields = [
                        "ipv4_nat",
                        "ipv4_dhcp",
                        "ipv4_dhcp_expiry",
                        "ipv4_dhcp_ranges",
                      ];
                      nullFields.forEach(
                        (field) => void formik.setFieldValue(field, undefined),
                      );
                    }
                  }}
                />
              ),
            }),

            getConfigurationRow({
              formik,
              name: "ipv4_nat",
              label: "IPv4 NAT",
              defaultValue: "",
              children: <Select options={optionTrueFalse} />,
              disabled: formik.values.ipv4_address === "none",
              disabledReason: "IPv4 address is set to none",
            }),

            getConfigurationRow({
              formik,
              name: "ipv6_address",
              label: "IPv6 address",
              defaultValue: "auto",
              children: (
                <IpAddressSelector
                  id="ipv6_address"
                  address={formik.values.ipv6_address}
                  setAddress={(value) => {
                    void formik.setFieldValue("ipv6_address", value);

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
                        (field) => void formik.setFieldValue(field, undefined),
                      );
                    }
                  }}
                />
              ),
            }),

            getConfigurationRow({
              formik,
              name: "ipv6_nat",
              label: "IPv6 NAT",
              defaultValue: "",
              children: <Select options={optionTrueFalse} />,
              disabled: formik.values.ipv6_address === "none",
              disabledReason: "IPv6 address is set to none",
            }),
          ]}
        />
      )}
    </ScrollableForm>
  );
};

export default NetworkFormMain;
