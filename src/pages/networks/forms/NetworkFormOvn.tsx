import { FC } from "react";
import { Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import ConfigurationTable from "components/ConfigurationTable";
import { OVN } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkFormOvn: FC<Props> = ({ formik }) => {
  return (
    <>
      <h2 className="p-heading--4" id={slugify(OVN)}>
        OVN
      </h2>
      <ConfigurationTable
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
    </>
  );
};

export default NetworkFormOvn;
