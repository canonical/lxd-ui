import { FC, ReactNode } from "react";
import classnames from "classnames";
import { Spinner } from "@canonical/react-components";

interface Props {
  className?: string;
  children: ReactNode;
  width?: "wide" | "narrow";
  pinned?: boolean;
  loading?: boolean;
  isSplit?: boolean;
}

const Aside: FC<Props> = ({
  children,
  className,
  width,
  pinned = false,
  loading = false,
  isSplit = false,
}: Props) => {
  return (
    <div
      className={classnames("l-aside", className, {
        "is-narrow": width === "narrow",
        "is-wide": width === "wide",
        "is-pinned": pinned,
        "is-split": isSplit,
      })}
    >
      {loading ? (
        <div className="loading">
          <Spinner />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default Aside;
