import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useState, type FC } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { ImageRegistryFormValues } from "types/forms/image";
import { createImageRegistry } from "api/image-registries";
import { ImageRegistryForm } from "../ImageRegistryForm";
import { checkDuplicateName } from "util/helpers";
import ImageRegistryRichChip from "../ImageRegistryRichChip";
import type { LxdImageRegistry, LxdImageRegistryConfig } from "types/image";

export const CreateImageRegistryPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const schema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "An image registry with this name already exists.",
        async (value) =>
          checkDuplicateName(value, "", controllerState, "image-registries"),
      )
      .matches(/^[A-Za-z0-9/\-:_.]+$/, {
        message:
          "Name can only contain alphanumeric, forward slash, hyphen, colon, underscore and full stop characters.",
      })
      .required("Image registry name is required."),
  });

  const getPayload = () => {
    const isSimpleStreams = formik.values.protocol === "simplestreams";
    const isPublic = isSimpleStreams || formik.values.cluster === "";
    const config: LxdImageRegistryConfig = {
      public: isPublic ? "true" : "false",
    };

    if (isSimpleStreams) {
      config.url = formik.values.url;
    } else {
      config.cluster = formik.values.cluster;
      config.source_project = formik.values.sourceProject;
      config.url = "https://cloud-images.ubuntu.com/daily/";
    }

    return {
      name: formik.values.name,
      description: formik.values.description,
      protocol: formik.values.protocol,
      config,
    } as Partial<LxdImageRegistry>;
  };

  const formik = useFormik<ImageRegistryFormValues>({
    initialValues: {
      isCreating: true,
      name: "",
      description: "",
      sourceProject: "default",
      cluster: "",
      protocol: "lxd",
    },
    validationSchema: schema,
    onSubmit: () => {
      createImageRegistry(JSON.stringify(getPayload()))
        .then(() => {
          toastNotify.success(
            <>
              Image registry{" "}
              <ImageRegistryRichChip
                imageRegistryName={formik.values.name ?? ""}
              />{" "}
              created.
            </>,
          );

          queryClient.invalidateQueries({
            queryKey: [queryKeys.imageRegistries],
          });
          closePanel();
        })
        .catch((e) => {
          notify.failure("Image registry creation failed", e);
          formik.setSubmitting(false);
        });
    },
  });

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Create image registry</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <ImageRegistryForm formik={formik} />
          </ScrollableContainer>
        </SidePanel.Content>
        <SidePanel.Footer className="u-align--right">
          <Button
            appearance="base"
            onClick={closePanel}
            className="u-no-margin--bottom"
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            onClick={() => void formik.submitForm()}
            className="u-no-margin--bottom"
            disabled={
              !formik.isValid || formik.isSubmitting || !formik.values.name
            }
            loading={formik.isSubmitting}
          >
            Create
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};
