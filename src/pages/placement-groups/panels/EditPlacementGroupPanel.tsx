import {
  ActionButton,
  Button,
  ScrollableContainer,
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
import { updatePlacementGroup } from "api/placement-groups";
import { useCurrentProject } from "context/useCurrentProject";
import type { PlacementGroupFormValues } from "pages/placement-groups/PlacementGroupForm";
import PlacementGroupForm from "pages/placement-groups/PlacementGroupForm";
import { usePlacementGroup } from "context/usePlacementGroups";
import type { LxdPlacementGroup } from "types/placementGroup";
import ResourceLink from "components/ResourceLink";
import PlacementGroupUsedBy from "pages/placement-groups/PlacementGroupUsedBy";
import { ROOT_PATH } from "util/rootPath";

const EditPlacementGroupPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { project } = useCurrentProject();

  const { data: placementGroup } = usePlacementGroup(
    panelParams.group ?? "",
    project?.name ?? "",
  );

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const schema = Yup.object().shape({
    name: Yup.string().required("Placement group name is required"),
  });

  const formik = useFormik<PlacementGroupFormValues>({
    initialValues: {
      name: placementGroup?.name,
      description: placementGroup?.description,
      policy: placementGroup?.config.policy,
      rigor: placementGroup?.config.rigor,
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: () => {
      const placementGroup = {
        name: formik.values.name,
        description: formik.values.description,
        config: {
          policy: formik.values.policy,
          rigor: formik.values.rigor,
        },
      } as LxdPlacementGroup;

      updatePlacementGroup(placementGroup, project?.name ?? "")
        .then(() => {
          toastNotify.success(
            <>
              Placement group{" "}
              <ResourceLink
                type="placement-group"
                value={placementGroup.name ?? ""}
                to={`${ROOT_PATH}/ui/project/${project?.name ?? "default"}/placement-groups/`}
              />{" "}
              updated.
            </>,
          );

          queryClient.invalidateQueries({
            queryKey: [queryKeys.placementGroups, project?.name],
          });

          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.placementGroups,
              project?.name,
              placementGroup.name,
            ],
          });
          closePanel();
        })
        .catch((e) => {
          notify.failure("Placement group update failed", e);
          formik.setSubmitting(false);
        });
    },
  });

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>
            Edit placement group {placementGroup?.name}
          </SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <PlacementGroupForm formik={formik} isEdit={true} />
            <div>Used by</div>
            <PlacementGroupUsedBy placementGroup={placementGroup} />
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
            Save changes
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default EditPlacementGroupPanel;
