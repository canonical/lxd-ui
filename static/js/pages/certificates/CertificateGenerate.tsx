import React, { FC } from "react";
import { generateCert } from "util/certificate";

const CertificateGenerate: FC = () => {
  const certs = generateCert();
  console.log(certs);

  return (
    <>
      <div>Hello</div>
    </>
  );
};

export default CertificateGenerate;
