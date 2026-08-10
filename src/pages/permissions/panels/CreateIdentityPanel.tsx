import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  useNotify,
} from "@canonical/react-components";
import { useState, type FC, type MouseEvent } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import BackLink from "components/BackLink";
import FormLink from "components/FormLink";
import NotificationRow from "components/NotificationRow";
import { useAuthGroups } from "context/useAuthGroups";
import { useIdentities } from "context/useIdentities";
import {
  createAndIssueBearerToken,
  createFineGrainedTlsIdentity,
} from "api/auth-identities";
import NameWithGroupForm from "pages/permissions/forms/NameWithGroupForm";
import TokenExpirySelector from "pages/permissions/panels/TokenExpirySelector";
import GroupSelection from "pages/permissions/panels/GroupSelection";
import { base64EncodeObject } from "util/helpers";
import {
  BEARER_EXPIRY_PATTERN,
  BEARER_EXPIRY_VALIDATION_TEXT,
  IDENTITY_TYPE,
  IDENTITY_TYPE_HELP_TEXT,
  IDENTITY_TYPES_WITH_EXPIRY,
  type BearerIdentityType,
  type IdentityType,
} from "util/permissionIdentities";
import type { IdentityFormValues } from "types/forms/identity";
import { createClusterLink } from "api/cluster-links";

interface Props {
  onSuccess: (identity: IdentityFormValues, token: string) => void;
}

const CreateIdentityPanel: FC<Props> = ({ onSuccess }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const [currentStep, setCurrentStep] = useState<
    "typeSelection" | "detailsForm"
  >("typeSelection");

  const { data: groups = [], error, isLoading } = useAuthGroups();
  const { data: identities = [] } = useIdentities();

  if (error) {
    notify.failure("Loading details failed", error);
  }

  const modifyGroups = (newGroups: string[], isUnselectAll?: boolean) => {
    if (isUnselectAll) {
      formik.setFieldValue("groups", []);
    } else {
      formik.setFieldValue("groups", newGroups);
    }
  };

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const onError = (e: unknown) => {
    formik.setSubmitting(false);
    notify.failure("Identity creation failed", e);
  };

  const selectType = (identityType: IdentityType) => {
    if (identityType !== formik.values.identityType) {
      formik.resetForm({
        values: {
          name: "",
          groups: [],
          identityType,
          expiry: "",
          isCustomExpiry: false,
        },
      });
    }

    setCurrentStep("detailsForm");
  };

  const handleSubmit = (values: IdentityFormValues) => {
    const assignedGroups = values.groups ?? [];

    if (values.identityType === IDENTITY_TYPE.TLS) {
      createFineGrainedTlsIdentity(values.name, assignedGroups)
        .then((response) => {
          const encodedToken = base64EncodeObject(response);
          onSuccess(values, encodedToken);
        })
        .catch((e) => {
          onError(e);
        });
    } else if (values.identityType === IDENTITY_TYPE.CLUSTER_LINK) {
      const payload = {
        name: values.name,
        auth_groups: values.groups,
        type: "unidirectional",
      };

      createClusterLink(JSON.stringify(payload))
        .then((response) => {
          if (!response) {
            onError("Failed to create cluster link identity");
            return;
          }
          const encodedToken = base64EncodeObject(response);
          onSuccess(values, encodedToken);
        })
        .catch((e) => {
          onError(e);
        });
    } else {
      createAndIssueBearerToken(
        values.name,
        values.identityType as BearerIdentityType,
        assignedGroups,
        values.expiry,
      )
        .then((response) => {
          onSuccess(values, response.token);
        })
        .catch((e) => {
          onError(e);
        });
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Identity name is required")
      .test(
        "unique-name",
        "An identity with this name already exists",
        function (value) {
          if (!value) {
            return true;
          }
          const existingNames = identities.map((identity) => identity.name);
          return !existingNames.includes(value);
        },
      ),
    expiry: Yup.string().when("identityType", {
      is: (identityType: IdentityType) =>
        IDENTITY_TYPES_WITH_EXPIRY.includes(identityType),
      then: (schema) =>
        schema.test(
          "valid-expiry-format",
          BEARER_EXPIRY_VALIDATION_TEXT,
          (value) => !value || BEARER_EXPIRY_PATTERN.test(value.trim()),
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik<IdentityFormValues>({
    initialValues: {
      name: "",
      groups: [],
      identityType: IDENTITY_TYPE.TLS,
      expiry: "",
      isCustomExpiry: false,
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const groupsAdded = new Set(formik.values.groups ?? []);
  const isNameInvalid = !formik.values.name || !!formik.errors.name;
  const goToTypeSelectionStep = () => {
    formik.setTouched({}, false);
    setCurrentStep("typeSelection");
  };

  return (
    <SidePanel loading={isLoading} hasError={Boolean(error)}>
      <SidePanel.Header>
        <SidePanel.HeaderTitle key={currentStep}>
          {currentStep === "typeSelection" ? (
            "Choose an identity type"
          ) : (
            <BackLink
              linkText="Choose type"
              title={IDENTITY_TYPE_HELP_TEXT[formik.values.identityType].title}
              onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
              }}
              onClick={goToTypeSelectionStep}
            />
          )}
        </SidePanel.HeaderTitle>
      </SidePanel.Header>
      <NotificationRow className="u-no-padding" />
      <SidePanel.Content className="u-no-padding">
        {currentStep === "typeSelection" ? (
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <div className="choose-identity-type">
              <FormLink
                icon="certificate"
                title={IDENTITY_TYPE_HELP_TEXT[IDENTITY_TYPE.TLS].title}
                subText={IDENTITY_TYPE_HELP_TEXT[IDENTITY_TYPE.TLS].description}
                subTextBelowTitle
                onClick={() => {
                  selectType(IDENTITY_TYPE.TLS);
                }}
              />
              <FormLink
                icon="private-key"
                title={
                  IDENTITY_TYPE_HELP_TEXT[IDENTITY_TYPE.BEARER_CLIENT].title
                }
                subText={
                  IDENTITY_TYPE_HELP_TEXT[IDENTITY_TYPE.BEARER_CLIENT]
                    .description
                }
                subTextBelowTitle
                onClick={() => {
                  selectType(IDENTITY_TYPE.BEARER_CLIENT);
                }}
              />
              <FormLink
                icon="private-key"
                title={
                  IDENTITY_TYPE_HELP_TEXT[IDENTITY_TYPE.BEARER_DEVLXD].title
                }
                subText={
                  IDENTITY_TYPE_HELP_TEXT[IDENTITY_TYPE.BEARER_DEVLXD]
                    .description
                }
                subTextBelowTitle
                onClick={() => {
                  selectType(IDENTITY_TYPE.BEARER_DEVLXD);
                }}
              />
              <FormLink
                icon="applications"
                title={
                  IDENTITY_TYPE_HELP_TEXT[IDENTITY_TYPE.CLUSTER_LINK].title
                }
                subText={
                  IDENTITY_TYPE_HELP_TEXT[IDENTITY_TYPE.CLUSTER_LINK]
                    .description
                }
                subTextBelowTitle
                onClick={() => {
                  selectType(IDENTITY_TYPE.CLUSTER_LINK);
                }}
              />
            </div>
          </ScrollableContainer>
        ) : (
          <>
            <NameWithGroupForm formik={formik} />
            {IDENTITY_TYPES_WITH_EXPIRY.includes(
              formik.values.identityType,
            ) && (
              <TokenExpirySelector
                isCustomExpiry={!!formik.values.isCustomExpiry}
                expiry={formik.values.expiry}
                disabled={isNameInvalid}
                error={
                  formik.values.isCustomExpiry &&
                  formik.touched.expiry &&
                  formik.errors.expiry
                    ? formik.errors.expiry
                    : undefined
                }
                onIsCustomExpiryChange={(isCustom) => {
                  formik.setFieldValue("isCustomExpiry", isCustom);
                  if (!isCustom) {
                    formik.setFieldValue("expiry", "");
                  }
                }}
                onExpiryChange={(value) => {
                  formik.setFieldValue("expiry", value);
                }}
                onExpiryBlur={() => {
                  formik.setFieldTouched("expiry", true);
                }}
              />
            )}
            <label htmlFor="group-selection-table">Auth groups</label>
            <GroupSelection
              groups={groups}
              modifiedGroups={groupsAdded}
              parentItemName=""
              selectedGroups={groupsAdded}
              setSelectedGroups={modifyGroups}
              toggleGroup={(group: string) => {
                if (groupsAdded.has(group)) {
                  groupsAdded.delete(group);
                } else {
                  groupsAdded.add(group);
                }
                formik.setFieldValue("groups", Array.from(groupsAdded));
              }}
              scrollDependencies={[
                groups,
                groupsAdded.size,
                notify.notification,
                formik,
              ]}
              disabled={isNameInvalid}
            />
          </>
        )}
      </SidePanel.Content>
      <SidePanel.Footer className="u-align--right">
        <div id="panel-footer" className="u-flex u-align--right">
          {currentStep === "typeSelection" ? (
            <Button
              appearance="base"
              onClick={closePanel}
              className="u-no-margin--bottom"
            >
              Cancel
            </Button>
          ) : (
            <>
              <Button
                appearance="base"
                type="button"
                onClick={goToTypeSelectionStep}
                className="u-no-margin--bottom"
              >
                Back
              </Button>
              <ActionButton
                appearance="positive"
                onClick={() => void formik.submitForm()}
                className="u-no-margin--bottom"
                disabled={
                  !formik.isValid ||
                  formik.isSubmitting ||
                  !formik.values.name ||
                  (formik.values.isCustomExpiry && !formik.values.expiry)
                }
                loading={formik.isSubmitting}
                title={
                  formik.values.isCustomExpiry && !formik.values.expiry
                    ? "Please provide a valid expiry date"
                    : undefined
                }
              >
                Create identity
              </ActionButton>
            </>
          )}
        </div>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default CreateIdentityPanel;
