import { FC } from "react";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkTopology: FC<Props> = ({ formik }) => {
  const network = formik.values.bareNetwork;

  return (
    <>
      <h2 className="p-heading--4" id="topology">
        Topology
      </h2>
      <div className="u-sv3">Here be topology for {network?.name}</div>
    </>
  );
};

export default NetworkTopology;
