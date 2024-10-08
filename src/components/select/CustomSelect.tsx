import classNames from "classnames";
import {
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { FC, FocusEvent, MutableRefObject, ReactNode } from "react";
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
import useEventListener from "@use-it/event-listener";
import { adjustDropdownHeight } from "util/customSelect";

export type SelectRef = MutableRefObject<
  | {
      open: () => void;
      close: () => void;
      isOpen: boolean;
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
    // Function to run when the select is focused.
    onFocus?: (event: FocusEvent<HTMLButtonElement>) => void;
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
  onFocus,
  initialPosition = "left",
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
  const [isMouseDown, setIsMouseDown] = useState(false);

  useImperativeHandle(
    selectRef,
    () => ({
      open: setIsOpen.bind(null, true),
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

  // Prevent onFocus from being called when the mouse is down on the select toggle
  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    if (!isMouseDown) {
      onFocus?.(event);
    }
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
          onFocus: handleFocus,
          disabled: disabled,
          // tabIndex is set to -1 when disabled to prevent keyboard navigation to the select toggle
          tabIndex: disabled ? -1 : 0,
          onMouseDown: () => setIsMouseDown(true),
          onMouseUp: () => setIsMouseDown(false),
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
            onClose={close}
            searchRef={searchRef}
            dropdownListRef={dropdownListRef}
            header={header}
          />
        )}
      </ContextualMenu>
    </Field>
  );
};

export default CustomSelect;
