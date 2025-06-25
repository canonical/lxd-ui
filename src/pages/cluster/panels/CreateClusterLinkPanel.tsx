import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import { useState } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import NotificationRow from "components/NotificationRow";
import { createClusterLink } from "api/cluster-links";
import { base64EncodeObject, checkDuplicateName } from "util/helpers";
import ResourceLink from "components/ResourceLink";
import type { ClusterLinkFormValues } from "pages/cluster/ClusterLinkForm";
import ClusterLinkForm from "pages/cluster/ClusterLinkForm";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  onSuccess: (identityName: string, token: string) => void;
}

const CreateClusterLinkPanel: FC<Props> = ({ onSuccess }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const clusterLinkSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A cluster link with this name already exists",
        async (value) =>
          checkDuplicateName(value, "", controllerState, "cluster/links"),
      )
      .required("Link name is required"),
  });

  const formik = useFormik<ClusterLinkFormValues>({
    initialValues: {
      name: "",
      description: "",
      token: "",
      tokenType: "generate",
      authGroups: [],
      isCreating: true,
    },
    validationSchema: clusterLinkSchema,
    onSubmit: (values) => {
      const payload = {
        name: values.name,
        description: values.description,
        trust_token: values.token,
        auth_groups: values.authGroups,
      };

      createClusterLink(JSON.stringify(payload))
        .then((response) => {
          if (formik.values.tokenType === "generate") {
            const encodedToken = base64EncodeObject(response);
            onSuccess(values.name, encodedToken);
          } else {
            toastNotify.success(
              <>
                Cluster link{" "}
                <ResourceLink
                  type="cluster-link"
                  value={values.name}
                  to={`${ROOT_PATH}/ui/cluster/links`}
                />{" "}
                created.
              </>,
            );
          }
          closePanel();
        })
        .catch((e) => {
          notify.failure("Cluster link creation failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries({
            queryKey: [queryKeys.cluster, queryKeys.links],
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeys.identities],
          });
        });
    },
  });

  return (
    <SidePanel>
      <SidePanel.Header>
        <SidePanel.HeaderTitle>Create cluster link</SidePanel.HeaderTitle>
      </SidePanel.Header>
      <NotificationRow className="u-no-padding" />
      <SidePanel.Content className="u-no-padding">
        <ScrollableContainer
          dependencies={[notify.notification]}
          belowIds={["panel-footer"]}
        >
          <ClusterLinkForm formik={formik} />
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
          loading={formik.isSubmitting}
          onClick={() => void formik.submitForm()}
          className="u-no-margin--bottom"
          disabled={
            !formik.isValid || formik.isSubmitting || !formik.values.name
          }
        >
          Create link
        </ActionButton>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default CreateClusterLinkPanel;
