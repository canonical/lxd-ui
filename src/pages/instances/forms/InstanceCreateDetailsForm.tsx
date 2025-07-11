import type { FC } from "react";
import {
  Button,
  Col,
  Icon,
  Input,
  Row,
  Select,
} from "@canonical/react-components";
import ProfileSelector from "pages/profiles/ProfileSelector";
import SelectImageBtn from "pages/images/actions/SelectImageBtn";
import {
  isContainerOnlyImage,
  isVmOnlyImage,
  LOCAL_IMAGE,
  LOCAL_ISO,
} from "util/images";
import { instanceCreationTypes } from "util/instanceOptions";
import type { FormikProps } from "formik/dist/types";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import type { LxdImageType, RemoteImage } from "types/image";
import InstanceLocationSelect from "pages/instances/forms/InstanceLocationSelect";
import UseCustomIsoBtn from "pages/images/actions/UseCustomIsoBtn";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import UploadInstanceFileBtn from "../actions/UploadInstanceFileBtn";
import type { InstanceIconType } from "components/ResourceIcon";
import SshKeyForm from "components/forms/SshKeyForm";

export interface InstanceDetailsFormValues {
  name?: string;
  description?: string;
  image?: RemoteImage;
  instanceType: InstanceIconType;
  profiles: string[];
  target?: string;
  placementGroup?: string;
  entityType: "instance";
  isCreating: boolean;
  readOnly: boolean;
  editRestriction?: string;
}

export const instanceDetailPayload = (values: CreateInstanceFormValues) => {
  const payload: Record<string, string | undefined | object> = {
    name: values.name,
    description: values.description,
    type: values.instanceType,
    profiles: values.profiles,
    source: {
      alias: values.image?.aliases.split(",")[0],
      mode: "pull",
      protocol: "simplestreams",
      server: values.image?.server,
      type: "image",
    },
  };

  if (values.image?.server === LOCAL_IMAGE) {
    payload.source = {
      type: "image",
      certificate: "",
      fingerprint: values.image?.fingerprint,
      allow_inconsistent: false,
    };
  }

  if (values.image?.server === LOCAL_ISO) {
    payload.source = {
      type: "none",
      certificate: "",
      allow_inconsistent: false,
    };
  }

  return payload;
};

interface Props {
  formik: FormikProps<CreateInstanceFormValues>;
  onSelectImage: (image: RemoteImage, type?: LxdImageType) => void;
  project: string;
}

const InstanceCreateDetailsForm: FC<Props> = ({
  formik,
  onSelectImage,
  project,
}) => {
  const { hasCustomVolumeIso } = useSupportedFeatures();

  function figureBaseImageName() {
    const image = formik.values.image;
    return image
      ? `${image.os} ${image.release} ${image.aliases.split(",")[0]}`
      : "";
  }

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Input
            id="name"
            name="name"
            type="text"
            label="Instance name"
            placeholder="Enter name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : null}
          />
          <AutoExpandingTextArea
            id="description"
            name="description"
            label="Description"
            placeholder="Enter description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
          />
        </Col>
      </Row>
      <Row>
        <Col size={12}>
          <p className="p-form__label">Base Image*</p>
          <div className="p-form__control u-clearfix base-image">
            {formik.values.image ? (
              <>
                <span className="u-text--muted u-truncate u-sv3 image-name">
                  {figureBaseImageName()}
                </span>
                <Button
                  appearance="base"
                  type="button"
                  onClick={async () => formik.setFieldValue("image", undefined)}
                  title="Clear"
                  hasIcon
                >
                  <Icon name="close" />
                </Button>
              </>
            ) : (
              <>
                <SelectImageBtn onSelect={onSelectImage} />
                {hasCustomVolumeIso && (
                  <UseCustomIsoBtn onSelect={onSelectImage} />
                )}
                <UploadInstanceFileBtn name={formik.values.name} />
              </>
            )}
          </div>
          <Select
            id="instanceType"
            label="Instance type"
            name="instanceType"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={instanceCreationTypes}
            value={formik.values.instanceType}
            disabled={
              !formik.values.image ||
              isContainerOnlyImage(formik.values.image) ||
              isVmOnlyImage(formik.values.image)
            }
            title={
              !formik.values.image
                ? "Please select an image before adding a type"
                : ""
            }
          />
          <InstanceLocationSelect formik={formik} />
        </Col>
      </Row>
      <ProfileSelector
        project={project}
        selected={formik.values.profiles}
        setSelected={(value) => void formik.setFieldValue("profiles", value)}
        readOnly={!formik.values.image}
        title={
          !formik.values.image
            ? "Please select an image before adding profiles"
            : ""
        }
      />
      <SshKeyForm
        formik={formik}
        disabledReason={
          !formik.values.image
            ? "Please select an image before adding SSH Keys"
            : ""
        }
      />
    </ScrollableForm>
  );
};

export default InstanceCreateDetailsForm;
