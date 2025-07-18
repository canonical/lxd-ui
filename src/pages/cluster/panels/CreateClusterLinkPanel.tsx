import {
  ActionButton,
  Button,
  Form,
  Input,
  Label,
  RadioInput,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import SidePanel from "components/SidePanel";
import type { FC } from "react";
import { useState } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";
import { createClusterLink } from "api/cluster-links";
import { base64EncodeObject, checkDuplicateName } from "util/helpers";
import ResourceLink from "components/ResourceLink";
import GroupSelection from "pages/permissions/panels/GroupSelection";
import { useAuthGroups } from "context/useAuthGroups";

export interface CreateClusterLinkForm {
  name: string;
  description: string;
  token?: string;
  authGroups: string[];
}

interface Props {
  onSuccess: (identityName: string, token: string) => void;
}

const CreateClusterLinkPanel: FC<Props> = ({ onSuccess }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [tokenType, setType] = useState<"generate" | "consume">("generate");
  const { data: authGroups = [] } = useAuthGroups();

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

  const formik = useFormik<CreateClusterLinkForm>({
    initialValues: {
      name: "",
      description: "",
      token: "",
      authGroups: [],
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
          if (tokenType === "generate") {
            const encodedToken = base64EncodeObject(response);
            onSuccess(values.name, encodedToken);
          } else {
            toastNotify.success(
              <>
                Cluster link{" "}
                <ResourceLink
                  type="cluster-link"
                  value={values.name}
                  to="/ui/cluster/links"
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
    <SidePanel isOverlay loading={false} hasError={false}>
      <SidePanel.Header>
        <SidePanel.HeaderTitle>Create cluster link</SidePanel.HeaderTitle>
      </SidePanel.Header>
      <NotificationRow className="u-no-padding" />
      <SidePanel.Content className="u-no-padding">
        <ScrollableContainer
          dependencies={[notify.notification]}
          belowIds={["panel-footer"]}
        >
          <Form onSubmit={formik.handleSubmit}>
            {/* hidden submit to enable enter key in inputs */}
            <Input type="submit" hidden value="Hidden input" />
            <Input
              {...formik.getFieldProps("name")}
              type="text"
              label="Name"
              placeholder="Enter name"
              required
              autoFocus
              error={formik.touched.name ? formik.errors.name : null}
            />
            <Input
              {...formik.getFieldProps("description")}
              type="text"
              label="Description"
              placeholder="Enter description"
            />

            <div className="u-sv1">
              <RadioInput
                inline
                labelClassName="margin-right"
                label="Generate token"
                checked={tokenType === "generate"}
                onClick={() => {
                  setType("generate");
                }}
              />
              <RadioInput
                inline
                label="Consume token"
                checked={tokenType === "consume"}
                onClick={() => {
                  setType("consume");
                }}
              />
            </div>
            {tokenType === "consume" && (
              <Input
                {...formik.getFieldProps("token")}
                type="text"
                label="Token"
                placeholder="Enter token"
              />
            )}
            <Label className="u-sv-2">Auth groups</Label>
            <p className="u-text--muted u-sv-1">
              Control access for incoming request on the cluster link.
            </p>
            <GroupSelection
              groups={authGroups}
              modifiedGroups={new Set(formik.values.authGroups)}
              parentItemName="cluster link"
              selectedGroups={new Set(formik.values.authGroups)}
              setSelectedGroups={(val, isUnselectAll) => {
                if (isUnselectAll) {
                  formik.setFieldValue("authGroups", []);
                } else {
                  formik.setFieldValue("authGroups", val);
                }
              }}
              toggleGroup={(group) => {
                const currentGroups = formik.values.authGroups;
                if (currentGroups.includes(group)) {
                  formik.setFieldValue(
                    "authGroups",
                    currentGroups.filter((g) => g !== group),
                  );
                } else {
                  formik.setFieldValue("authGroups", [...currentGroups, group]);
                }
              }}
              scrollDependencies={[formik]}
            />
          </Form>
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
