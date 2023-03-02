import React, { FC } from "react";
import { Button, Col, Form, Row } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { dump as dumpYaml } from "js-yaml";
import PanelHeader from "components/PanelHeader";
import NotificationRow from "components/NotificationRow";
import Aside from "components/Aside";
import useNotify from "util/useNotify";
import YamlEditor from "@focus-reactive/react-yaml";
import usePanelParams from "util/usePanelParams";
import { yamlToJson } from "util/yaml";
import {
  createProfileFromJson,
  fetchProfile,
  updateProfileFromJson,
} from "api/profiles";
import Loader from "components/Loader";

const ProfileFormYaml: FC = () => {
  const notify = useNotify();
  const panelParams = usePanelParams();
  const queryClient = useQueryClient();

  const isEditMode = panelParams.profile !== null && panelParams.profile !== "";

  const ProfileSchema = Yup.object().shape({
    profileYaml: Yup.string().required("This field is required"),
  });

  const initialYaml = "\n\n";

  const formik = useFormik({
    initialValues: {
      profileYaml: initialYaml,
    },
    validationSchema: ProfileSchema,
    onSubmit: (values) => {
      if (values.profileYaml.trim() === "") {
        formik.setSubmitting(false);
        notify.failure(
          "",
          new Error("Please enter a valid YAML configuration.")
        );
        return;
      }
      const profileJson = yamlToJson(values.profileYaml);
      const mutation = panelParams.profile
        ? updateProfileFromJson
        : createProfileFromJson;
      mutation(profileJson, panelParams.project)
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.profiles],
          });
          panelParams.clear();
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Error on profile configuration save.", e);
        });
    },
  });

  const {
    data: profile,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, panelParams.profile],
    queryFn: () => fetchProfile(panelParams.profile ?? "", panelParams.project),
    enabled: isEditMode,
  });

  if (error) {
    notify.failure("Could not load profile details.", error);
  }

  if (formik.values.profileYaml === initialYaml && profile) {
    const yaml = dumpYaml(profile);
    void formik.setFieldValue("profileYaml", yaml);
  }

  return (
    <Aside width="wide">
      <div className="p-panel">
        <PanelHeader
          title={
            <h4>
              {panelParams.profile
                ? `Edit profile configuration for ${panelParams.profile}`
                : "Create profile from YAML configuration"}
            </h4>
          }
        />
        <NotificationRow />
        {isEditMode && isLoading ? (
          <Loader text="Loading profile details..." />
        ) : (
          <Row>
            <Form onSubmit={formik.handleSubmit} stacked>
              <div className="p-profile-yaml">
                <YamlEditor
                  // using the profile name as a key to force a remount of the component
                  // (it won't update otherwise)
                  key={profile ? `update-${profile.name}` : "create"}
                  text={formik.values.profileYaml}
                  onChange={({ text }) =>
                    void formik.setValues({ profileYaml: text })
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
                    buttonLabel={
                      panelParams.profile ? "Update profile" : "Create profile"
                    }
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

export default ProfileFormYaml;
