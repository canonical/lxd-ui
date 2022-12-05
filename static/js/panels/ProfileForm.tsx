import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Form, Input, Row } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import Aside from "../components/Aside";
import NotificationRow from "../components/NotificationRow";
import PanelHeader from "../components/PanelHeader";
import useNotification from "../util/useNotification";
import { createProfile } from "../api/profiles";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../util/queryKeys";
import SubmitButton from "../buttons/SubmitButton";

const ProfileForm: FC = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const queryClient = useQueryClient();

  const ProfileSchema = Yup.object().shape({
    name: Yup.string().required("This field is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    validationSchema: ProfileSchema,
    onSubmit: (values) => {
      createProfile(values.name, values.description)
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.profiles],
          });
          navigate("/profiles");
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Error on profile creation.", e);
        });
    },
  });

  return (
    <Aside>
      <div className="p-panel">
        <PanelHeader title={<h4>Create profile</h4>} />
        <div className="p-panel__content">
          <NotificationRow notify={notify} />
          <Row>
            <Form onSubmit={formik.handleSubmit} stacked>
              <Input
                id="name"
                name="name"
                type="text"
                label="Profile name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.name}
                error={formik.touched.name ? formik.errors.name : null}
                required
                stacked
              />
              <Input
                id="description"
                name="description"
                type="text"
                label="Description"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.description}
                error={
                  formik.touched.description ? formik.errors.description : null
                }
                stacked
              />
              <hr />
              <Row className="u-align--right">
                <Col size={12}>
                  <SubmitButton
                    isSubmitting={formik.isSubmitting}
                    isDisabled={!formik.isValid}
                    buttonLabel="Create profile"
                  />
                </Col>
              </Row>
            </Form>
          </Row>
        </div>
      </div>
    </Aside>
  );
};

export default ProfileForm;
