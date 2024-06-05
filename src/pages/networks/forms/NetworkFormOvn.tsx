import { FC } from "react";
import { Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkFormOvn: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "ovn_ingress_mode",
          label: "OVN ingress mode",
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
                  label: "l2proxy",
                  value: "l2proxy",
                },
                {
                  label: "routed",
                  value: "routed",
                },
              ]}
            />
          ),
        }),
      ]}
    />
  );
};

export default NetworkFormOvn;
