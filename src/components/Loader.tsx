import type { FC } from "react";
import { Spinner } from "@canonical/react-components";
import CustomLayout from "components/CustomLayout";

interface Props {
  text?: string;
  isMainComponent?: boolean;
}

const Loader: FC<Props> = ({
  text = "Loading...",
  isMainComponent = false,
}) => {
  const loader = (
    <div className="u-loader">
      <Spinner text={text} />
    </div>
  );

  return isMainComponent ? <CustomLayout>{loader}</CustomLayout> : loader;
};

export default Loader;
