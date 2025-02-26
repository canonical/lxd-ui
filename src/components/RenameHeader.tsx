import { FC, ReactNode } from "react";
import {
  ActionButton,
  Button,
  Input,
  Tooltip,
} from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import classnames from "classnames";

export interface RenameHeaderValues {
  name: string;
  isRenaming: boolean;
}

interface Props {
  name: string;
  relatedChip?: ReactNode;
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
  relatedChip,
  titleClassName,
  parentItems,
  centerControls,
  controls,
  isLoaded,
  formik,
  renameDisabledReason,
}) => {
  const canRename = renameDisabledReason === undefined;
  const toggleRename = () => {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 10);
    if (!canRename || !formik) {
      return;
    }
    void formik.setValues({
      ...formik.values,
      name: name,
      isRenaming: !formik.values.isRenaming,
    });
  };

  return (
    <div className="p-panel__header rename-header">
      <h1 className="u-off-screen">{name}</h1>
      <div className={classnames("p-panel__title", titleClassName)}>
        <nav
          key="breadcrumbs"
          className="p-breadcrumbs p-breadcrumbs--large"
          aria-label="Breadcrumbs"
        >
          <ol
            className="p-breadcrumbs__items"
            style={{ display: "inline-block" }}
          >
            {parentItems.map((item, key) => (
              <li
                className="p-heading--4 u-no-margin--bottom continuous-breadcrumb"
                key={key}
              >
                {item}
              </li>
            ))}
            {formik?.values.isRenaming ? (
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
                  onKeyUp={(e) => e.key === "Enter" && void formik.submitForm()}
                  type="text"
                />
                <div>
                  <Button
                    appearance="base"
                    className="cancel"
                    onClick={toggleRename}
                  >
                    Cancel
                  </Button>
                  <ActionButton
                    appearance="positive"
                    loading={formik.isSubmitting}
                    disabled={!formik.isValid || name === formik.values.name}
                    onClick={() => void formik.submitForm()}
                  >
                    Save
                  </ActionButton>
                </div>
              </li>
            ) : (
              <li
                className="p-heading--4 u-no-margin--bottom name continuous-breadcrumb u-truncate"
                onClick={toggleRename}
                title={canRename ? `Rename ${name}` : ""}
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
          {relatedChip && (
            <span style={{ marginLeft: "-1rem" }}>{relatedChip}</span>
          )}
        </nav>
        {!formik?.values.isRenaming && centerControls}
      </div>
      {isLoaded && !formik?.values.isRenaming && (
        <div className="p-panel__controls">{controls}</div>
      )}
    </div>
  );
};

export default RenameHeader;
