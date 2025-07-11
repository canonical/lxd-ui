import {
  ActionButton,
  Button,
  Form,
  Input,
  useNotify,
} from "@canonical/react-components";
import SidePanel from "components/SidePanel";
import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";
import { createClusterMember } from "api/cluster";
import type { LxdClusterMember } from "types/cluster";
import { base64EncodeObject } from "util/helpers";

interface Props {
  onSuccess: (identityName: string, token: string) => void;
}

const AddClusterMemberPanel: FC<Props> = ({ onSuccess }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  interface AddClusterMemberForm {
    name: string;
  }

  const formik = useFormik<AddClusterMemberForm>({
    initialValues: {
      name: "",
    },
    onSubmit: (values) => {
      const payload = {
        server_name: values.name,
      } as LxdClusterMember;

      createClusterMember(payload)
        .then((response) => {
          const token = {
            server_name: response.serverName,
            fingerprint: response.fingerprint,
            addresses: response.addresses,
            secret: response.secret,
            expires_at: response.expiresAt,
          };
          const encodedToken = base64EncodeObject(token);
          onSuccess(values.name, encodedToken);
          closePanel();
        })
        .catch((e) => {
          notify.failure("Cluster member addition failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  return (
    <SidePanel isOverlay loading={false} hasError={false}>
      <SidePanel.Header>
        <SidePanel.HeaderTitle>
          Add cluster member {panelParams.member}
        </SidePanel.HeaderTitle>
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
          Request join token
        </ActionButton>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default AddClusterMemberPanel;
