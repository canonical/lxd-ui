import React, { FC } from "react";
import {
  Col,
  Input,
  NotificationType,
  Row,
  Textarea,
} from "@canonical/react-components";
import ProfileSelect from "pages/profiles/ProfileSelector";
import { FormikProps } from "formik/dist/types";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { useSettings } from "context/useSettings";
import MigrateInstanceBtn from "pages/instances/actions/MigrateInstanceBtn";

export interface InstanceEditDetailsFormValues {
  name: string;
  description?: string;
  instanceType: string;
  location: string;
  profiles: string[];
  type: string;
  readOnly: boolean;
}

export const instanceEditDetailPayload = (values: EditInstanceFormValues) => {
  return {
    name: values.name,
    description: values.description,
    type: values.instanceType,
    profiles: values.profiles,
  };
};

interface Props {
  formik: FormikProps<EditInstanceFormValues>;
  project: string;
  setInTabNotification: (msg: NotificationType) => void;
}

const InstanceEditDetailsForm: FC<Props> = ({
  formik,
  project,
  setInTabNotification,
}) => {
  const isReadOnly = formik.values.readOnly;
  const { data: settings } = useSettings();
  const isClustered = settings?.environment?.server_clustered;

  return (
    <div className="details">
      <Row>
        <Col size={8}>
          <Input
            id="name"
            name="name"
            type="text"
            label="Instance name"
            help="Click the name in the header to rename the instance"
            placeholder="Enter name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : null}
            required
            disabled={true}
          />
          <Textarea
            id="description"
            name="description"
            label="Description"
            placeholder="Enter description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
            rows={Math.max(
              1,
              Math.ceil((formik.values.description?.length ?? 0) / 46)
            )}
            disabled={isReadOnly}
          />
        </Col>
      </Row>
      {isClustered && (
        <Row>
          <Col size={8}>
            <Input
              id="target"
              name="target"
              type="text"
              label="Instance location"
              value={formik.values.location}
              required
              disabled={true}
            />
          </Col>
          {!isReadOnly && (
            <Col size={4}>
              <MigrateInstanceBtn
                instance={formik.values.name}
                location={formik.values.location}
                project={project}
                setInTabNotification={setInTabNotification}
                onFinish={(newLocation: string) =>
                  formik.setFieldValue("location", newLocation)
                }
              />
            </Col>
          )}
        </Row>
      )}
      <ProfileSelect
        project={project}
        selected={formik.values.profiles}
        setSelected={(value) => formik.setFieldValue("profiles", value)}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};

export default InstanceEditDetailsForm;
