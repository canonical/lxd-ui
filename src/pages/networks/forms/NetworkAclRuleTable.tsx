import type { FC } from "react";
import { Button, Icon, MainTable } from "@canonical/react-components";
import type { AclRuleFormValues } from "pages/networks/forms/NetworkAclRuleModal";
import { capitalizeFirstLetter } from "util/helpers";

interface Props {
  editRestriction?: string;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  rules: Partial<Omit<AclRuleFormValues, "direction">>[];
}

const NetworkAclRuleTable: FC<Props> = ({
  editRestriction,
  onEdit,
  onRemove,
  rules,
}) => {
  const getPeer = (address?: string, port?: string) => {
    return port ? `${address ?? "*"}:${port}` : `${address ?? "*"}`;
  };

  return (
    <MainTable
      sortable
      headers={[
        { content: "Action", sortKey: "action" },
        { content: "Protocol", sortKey: "protocol" },
        { content: "State", sortKey: "state" },
        { content: "Description", sortKey: "description" },
        { content: "Source", sortKey: "source" },
        { content: "Destination", sortKey: "destination" },
        { content: "" },
      ]}
      rows={rules.map((rule, index) => {
        const source = getPeer(rule.source, rule.source_port);
        const destination = getPeer(rule.destination, rule.destination_port);

        return {
          columns: [
            {
              content: capitalizeFirstLetter(rule.action ?? ""),
              role: "rowheader",
              "aria-label": "Action",
            },
            {
              content: `${(rule.protocol ?? "").length === 0 ? "Any" : rule.protocol?.toUpperCase()}`,
              role: "cell",
              "aria-label": "Protocol",
            },
            {
              content: capitalizeFirstLetter(rule.state ?? ""),
              role: "cell",
              "aria-label": "State",
            },
            {
              content: rule.description,
              role: "cell",
              "aria-label": "Description",
            },
            {
              content: source,
              role: "cell",
              "aria-label": "Source",
            },
            {
              content: destination,
              role: "cell",
              "aria-label": "Destination",
            },
            {
              content: (
                <>
                  <Button
                    onClick={() => {
                      onEdit(index);
                    }}
                    dense
                    type="button"
                    hasIcon
                    appearance="base"
                    disabled={!!editRestriction}
                    title={
                      "Edit rule" +
                      (editRestriction ? ` - ${editRestriction}` : "")
                    }
                  >
                    <Icon name="edit" />
                  </Button>
                  <Button
                    onClick={() => {
                      onRemove(index);
                    }}
                    dense
                    type="button"
                    hasIcon
                    appearance="base"
                    disabled={!!editRestriction}
                    title={
                      "Remove rule" +
                      (editRestriction ? ` - ${editRestriction}` : "")
                    }
                  >
                    <Icon name="delete" />
                  </Button>
                </>
              ),
              role: "cell",
              className: "actions u-align--right",
            },
          ],
          sortData: {
            action: rule.action,
            protocol: rule.protocol,
            state: rule.state,
            description: rule.description,
            source: source,
            destination: destination,
          },
        };
      })}
    />
  );
};

export default NetworkAclRuleTable;
