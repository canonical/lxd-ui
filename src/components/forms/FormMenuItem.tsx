import type { FC } from "react";
import { Fragment } from "react";
import { slugify } from "util/slugify";
import { Button } from "@canonical/react-components";
import classnames from "classnames";

interface Props {
  active: string;
  setActive: (item: string) => void;
  label: string;
  disableReason?: string;
  hasError?: boolean;
  isBold?: boolean;
}

const FormMenuItem: FC<Props> = ({
  active,
  setActive,
  label,
  disableReason,
  hasError,
  isBold,
}) => {
  const ValueWrapper = isBold ? "strong" : Fragment;

  if (disableReason) {
    return (
      <li className="p-side-navigation__item">
        <Button
          className="p-side-navigation__link p-button--base"
          disabled={true}
          title={disableReason}
        >
          <ValueWrapper>{label}</ValueWrapper>
        </Button>
      </li>
    );
  }
  return (
    <li
      className={classnames("p-side-navigation__item", {
        "has-error": hasError,
      })}
    >
      <a
        className="p-side-navigation__link"
        onClick={() => {
          setActive(label);
        }}
        aria-current={slugify(label) === slugify(active) ? "page" : undefined}
      >
        <ValueWrapper>{label}</ValueWrapper>
      </a>
    </li>
  );
};

export default FormMenuItem;
