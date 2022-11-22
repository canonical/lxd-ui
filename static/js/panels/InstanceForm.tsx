import React, { FC } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchImageList } from "../api/images";
import { createInstance } from "../api/instances";
import Aside from "../components/Aside";
import NotificationRow from "../components/NotificationRow";
import PanelHeader from "../components/PanelHeader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../util/queryKeys";
import useNotification from "../util/useNotification";

const InstanceForm: FC = () => {
  const notify = useNotification();

  const navigate = useNavigate();
  const [queryParams] = useSearchParams();
  const queryClient = useQueryClient();

  const { data: images = [], error } = useQuery({
    queryKey: [queryKeys.images],
    queryFn: fetchImageList,
  });

  if (error) {
    notify.failure("Could not load images.", error);
  }

  const getImageOptions = () => {
    const options = images.map((image) => {
      return {
        label: image.properties.description,
        value: image.fingerprint,
        disabled: false,
      };
    });
    options.unshift({
      label: images.length === 0 ? "No image available" : "Select option",
      value: "",
      disabled: true,
    });
    return options;
  };

  const getInstanceType = (fingerprint: string) => {
    return images.find((item) => item.fingerprint === fingerprint)?.type ===
      "container"
      ? "container"
      : "virtual-machine";
  };

  const InstanceSchema = Yup.object().shape({
    image: Yup.string().required("This field is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      image: queryParams.get("image") || "",
    },
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      const instanceType = getInstanceType(values.image);
      createInstance(values.name, values.image, instanceType)
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.instances],
          });
          navigate("/instances");
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Error on instance creation.", e);
        });
    },
  });

  const submitButton = formik.isSubmitting ? (
    <Button
      appearance="positive"
      type="submit"
      hasIcon
      disabled
      style={{ marginRight: "1rem" }}
    >
      <i className="p-icon--spinner is-light u-animation--spin"></i>{" "}
      <span>Processing...</span>
    </Button>
  ) : (
    <Button
      appearance="positive"
      type="submit"
      disabled={!formik.isValid}
      style={{ marginRight: "1rem" }}
    >
      Create instance
    </Button>
  );

  return (
    <Aside>
      <div className="p-panel">
        <PanelHeader title={<h4>Create instance</h4>} />
        <div className="p-panel__content">
          <NotificationRow notify={notify} />
          <Row>
            <Form onSubmit={formik.handleSubmit} stacked>
              <Input
                id="name"
                name="name"
                type="text"
                label="Instance name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.name}
                error={formik.touched.name ? formik.errors.name : null}
                stacked
              />
              <Select
                id="image"
                name="image"
                label="Image"
                options={getImageOptions()}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.image}
                error={formik.touched.image ? formik.errors.image : null}
                required
                stacked
              />
              <hr />
              <Row className="u-align--right">
                <Col size={12}>{submitButton}</Col>
              </Row>
            </Form>
          </Row>
        </div>
      </div>
    </Aside>
  );
};

export default InstanceForm;
