import {
  ActionButton,
  Button,
  failure,
  Notification,
  type NotificationType,
  Row,
  ScrollableContainer,
  SidePanel,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FC, type MouseEvent } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import { createClusterLink } from "api/cluster-links";
import { base64EncodeObject, checkDuplicateName } from "util/helpers";
import ClusterLinkForm from "pages/cluster/ClusterLinkForm";
import ClusterLinkRichChip from "../ClusterLinkRichChip";
import ClusterLinkDirectionSelection from "pages/cluster/ClusterLinkDirectionSelection";
import BackLink from "components/BackLink";
import type { ClusterLinkFormValues } from "types/forms/clusterLink";
import { useEscCallback } from "context/useEscCallback";

type CreateLinkFlowStep = "direction-selection" | "details";

interface Props {
  onSuccess: (identityName: string, token: string) => void;
}

const CreateClusterLinkPanel: FC<Props> = ({ onSuccess }) => {
  const panelParams = usePanelParams();
  const [error, setError] = useState<NotificationType | null>(null);
  const [currentStep, setCurrentStep] = useState<CreateLinkFlowStep>(
    "direction-selection",
  );
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const handleEscKey = () => {
    switch (currentStep) {
      case "direction-selection":
        closePanel();
        break;
      case "details":
        goToDirectionSelection();
        break;
    }
  };

  useEscCallback(handleEscKey);

  const closePanel = () => {
    panelParams.clear();
    setError(null);
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
    token: Yup.string().when(["tokenType", "type"], {
      is: (tokenType: string, type: string) =>
        tokenType === "consume" || type === "unidirectional",
      then: (schema) => schema.required("Token is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik<ClusterLinkFormValues>({
    initialValues: {
      name: "",
      description: "",
      token: "",
      tokenType: undefined,
      authGroups: [],
      isCreating: true,
      type: "bidirectional",
    },
    validationSchema: clusterLinkSchema,
    onSubmit: (values) => {
      const isBidirectional = values.type === "bidirectional";
      const hasToken = values.tokenType === "consume" || !isBidirectional;

      const payload = {
        name: values.name,
        description: values.description,
        trust_token: hasToken ? values.token : undefined,
        auth_groups: isBidirectional ? values.authGroups : undefined,
        type: values.type,
      };

      createClusterLink(JSON.stringify(payload))
        .then((response) => {
          if (
            formik.values.type === "bidirectional" &&
            formik.values.tokenType === "generate" &&
            response
          ) {
            const encodedToken = base64EncodeObject(response);
            onSuccess(values.name, encodedToken);
          } else {
            toastNotify.success(
              <>
                Cluster link <ClusterLinkRichChip clusterLink={values.name} />{" "}
                created.
              </>,
            );
          }
          closePanel();
        })
        .catch((e) => {
          setError(failure("Cluster link creation failed", e));
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

  const goToDirectionSelection = () => {
    setCurrentStep("direction-selection");
  };

  const goToDetailsStep = () => {
    setCurrentStep("details");
  };

  return (
    <SidePanel>
      <SidePanel.Header>
        <SidePanel.HeaderTitle>
          {currentStep === "direction-selection" && "Choose cluster link type"}
          {currentStep === "details" && (
            <BackLink
              linkText="Choose type"
              title="Create cluster link"
              onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
              }}
              onClick={goToDirectionSelection}
            />
          )}
        </SidePanel.HeaderTitle>
      </SidePanel.Header>
      <Row className="u-no-padding">
        {error && (
          <Notification
            title={error.title}
            severity="negative"
            onDismiss={() => {
              setError(null);
            }}
          >
            {error.message}
          </Notification>
        )}
      </Row>
      <SidePanel.Content className="u-no-padding">
        <ScrollableContainer
          dependencies={[currentStep, error]}
          belowIds={["panel-footer"]}
        >
          {currentStep === "direction-selection" && (
            <ClusterLinkDirectionSelection
              onSelect={(type) => {
                formik.setFieldValue("type", type);
                goToDetailsStep();
              }}
            />
          )}
          {currentStep === "details" && <ClusterLinkForm formik={formik} />}
        </ScrollableContainer>
      </SidePanel.Content>
      <SidePanel.Footer className="u-align--right">
        {currentStep === "direction-selection" && (
          <Button
            appearance="base"
            onClick={closePanel}
            className="u-no-margin--bottom"
          >
            Cancel
          </Button>
        )}
        {currentStep === "details" && (
          <>
            <Button
              appearance="base"
              onClick={goToDirectionSelection}
              className="u-no-margin--bottom"
              disabled={formik.isSubmitting}
            >
              Back
            </Button>
            <ActionButton
              appearance="positive"
              loading={formik.isSubmitting}
              onClick={() => void formik.submitForm()}
              className="u-no-margin--bottom"
              disabled={
                !formik.isValid || formik.isSubmitting || !formik.values.name
              }
              title={
                formik.values.name
                  ? undefined
                  : "Please enter a name before submitting the form"
              }
            >
              Create link
            </ActionButton>
          </>
        )}
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default CreateClusterLinkPanel;
