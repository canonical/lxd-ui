import { FC, useEffect } from "react";
import { Form, Input, Row, Col, useNotify } from "@canonical/react-components";
import { FormikProps } from "formik";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import PermissionGroupFormMenu from "./PermissionGroupFormMenu";
import IdentityProviderGroupFormMain from "./IdentityProviderGroupFormMain";
import { IdpGroup } from "types/permissions";

export interface IdentityProviderGroupFormValues {
  isCreating: boolean;
  readOnly: boolean;
  name: string;
  groups: string[];
}

interface Props {
  idpGroup: Partial<IdpGroup>;
  formik: FormikProps<IdentityProviderGroupFormValues>;
  section: string;
}

const IdentityProviderGroupForm: FC<Props> = ({
  formik,
  section,
  idpGroup,
}) => {
  const notify = useNotify();

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  return (
    <Form className="form permission-group-form" onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <PermissionGroupFormMenu
        active={section}
        setActive={() => {}}
        formik={formik}
      />
      <Row className="form-contents" key={section}>
        <Col size={12}>
          <IdentityProviderGroupFormMain formik={formik} idpGroup={idpGroup} />
        </Col>
      </Row>
    </Form>
  );
};

export default IdentityProviderGroupForm;
