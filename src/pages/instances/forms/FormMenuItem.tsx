import React, { FC } from "react";
import { slugify } from "util/slugify";

interface Props {
  active: string;
  setActive: (item: string) => void;
  label: string;
}

const FormMenuItem: FC<Props> = ({ active, setActive, label }) => {
  return (
    <li className="p-side-navigation__item">
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
