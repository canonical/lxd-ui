import type { FC } from "react";
import { MainTable } from "@canonical/react-components";
import type { UserKey } from "types/forms/instanceAndProfile";

interface Props {
  userKeys: UserKey[];
}

const UserKeyListTable: FC<Props> = ({ userKeys }) => {
  if (userKeys.length === 0) {
    return <>-</>;
  }

  const headers = [
    { content: "Key", sortKey: "key", className: "u-text--muted key" },
    { content: "Value", sortKey: "value", className: "u-text--muted value" },
  ];

  const rows = userKeys.map(({ key, value }) => {
    return {
      key,
      className: "u-row",
      columns: [
        {
          content: key,
          role: "rowheader",
          "aria-label": "Key",
          className: "key",
        },
        {
          content: value,
          role: "cell",
          "aria-label": "Value",
          className: "value",
        },
      ],
      sortData: {
        key: key.toLowerCase(),
        value: value.toLowerCase(),
      },
    };
  });

  return (
    <MainTable
      className="user-key-list-table"
      headers={headers}
      rows={rows}
      sortable
    />
  );
};

export default UserKeyListTable;
