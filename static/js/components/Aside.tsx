import React, { FC, ReactNode } from "react";
import classnames from "classnames";

import { Spinner } from "@canonical/react-components";

import SlideInOut from "./SlideInOut";
import "../../sass/_aside.scss";

type Props = {
  children: ReactNode;
  width?: "wide" | "narrow";
  pinned?: boolean;
  loading?: boolean;
  isSplit?: boolean;
};

const Aside: FC<Props> = ({
  children,
  width,
  pinned = false,
  loading = false,
  isSplit = false,
}: Props) => {
  return (
    <SlideInOut
      isActive={true}
      className={classnames("l-aside", {
        "is-narrow": width === "narrow",
        "is-wide": width === "wide",
        "is-pinned": pinned === true,
        "is-split": isSplit === true,
      })}
    >
      {loading ? (
        <div className="loading">
          <Spinner />
        </div>
      ) : (
        children
      )}
    </SlideInOut>
  );
};

export default Aside;
