import { SearchBox } from "@canonical/react-components";
import {
  FC,
  KeyboardEvent,
  LiHTMLAttributes,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import { adjustDropdownHeight } from "util/customSelect";
import useEventListener from "@use-it/event-listener";
import { getNearestParentsZIndex } from "util/zIndex";

export type CustomSelectOption = LiHTMLAttributes<HTMLLIElement> & {
  value: string;
  label: ReactNode;
  // text used for search, sort and display in toggle button
  // text must be provided if label is not a string
  text?: string;
  disabled?: boolean;
};

interface Props {
  searchable?: "auto" | "always" | "never";
  name: string;
  options: CustomSelectOption[];
  onSelect: (value: string) => void;
  onClose: () => void;
  header?: ReactNode;
  toggleId: string;
}

export const getOptionText = (option: CustomSelectOption): string => {
  if (option.text) {
    return option.text;
  }

  if (typeof option.label === "string") {
    return option.label;
  }

  throw new Error(
    "CustomSelect: options must have a string label or a text property",
  );
};

export const sortOptions = (
  a: CustomSelectOption,
  b: CustomSelectOption,
): number => {
  // sort options alphabetically
  const textA = getOptionText(a) || a.value;
  const textB = getOptionText(b) || b.value;
  return textA.localeCompare(textB);
};

const CustomSelectDropdown: FC<Props> = ({
  searchable,
  name,
  options,
  onSelect,
  onClose,
  header,
  toggleId,
}) => {
  const [search, setSearch] = useState("");
  // track selected option index for keyboard actions
  const [selectedIndex, setSelectedIndex] = useState(0);
  // use ref to keep a reference to all option HTML elements so we do not need to make DOM calls later for scrolling
  const optionsRef = useRef<HTMLLIElement[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownListRef = useRef<HTMLUListElement>(null);
  const isSearchable =
    searchable !== "never" &&
    options.length > 1 &&
    (searchable === "always" || (searchable === "auto" && options.length >= 5));

  useEffect(() => {
    if (dropdownRef.current) {
      const toggle = document.getElementById(toggleId);

      // align width with wrapper toggle width
      const toggleWidth = toggle?.getBoundingClientRect()?.width ?? 0;
      dropdownRef.current.style.setProperty("min-width", `${toggleWidth}px`);

      // align z-index: when we are in a modal context, we want the dropdown to be above the modal
      // apply the nearest parents z-index + 1
      const zIndex = getNearestParentsZIndex(toggle);
      if (parseInt(zIndex) > 0) {
        dropdownRef.current.parentElement?.style.setProperty(
          "z-index",
          zIndex + 1,
        );
      }
    }

    setTimeout(() => {
      if (isSearchable) {
        searchRef.current?.focus();
        return;
      }

      dropdownRef.current?.focus();
    }, 100);
  }, [isSearchable]);

  const handleResize = () => {
    adjustDropdownHeight(dropdownListRef.current, searchRef.current);
  };

  useLayoutEffect(handleResize, []);
  useEventListener("resize", handleResize);

  // track selected index from key board action and scroll into view if needed
  useEffect(() => {
    optionsRef.current[selectedIndex]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [selectedIndex]);

  const filteredOptions = options?.filter((option) => {
    if (!search || option.disabled) return true;
    const searchText = getOptionText(option) || option.value;
    return searchText.toLowerCase().includes(search);
  });

  const getNextOptionIndex = (goingUp: boolean, prevIndex: number) => {
    const increment = goingUp ? -1 : 1;
    let currIndex = prevIndex + increment;
    // skip disabled options for key board action
    while (filteredOptions[currIndex] && filteredOptions[currIndex]?.disabled) {
      currIndex += increment;
    }

    // consider upper bound for navigating down the list
    if (increment > 0) {
      return currIndex < filteredOptions.length ? currIndex : prevIndex;
    }

    // consider lower bound for navigating up the list
    return currIndex >= 0 ? currIndex : prevIndex;
  };

  // handle keyboard actions for navigating the select dropdown
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const upDownKeys = ["ArrowUp", "ArrowDown"];

    // prevent default browser actions for up, down, enter and escape keys
    // also prevent any other event listeners from being called up the DOM tree
    if ([...upDownKeys, "Enter", "Escape", "Tab"].includes(event.key)) {
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();
    }

    if (upDownKeys.includes(event.key)) {
      setSelectedIndex((prevIndex) => {
        const goingUp = event.key === "ArrowUp";
        return getNextOptionIndex(goingUp, prevIndex);
      });
    }

    if (event.key === "Enter" && filteredOptions[selectedIndex]) {
      onSelect(filteredOptions[selectedIndex].value);
    }

    if (event.key === "Escape" || event.key === "Tab") {
      onClose();
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value.toLowerCase());
    // reset selected index when search text changes
    setSelectedIndex(0);
    optionsRef.current = [];
  };

  const handleSelect = (option: CustomSelectOption) => {
    if (option.disabled) {
      return;
    }

    onSelect(option.value);
  };

  const optionItems = filteredOptions.map((option, idx) => {
    return (
      <li
        key={`${option.value}-${idx}`}
        onClick={() => handleSelect(option)}
        className={classnames(
          "p-list__item",
          "p-custom-select__option",
          "u-truncate",
          {
            disabled: option.disabled,
            highlight: idx === selectedIndex && !option.disabled,
          },
        )}
        // adding option elements to a ref array makes it easier to scroll the element later
        // else we'd have to make a DOM call to find the element based on some identifier
        ref={(el) => {
          if (!el) return;
          optionsRef.current[idx] = el;
        }}
        role="option"
        onMouseMove={() => setSelectedIndex(idx)}
      >
        <span
          className={classnames({
            "u-text--muted": option.disabled,
          })}
        >
          {option.label}
        </span>
      </li>
    );
  });

  return (
    <div
      className="p-custom-select__dropdown u-no-padding"
      role="combobox"
      onKeyDownCapture={handleKeyDown}
      // allow focus on the dropdown so that keyboard actions can be captured
      tabIndex={-1}
      ref={dropdownRef}
      onMouseDown={(e) => {
        // when custom select is used in a modal, which is a portal, a dropdown click
        // should not close the modal itself, so we stop the event right here.
        e.stopPropagation();
      }}
    >
      {isSearchable && (
        <div className="p-custom-select__search u-no-padding--bottom">
          <SearchBox
            ref={searchRef}
            id={`select-search-${name}`}
            name={`select-search-${name}`}
            type="text"
            aria-label={`Search for ${name}`}
            className="u-no-margin--bottom"
            onChange={handleSearch}
            value={search}
            autocomplete="off"
          />
        </div>
      )}
      {header}
      <ul
        className="p-list u-no-margin--bottom"
        role="listbox"
        ref={dropdownListRef}
      >
        {optionItems}
      </ul>
    </div>
  );
};

export default CustomSelectDropdown;
