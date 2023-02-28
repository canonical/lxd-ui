import React, { FC, MouseEvent, ReactNode, useState } from "react";
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
import { createInstance, startInstance } from "api/instances";
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
import { instanceCreationTypes } from "util/instanceOptions";
import { checkDuplicateName } from "util/helpers";
import InstanceCustomiseYaml from "./InstanceCustomiseYaml";
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import usePanelParams from "util/usePanelParams";
import { useSharedNotify } from "../../context/sharedNotify";
import ConfirmationModal from "components/ConfirmationModal";
import usePortal from "react-useportal";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { Location } from "history";

interface FormValues {
  name: string;
  image: RemoteImage | undefined;
  instanceType: string;
  profiles: string[];
  yaml?: string;
  unchangedYaml?: string;
}

interface RetryFormState {
  retryFormValues: FormValues;
}

const CreateInstanceForm: FC = () => {
  const location = useLocation() as Location<RetryFormState | null>;
  const navigate = useNavigate();
  const notify = useNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const panelParams = usePanelParams();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { sharedNotify: instanceListNotify } = useSharedNotify();

  const InstanceSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "An instance with this name already exists",
        (value) =>
          checkDuplicateName(
            value,
            panelParams.project,
            controllerState,
            "instances"
          )
      )
      .optional(),
    instanceType: Yup.string().required("Instance type is required"),
  });

  function notifyInProgress() {
    instanceListNotify?.info(<>Creating the instance.</>, "Processing");
  }

  function notifyLaunchedAndStarted(instanceLink: ReactNode) {
    instanceListNotify?.success(
      <>Launched and started instance {instanceLink}.</>
    );
  }

  function notifyCreatedButStartFailed(instanceLink: ReactNode, e: Error) {
    instanceListNotify?.failure(
      <>The instance {instanceLink} was created, but could not be started.</>,
      e
    );
  }

  function notifyLaunched(instanceLink: ReactNode) {
    instanceListNotify?.success(<>Launched instance {instanceLink}.</>);
  }

  function notifyLaunchFailed(e: Error, formUrl: string, values: FormValues) {
    instanceListNotify?.failure(<>Instance creation failed.</>, e, [
      {
        label: "Check configuration",
        onClick: () =>
          navigate(formUrl, { state: { retryFormValues: values } }),
      },
    ]);
  }

  const submit = (values: FormValues, shouldStart = true) => {
    const project = panelParams.project;
    const formUrl = location.pathname + location.search;
    notifyInProgress();
    panelParams.clear();

    const instanceCreationObj = values.yaml
      ? yamlToObject(values.yaml)
      : getCreationPayload(values);
    const instanceCreationStr = JSON.stringify(instanceCreationObj);
    createInstance(instanceCreationStr, project)
      .then((operation) => {
        const instanceName = operation.metadata.resources.instances?.[0]
          .split("/")
          .pop();
        if (!instanceName) {
          return;
        }
        const instanceLink = (
          <Link to={`/ui/${project}/instances/${instanceName}`}>
            {instanceName}
          </Link>
        );
        if (shouldStart) {
          startInstance({
            name: instanceName,
            project: project,
          } as LxdInstance)
            .then(() => {
              notifyLaunchedAndStarted(instanceLink);
            })
            .catch((e: Error) => {
              notifyCreatedButStartFailed(instanceLink, e);
            });
        } else {
          notifyLaunched(instanceLink);
        }
      })
      .catch((e: Error) => {
        notifyLaunchFailed(e, formUrl, values);
      })
      .finally(() => {
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
      });
  };

  const formik = useFormik<FormValues>({
    initialValues: location.state?.retryFormValues ?? {
      name: "",
      image: undefined,
      instanceType: "container",
      profiles: ["default"],
      yaml: undefined,
    },
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      if (!values.image) {
        formik.setSubmitting(false);
        notify.failure("", new Error("No image selected"));
        return;
      }
      submit(values);
    },
  });

  const handleSelectImage = (image: RemoteImage, type: string | null) => {
    void formik.setFieldValue("image", image);
    if (type) {
      void formik.setFieldValue("instanceType", type);
    }
    if (isVmOnlyImage(image)) {
      void formik.setFieldValue("instanceType", "virtual-machine");
    }
    if (isContainerOnlyImage(image)) {
      void formik.setFieldValue("instanceType", "container");
    }
  };

  const getCreationPayload = (values: FormValues) => {
    return {
      type: values.instanceType,
      name: values.name,
      profiles: values.profiles,
      source: {
        alias: values.image?.aliases.split(",")[0],
        mode: "pull",
        protocol: "simplestreams",
        server: values.image?.server,
        type: "image",
      },
    };
  };

  const switchToYaml = () => {
    const instanceCreateObj = getCreationPayload(formik.values);
    const yaml = dumpYaml(instanceCreateObj);
    void formik.setFieldValue("yaml", yaml);
    void formik.setFieldValue("unchangedYaml", yaml);
  };

  const closeYaml = (e: MouseEvent<HTMLElement>) => {
    if (formik.values.yaml !== formik.values.unchangedYaml && !isOpen) {
      openPortal(e);
      return;
    }
    void formik.setFieldValue("yaml", undefined);
    void formik.setFieldValue("unchangedYaml", undefined);
    closePortal();
  };

  return (
    <Aside>
      <div className="p-panel l-site">
        <PanelHeader
          title={<h4>Create new instance</h4>}
          onClose={formik.values.yaml ? closeYaml : undefined}
        />
        <div className="p-panel__content">
          <NotificationRow notify={notify} />
          <Row>
            <Form onSubmit={() => submit(formik.values)} stacked>
              {formik.values.yaml ? (
                <InstanceCustomiseYaml
                  instanceYaml={formik.values.yaml}
                  setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
                  goBack={closeYaml}
                />
              ) : (
                <>
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
                        options={instanceCreationTypes}
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
                  {formik.values.image && (
                    <>
                      <ProfileSelect
                        notify={notify}
                        project={panelParams.project}
                        selected={formik.values.profiles}
                        setSelected={(value) =>
                          void formik.setFieldValue("profiles", value)
                        }
                      />
                      <Button type="button" onClick={switchToYaml}>
                        Customise (YAML)
                      </Button>
                    </>
                  )}
                </>
              )}
            </Form>
          </Row>
        </div>
        <div className="l-footer--sticky p-bottom-controls">
          <hr />
          <Row className="u-align--right">
            <Col size={12}>
              <Button appearance="base" onClick={panelParams.clear}>
                Cancel
              </Button>
              <SubmitButton
                isSubmitting={formik.isSubmitting}
                isDisabled={!formik.isValid}
                buttonLabel="Create"
                appearance="default"
                onClick={() => submit(formik.values, false)}
              />
              <SubmitButton
                isSubmitting={formik.isSubmitting}
                isDisabled={!formik.isValid}
                buttonLabel="Create and start"
                onClick={() => submit(formik.values)}
              />
            </Col>
          </Row>
        </div>
      </div>
      {isOpen && (
        <Portal>
          <ConfirmationModal
            title="Confirm"
            confirmationMessage={
              "Are you sure you want to go back to the basic form? All the changes applied to the YAML config will be lost."
            }
            posButtonLabel="Go back"
            onConfirm={closeYaml}
            onClose={closePortal}
            hasShiftHint={false}
          />
        </Portal>
      )}
    </Aside>
  );
};

export default CreateInstanceForm;
