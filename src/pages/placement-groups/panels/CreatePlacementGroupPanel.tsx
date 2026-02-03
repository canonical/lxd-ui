import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { FC } from "react";
import { useState } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { createPlacementGroup } from "api/placement-groups";
import { useCurrentProject } from "context/useCurrentProject";
import type { PlacementGroupFormValues } from "types/forms/placementGroup";
import {
  PLACEMENT_GROUP_POLICY_COMPACT,
  PLACEMENT_GROUP_RIGOR_STRICT,
} from "pages/placement-groups/PlacementGroupForm";
import PlacementGroupForm from "pages/placement-groups/PlacementGroupForm";
import ResourceLink from "components/ResourceLink";
import { checkDuplicateName } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";

const CreatePlacementGroupPanel: FC = () => {
  const controllerState = useState<AbortController | null>(null);
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
    name: Yup.string()
      .test(
        "deduplicate",
        "A placement group with this name already exists",
        async (value) => {
          return checkDuplicateName(
            value,
            project?.name ?? "",
            controllerState,
            "placement-groups",
          );
        },
      )
      .matches(/^[A-Za-z0-9/\-:_.]+$/, {
        message:
          "Name can only contain alphanumeric, forward slash, hyphen, colon, underscore and full stop characters",
      })
      .required("Placement group name is required"),
  });

  const formik = useFormik<PlacementGroupFormValues>({
    initialValues: {
      name: "",
      description: "",
      policy: PLACEMENT_GROUP_POLICY_COMPACT,
      rigor: PLACEMENT_GROUP_RIGOR_STRICT,
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
                to={`${ROOT_PATH}/ui/project/${project?.name ?? "default"}/placement-groups/`}
              />{" "}
              created.
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
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <PlacementGroupForm formik={formik} />
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

export default CreatePlacementGroupPanel;
