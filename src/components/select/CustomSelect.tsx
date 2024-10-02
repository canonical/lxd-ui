import classNames from "classnames";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { FC } from "react";
import {
  ClassName,
  Field,
  ContextualMenu,
  PropsWithSpread,
  FieldProps,
} from "@canonical/react-components";
import CustomSelectDropdown, {
  CustomSelectOption,
  getOptionText,
} from "./CustomSelectDropdown";
import useEventListener from "@use-it/event-listener";
import { adjustDropdownHeight } from "util/customSelect";

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
    // Whether the select is searchable. Option "auto" is the default, the select will be searchable if it has 5 or more options.
    searchable?: "auto" | "always" | "never";
    // Whether to focus on the element on initial render.
    takeFocus?: boolean;
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
  searchable = "auto",
  takeFocus,
  ...fieldProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const validationId = useId();
  const defaultSelectId = useId();
  const selectId = id || defaultSelectId;
  const helpId = useId();
  const hasError = !!error;
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (takeFocus) {
      const toggleButton = document.getElementById(selectId);
      toggleButton?.focus();
    }
  }, [takeFocus]);

  useLayoutEffect(() => {
    if (isOpen) {
      adjustDropdownHeight(dropdownListRef.current, searchRef.current);
    }
  }, [isOpen]);

  useEventListener("resize", () =>
    adjustDropdownHeight(dropdownListRef.current, searchRef.current),
  );

  const selectedOption = options.find((option) => option.value === value);

  const toggleLabel = (
    <span className="toggle-label u-truncate">
      {selectedOption ? getOptionText(selectedOption) : "Select an option"}
    </span>
  );

  const handleSelect = (value: string) => {
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
        position="left"
        toggleDisabled={disabled}
        onToggleMenu={(open) => {
          // Handle syncing the state when toggling the menu from within the
          // contextual menu component e.g. when clicking outside.
          if (open !== isOpen) {
            setIsOpen(open);
          }
        }}
        toggleProps={{
          id: selectId,
        }}
        className="p-custom-select__wrapper"
      >
        {(close: () => void) => (
          <CustomSelectDropdown
            searchable={searchable}
            name={name || ""}
            options={options || []}
            onSelect={handleSelect}
            onClose={close}
            searchRef={searchRef}
            dropdownListRef={dropdownListRef}
          />
        )}
      </ContextualMenu>
    </Field>
  );
};

export default CustomSelect;
