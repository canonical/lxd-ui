import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useEffect, useState, type FC } from "react";
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
import { ROOT_PATH } from "util/rootPath";
import { getPayload } from "util/replicator";
import { useProjects } from "context/useProjects";
import { useProjectEntitlements } from "util/entitlements/projects";
import {
  testReachableClusterLink,
  testProjectReplicaCluster,
} from "util/clusterLink";
import { Link } from "react-router-dom";
import ReplicatorRichChip from "../ReplicatorRichChip";

const CreateReplicatorPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const { project: currentProject } = useCurrentProject();
  const { data: projects = [] } = useProjects();
  const { canCreateReplicators, canEditProject } = useProjectEntitlements();

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const getSelectedProject = (projectName?: string) => {
    return projects.find((project) => project.name === projectName);
  };

  const getReplicaClusterConfigErrorMessage = (projectName?: string) => {
    return (
      <>
        Project <code>replica.cluster</code> must match the selected cluster.
        Change it in the{" "}
        <Link
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName || "")}/configuration`}
          target="_blank"
          rel="noopener noreferrer"
        >
          project configuration
        </Link>
        .
      </>
    ) as unknown as string;
  };

  const testProjectReplicatorPermissions = (projectName?: string): boolean => {
    const selectedProject = getSelectedProject(projectName);
    if (!selectedProject) {
      return true;
    }

    return (
      canEditProject(selectedProject) && canCreateReplicators(selectedProject)
    );
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
    project: Yup.string()
      .required("Project is required.")
      .test({
        name: "replica cluster matches selected cluster link",
        test(value, context) {
          const parent = context.parent as { cluster?: string };
          const project = getSelectedProject(value);

          if (testProjectReplicaCluster(project, parent.cluster)) {
            return true;
          }

          return this.createError({
            message: getReplicaClusterConfigErrorMessage(project?.name),
          });
        },
      })
      .test({
        name: "Can edit and create replicator",
        test(value) {
          if (testProjectReplicatorPermissions(value)) {
            return true;
          }

          return this.createError({
            message: (
              <>
                You need the <code>edit</code> and{" "}
                <code>can_create_replicators</code> permission on the project.
              </>
            ) as unknown as string,
          });
        },
      }),
    cluster: Yup.string()
      .test({
        name: "Reachable cluster link",
        test: testReachableClusterLink(),
      })
      .required("Cluster is required."),
  });

  const formik = useFormik<ReplicatorFormValues>({
    initialValues: {
      isCreating: true,
      name: "",
      description: "",
      project: "",
      cluster: "",
      snapshot: "false",
      schedule: "",
    },
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
              />
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

  // Re-validate project when cluster changes.
  useEffect(() => {
    if (!formik.values.project) {
      return;
    }

    void formik.validateField("project");
  }, [formik.values.cluster]);

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
