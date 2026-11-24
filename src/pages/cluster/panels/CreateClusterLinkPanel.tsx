import classnames from "classnames";
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
import { useState, type FC } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import { createClusterLink } from "api/cluster-links";
import { base64EncodeObject, checkDuplicateName } from "util/helpers";
import {
  isBidirectional,
  isUnidirectional,
  isPublic,
  getCertificateFingerprint,
  isValidRemoteAddress,
  normalizeRemoteAddress,
} from "util/clusterLink";
import ClusterLinkForm from "pages/cluster/ClusterLinkForm";
import ClusterLinkRichChip from "pages/cluster/ClusterLinkRichChip";
import ClusterLinkVerifyCertificate from "pages/cluster/ClusterLinkVerifyCertificate";
import type { ClusterLinkFormValues } from "types/forms/clusterLink";
import { useEscCallback } from "context/useEscCallback";
import type { LxdClusterLink, LxdClusterLinkType } from "types/cluster";
import ClusterLinkExplanationTooltip from "pages/cluster/ClusterLinkExplanationTooltip";

interface PublicLinkCertificate {
  fingerprint: string;
  remoteAddress: string;
  description?: string;
}

interface Props {
  onSuccess?: (identityName: string, token: string) => void;
  pendingLink?: LxdClusterLink;
}

const CreateClusterLinkPanel: FC<Props> = ({ onSuccess, pendingLink }) => {
  const panelParams = usePanelParams();
  const [error, setError] = useState<NotificationType | null>(null);
  const [certificate, setCertificate] = useState<PublicLinkCertificate | null>(
    () =>
      pendingLink
        ? {
            fingerprint: getCertificateFingerprint(
              pendingLink.config["volatile.pending_certificate"] ?? "",
            ),
            remoteAddress: pendingLink.config["volatile.pending_address"] ?? "",
            description: pendingLink.description ?? "",
          }
        : null,
  );
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [isFingerprintConfirmed, setFingerprintConfirmed] = useState(false);
  const [publicAction, setPublicAction] = useState<"fetch" | "confirm" | null>(
    null,
  );
  const isFetchingCertificate = publicAction === "fetch";

  const invalidateClusterLinks = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.cluster, queryKeys.links],
    });
  };

  const handleEscKey = () => {
    if (!formik.isSubmitting) {
      closePanel();
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
        // once the certificate is fetched, the name belongs to our own pending link
        async (value) =>
          !!certificate ||
          checkDuplicateName(value, "", controllerState, "cluster/links"),
      )
      .required("Link name is required"),
    tokenType: Yup.string().when("type", {
      is: isBidirectional,
      then: (schema) => schema.required("Token setup is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    token: Yup.string().when(["tokenType", "type"], {
      is: (tokenType: string, type: LxdClusterLinkType) =>
        (isBidirectional(type) && tokenType === "consume") ||
        isUnidirectional(type),
      then: (schema) => schema.required("Token is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    remoteAddress: Yup.string().when("type", {
      is: isPublic,
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
    },
    validationSchema: clusterLinkSchema,
    onSubmit: async (values) => {
      setError(null);
      if (isPublic(values.type)) {
        if (!hasCurrentCertificate) {
          await fetchCertificate(values);
        } else if (isFingerprintConfirmed) {
          await confirmPublicLink(values);
        }
        return;
      }

      const isBidirectionalLink = isBidirectional(values.type);
      const hasToken = values.tokenType === "consume" || !isBidirectionalLink;

      const payload = {
        name: values.name,
        description: values.description,
        trust_token: hasToken ? values.token : undefined,
        auth_groups: isBidirectionalLink ? values.authGroups : undefined,
        type: values.type,
      };

      return createClusterLink(JSON.stringify(payload))
        .then((response) => {
          if (
            isBidirectional(values.type) &&
            values.tokenType === "generate" &&
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
          invalidateClusterLinks();
          queryClient.invalidateQueries({
            queryKey: [queryKeys.identities],
          });
          closePanel();
        })
        .catch((e) => {
          setError(failure("Cluster link creation failed", e));
        });
    },
  });

  const fetchCertificate = async (
    values: ClusterLinkFormValues,
  ): Promise<void> => {
    setPublicAction("fetch");
    const remoteAddress = normalizeRemoteAddress(values.remoteAddress);
    const payload = {
      name: values.name,
      description: values.description,
      type: values.type,
      remote_address: remoteAddress,
    };

    return createClusterLink(JSON.stringify(payload))
      .then((response) => {
        invalidateClusterLinks();
        const fingerprint = response?.fingerprint ?? "";
        setFingerprintConfirmed(false);
        void formik.setFieldValue("remoteAddress", remoteAddress);
        setCertificate({
          fingerprint,
          remoteAddress,
          description: values.description,
        });
        if (!fingerprint) {
          setError(
            failure(
              "Fetching certificate failed",
              new Error("The remote server did not return a fingerprint."),
            ),
          );
          return;
        }
        setError(null);
      })
      .catch((e) => {
        setFingerprintConfirmed(false);
        setCertificate((current) =>
          current ? { ...current, fingerprint: "" } : null,
        );
        setError(failure("Fetching certificate failed", e));
      })
      .finally(() => {
        setPublicAction(null);
      });
  };

  const confirmPublicLink = async (
    values: ClusterLinkFormValues,
  ): Promise<void> => {
    setPublicAction("confirm");
    const { name, type } = values;
    const payload = { name, type, fingerprint: certificate?.fingerprint };

    return createClusterLink(JSON.stringify(payload))
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
        setPublicAction(null);
      });
  };

  const isPublicLink = isPublic(formik.values.type);
  const hasCurrentCertificate =
    !!certificate?.fingerprint &&
    certificate.remoteAddress ===
      normalizeRemoteAddress(formik.values.remoteAddress) &&
    certificate.description === formik.values.description;
  const isCreateDisabled =
    !formik.isValid ||
    formik.isSubmitting ||
    !formik.values.name ||
    (isPublicLink && (!hasCurrentCertificate || !isFingerprintConfirmed));

  const certificateVerification = hasCurrentCertificate && certificate && (
    <ClusterLinkVerifyCertificate
      remoteAddress={pendingLink ? certificate.remoteAddress : undefined}
      fingerprint={certificate.fingerprint}
      isConfirmed={isFingerprintConfirmed}
      setConfirmed={setFingerprintConfirmed}
      disabled={formik.isSubmitting}
    />
  );

  return (
    <SidePanel>
      <SidePanel.Header>
        <SidePanel.HeaderTitle
          className={classnames({ "u-truncate": !!pendingLink })}
        >
          {pendingLink ? (
            <ClusterLinkExplanationTooltip>
              <span title={`Verify certificate for ${formik.values.name}`}>
                Verify certificate for {formik.values.name}
              </span>
            </ClusterLinkExplanationTooltip>
          ) : (
            "Create cluster link"
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
          dependencies={[formik.values.type, hasCurrentCertificate, error]}
          belowIds={["panel-footer"]}
        >
          {pendingLink ? (
            certificateVerification
          ) : (
            <ClusterLinkForm
              formik={formik}
              isNameLocked={!!certificate}
              onPublicDetailsChange={() => {
                setFingerprintConfirmed(false);
              }}
            >
              {isPublicLink && (
                <>
                  <ActionButton
                    type="button"
                    loading={isFetchingCertificate}
                    disabled={
                      !formik.isValid ||
                      formik.isSubmitting ||
                      !formik.values.name ||
                      !formik.values.remoteAddress ||
                      hasCurrentCertificate
                    }
                    onClick={() => void formik.submitForm()}
                  >
                    Fetch certificate
                  </ActionButton>
                  {certificateVerification}
                </>
              )}
            </ClusterLinkForm>
          )}
        </ScrollableContainer>
      </SidePanel.Content>
      <SidePanel.Footer>
        <ActionButton
          appearance="positive"
          loading={
            isPublicLink ? publicAction === "confirm" : formik.isSubmitting
          }
          onClick={() => void formik.submitForm()}
          className="u-no-margin--bottom"
          disabled={isCreateDisabled}
        >
          Create
        </ActionButton>
        <Button
          appearance="base"
          onClick={closePanel}
          className="u-no-margin--bottom"
          disabled={formik.isSubmitting}
        >
          Cancel
        </Button>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default CreateClusterLinkPanel;
