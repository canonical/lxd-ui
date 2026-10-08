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
import { useEffect, useState, type FC, type MouseEvent } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import { createClusterLink } from "api/cluster-links";
import { base64EncodeObject, checkDuplicateName } from "util/helpers";
import {
  getCertificateFingerprint,
  isValidRemoteAddress,
  normalizeRemoteAddress,
} from "util/clusterLink";
import ClusterLinkForm from "pages/cluster/ClusterLinkForm";
import ClusterLinkRichChip from "../ClusterLinkRichChip";
import ClusterLinkDirectionSelection from "pages/cluster/ClusterLinkDirectionSelection";
import ClusterLinkVerifyCertificate from "pages/cluster/ClusterLinkVerifyCertificate";
import BackLink from "components/BackLink";
import type { ClusterLinkFormValues } from "types/forms/clusterLink";
import { useEscCallback } from "context/useEscCallback";
import type { LxdClusterLink } from "types/cluster";
import ClusterLinkExplanationTooltip from "pages/cluster/ClusterLinkExplanationTooltip";

type CreateLinkFlowStep =
  | "direction-selection"
  | "details"
  | "verify-certificate";

interface Props {
  onSuccess?: (identityName: string, token: string) => void;
  pendingLink?: LxdClusterLink;
}

const CreateClusterLinkPanel: FC<Props> = ({ onSuccess, pendingLink }) => {
  const panelParams = usePanelParams();
  const [error, setError] = useState<NotificationType | null>(null);
  const [currentStep, setCurrentStep] = useState<CreateLinkFlowStep>(
    pendingLink ? "verify-certificate" : "direction-selection",
  );
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [isFingerprintConfirmed, setFingerprintConfirmed] = useState(false);
  const [isLoading, setLoading] = useState(false);
  // name of the pending public link created by "Fetch certificate", it can't be renamed
  const [fetchedLinkName, setFetchedLinkName] = useState<string | null>(null);

  const invalidateClusterLinks = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.cluster, queryKeys.links],
    });
  };

  const handleEscKey = () => {
    // stay on the current step while a request is in flight, so its response lands on the step it belongs to
    if (formik.isSubmitting || isLoading) {
      return;
    }
    switch (currentStep) {
      case "direction-selection":
        closePanel();
        break;
      case "details":
        if (fetchedLinkName) {
          closePanel();
        } else {
          goToDirectionSelection();
        }
        break;
      case "verify-certificate":
        if (pendingLink) {
          closePanel();
        } else {
          goToDetailsStep();
        }
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
          value === fetchedLinkName ||
          checkDuplicateName(value, "", controllerState, "cluster/links"),
      )
      .required("Link name is required"),
    token: Yup.string().when(["tokenType", "type"], {
      is: (tokenType: string, type: string) =>
        tokenType === "consume" || type === "unidirectional",
      then: (schema) => schema.required("Token is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    remoteAddress: Yup.string().when("type", {
      is: "public",
      then: (schema) =>
        schema
          .required("Remote address is required")
          .test(
            "valid-remote-address",
            "Enter a valid IP address or hostname, optionally with a port",
            (value) => isValidRemoteAddress(value),
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik<ClusterLinkFormValues>({
    initialValues: {
      name: pendingLink?.name ?? "",
      description: pendingLink?.description ?? "",
      token: "",
      tokenType: undefined,
      authGroups: [],
      isCreating: true,
      type: pendingLink ? "public" : "bidirectional",
      remoteAddress: pendingLink?.config["volatile.pending_address"] ?? "",
      fingerprint: "",
    },
    validationSchema: clusterLinkSchema,
    onSubmit: (values) => {
      if (values.type === "public") {
        fetchCertificate(values);
        return;
      }

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
            onSuccess?.(values.name, encodedToken);
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
    if (formik.isSubmitting) {
      return;
    }
    setCurrentStep("direction-selection");
  };

  const goToDetailsStep = () => {
    if (isLoading) {
      return;
    }
    setCurrentStep("details");
  };

  const goToVerifyCertificateStep = () => {
    setCurrentStep("verify-certificate");
  };

  // a pending link already holds the remote certificate, so its fingerprint can be shown right away
  useEffect(() => {
    if (!pendingLink) {
      return;
    }
    getCertificateFingerprint(
      pendingLink.config["volatile.pending_certificate"] ?? "",
    )
      .then((fingerprint) => {
        void formik.setFieldValue("fingerprint", fingerprint);
      })
      .catch((e) => {
        setError(failure("Reading the certificate failed", e));
      });
  }, [pendingLink?.name]);

  const fetchCertificate = (values: ClusterLinkFormValues) => {
    const remoteAddress = normalizeRemoteAddress(values.remoteAddress);
    const payload = {
      name: values.name,
      description: values.description,
      type: values.type,
      remote_address: remoteAddress,
    };

    createClusterLink(JSON.stringify(payload))
      .then((response) => {
        setError(null);
        setFingerprintConfirmed(false);
        setFetchedLinkName(values.name);
        void formik.setFieldValue("remoteAddress", remoteAddress);
        void formik.setFieldValue("fingerprint", response?.fingerprint ?? "");
        goToVerifyCertificateStep();
        invalidateClusterLinks();
      })
      .catch((e) => {
        setError(failure("Fetching certificate failed", e));
      })
      .finally(() => {
        formik.setSubmitting(false);
      });
  };

  const confirmPublicLink = () => {
    const { name, type, fingerprint } = formik.values;
    const payload = { name, type, fingerprint };

    setLoading(true);
    createClusterLink(JSON.stringify(payload))
      .then(() => {
        toastNotify.success(
          <>
            Cluster link <ClusterLinkRichChip clusterLink={name} /> created.
          </>,
        );
        invalidateClusterLinks();
        closePanel();
      })
      .catch((e) => {
        setError(failure("Cluster link creation failed", e));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const isPublic = formik.values.type === "public";

  return (
    <SidePanel>
      <SidePanel.Header>
        <SidePanel.HeaderTitle
          className={pendingLink ? "u-truncate" : undefined}
        >
          {currentStep === "direction-selection" && "Choose cluster link type"}
          {currentStep === "details" &&
            fetchedLinkName &&
            "Create cluster link"}
          {currentStep === "details" && !fetchedLinkName && (
            <BackLink
              linkText="Choose type"
              title="Create cluster link"
              onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
              }}
              onClick={goToDirectionSelection}
            />
          )}
          {currentStep === "verify-certificate" && pendingLink && (
            <ClusterLinkExplanationTooltip>
              <span title={`Verify certificate for ${pendingLink.name}`}>
                Verify certificate for {pendingLink.name}
              </span>
            </ClusterLinkExplanationTooltip>
          )}
          {currentStep === "verify-certificate" && !pendingLink && (
            <BackLink
              linkText="Create cluster link"
              title="Verify certificate"
              onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
              }}
              onClick={goToDetailsStep}
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
      <SidePanel.Content className="u-no-padding cluster-link-panel">
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
          {currentStep === "details" && (
            <ClusterLinkForm formik={formik} isNameLocked={!!fetchedLinkName} />
          )}
          {currentStep === "verify-certificate" &&
            formik.values.fingerprint && (
              <ClusterLinkVerifyCertificate
                remoteAddress={formik.values.remoteAddress ?? ""}
                fingerprint={formik.values.fingerprint ?? ""}
                isConfirmed={isFingerprintConfirmed}
                setConfirmed={setFingerprintConfirmed}
              />
            )}
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
              onClick={fetchedLinkName ? closePanel : goToDirectionSelection}
              className="u-no-margin--bottom"
              disabled={formik.isSubmitting}
            >
              {fetchedLinkName ? "Cancel" : "Back"}
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
              {isPublic ? "Fetch certificate" : "Create link"}
            </ActionButton>
          </>
        )}
        {currentStep === "verify-certificate" && (
          <>
            <Button
              appearance="base"
              onClick={pendingLink ? closePanel : goToDetailsStep}
              className="u-no-margin--bottom"
              disabled={isLoading}
            >
              {pendingLink ? "Cancel" : "Back"}
            </Button>
            <ActionButton
              appearance="positive"
              loading={isLoading}
              onClick={confirmPublicLink}
              className="u-no-margin--bottom"
              disabled={!isFingerprintConfirmed || isLoading}
              title={
                isFingerprintConfirmed
                  ? undefined
                  : "Confirm the certificate fingerprint before creating the link"
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
