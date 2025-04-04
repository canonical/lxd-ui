import type { FC } from "react";
import CustomLayout from "components/CustomLayout";
import Loader from "components/Loader";

const ContentPageLoader: FC = () => {
  return (
    <CustomLayout>
      <Loader />
    </CustomLayout>
  );
};

export default ContentPageLoader;
