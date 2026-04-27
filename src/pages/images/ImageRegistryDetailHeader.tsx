import { useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotify, useToastNotification } from "@canonical/react-components";
import { renameImageRegistry } from "api/image-registries";
import RenameHeader from "components/RenameHeader";
import type { RenameHeaderValues } from "components/RenameHeader";
import { useFormik } from "formik";
import ImageRegistryRichChip from "pages/images/ImageRegistryRichChip";
import DeleteImageRegistryBtn from "pages/images/actions/DeleteImageRegistryBtn";
import EditImageRegistryButton from "pages/images/actions/EditImageRegistryButton";
import type { LxdImageRegistry } from "types/image";
import { useImageRegistriesEntitlements } from "util/entitlements/images";
import { checkDuplicateName } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import * as Yup from "yup";

interface Props {
  imageRegistry: LxdImageRegistry;
}

const ImageRegistryDetailHeader: FC<Props> = ({ imageRegistry }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const { canEditImageRegistry } = useImageRegistriesEntitlements();
  const controllerState = useState<AbortController | null>(null);

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "An image registry with this name already exists",
        async (value) =>
          checkDuplicateName(value, "", controllerState, "image-registries"),
      )
      .required("Image registry name is required"),
  });

  const getDisabledReason = () => {
    if (!canEditImageRegistry(imageRegistry)) {
      return "You do not have permission to rename this image registry";
    }

    if (!imageRegistry) {
      return "Invalid Image Registry: Cannot be renamed";
    }

    if (imageRegistry.builtin) {
      return "Built-in image registries cannot be renamed";
    }

    return undefined;
  };

  const onSuccess = (imageRegistryName: string) => {
    const url = `${ROOT_PATH}/ui/image-registry/${encodeURIComponent(imageRegistryName)}`;
    navigate(url);
    toastNotify.success(
      <>
        Image registry <strong>{imageRegistry.name}</strong> renamed to{" "}
        <ImageRegistryRichChip imageRegistryName={imageRegistryName} />
      </>,
    );
  };

  const onFailure = (imageRegistryName: string, e: unknown) => {
    notify.failure(`Renaming of image registry ${imageRegistryName} failed`, e);
  };

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name: imageRegistry.name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (imageRegistry.name === values.name) {
        formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameImageRegistry(imageRegistry.name, values.name)
        .then(() => {
          onSuccess(values.name);
          formik.setFieldValue("isRenaming", false);
        })
        .catch((e) => {
          onFailure(values.name, e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  return (
    <RenameHeader
      name={imageRegistry.name}
      parentItems={[
        <Link to={`${ROOT_PATH}/ui/image-registries`} key={1}>
          Image registries
        </Link>,
      ]}
      controls={[
        <EditImageRegistryButton key="edit" imageRegistry={imageRegistry} />,
        <DeleteImageRegistryBtn key="delete" imageRegistry={imageRegistry} />,
      ]}
      isLoaded={Boolean(imageRegistry.name)}
      formik={formik}
      renameDisabledReason={getDisabledReason()}
    />
  );
};

export default ImageRegistryDetailHeader;
