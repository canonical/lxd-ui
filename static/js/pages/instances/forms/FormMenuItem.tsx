import React, { FC } from "react";

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
        aria-current={label === active ? "page" : undefined}
      >
        {label}
      </a>
    </li>
  );
};

export default FormMenuItem;
