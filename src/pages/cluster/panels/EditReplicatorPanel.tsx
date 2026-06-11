import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { type FC } from "react";
import usePanelParams from "util/usePanelParams";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { ReplicatorFormValues } from "types/forms/replicator";
import { updateReplicator } from "api/replicators";
import { ReplicatorForm } from "../ReplicatorForm";
import { useReplicator } from "context/useReplicators";
import { getPayload } from "util/replicator";
import * as Yup from "yup";
import {
  testReachableClusterLink,
  testProjectReplicaCluster,
} from "util/clusterLink";
import { useProject } from "context/useProjects";
import ReplicatorRichChip from "../ReplicatorRichChip";

const EditReplicatorPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const replicatorName = panelParams.replicator ?? "";
  const { data: replicator } = useReplicator(
    replicatorName,
    panelParams.project,
    !!replicatorName,
  );
  const { data: project } = useProject(panelParams.project);

  const schema = Yup.object().shape({
    cluster: Yup.string()
      .test({
        name: "replica cluster matches selected cluster link",
        test(value) {
          if (testProjectReplicaCluster(project, value)) {
            return true;
          }
          const replicaCluster = project?.config["replica.cluster"];

          return this.createError({
            message: (
              <>
                Cluster must match the project <code>replica.cluster</code>{" "}
                <code>{replicaCluster}</code>.
              </>
            ) as unknown as string,
          });
        },
      })
      .test({
        name: "Reachable cluster link",
        test: testReachableClusterLink(),
      })
      .required("Cluster is required."),
  });

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const formik = useFormik<ReplicatorFormValues>({
    initialValues: {
      isCreating: false,
      name: replicatorName || "",
      description: replicator?.description || "",
      project: panelParams.project,
      cluster: replicator?.config?.cluster || "",
      snapshot: replicator?.config?.snapshot || "false",
      schedule: replicator?.config?.schedule || "",
    },
    enableReinitialize: true,
    validationSchema: schema,
    validateOnChange: true,
    onSubmit: () => {
      updateReplicator(
        formik.values.name,
        panelParams.project,
        JSON.stringify(getPayload(formik)),
      )
        .then(() => {
          toastNotify.success(
            <>
              Replicator{" "}
              <ReplicatorRichChip
                replicator={formik.values.name}
                project={formik.values.project}
              />
              updated.
            </>,
          );

          void queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              formik.values.project,
              queryKeys.replicators,
            ],
          });
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.projects, null, queryKeys.replicators],
          });
          closePanel();
        })
        .catch((e) => {
          notify.failure("Replicator update failed", e);
          formik.setSubmitting(false);
        });
    },
  });

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Edit replicator</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <ReplicatorForm formik={formik} isEdit />
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
            Update
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default EditReplicatorPanel;
