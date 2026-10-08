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
import { useEffect, useRef, useState, type FC, type MouseEvent } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import {
  createClusterLink,
  deleteClusterLink,
  fetchPublicClusterLinkCertificate,
} from "api/cluster-links";
import { base64EncodeObject, checkDuplicateName } from "util/helpers";
import { isValidRemoteAddress, normalizeRemoteAddress } from "util/clusterLink";
import ClusterLinkForm from "pages/cluster/ClusterLinkForm";
import ClusterLinkRichChip from "../ClusterLinkRichChip";
import ClusterLinkDirectionSelection from "pages/cluster/ClusterLinkDirectionSelection";
import ClusterLinkVerifyCertificate from "pages/cluster/ClusterLinkVerifyCertificate";
import BackLink from "components/BackLink";
import type { ClusterLinkFormValues } from "types/forms/clusterLink";
import { useEscCallback } from "context/useEscCallback";

type CreateLinkFlowStep =
  | "direction-selection"
  | "details"
  | "verify-certificate";

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
  const [isFingerprintConfirmed, setFingerprintConfirmed] = useState(false);
  const [isConfirming, setConfirming] = useState(false);
  const [isDiscarding, setDiscarding] = useState(false);
  // name of a public link created by "Fetch certificate" that is not confirmed yet
  const pendingLinkRef = useRef<string | null>(null);
  // refs, so the unmount cleanup and late responses see the latest values
  const isMountedRef = useRef(false);
  const isConfirmingRef = useRef(false);

  const invalidateClusterLinks = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.cluster, queryKeys.links],
    });
  };

  // delete a pending public link after the panel has closed, so failures are shown as a toast
  const removePendingLinkInBackground = (link: string) => {
    deleteClusterLink(link)
      .catch((e) => {
        toastNotify.failure(
          `Removing the pending cluster link ${link} failed`,
          e,
        );
      })
      .finally(invalidateClusterLinks);
  };
  const removePendingLinkRef = useRef(removePendingLinkInBackground);
  removePendingLinkRef.current = removePendingLinkInBackground;

  // delete an unconfirmed public link if the panel closes before confirmation
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const pendingLink = pendingLinkRef.current;
      // a link that is being confirmed must not be deleted
      if (pendingLink && !isConfirmingRef.current) {
        pendingLinkRef.current = null;
        removePendingLinkRef.current(pendingLink);
      }
    };
  }, []);

  const handleEscKey = () => {
    switch (currentStep) {
      case "direction-selection":
        closePanel();
        break;
      case "details":
        goToDirectionSelection();
        break;
      case "verify-certificate":
        discardPendingLink();
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
      name: "",
      description: "",
      token: "",
      tokenType: undefined,
      authGroups: [],
      isCreating: true,
      type: "bidirectional",
      remoteAddress: "",
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

  const goToVerifyCertificateStep = () => {
    setCurrentStep("verify-certificate");
  };

  const fetchCertificate = (values: ClusterLinkFormValues) => {
    const remoteAddress = normalizeRemoteAddress(values.remoteAddress);
    const payload = {
      name: values.name,
      description: values.description,
      type: values.type,
      remote_address: remoteAddress,
    };

    fetchPublicClusterLinkCertificate(JSON.stringify(payload))
      .then((certificate) => {
        if (!isMountedRef.current) {
          // the panel closed while fetching, so remove the link that was just created
          removePendingLinkInBackground(values.name);
          return;
        }
        pendingLinkRef.current = values.name;
        setError(null);
        setFingerprintConfirmed(false);
        void formik.setFieldValue("remoteAddress", remoteAddress);
        void formik.setFieldValue("fingerprint", certificate.fingerprint);
        goToVerifyCertificateStep();
      })
      .catch((e) => {
        setError(failure("Fetching certificate failed", e));
      })
      .finally(() => {
        formik.setSubmitting(false);
      });
  };

  // delete the unconfirmed public link and return to the details step
  const discardPendingLink = () => {
    if (isConfirming || isDiscarding) {
      return;
    }
    const pendingLink = pendingLinkRef.current;
    if (!pendingLink) {
      goToDetailsStep();
      return;
    }

    setDiscarding(true);
    deleteClusterLink(pendingLink)
      .then(() => {
        pendingLinkRef.current = null;
        setError(null);
        setFingerprintConfirmed(false);
        void formik.setFieldValue("fingerprint", "");
        goToDetailsStep();
      })
      .catch((e) => {
        setError(failure("Removing the pending cluster link failed", e));
      })
      .finally(() => {
        setDiscarding(false);
        invalidateClusterLinks();
      });
  };

  // pin the fetched certificate, which activates the public link
  const confirmPublicLink = () => {
    const { name, type, fingerprint } = formik.values;
    const payload = { name, type, fingerprint };

    isConfirmingRef.current = true;
    setConfirming(true);
    createClusterLink(JSON.stringify(payload))
      .then(() => {
        pendingLinkRef.current = null;
        toastNotify.success(
          <>
            Cluster link <ClusterLinkRichChip clusterLink={name} /> created.
          </>,
        );
        closePanel();
      })
      .catch((e) => {
        setError(failure("Cluster link creation failed", e));
      })
      .finally(() => {
        isConfirmingRef.current = false;
        setConfirming(false);
        invalidateClusterLinks();
      });
  };

  const isPublic = formik.values.type === "public";

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
          {currentStep === "verify-certificate" && (
            <BackLink
              linkText="Create cluster link"
              title="Verify certificate"
              onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
              }}
              onClick={discardPendingLink}
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
          {currentStep === "verify-certificate" && (
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
                !formik.isValid ||
                formik.isSubmitting ||
                !formik.values.name ||
                (isPublic && !formik.values.remoteAddress)
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
              onClick={discardPendingLink}
              className="u-no-margin--bottom"
              disabled={isDiscarding || isConfirming}
            >
              Back
            </Button>
            <ActionButton
              appearance="positive"
              loading={isConfirming}
              onClick={confirmPublicLink}
              className="u-no-margin--bottom"
              disabled={!isFingerprintConfirmed || isConfirming || isDiscarding}
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
