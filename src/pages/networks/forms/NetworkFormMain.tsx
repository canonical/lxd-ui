import React, { FC, ReactNode } from "react";
import { Col, Input, Row, Select, Textarea } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import IpAddressSelector from "pages/networks/forms/IpAddressSelector";
import ConfigurationTable from "components/ConfigurationTable";
import { getNetworkConfigurationRow } from "pages/networks/forms/NetworkConfigurationRow";
import UplinkSelector from "pages/networks/forms/UplinkSelector";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import NetworkTypeSelector from "pages/networks/forms/NetworkTypeSelector";
import { optionTrueFalse } from "util/instanceOptions";
import { getTextareaRows } from "util/formFields";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  project: string;
}

const NetworkFormMain: FC<Props> = ({ formik, project }) => {
  const getFormProps = (id: "type" | "network" | "name" | "description") => {
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

  return (
    <>
      <Row>
        <Col size={8}>
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
          <Textarea
            {...getFormProps("description")}
            label="Description"
            disabled={formik.values.readOnly}
            rows={getTextareaRows(formik.values.description?.length)}
          />
          {formik.values.type === "ovn" && (
            <UplinkSelector
              props={getFormProps("network")}
              project={project}
              isDisabled={formik.values.readOnly}
            />
          )}
        </Col>
      </Row>
      <ConfigurationTable
        rows={[
          getNetworkConfigurationRow({
            formik: formik,
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

          ...(formik.values.ipv4_address !== "none"
            ? [
                getNetworkConfigurationRow({
                  formik: formik,
                  name: "ipv4_nat",
                  label: "IPv4 NAT",
                  defaultValue: "",
                  children: <Select options={optionTrueFalse} />,
                }),
              ]
            : []),

          getNetworkConfigurationRow({
            formik: formik,
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

          ...(formik.values.ipv6_address !== "none"
            ? [
                getNetworkConfigurationRow({
                  formik: formik,
                  name: "ipv6_nat",
                  label: "IPv6 NAT",
                  defaultValue: "",
                  children: <Select options={optionTrueFalse} />,
                }),
              ]
            : []),
        ]}
      />
    </>
  );
};

export default NetworkFormMain;
