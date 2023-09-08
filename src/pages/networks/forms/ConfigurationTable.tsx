import React, { FC, ReactNode } from "react";
import { MainTable } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { FormikProps } from "formik/dist/types";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  rows: MainTableRow[];
  configurationExtra?: ReactNode;
  emptyStateMsg?: string;
}

const ConfigurationTable: FC<Props> = ({ rows, emptyStateMsg }) => {
  const headers = [
    {
      content: "",
      className: "override",
    },
    { content: "Configuration", className: "config" },
    { content: "Inherited", className: "value" },
    { content: "Override", className: "defined" },
  ];

  return (
    <MainTable
      className="configuration-table"
      emptyStateMsg={emptyStateMsg}
      headers={headers}
      rows={rows}
    />
  );
};

export default ConfigurationTable;
