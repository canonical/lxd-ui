import React, { FC } from "react";
import { NavLink } from "react-router-dom";

const Logo: FC = () => {
  return (
    <NavLink className="p-panel__logo" to="/ui/">
      <img
        src="/ui/static/assets/img/logo/containers.svg"
        alt="LXD-UI logo"
        className="p-panel__logo-image"
      />
      <div className="logo-text">Canonical LXD</div>
    </NavLink>
  );
};

export default Logo;
