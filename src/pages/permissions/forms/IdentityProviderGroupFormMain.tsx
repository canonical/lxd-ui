import { FC, ReactNode } from "react";
import { Row, Input, Col, Button, List } from "@canonical/react-components";
import { FormikProps } from "formik";
import ScrollableForm from "components/ScrollableForm";
import { IdentityProviderGroupFormValues } from "./IdentityProviderGroupForm";
import usePortal from "react-useportal";
import IdentityProviderMapGroupModal from "../IdentityProviderMapGroupModal";
import { IdpGroup } from "types/permissions";

interface Props {
  idpGroup: Partial<IdpGroup>;
  formik: FormikProps<IdentityProviderGroupFormValues>;
}

const IdentityProviderGroupFormMain: FC<Props> = ({ formik, idpGroup }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const getFormProps = (id: "name") => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id],
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `Enter ${id.replaceAll("_", " ")}`,
    };
  };

  const handleCompleteLxdGroupsMapping = (groups: string[]) => {
    void formik.setFieldValue("groups", groups);
    closePortal();
  };

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Input
            {...getFormProps("name")}
            type="text"
            label="Name"
            required
            disabled={!formik.values.isCreating || formik.values.readOnly}
          />
          <Button
            appearance="positive"
            disabled={formik.values.readOnly}
            onClick={openPortal}
            type="button"
          >
            <span>Map LXD Groups</span>
          </Button>
          {isOpen ? (
            <Portal>
              <IdentityProviderMapGroupModal
                idpGroup={idpGroup}
                onCancel={closePortal}
                onFinish={handleCompleteLxdGroupsMapping}
                submitting={false}
              />
            </Portal>
          ) : null}
          {formik.values.groups.length ? (
            <List items={formik.values.groups} divided />
          ) : null}
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default IdentityProviderGroupFormMain;
