import React, { Dispatch, FC, SetStateAction } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
} from "@canonical/react-components";
import { Notification } from "../../types/notification";
import * as Yup from "yup";
import { useFormik } from "formik";
import { importImage } from "../../api/images";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";

type Props = {
  setNotification: Dispatch<SetStateAction<Notification | null>>;
};

const ImageAdd: FC<Props> = ({ setNotification }) => {
  const navigate = useNavigate();
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
      setNotification({
        message: "Import started, this can take several minutes.",
        type: "information",
      });
      importImage({ aliases: values.name, server: values.server })
        .then(() => {
          setNotification({
            message: `Image import finished.`,
            type: "positive",
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeys.images],
          });
          navigate("/images");
        })
        .catch((e) => {
          formik.setSubmitting(false);
          setNotification({
            message: `Error on image import. ${e.toString()}`,
            type: "negative",
          });
        });
    },
  });

  const submitButton = formik.isSubmitting ? (
    <Button appearance="positive" type="submit" hasIcon disabled>
      <i className="p-icon--spinner is-light u-animation--spin"></i>{" "}
      <span>Processing...</span>
    </Button>
  ) : (
    <Button appearance="positive" type="submit" disabled={!formik.isValid}>
      <i className="p-icon--import is-light"></i> <span>Import image</span>
    </Button>
  );

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
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name ? formik.errors.name : null}
        required
        stacked
        type="text"
      />
      <hr />
      <Row className="u-align--right">
        <Col size={12}>{submitButton}</Col>
      </Row>
    </Form>
  );
};

export default ImageAdd;
