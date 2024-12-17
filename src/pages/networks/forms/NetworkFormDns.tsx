import { FC } from "react";
import { Input, Select, Textarea } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import ConfigurationTable from "components/ConfigurationTable";
import { DNS } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  filterRows: (rows: MainTableRow[]) => MainTableRow[];
}

const NetworkFormDns: FC<Props> = ({ formik, filterRows }) => {
  return (
    <>
      <h2 className="p-heading--4" id={slugify(DNS)}>
        DNS
      </h2>
      <ConfigurationTable
        rows={filterRows([
          ...(formik.values.networkType !== "physical"
            ? [
                getConfigurationRow({
                  formik,
                  name: "dns_domain",
                  label: "DNS domain",
                  defaultValue: "",
                  children: <Input type="text" />,
                }),
              ]
            : []),

          ...(formik.values.networkType === "bridge"
            ? [
                getConfigurationRow({
                  formik,
                  name: "dns_mode",
                  label: "DNS mode",
                  defaultValue: "",
                  children: (
                    <Select
                      options={[
                        {
                          label: "Select option",
                          value: "",
                          disabled: true,
                        },
                        {
                          label: "None",
                          value: "none",
                        },
                        {
                          label: "Managed",
                          value: "managed",
                        },
                        {
                          label: "Dynamic",
                          value: "dynamic",
                        },
                      ]}
                    />
                  ),
                }),
              ]
            : []),

          ...(formik.values.networkType === "physical"
            ? [
                getConfigurationRow({
                  formik,
                  name: "dns_nameservers",
                  label: "DNS nameservers",
                  defaultValue: "",
                  children: <Input type="text" />,
                }),
              ]
            : [
                getConfigurationRow({
                  formik,
                  name: "dns_search",
                  label: "DNS search",
                  defaultValue: "",
                  children: <Textarea />,
                }),
              ]),
        ])}
      />
    </>
  );
};

export default NetworkFormDns;
