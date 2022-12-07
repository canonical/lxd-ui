import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Form, Row } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createInstanceFromJson } from "../api/instances";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../util/queryKeys";
import SubmitButton from "../buttons/SubmitButton";
import { load as loadYaml } from "js-yaml";
import PanelHeader from "../components/PanelHeader";
import NotificationRow from "../components/NotificationRow";
import Aside from "../components/Aside";
import useNotification from "../util/useNotification";
import YamlEditor from "@focus-reactive/react-yaml";

const InstanceFormYaml: FC = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const queryClient = useQueryClient();

  const yamlToJson = (yamlString: string): string => {
    const json = loadYaml(yamlString.trim());
    return JSON.stringify(json);
  };

  const InstanceSchema = Yup.object().shape({
    instanceYaml: Yup.string().required("This field is required"),
  });

  const formik = useFormik({
    initialValues: {
      instanceYaml: "\n\n",
    },
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      if (values.instanceYaml.trim() === "") {
        formik.setSubmitting(false);
        return notify.failure(
          "",
          new Error("Please enter a valid YAML configuration.")
        );
      }
      const instanceJson = yamlToJson(values.instanceYaml);
      createInstanceFromJson(instanceJson)
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

  return (
    <Aside width="wide">
      <div className="p-panel">
        <PanelHeader title={<h4>Create instance from YAML configuration</h4>} />
        <NotificationRow notify={notify} />
        <Row>
          <Form onSubmit={formik.handleSubmit} stacked>
            <div className="p-instance-yaml">
              <YamlEditor
                text={formik.values.instanceYaml}
                onChange={({ text }) =>
                  void formik.setValues({ instanceYaml: text })
                }
              />
            </div>
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
    </Aside>
  );
};

export default InstanceFormYaml;
