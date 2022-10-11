import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
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
import { fetchImageList } from "./api/images";
import { createInstance } from "./api/instances";

function InstanceForm() {
  const [images, setImages] = useState([
    {
      label: "Select option",
      value: "",
      disabled: "disabled",
    },
  ]);

  let history = useHistory();

  useEffect(() => {
    fetchImageList().then((data) => {
      const options = data.map((imageRaw) => {
        return {
          label: imageRaw.properties.description,
          value: imageRaw.fingerprint,
        };
      });
      options.unshift({
        label: options.length === 0 ? "No image available" : "Select option",
        value: "",
        disabled: "disabled",
      });
      setImages(options);
    });
  }, []);

  const InstanceSchema = Yup.object().shape({
    name: Yup.string()
      .required("This field is required")
      .matches('^[^<>:"/\\|?*\\s]*$', "This is not a valid name"),
    image: Yup.string().required("This field is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      image: "",
    },
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      createInstance(values.name, values.image).then(() =>
        history.push("/instances")
      );
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
      disabled={!formik.dirty || !formik.isValid}
      style={{ marginRight: "1rem" }}
    >
      Create instance
    </Button>
  );

  return (
    <>
      <div className="p-panel__header">
        <h4 className="p-panel__title">Create instance</h4>
      </div>
      <div className="p-panel__content">
        <Row>
          <strong className="p-heading--5">Required</strong>
        </Row>
        <Row>
          <Form onSubmit={formik.handleSubmit} stacked>
            <Input
              id="name"
              name="name"
              type="text"
              label="Instance name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              error={formik.touched.name ? formik.errors.name : null}
              stacked
            />
            <Select
              id="image"
              name="image"
              label="Image"
              options={images}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.image}
              error={formik.touched.image ? formik.errors.image : null}
              stacked
            />
            <hr />
            <Row className="u-align--right">
              <Col size={12}>
                {submitButton}
                <Link to="/instances">
                  <Button>Cancel</Button>
                </Link>
              </Col>
            </Row>
          </Form>
        </Row>
      </div>
    </>
  );
}

export default InstanceForm;
