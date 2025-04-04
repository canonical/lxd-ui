import type { FC } from "react";
import { Spinner } from "@canonical/react-components";
import CustomLayout from "components/CustomLayout";

interface Props {
  text?: string;
  /**
   * Whether the Loader is replacing the main component in the application layout.
   * In that case, the loader has to be wrapped with a main panel of the application
   * layout. This is important for the mobile view. This prop enables the wrapping.
   */
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
