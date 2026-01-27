import type { FC } from "react";
import {
  ActionButton,
  Button,
  CustomLayout,
  NotificationConsumer,
  Row,
  Spinner,
  useNotify,
} from "@canonical/react-components";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useCallback, useMemo } from "react";
import type { TLSIdentityFormValues } from "types/forms/tlsIdentity";
import GroupSelection from "pages/permissions/panels/GroupSelection";
import { useAuthGroups } from "context/useAuthGroups";
import { createFineGrainedTlsIdentity } from "api/auth-identities";
import NameWithGroupForm from "pages/permissions/forms/NameWithGroupForm";
import { useIdentities } from "context/useIdentities";
import { Navigate, useNavigate } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";
import CertificateAddNotifications from "components/CertificateAddNotifications";
import AuthenticationTlsStepper from "components/AuthenticationTlsStepper";
import { logoutBearerToken } from "util/helpers";
import { useAuth } from "context/auth";
import { AUTH_METHOD, isPermanent } from "util/authentication";

const CreateTlsIdentityWithBearerToken: FC = () => {
  const { isAuthenticated, isAuthLoading, authMethod } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();
  const { data: groups = [], error } = useAuthGroups();
  const { data: identities = [], error: identitiesError } = useIdentities();
  const isBearerToken = authMethod === AUTH_METHOD.BEARER;

  const findAvailableName = useCallback(
    (baseName: string): string => {
      const existingNames = identities.map((identity) => identity.name);

      if (!existingNames.includes(baseName)) {
        return baseName;
      }

      let counter = 2;
      while (existingNames.includes(`${baseName}-${counter}`)) {
        counter++;
      }
      return `${baseName}-${counter}`;
    },
    [identities],
  );

  const initialGroups = useMemo(() => {
    const adminsGroup = groups.find((group) => group.name === "admins");
    return adminsGroup ? ["admins"] : [];
  }, [groups]);

  if (error) {
    notify.failure("Loading details failed", error);
  }

  if (identitiesError) {
    notify.failure("Loading identities failed", identitiesError);
  }

  const handleSubmit = (values: TLSIdentityFormValues) => {
    createFineGrainedTlsIdentity(values.name, values.groups ?? [], false)
      .then(() => {
        logoutBearerToken();
      })
      .catch((e) => {
        formik.setSubmitting(false);
        notify.failure("Identity creation failed", e);
      });
  };

  const groupSchema = Yup.object().shape({
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
  });

  const formik = useFormik<TLSIdentityFormValues>({
    initialValues: {
      name: findAvailableName("lxd-ui"),
      groups: initialGroups,
    },
    validationSchema: groupSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (isAuthenticated && isPermanent(authMethod)) {
    return <Navigate to={`${ROOT_PATH}/ui`} replace={true} />;
  }

  if (!isAuthenticated || !isBearerToken) {
    return <Navigate to={`${ROOT_PATH}/ui/login`} replace={true} />;
  }

  return (
    <CustomLayout mainClassName="certificates-with-bearer-token">
      <Row>
        <AuthenticationTlsStepper
          variant="horizontal"
          step2Name="Create TLS identity"
        />
        {notify.notification ? (
          <NotificationConsumer />
        ) : (
          <CertificateAddNotifications />
        )}
        <NameWithGroupForm formik={formik} />
        <p>Auth groups</p>
        <GroupSelection
          groups={groups}
          modifiedGroups={new Set(formik.values.groups)}
          parentItemName=""
          selectedGroups={new Set(formik.values.groups)}
          setSelectedGroups={(newGroups: string[]) => {
            formik.setFieldValue("groups", newGroups);
          }}
          toggleGroup={(group: string) => {
            const currentGroups = formik.values.groups ?? [];
            const newGroups = currentGroups.includes(group)
              ? currentGroups.filter((g) => g !== group)
              : [...currentGroups, group];
            formik.setFieldValue("groups", newGroups);
          }}
          scrollDependencies={[
            groups,
            formik.values.groups?.length,
            notify.notification,
            formik,
          ]}
          belowIds={[
            "create-tls-identity-with-bearer-token-footer",
            "status-bar",
          ]}
        />
        <div
          id="create-tls-identity-with-bearer-token-footer"
          className="u-flex create-tls-identity-with-bearer-token-footer"
        >
          <Button
            appearance="base"
            onClick={() => {
              navigate(`${ROOT_PATH}/ui/login/certificate-generate`);
            }}
            className="u-no-margin--bottom"
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            onClick={() => void formik.submitForm()}
            disabled={
              !formik.isValid || formik.isSubmitting || !formik.values.name
            }
            loading={formik.isSubmitting}
            className="u-no-margin--bottom"
          >
            Create identity
          </ActionButton>
        </div>
      </Row>
    </CustomLayout>
  );
};

export default CreateTlsIdentityWithBearerToken;
