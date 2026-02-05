import type { FC } from "react";
import { Input, Select, Textarea } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import type { NetworkFormValues } from "types/forms/network";
import ConfigurationTable from "components/ConfigurationTable";
import { DNS } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { bridgeType, physicalType } from "util/networks";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  filterRows: (rows: MainTableRow[]) => MainTableRow[];
}

const NetworkFormDns: FC<Props> = ({ formik, filterRows }) => {
  const rows = filterRows([
    ...(formik.values.networkType !== physicalType
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

    ...(formik.values.networkType === bridgeType
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

    ...(formik.values.networkType === physicalType
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
  ]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="p-heading--4" id={slugify(DNS)}>
        DNS
      </h2>
      <ConfigurationTable rows={rows} />
    </>
  );
};

export default NetworkFormDns;
