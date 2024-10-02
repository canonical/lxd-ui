import { SearchBox } from "@canonical/react-components";
import {
  FC,
  KeyboardEvent,
  LiHTMLAttributes,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import classnames from "classnames";

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
  searchRef: RefObject<HTMLInputElement>;
  dropdownListRef: RefObject<HTMLUListElement>;
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
  searchRef,
  dropdownListRef,
}) => {
  const [search, setSearch] = useState("");
  // track selected option index for keyboard actions
  const [selectedIndex, setSelectedIndex] = useState(-1);
  // use ref to keep a reference to all option HTML elements so we do not need to make DOM calls later for scrolling
  const optionsRef = useRef<HTMLLIElement[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isSearchable =
    searchable !== "never" &&
    (searchable === "always" || (searchable === "auto" && options.length >= 5));

  useEffect(() => {
    setTimeout(() => {
      if (isSearchable) {
        searchRef.current?.focus();
        return;
      }

      dropdownRef.current?.focus();
    }, 100);
  }, [isSearchable]);

  // track selected index from key board action and scroll into view if needed
  useEffect(() => {
    if (selectedIndex !== -1 && optionsRef.current[selectedIndex]) {
      optionsRef.current[selectedIndex].scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [selectedIndex]);

  // handle keyboard actions for navigating the select dropdown
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const upDownKeys = ["ArrowUp", "ArrowDown"];

    // prevent default browser actions for up, down, enter and escape keys
    // also prevent any other event listeners from being called up the DOM tree
    if ([...upDownKeys, "Enter", "Escape"].includes(event.key)) {
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();
    }

    if (upDownKeys.includes(event.key)) {
      setSelectedIndex((prevIndex) => {
        const goingUp = event.key === "ArrowUp";
        const increment = goingUp ? -1 : 1;
        let currIndex = prevIndex + increment;
        // skip disabled options for key board action
        while (options[currIndex] && options[currIndex]?.disabled) {
          currIndex += increment;
        }

        // consider upper bound for navigating down the list
        if (increment > 0) {
          return currIndex < options.length ? currIndex : prevIndex;
        }

        // consider lower bound for navigating up the list
        return currIndex >= 0 ? currIndex : prevIndex;
      });
    }

    if (event.key === "Enter" && selectedIndex !== -1) {
      onSelect(options[selectedIndex].value);
    }

    if (event.key === "Escape") {
      onClose();
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value.toLowerCase());
    // reset selected index when search text changes
    setSelectedIndex(-1);
    optionsRef.current = [];
  };

  const optionItems = options
    // filter options based on search text
    ?.filter((option) => {
      if (!search) return true;
      const searchText = getOptionText(option) || option.value;
      return searchText.toLowerCase().includes(search);
    })
    .map((option, idx) => {
      return (
        <li
          {...option}
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={classnames(
            "p-list__item",
            "p-custom-select__option",
            "u-truncate",
            {
              disabled: option.disabled,
              highlight: idx === selectedIndex,
            },
          )}
          // adding option elements to a ref array makes it easier to scroll the element later
          // else we'd have to make a DOM call to find the element based on some identifier
          ref={(el) => {
            if (!el) return;
            optionsRef.current[idx] = el;
          }}
          role="option"
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
          />
        </div>
      )}
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
