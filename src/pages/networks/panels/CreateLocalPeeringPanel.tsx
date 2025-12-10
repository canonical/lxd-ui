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
import ResourceLink from "components/ResourceLink";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentProject } from "context/useCurrentProject";
import type { LxdNetwork } from "types/network";
import { createNetworkPeer } from "api/network-local-peering";
import NetworkLocalPeeringForm from "../forms/NetworkLocalPeeringForm";
import type { LocalPeeringFormValues } from "../forms/NetworkLocalPeeringForm";
import { testDuplicateLocalPeeringName } from "util/networks";

interface Props {
  network: LxdNetwork;
}

const CreateLocalPeeringPanel: FC<Props> = ({ network }) => {
  const panelParams = usePanelParams();
  const { project } = useCurrentProject();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };
  const networkURL = `/ui/project/${encodeURIComponent(project?.name ?? "")}/network/${encodeURIComponent(network.name)}`;
  const projectOtherLabel = "Manually enter project";
  const networkOtherLabel = "Manually enter network";

  const localPeeringSchema = Yup.object().shape({
    targetProject: Yup.string().required("Target project is required"),

    customTargetProject: Yup.string()
      .nullable()
      .when("targetProject", {
        is: (v: string) => v === projectOtherLabel,
        then: (schema) => schema.required("Please enter a project name"),
        otherwise: (schema) => schema.notRequired(),
      }),

    targetNetwork: Yup.string().when("targetProject", {
      is: (v: string) => v !== projectOtherLabel,
      then: (schema) => schema.required("Target network is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    customTargetNetwork: Yup.string()
      .nullable()
      .when("targetNetwork", {
        is: (v: string) => v === networkOtherLabel,
        then: (schema) => schema.required("Please enter a network name"),
        otherwise: (schema) => schema.notRequired(),
      }),

    name: Yup.string()
      .test(
        ...testDuplicateLocalPeeringName(
          panelParams.project,
          network.name,
          controllerState,
        ),
      )
      .required("Local peering name is required"),
  });

  const handleSuccess = (peerName: string) => {
    toastNotify.success(
      <>
        Local peering{" "}
        <ResourceLink
          type={"peering"}
          value={peerName}
          to={`${networkURL}/local-peerings`}
        />{" "}
        created for network{" "}
        <ResourceLink type="network" value={network.name} to={networkURL} />.
      </>,
    );
    closePanel();
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [
        queryKeys.projects,
        panelParams.project,
        queryKeys.networks,
        network.name,
        queryKeys.peers,
      ],
    });
  };

  const formik = useFormik<LocalPeeringFormValues>({
    initialValues: {
      name: "",
      description: "",
      targetProject: project?.name || "",
      targetNetwork: "",
      customTargetNetwork: "",
      customTargetProject: "",
      createMutualPeering: false,
    },
    validationSchema: localPeeringSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      const localPeeringPayload = {
        name: values.name,
        description: values.description,
        target_project:
          values.targetProject === projectOtherLabel
            ? values.customTargetProject
            : values.targetProject,
        target_network:
          values.targetNetwork === networkOtherLabel
            ? values.customTargetNetwork
            : values.targetNetwork,
      };

      createNetworkPeer(
        network.name,
        panelParams.project,
        JSON.stringify(localPeeringPayload),
      )
        .then(() => {
          if (formik.values.createMutualPeering) {
            const mutualPeeringPayload = {
              name: values.name,
              description: values.description,
              target_project: panelParams.project,
              target_network: network.name,
            };

            createNetworkPeer(
              values.targetNetwork,
              values.targetProject,
              JSON.stringify(mutualPeeringPayload),
            )
              .then(() => {
                invalidateQueries();
                handleSuccess(values.name);
              })
              .catch((e) => {
                formik.setSubmitting(false);
                invalidateQueries();
                notify.failure(`Mutual local peering creation failed`, e);
              });
          } else {
            invalidateQueries();
            handleSuccess(values.name);
          }
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure(`Local peering creation failed`, e);
        });
    },
  });

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Create local peering</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <NetworkLocalPeeringForm formik={formik} network={network} />
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
            Create local peering
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default CreateLocalPeeringPanel;
