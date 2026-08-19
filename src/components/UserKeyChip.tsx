import {
  useEffect,
  useRef,
  useState,
  type FC,
  type KeyboardEvent,
} from "react";
import classnames from "classnames";
import { toFullUserKey } from "util/userKeys";
import type { UserKey } from "types/forms/instanceAndProfile";

interface Props {
  userKey: UserKey;
}

const UserKeyChip: FC<Props> = ({ userKey }) => {
  const { key, value } = userKey;
  const chipRef = useRef<HTMLSpanElement>(null);
  const [isExpanded, setExpanded] = useState(false);
  const [isTruncated, setTruncated] = useState(false);

  useEffect(() => {
    if (isExpanded || !chipRef.current) {
      return;
    }
    const parts = chipRef.current.querySelectorAll(
      ".p-chip__lead, .p-chip__value",
    );
    setTruncated(
      [...parts].some((part) => part.scrollWidth > part.clientWidth),
    );
  }, [key, value, isExpanded]);

  const canToggle = isTruncated || isExpanded;

  const toggle = () => {
    if (canToggle) {
      setExpanded(!isExpanded);
    }
  };

  return (
    <span
      ref={chipRef}
      className={classnames("p-chip is-inline is-dense user-key-chip", {
        "is-expanded": isExpanded,
        "is-toggleable": canToggle,
      })}
      aria-label={`${toFullUserKey(key)}=${value}`}
      role={canToggle ? "button" : undefined}
      tabIndex={canToggle ? 0 : undefined}
      aria-expanded={canToggle ? isExpanded : undefined}
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }
      }}
    >
      <span className="p-chip__lead">{key}</span>
      <span className="p-chip__value">{value}</span>
    </span>
  );
};

export default UserKeyChip;
