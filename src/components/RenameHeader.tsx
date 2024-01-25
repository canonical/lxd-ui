import React, { FC, ReactNode } from "react";
import { Button, Input, Tooltip } from "@canonical/react-components";
import SubmitButton from "components/SubmitButton";
import { FormikProps } from "formik/dist/types";
import classnames from "classnames";

export interface RenameHeaderValues {
  name: string;
  isRenaming: boolean;
}

interface Props {
  name: string;
  titleClassName?: string;
  parentItems: ReactNode[];
  centerControls?: ReactNode;
  controls?: ReactNode;
  isLoaded: boolean;
  renameDisabledReason?: string;
  formik: FormikProps<RenameHeaderValues>;
}

const RenameHeader: FC<Props> = ({
  name,
  titleClassName,
  parentItems,
  centerControls,
  controls,
  isLoaded,
  formik,
  renameDisabledReason,
}) => {
  const canRename = renameDisabledReason === undefined;
  const enableRename = () => {
    if (!canRename) {
      return;
    }
    void formik.setValues({
      ...formik.values,
      isRenaming: true,
    });
  };

  return (
    <div className="p-panel__header rename-header">
      <h1 className="u-off-screen">{name}</h1>
      {isLoaded ? (
        <div className={classnames("p-panel__title", titleClassName)}>
          <nav
            key="breadcrumbs"
            className="p-breadcrumbs p-breadcrumbs--large"
            aria-label="Breadcrumbs"
          >
            <ol className="p-breadcrumbs__items">
              {parentItems.map((item, key) => (
                <li className="p-breadcrumbs__item" key={key}>
                  {item}
                </li>
              ))}
              {formik.values.isRenaming ? (
                <li className="p-breadcrumbs__item rename">
                  <Input
                    autoFocus
                    id="name"
                    name="name"
                    className="name-input"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.name}
                    error={formik.touched.name ? formik.errors.name : null}
                    onKeyUp={(e) =>
                      e.key === "Enter" && void formik.submitForm()
                    }
                    type="text"
                  />
                  <div>
                    <Button
                      appearance="base"
                      className="cancel"
                      onClick={() =>
                        void formik.setFieldValue("isRenaming", false)
                      }
                    >
                      Cancel
                    </Button>
                    <SubmitButton
                      isSubmitting={formik.isSubmitting}
                      isDisabled={
                        !formik.isValid || name === formik.values.name
                      }
                      buttonLabel="Save"
                      onClick={() => void formik.submitForm()}
                    />
                  </div>
                </li>
              ) : (
                <li
                  className="p-breadcrumbs__item name u-truncate"
                  onClick={enableRename}
                  title={name}
                >
                  <Tooltip
                    message={!canRename && renameDisabledReason}
                    position="btm-left"
                  >
                    {name}
                  </Tooltip>
                </li>
              )}
            </ol>
          </nav>
          {!formik.values.isRenaming && centerControls}
        </div>
      ) : (
        <h4 className="p-panel__title">{name}</h4>
      )}
      {isLoaded && !formik.values.isRenaming && (
        <div className="p-panel__controls">{controls}</div>
      )}
    </div>
  );
};

export default RenameHeader;
