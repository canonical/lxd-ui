import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Row,
  Select,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createInstance } from "../api/instances";
import Aside from "../components/Aside";
import NotificationRow from "../components/NotificationRow";
import PanelHeader from "../components/PanelHeader";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../util/queryKeys";
import useNotification from "../util/useNotification";
import SubmitButton from "../buttons/SubmitButton";
import SelectImageBtn from "../buttons/images/SelectImageBtn";
import { RemoteImage } from "../types/image";

const InstanceFormGuided: FC = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const queryClient = useQueryClient();

  const InstanceSchema = Yup.object().shape({
    name: Yup.string().optional(),
    instanceType: Yup.string().required("Instance type is required"),
  });

  const formik = useFormik<{
    name: string;
    image: RemoteImage | undefined;
    instanceType: string;
  }>({
    initialValues: {
      name: "",
      image: undefined,
      instanceType: "container",
    },
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      if (!values.image) {
        formik.setSubmitting(false);
        notify.failure("", new Error("No image selected"));
        return;
      }
      createInstance(values.name, values.image, values.instanceType)
        .then(() => {
          void queryClient.invalidateQueries({
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

  const isVmOnlyImage = (image: RemoteImage) => {
    return image.variant?.includes("desktop");
  };

  const isContainerOnlyImage = (image: RemoteImage) => {
    const vmFiles = ["disk1.img", "disk-kvm.img", "uefi1.img"];
    return (
      Object.entries(image.versions ?? {}).find((version) =>
        Object.entries(version[1].items).find((item) =>
          vmFiles.includes(item[1].ftype)
        )
      ) === undefined
    );
  };

  const handleSelectImage = (image: RemoteImage) => {
    void formik.setFieldValue("image", image);
    if (isVmOnlyImage(image)) {
      void formik.setFieldValue("instanceType", "virtual-machine");
    }
    if (isContainerOnlyImage(image)) {
      void formik.setFieldValue("instanceType", "container");
    }
  };

  return (
    <Aside>
      <div className="p-panel">
        <PanelHeader title={<h4>Quick create instance</h4>} />
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
              />
              {formik.values.image ? (
                <>
                  <Row>
                    <Col size={8}>
                      <Input
                        id="baseImage"
                        name="baseImage"
                        label="Base Image"
                        type="text"
                        value={
                          formik.values.image.os +
                          " " +
                          formik.values.image.release +
                          " " +
                          formik.values.image.aliases.split(",")[0]
                        }
                        disabled
                        required
                      />
                    </Col>
                    <Col size={4} className="u-align-self-end">
                      <SelectImageBtn
                        appearance="link"
                        caption="Change image"
                        onSelect={handleSelectImage}
                      />
                    </Col>
                  </Row>
                  <Input
                    id="architecture"
                    name="architecture"
                    label="Architecture"
                    type="text"
                    value={formik.values.image.arch}
                    disabled
                  />
                  <Select
                    id="instanceType"
                    label="Instance type"
                    name="instanceType"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    options={[
                      {
                        label: "Container",
                        value: "container",
                      },
                      {
                        label: "Virtual Machine",
                        value: "virtual-machine",
                      },
                    ]}
                    value={formik.values.instanceType}
                    disabled={
                      isContainerOnlyImage(formik.values.image) ||
                      isVmOnlyImage(formik.values.image)
                    }
                  />
                </>
              ) : (
                <>
                  <Col size={4}>
                    <Label>* Base Image</Label>
                  </Col>
                  <Col size={8}>
                    <SelectImageBtn
                      appearance="bare"
                      caption="Select image"
                      onSelect={handleSelectImage}
                    />
                  </Col>
                </>
              )}
              <hr />
              <Row className="u-align--right">
                <Col size={12}>
                  <Button onClick={() => navigate("/instances")}>Cancel</Button>
                  <SubmitButton
                    isSubmitting={formik.isSubmitting}
                    isDisabled={!formik.isValid}
                    buttonLabel="Create instance"
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

export default InstanceFormGuided;
