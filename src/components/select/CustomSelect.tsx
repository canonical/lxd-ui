import classNames from "classnames";
import { useEffect, useId, useImperativeHandle, useState } from "react";
import type { FC, MutableRefObject, ReactNode } from "react";
import {
  ClassName,
  Field,
  ContextualMenu,
  PropsWithSpread,
  FieldProps,
  Position,
} from "@canonical/react-components";
import CustomSelectDropdown, {
  CustomSelectOption,
  getOptionText,
} from "./CustomSelectDropdown";
import useEventListener from "util/useEventListener";

export type SelectRef = MutableRefObject<
  | {
      open: () => void;
      close: () => void;
      isOpen: boolean;
      focus: () => void;
    }
  | undefined
>;

export type Props = PropsWithSpread<
  FieldProps,
  {
    // Selected option value
    value: string;
    // Array of options that the select can choose from.
    options: CustomSelectOption[];
    // Function to run when select value changes.
    onChange: (value: string) => void;
    // id for the select component
    id?: string | null;
    // Name for the select element
    name?: string;
    // Whether if the select is disabled
    disabled?: boolean;
    // Styling for the wrapping Field component
    wrapperClassName?: ClassName;
    // The styling for the select toggle button
    toggleClassName?: ClassName;
    // The styling for the select dropdown
    dropdownClassName?: string;
    // Whether the select is searchable. Option "auto" is the default, the select will be searchable if it has 5 or more options.
    searchable?: "auto" | "always" | "never";
    // Whether to focus on the element on initial render.
    takeFocus?: boolean;
    // Additional component to display above the dropdwon list.
    header?: ReactNode;
    // Ref for the select component which exposes internal methods and state for programatic control at the parent level.
    selectRef?: SelectRef;
    // initial position of the dropdown
    initialPosition?: Position;
  }
>;

const CustomSelect: FC<Props> = ({
  value,
  options,
  onChange,
  id,
  name,
  disabled,
  success,
  error,
  help,
  wrapperClassName,
  toggleClassName,
  dropdownClassName,
  searchable = "auto",
  takeFocus,
  header,
  selectRef,
  initialPosition = "left",
  ...fieldProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const validationId = useId();
  const defaultSelectId = useId();
  const selectId = id || defaultSelectId;
  const helpId = useId();
  const hasError = !!error;

  // Close the dropdown when the browser tab is hidden
  useEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      setIsOpen(false);
    }
  });

  // Close the dropdown when the browser window loses focus
  useEventListener(
    "blur",
    () => {
      setIsOpen(false);
    },
    window,
  );

  useImperativeHandle(
    selectRef,
    () => ({
      open: () => {
        setIsOpen(true);
        document.getElementById(selectId)?.focus();
      },
      focus: () => document.getElementById(selectId)?.focus(),
      close: setIsOpen.bind(null, false),
      isOpen: isOpen,
    }),
    [isOpen],
  );

  useEffect(() => {
    if (takeFocus) {
      const toggleButton = document.getElementById(selectId);
      toggleButton?.focus();
    }
  }, [takeFocus]);

  const selectedOption = options.find((option) => option.value === value);

  const toggleLabel = (
    <span className="toggle-label u-truncate">
      {selectedOption ? getOptionText(selectedOption) : "Select an option"}
    </span>
  );

  const handleSelect = (value: string) => {
    document.getElementById(selectId)?.focus();
    setIsOpen(false);
    onChange(value);
  };

  return (
    <Field
      {...fieldProps}
      className={classNames("p-custom-select", wrapperClassName)}
      error={error}
      forId={selectId}
      help={help}
      helpId={helpId}
      isSelect
      success={success}
      validationId={validationId}
    >
      <ContextualMenu
        aria-describedby={[help ? helpId : null, success ? validationId : null]
          .filter(Boolean)
          .join(" ")}
        aria-errormessage={hasError ? validationId : undefined}
        aria-invalid={hasError}
        toggleClassName={classNames(
          "p-custom-select__toggle",
          "p-form-validation__input",
          toggleClassName,
          {
            active: isOpen,
          },
        )}
        toggleLabel={toggleLabel}
        visible={isOpen}
        onToggleMenu={(open) => {
          // Handle syncing the state when toggling the menu from within the
          // contextual menu component e.g. when clicking outside.
          if (open !== isOpen) {
            setIsOpen(open);
          }
        }}
        toggleProps={{
          id: selectId,
          disabled: disabled,
          // tabIndex is set to -1 when disabled to prevent keyboard navigation to the select toggle
          tabIndex: disabled ? -1 : 0,
        }}
        className="p-custom-select__wrapper"
        dropdownClassName={dropdownClassName}
        // This is unfortunately necessary to prevent the same styling applied to the toggle wrapper as well as the dropdown wrapper
        // TODO: should create an upstream fix so that contextualMenuClassname is not applied to both the toggle and dropdown wrappers
        style={{ width: "100%" }}
        autoAdjust
        position={initialPosition}
      >
        {(close: () => void) => (
          <CustomSelectDropdown
            searchable={searchable}
            name={name || ""}
            options={options || []}
            onSelect={handleSelect}
            onClose={() => {
              // When pressing ESC to close the dropdown, we keep focus on the toggle button
              close();
              document.getElementById(selectId)?.focus();
            }}
            header={header}
            toggleId={selectId}
          />
        )}
      </ContextualMenu>
    </Field>
  );
};

export default CustomSelect;
