import type { ReactNode } from "react";
import { cloneElement } from "react";
import { Button, Icon, Label, Tooltip } from "@canonical/react-components";
import type { CpuLimit, MemoryLimit } from "types/limits";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import classnames from "classnames";
import type { FormikProps } from "formik/dist/types";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "components/forms/instanceAndProfileFormValues";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import type { ProjectFormValues } from "pages/projects/CreateProject";
import { getConfigRowMetadata } from "util/configInheritance";
import type { StoragePoolFormValues } from "pages/storage/forms/StoragePoolForm";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import type { NetworkAclFormValues } from "pages/networks/forms/NetworkAclForm";

export type ConfigurationRowFormikValues =
  | InstanceAndProfileFormValues
  | StorageVolumeFormValues
  | NetworkAclFormValues
  | NetworkFormValues
  | ProjectFormValues
  | StoragePoolFormValues;

export type ConfigurationRowFormikProps =
  | InstanceAndProfileFormikProps
  | FormikProps<NetworkAclFormValues>
  | FormikProps<NetworkFormValues>
  | FormikProps<ProjectFormValues>
  | FormikProps<StorageVolumeFormValues>
  | FormikProps<StoragePoolFormValues>;

interface Props {
  formik: ConfigurationRowFormikProps;
  name: string;
  label: string | ReactNode;
  children: React.JSX.Element;
  defaultValue?: string | CpuLimit | MemoryLimit | boolean;
  disabled?: boolean;
  disabledReason?: string;
  help?: string;
  inputHelp?: string;
  readOnlyRenderer?: (value: ReactNode) => string | ReactNode;
  hideOverrideBtn?: boolean;
}

export const getConfigurationRow = ({
  formik,
  name,
  label,
  children,
  defaultValue,
  disabled = false,
  disabledReason,
  help,
  inputHelp,
  readOnlyRenderer = (value: ReactNode) => <>{value}</>,
  hideOverrideBtn = false,
}: Props): MainTableRow => {
  const values = formik.values as unknown as Record<string, string | undefined>;
  const value = values[name];
  const isOverridden = value !== undefined;
  const overrideValue = readOnlyRenderer(value === "" ? "-" : value);
  const metadata = getConfigRowMetadata(formik.values, name);

  const enableOverride = () => {
    formik.setFieldValue(name, defaultValue);
  };

  const toggleDefault = () => {
    if (isOverridden) {
      formik.setFieldValue(name, undefined);
    } else {
      enableOverride();
      focusField(name);
    }
  };

  const isDisabled = () => {
    return disabled || !!formik.values.editRestriction;
  };

  const getDisabledReasonOrTitle = (title?: string) => {
    if (formik.values.editRestriction) {
      return formik.values.editRestriction;
    }

    if (disabledReason) {
      return disabledReason;
    }

    return title;
  };

  const getForm = (): ReactNode => {
    return (
      <div className="override-form">
        {wrapDisabledTooltip(
          <div>
            {cloneElement(children, {
              id: name,
              name,
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
              value,
              disabled: isDisabled(),
              help: (
                <ConfigFieldDescription
                  description={
                    metadata.configField
                      ? metadata.configField.longdesc
                      : inputHelp
                  }
                />
              ),
            })}
          </div>,
        )}
        <Button
          onClick={toggleDefault}
          type="button"
          appearance="base"
          title={getDisabledReasonOrTitle("Clear override")}
          disabled={isDisabled()}
          hasIcon
          className="u-no-margin--bottom"
        >
          <Icon name="close" className="clear-configuration-icon" />
        </Button>
      </div>
    );
  };

  const displayLabel = isOverridden ? (
    <Label forId={name}>
      <b>{label}</b>
    </Label>
  ) : (
    <b>{label}</b>
  );

  const wrapDisabledTooltip = (children: ReactNode): ReactNode => {
    if ((disabled && disabledReason) || formik.values.editRestriction) {
      return (
        <Tooltip message={getDisabledReasonOrTitle()} position="right">
          {children}
        </Tooltip>
      );
    }
    return children;
  };

  const renderOverride = (): ReactNode => {
    if (formik.values.readOnly) {
      return (
        <>
          {overrideValue}
          {hideOverrideBtn === false && (
            <Button
              onClick={() => {
                ensureEditMode(formik);
                if (!isOverridden) {
                  enableOverride();
                }
                focusField(name);
              }}
              className="u-no-margin--bottom"
              type="button"
              appearance="base"
              title={getDisabledReasonOrTitle(
                isOverridden ? "Edit" : "Create override",
              )}
              disabled={isDisabled()}
              hasIcon
            >
              <Icon name="edit" />
            </Button>
          )}
        </>
      );
    }
    if (isOverridden) {
      return getForm();
    }
    return wrapDisabledTooltip(
      <Button
        onClick={toggleDefault}
        className="u-no-margin--bottom"
        type="button"
        disabled={isDisabled()}
        appearance="base"
        title={formik.values.editRestriction ?? "Create override"}
        hasIcon
      >
        <Icon name="edit" />
      </Button>,
    );
  };

  return getConfigurationRowBase({
    configuration: (
      <>
        {displayLabel}
        <p className="configuration-help">
          <ConfigFieldDescription
            description={
              metadata.configField ? metadata.configField.shortdesc : help
            }
          />
        </p>
      </>
    ),
    inherited: (
      <div
        className={classnames({
          "u-text--muted": isOverridden,
          "u-text--line-through": isOverridden,
        })}
      >
        <div className="mono-font">
          <b>{readOnlyRenderer(metadata.value)}</b>
        </div>
        {metadata && (
          <div className="p-text--small u-text--muted">
            From: {metadata.source}
          </div>
        )}
      </div>
    ),
    override: renderOverride(),
    name: `${label as string}-${name ?? ""}-${metadata.value}-${metadata.configField?.shortdesc}`,
    edit: formik.values.readOnly ? "read" : "edit",
  });
};

interface BaseProps {
  configuration: ReactNode;
  inherited: ReactNode;
  override: ReactNode;
  className?: string;
  name?: string;
  edit?: string;
}

export const getConfigurationRowBase = ({
  configuration,
  inherited,
  override,
  className,
  name,
  edit,
}: BaseProps): MainTableRow => {
  return {
    name,
    key: name,
    className,
    columns: [
      {
        key: `configuration-${name}-${edit}`,
        content: configuration,
        className: "configuration",
      },
      {
        key: `inherited-${name}-${edit}`,
        content: inherited,
        className: "inherited",
      },
      {
        key: `override-${name}-${edit}`,
        content: override,
        className: "override",
      },
    ],
  };
};
