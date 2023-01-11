import React, { FC, useState } from "react";
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
import { createInstance } from "api/instances";
import Aside from "components/Aside";
import NotificationRow from "components/NotificationRow";
import PanelHeader from "components/PanelHeader";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import useNotification from "util/useNotification";
import SubmitButton from "components/SubmitButton";
import ProfileSelect from "pages/profiles/ProfileSelector";
import SelectImageBtn from "pages/images/actions/SelectImageBtn";
import { RemoteImage } from "types/image";
import { isContainerOnlyImage, isVmOnlyImage } from "util/images";
import { instanceTypeOptions } from "util/instanceOptions";
import { checkDuplicateName } from "util/helpers";

const InstanceFormGuided: FC = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const InstanceSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "An instance with this name already exists",
        (value) => checkDuplicateName(value, controllerState, "instances")
      )
      .optional(),
    instanceType: Yup.string().required("Instance type is required"),
  });

  const formik = useFormik<{
    name: string;
    image: RemoteImage | undefined;
    instanceType: string;
    profiles: string[];
  }>({
    initialValues: {
      name: "",
      image: undefined,
      instanceType: "container",
      profiles: ["default"],
    },
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      if (!values.image) {
        formik.setSubmitting(false);
        notify.failure("", new Error("No image selected"));
        return;
      }
      createInstance(
        values.name,
        values.image,
        values.instanceType,
        values.profiles
      )
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.instances],
          });
          navigate("/ui/instances");
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Error on instance creation.", e);
        });
    },
  });

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
                    options={instanceTypeOptions}
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
                    <Label required>Base Image</Label>
                  </Col>
                  <Col size={8}>
                    <SelectImageBtn
                      appearance=""
                      caption="Select image"
                      onSelect={handleSelectImage}
                    />
                  </Col>
                </>
              )}
              <ProfileSelect
                notify={notify}
                selected={formik.values.profiles}
                setSelected={(value) =>
                  void formik.setFieldValue("profiles", value)
                }
              />
              <hr />
              <Row className="u-align--right">
                <Col size={12}>
                  <Button onClick={() => navigate("/ui/instances")}>
                    Cancel
                  </Button>
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
