import React, { FC } from "react";
import { Col, Form, Input, Row, Select } from "@canonical/react-components";
import * as Yup from "yup";
import { useFormik } from "formik";
import { importImage } from "../../api/images";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import SubmitButton from "../../buttons/SubmitButton";

interface Props {
  notify: NotificationHelper;
}

const ImageAdd: FC<Props> = ({ notify }) => {
  const queryClient = useQueryClient();

  const ImageSchema = Yup.object().shape({
    server: Yup.string().required("This field is required"),
    name: Yup.string().required("This field is required"),
  });

  const formik = useFormik({
    initialValues: {
      server: "https://images.linuxcontainers.org",
      otherServer: "",
      name: "",
    },
    validationSchema: ImageSchema,
    onSubmit: (values) => {
      notify.info("Import started, this can take several minutes.");
      importImage({ aliases: values.name, server: values.server })
        .then(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.images],
          });
          notify.success("Image import finished.");
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Error on image import.", e);
        });
    },
  });

  return (
    <Form onSubmit={formik.handleSubmit} stacked>
      <Select
        name="server"
        className="is-dense"
        label="Server"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.server ? formik.errors.server : null}
        options={[
          {
            label: "https://images.linuxcontainers.org",
            value: "https://images.linuxcontainers.org",
          },
          {
            label: "https://cloud-images.ubuntu.com/releases",
            value: "https://cloud-images.ubuntu.com/releases",
          },
          { label: "Other", value: "other" },
        ]}
        required
        stacked
      />
      {formik.values.server === "other" && (
        <Input
          id="otherServer"
          label="Other server"
          help="Url to a custom image server"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.server ? formik.errors.server : null}
          required
          stacked
          type="text"
        />
      )}
      <Input
        id="name"
        label="Name"
        help="Alias of an image available on the chosen server i.e. ubuntu/22.04/desktop"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name ? formik.errors.name : null}
        required
        stacked
        type="text"
      />
      <hr />
      <Row className="u-align--right">
        <Col size={12}>
          <SubmitButton
            isSubmitting={formik.isSubmitting}
            isDisabled={!formik.isValid}
            buttonLabel="Import image"
          />
        </Col>
      </Row>
    </Form>
  );
};

export default ImageAdd;
