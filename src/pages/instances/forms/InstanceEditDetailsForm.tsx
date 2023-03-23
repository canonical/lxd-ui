import React, { FC } from "react";
import { Col, Input, List, Row, Textarea } from "@canonical/react-components";
import ProfileSelect from "pages/profiles/ProfileSelector";
import { FormikProps } from "formik/dist/types";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { Link } from "react-router-dom";

export interface InstanceEditDetailsFormValues {
  name: string;
  description?: string;
  instanceType: string;
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
}

const InstanceEditDetailsForm: FC<Props> = ({ formik, project }) => {
  const isReadOnly = formik.values.readOnly;

  return (
    <div className="details">
      {isReadOnly ? (
        <table>
          <tbody>
            <tr>
              <th className="u-text--muted">Name</th>
              <td>{formik.values.name}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Description</th>
              <td>
                {formik.values.description ? formik.values.description : "-"}
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">Profiles</th>
              <td>
                <List
                  className="u-no-margin--bottom"
                  items={formik.values.profiles.map((name) => (
                    <Link
                      key={name}
                      to={`/ui/${project}/profiles/detail/${name}`}
                    >
                      {name}
                    </Link>
                  ))}
                />
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <>
          <Row>
            <Col size={8}>
              <Input
                id="name"
                name="name"
                label="Instance name"
                placeholder="Enter name"
                type="text"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.name}
                disabled
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
              />
            </Col>
          </Row>
          <ProfileSelect
            project={project}
            selected={formik.values.profiles}
            setSelected={(value) => formik.setFieldValue("profiles", value)}
          />
        </>
      )}
    </div>
  );
};

export default InstanceEditDetailsForm;
