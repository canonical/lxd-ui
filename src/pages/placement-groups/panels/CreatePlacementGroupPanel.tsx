import {
  ActionButton,
  Button,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { createPlacementGroup } from "api/placement-groups";
import { useCurrentProject } from "context/useCurrentProject";
import type { PlacementGroupFormValues } from "pages/placement-groups/PlacementGroupForm";
import PlacementGroupForm from "pages/placement-groups/PlacementGroupForm";
import ResourceLink from "components/ResourceLink";

const CreatePlacementGroupPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { project } = useCurrentProject();

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const schema = Yup.object().shape({
    name: Yup.string().required("Placement group name is required"),
  });

  const formik = useFormik<PlacementGroupFormValues>({
    initialValues: {
      name: "",
      description: "",
      policy: "compact",
      rigor: "strict",
    },
    validationSchema: schema,
    onSubmit: () => {
      const placementGroup = {
        name: formik.values.name,
        description: formik.values.description,
        config: {
          policy: formik.values.policy,
          rigor: formik.values.rigor,
        },
      };

      createPlacementGroup(JSON.stringify(placementGroup), project?.name ?? "")
        .then(() => {
          toastNotify.success(
            <>
              Placement group{" "}
              <ResourceLink
                type="placement-group"
                value={placementGroup.name ?? ""}
                to={`/ui/project/${project?.name ?? "default"}/placement-groups/`}
              />{" "}
              created
            </>,
          );

          queryClient.invalidateQueries({
            queryKey: [queryKeys.placementGroups, project?.name],
          });
          closePanel();
        })
        .catch((e) => {
          notify.failure("Placement group creation failed", e);
          formik.setSubmitting(false);
        });
    },
  });

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Create placement group</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <PlacementGroupForm formik={formik} />
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
            Create placement group
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default CreatePlacementGroupPanel;
