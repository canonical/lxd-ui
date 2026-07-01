import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useState, type FC } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { ReplicatorFormValues } from "types/forms/replicator";
import { createReplicator } from "api/replicators";
import { ReplicatorForm } from "../ReplicatorForm";
import { checkDuplicateName } from "util/helpers";
import { useCurrentProject } from "context/useCurrentProject";
import { getPayload } from "util/replicator";
import ReplicatorRichChip from "../ReplicatorRichChip";

const CreateReplicatorPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const { project: currentProject } = useCurrentProject();
  const panelProject = panelParams.replicaProject ?? "";
  const panelClusterLink = panelParams.clusterLink ?? "";

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const schema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A replicator with this name already exists.",
        async (value, context) => {
          const project = (context.parent as { project?: string }).project;

          return checkDuplicateName(
            value,
            project || currentProject?.name || "default",
            controllerState,
            "replicators",
          );
        },
      )
      .matches(/^[A-Za-z0-9/\-:_.]+$/, {
        message:
          "Name can only contain alphanumeric, forward slash, hyphen, colon, underscore and full stop characters.",
      })
      .required("Replicator name is required."),
    project: Yup.string().required("Project is required."),
    cluster: Yup.string().required("Cluster is required."),
  });

  const formik = useFormik<ReplicatorFormValues>({
    initialValues: {
      isCreating: true,
      name: "",
      description: "",
      project: panelProject,
      cluster: panelClusterLink,
      snapshot: "false",
      schedule: "",
    },
    initialTouched: {
      project: !!panelProject,
      cluster: !!panelClusterLink,
    },
    enableReinitialize: true,
    validateOnMount: true,
    validationSchema: schema,
    validateOnChange: true,
    onSubmit: () => {
      createReplicator(
        JSON.stringify(getPayload(formik)),
        formik.values.project,
      )
        .then(() => {
          toastNotify.success(
            <>
              Replicator{" "}
              <ReplicatorRichChip
                replicator={formik.values.name}
                project={formik.values.project}
              />{" "}
              created.
            </>,
          );

          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              formik.values.project,
              queryKeys.replicators,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeys.projects, null, queryKeys.replicators],
          });
          closePanel();
        })
        .catch((e) => {
          notify.failure("Replicator creation failed", e);
          formik.setSubmitting(false);
        });
    },
  });

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Create replicator</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <ReplicatorForm formik={formik} />
          </ScrollableContainer>
        </SidePanel.Content>
        <SidePanel.Footer className="u-align--right">
          <Button
            appearance="base"
            onClick={closePanel}
            className="u-no-margin--bottom"
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            onClick={() => void formik.submitForm()}
            className="u-no-margin--bottom"
            disabled={
              !formik.isValid || formik.isSubmitting || !formik.values.name
            }
            loading={formik.isSubmitting}
          >
            Create
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default CreateReplicatorPanel;
