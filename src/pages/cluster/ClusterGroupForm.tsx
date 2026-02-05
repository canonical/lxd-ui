import type { FC } from "react";
import { Form, Icon, Input } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import { useClusterMembers } from "context/useClusterMembers";
import SelectableMainTable from "components/SelectableMainTable";
import type { ClusterGroupFormValues } from "types/forms/clusterGroup";

export interface Props {
  formik: FormikProps<ClusterGroupFormValues>;
}

const ClusterGroupForm: FC<Props> = ({ formik }) => {
  const { data: members = [] } = useClusterMembers();

  const previousMembers = formik.values.bareGroup?.members ?? [];
  const addedMembers = formik.values.members.filter(
    (member) => !previousMembers.includes(member),
  );
  const removedMembers = previousMembers.filter(
    (members) => !formik.values.members.includes(members),
  );
  const modifiedMembers = [...addedMembers, ...removedMembers];
  const preselectedMembers = new Set(formik.values.bareGroup?.members ?? []);

  const sortedMembers = members.sort((a, b) => {
    if (preselectedMembers.has(a.server_name)) {
      return -1;
    }
    if (preselectedMembers.has(b.server_name)) {
      return 1;
    }
    return 0;
  });

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      {!formik.values.bareGroup && (
        <Input
          {...formik.getFieldProps("name")}
          type="text"
          label="Name"
          placeholder="Enter name"
          required
          autoFocus
          error={formik.touched.name ? formik.errors.name : null}
        />
      )}
      <Input
        {...formik.getFieldProps("description")}
        type="text"
        label="Description"
        placeholder="Enter description"
      />
      <p className="u-sv-1">Cluster members</p>
      <SelectableMainTable
        itemName="member"
        parentName="cluster group"
        className="member-selection-table"
        filteredNames={members?.map((member) => member.server_name) ?? []}
        selectedNames={formik.values.members}
        hideContextualMenu
        setSelectedNames={(val, isUnselectAll) => {
          if (isUnselectAll) {
            formik.setFieldValue("members", []);
            return;
          }
          formik.setFieldValue("members", val);
        }}
        disabledNames={[]}
        headers={[
          {
            content: "Name",
            sortKey: "name",
            className: "name",
          },
          {
            content: "Groups",
            className: "groups u-align--right",
          },
          {
            content: "",
            "aria-label": "Modified status",
            className: "modified-status",
          },
        ]}
        rows={
          sortedMembers.map((member) => {
            const name = member.server_name;
            const groups = (member.groups ?? []).length;

            const toggleRow = () => {
              if (formik.values.members.includes(name)) {
                formik.setFieldValue(
                  "members",
                  formik.values.members.filter((m) => m !== name),
                );
              } else {
                formik.setFieldValue("members", [
                  ...formik.values.members,
                  name,
                ]);
              }
            };
            const isModified = modifiedMembers.includes(name);

            return {
              key: name,
              name: name,
              columns: [
                {
                  content: name,
                  title: name,
                  onClick: toggleRow,
                  role: "rowheader",
                  className: "name u-truncate clickable-cell",
                  "aria-label": "Name",
                },
                {
                  content: groups,
                  onClick: toggleRow,
                  role: "cell",
                  className: "groups u-truncate clickable-cell u-align--right",
                  "aria-label": "groups",
                },
                {
                  content: isModified && (
                    <Icon
                      name="status-in-progress-small"
                      aria-label={
                        addedMembers.includes(name)
                          ? "was added"
                          : "was removed"
                      }
                    />
                  ),
                  role: "cell",
                  "aria-label": "Modified status",
                  className: "modified-status u-align--right",
                },
              ],
            };
          }) ?? []
        }
      />
    </Form>
  );
};

export default ClusterGroupForm;
