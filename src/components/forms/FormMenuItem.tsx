import { FC } from "react";
import { slugify } from "util/slugify";
import { Button } from "@canonical/react-components";
import classnames from "classnames";

interface Props {
  active: string;
  setActive: (item: string) => void;
  label: string;
  disableReason?: string;
  hasError?: boolean;
}

const FormMenuItem: FC<Props> = ({
  active,
  setActive,
  label,
  disableReason,
  hasError,
}) => {
  if (disableReason) {
    return (
      <li className="p-side-navigation__item">
        <Button
          className="p-side-navigation__link p-button--base"
          disabled={true}
          title={disableReason}
        >
          {label}
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
        onClick={() => setActive(label)}
        aria-current={slugify(label) === slugify(active) ? "page" : undefined}
      >
        {label}
      </a>
    </li>
  );
};

export default FormMenuItem;
