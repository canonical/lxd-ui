import React, { FC } from "react";
import { Button, Col, Form, Row } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchInstance, updateInstanceFromJson } from "api/instances";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { dump as dumpYaml } from "js-yaml";
import PanelHeader from "components/PanelHeader";
import NotificationRow from "components/NotificationRow";
import Aside from "components/Aside";
import { useNotify } from "context/notify";
import YamlEditor from "@focus-reactive/react-yaml";
import usePanelParams from "util/usePanelParams";
import { yamlToJson } from "util/yaml";
import Loader from "components/Loader";

const EditInstanceForm: FC = () => {
  const notify = useNotify();
  const panelParams = usePanelParams();
  const queryClient = useQueryClient();

  const InstanceSchema = Yup.object().shape({
    instanceYaml: Yup.string().required("This field is required"),
  });

  const {
    data: instance,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, panelParams.instance],
    queryFn: () =>
      fetchInstance(panelParams.instance ?? "", panelParams.project, 0),
    enabled: panelParams.instance !== null,
  });

  if (error) {
    notify.failure("Could not load instance details.", error);
  }

  const formik = useFormik({
    initialValues: {
      instanceYaml: instance ? dumpYaml(instance) : "",
    },
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      if (values.instanceYaml.trim() === "") {
        formik.setSubmitting(false);
        notify.failure(
          "",
          new Error("Please enter a valid YAML configuration.")
        );
        return;
      }
      const instanceJson = yamlToJson(values.instanceYaml);
      updateInstanceFromJson(instanceJson, panelParams.project)
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.instances],
          });
          panelParams.clear();
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Error on instance configuration save.", e);
        });
    },
  });

  return (
    <Aside width="wide">
      <div className="p-panel">
        <PanelHeader
          title={
            <h4>Edit instance configuration for {panelParams.instance}</h4>
          }
        />
        <NotificationRow />
        {isLoading ? (
          <Loader text="Loading instance details..." />
        ) : (
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
                  <Button onClick={panelParams.clear} type="button">
                    Cancel
                  </Button>
                  <SubmitButton
                    isSubmitting={formik.isSubmitting}
                    isDisabled={!formik.isValid}
                    buttonLabel="Update instance"
                  />
                </Col>
              </Row>
            </Form>
          </Row>
        )}
      </div>
    </Aside>
  );
};

export default EditInstanceForm;
