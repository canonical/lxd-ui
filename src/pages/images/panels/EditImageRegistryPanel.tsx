import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  Spinner,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { type FC } from "react";
import usePanelParams from "util/usePanelParams";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { ImageRegistryFormValues } from "types/forms/image";
import { updateImageRegistry } from "api/image-registries";
import { ImageRegistryForm } from "../ImageRegistryForm";
import ImageRegistryRichChip from "../ImageRegistryRichChip";
import type { LxdImageRegistry, LxdImageRegistryConfig } from "types/image";
import { useImageRegistry } from "context/useImageRegistries";

export const EditImageRegistryPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const {
    data: registry,
    error,
    isLoading,
  } = useImageRegistry(panelParams.imageRegistry ?? "");

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const getPayload = () => {
    const isSimpleStreams = formik.values.protocol === "simplestreams";
    const isPublic = isSimpleStreams || formik.values.cluster === "";
    const config: LxdImageRegistryConfig = {
      public: isPublic ? "true" : "false",
    };
    const payload = {
      description: formik.values.description,
    } as Partial<LxdImageRegistry>;

    if (isSimpleStreams) {
      config.url = formik.values.url;
    } else {
      config.cluster = formik.values.cluster;
      config.source_project = formik.values.sourceProject;
      config.url = formik.values.url;
    }
    payload.config = config;
    return payload;
  };

  const formik = useFormik<ImageRegistryFormValues>({
    initialValues: {
      isCreating: false,
      name: registry?.name ?? "",
      description: registry?.description ?? "",
      sourceProject: registry?.config?.source_project ?? "",
      cluster: registry?.config?.cluster ?? "",
      protocol: registry?.protocol ?? "lxd",
      url: registry?.config?.url ?? "",
    },
    enableReinitialize: true,
    onSubmit: () => {
      updateImageRegistry(registry?.name ?? "", JSON.stringify(getPayload()))
        .then(() => {
          toastNotify.success(
            <>
              Image registry{" "}
              <ImageRegistryRichChip
                imageRegistryName={formik.values.name ?? ""}
              />{" "}
              updated.
            </>,
          );

          queryClient.invalidateQueries({
            queryKey: [queryKeys.imageRegistries],
          });
          closePanel();
        })
        .catch((e) => {
          notify.failure("Image registry update failed", e);
          formik.setSubmitting(false);
        });
    },
  });

  if (isLoading) {
    return <Spinner text="Loading image registry..." />;
  }

  if (error || !registry) {
    notify.failure("Loading image registry failed", error);
    return null;
  }

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Edit image registry</SidePanel.HeaderTitle>
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
            Save
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};
