import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  useNotify,
} from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  createClusterGroup,
  fetchClusterMembers,
  updateClusterGroup,
} from "api/cluster";
import { LxdClusterGroup } from "types/cluster";
import * as Yup from "yup";
import { checkDuplicateName } from "util/helpers";
import { useFormik } from "formik";
import SubmitButton from "components/SubmitButton";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { useNavigate, useParams } from "react-router-dom";
import { getClusterHeaders, getClusterRows } from "util/clusterGroups";
import SelectableMainTable from "components/SelectableMainTable";
import NotificationRow from "components/NotificationRow";

export interface ClusterGroupFormValues {
  description: string;
  members: string[];
  name: string;
}

interface Props {
  group?: LxdClusterGroup;
}

const ClusterGroupForm: FC<Props> = ({ group }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { group: activeGroup } = useParams<{ group: string }>();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const { data: members = [], error } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: fetchClusterMembers,
  });

  if (error) {
    notify.failure("Loading cluster members failed", error);
  }

  const ClusterGroupSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A cluster group with this name already exists",
        (value) =>
          group?.name === value ||
          checkDuplicateName(value, "", controllerState, "cluster/groups")
      )
      .required(),
  });

  const formik = useFormik<ClusterGroupFormValues>({
    initialValues: {
      description: group?.description ?? "",
      members: group?.members ?? [],
      name: group?.name ?? "",
    },
    validationSchema: ClusterGroupSchema,
    onSubmit: (values) => {
      const mutation = group ? updateClusterGroup : createClusterGroup;
      mutation({
        name: values.name,
        description: values.description,
        members: values.members,
      })
        .then(() => {
          const verb = group ? "saved" : "created";
          navigate(
            `/ui/cluster/groups/detail/${values.name}`,
            notify.queue(
              notify.success(`Cluster group ${values.name} ${verb}.`)
            )
          );
        })
        .catch((e: Error) => {
          const verb = group ? "save" : "creation";
          notify.failure(`Cluster group ${verb} failed`, e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.cluster, queryKeys.groups],
          });
        });
    },
  });

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message]);
  useEventListener("resize", updateFormHeight);

  return (
    <main className="l-main">
      <div className="p-panel">
        <div className="p-panel__header">
          <h1 className="p-panel__title">
            {group ? "Edit cluster group" : "Create cluster group"}
          </h1>
        </div>
        <div className="p-panel__content cluster-group-form">
          <Form
            onSubmit={() => void formik.submitForm()}
            stacked
            className="form"
          >
            <Row className="form-contents">
              <Col size={12}>
                <NotificationRow />
                <div className="cluster-group-metadata">
                  <Input
                    id="name"
                    type="text"
                    label="Group name"
                    placeholder="Enter name"
                    required
                    disabled={Boolean(group)}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.name}
                    error={formik.touched.name ? formik.errors.name : null}
                  />
                  <Input
                    id="description"
                    type="text"
                    label="Description"
                    placeholder="Enter description"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.description}
                    error={
                      formik.touched.description
                        ? formik.errors.description
                        : null
                    }
                  />
                </div>
                <div className="choose-label">
                  Choose members from the list{" "}
                  <span className="u-text--muted">
                    ({formik.values.members.length} selected)
                  </span>{" "}
                </div>
                <SelectableMainTable
                  headers={getClusterHeaders()}
                  rows={getClusterRows(members, activeGroup)}
                  sortable
                  className="cluster-group-select-members"
                  filteredNames={members.map((member) => member.server_name)}
                  itemName="member"
                  parentName="cluster"
                  selectedNames={formik.values.members}
                  setSelectedNames={(newMembers) =>
                    void formik.setFieldValue("members", newMembers)
                  }
                  processingNames={[]}
                  totalCount={members.length}
                />
              </Col>
            </Row>
          </Form>
          <div className="p-bottom-controls" id="form-footer">
            <hr />
            <Row className="u-align--right">
              <Col size={12}>
                <Button
                  appearance="base"
                  onClick={() => navigate(`/ui/cluster`)}
                >
                  Cancel
                </Button>
                <SubmitButton
                  isSubmitting={formik.isSubmitting}
                  isDisabled={!formik.isValid || !formik.values.name}
                  buttonLabel={group ? "Save changes" : "Create"}
                  onClick={() => void formik.submitForm()}
                />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ClusterGroupForm;
