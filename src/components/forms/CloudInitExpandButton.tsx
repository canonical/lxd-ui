import type { FC, MouseEvent, ReactNode } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useModal } from "context/useModal";
import ResourceLink from "components/ResourceLink";
import type { CloudInitKey } from "components/forms/CloudInitForm";
import YamlModal from "components/forms/YamlModal";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import { ensureEditMode } from "util/instanceEdit";
import classnames from "classnames";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useLocation } from "react-router-dom";
import ResourceLabel from "components/ResourceLabel";
import { ROOT_PATH } from "util/rootPath";

const LABELS: Record<CloudInitKey, string> = {
  cloud_init_network_config: "cloud-init network config",
  cloud_init_user_data: "cloud-init user data",
  cloud_init_vendor_data: "cloud-init vendor data",
};

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
  name: CloudInitKey;
  initialValue: string;
  source?: ReactNode;
  onApplyChanges?: () => void;
  isReadOnly?: boolean;
  className?: string;
}

const CloudInitExpandButton: FC<Props> = ({
  formik,
  project,
  name,
  initialValue,
  source,
  onApplyChanges,
  isReadOnly,
  className,
}) => {
  const { showModal, hideModal } = useModal();
  const isSmallScreen = useIsScreenBelow();
  const location = useLocation();

  const getModalTitle = () => {
    const label = LABELS[name];
    const entityName = formik.values.name || "";
    const entityType = formik.values.entityType;

    const isCreating = location.pathname.includes("/create");
    const isNew = isCreating || !entityName;
    const isInherited = source && source !== entityName;

    let entityIdentifier = null;

    if (!isNew && entityName) {
      entityIdentifier = (
        <ResourceLink
          type={entityType}
          value={entityName}
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/${entityType}/${encodeURIComponent(entityName)}`}
        />
      );
    } else if (isNew && entityName) {
      entityIdentifier = <ResourceLabel type={entityType} value={entityName} />;
    }

    return (
      <div
        className="u-no-margin"
        onClick={(event) => {
          const target = event.target as HTMLElement;
          const link = target.closest("a");

          if (link) {
            const openInNewTab =
              event.ctrlKey || event.metaKey || event.shiftKey;

            if (!openInNewTab) {
              hideModal();
            }
          }
        }}
      >
        <h4 className="p-heading--4 u-no-margin--bottom">
          {isReadOnly ? "View" : "Edit"} {label}
        </h4>
        <p className="p-heading--6 u-text--muted u-no-margin--top u-no-margin--bottom font-weight-normal">
          For {isNew && "new "}
          {entityType} {entityIdentifier}
          {isSmallScreen && <br />}
          {isInherited && (
            <>
              {" inherited from "}
              {source}
            </>
          )}
        </p>
      </div>
    );
  };

  const handleApply = (newValue: string) => {
    ensureEditMode(formik);
    formik.setFieldValue(name, newValue);
    onApplyChanges?.();
  };

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    showModal(
      <YamlModal
        title={getModalTitle()}
        onClose={hideModal}
        applyChanges={handleApply}
        readOnly={isReadOnly || !!formik.values.editRestriction}
        readOnlyMessage={
          isReadOnly
            ? "Read only editor for inherited value. Create an override to modify."
            : formik.values.editRestriction
        }
        initialValue={formik.values[name] || initialValue}
      />,
      e,
    );
  };

  return (
    <Button
      onClick={handleClick}
      type="button"
      appearance="base"
      title={isReadOnly ? "Expand view" : "Expand editor"}
      hasIcon
      className={classnames("u-no-margin--bottom", className)}
    >
      <Icon name="fullscreen" className="full-screen-icon" />
    </Button>
  );
};

export default CloudInitExpandButton;
