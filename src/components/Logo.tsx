import React, { FC } from "react";
import { NavLink } from "react-router-dom";

const Logo: FC = () => {
  return (
    <NavLink className="p-panel__logo" to="/ui/">
      <img
        src="/ui/assets/img/lxd-logo.svg"
        alt="LXD-UI logo"
        className="p-panel__logo-image"
      />
      <div className="logo-text p-heading--4">Canonical LXD</div>
    </NavLink>
  );
};

export default Logo;
