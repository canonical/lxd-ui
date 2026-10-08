import type { FC } from "react";
import {
  CheckboxInput,
  CodeSnippet,
  OutputField,
} from "@canonical/react-components";
import CopyToClipboard from "components/CopyToClipboard";

interface Props {
  remoteAddress: string;
  fingerprint: string;
  isConfirmed: boolean;
  setConfirmed: (value: boolean) => void;
}

const ClusterLinkVerifyCertificate: FC<Props> = ({
  remoteAddress,
  fingerprint,
  isConfirmed,
  setConfirmed,
}) => {
  return (
    <>
      <OutputField
        id="remote-address"
        label="Remote address"
        value={remoteAddress}
      />
      <h3 className="p-muted-heading p-heading--5">Certificate</h3>
      <CodeSnippet
        className="code-snippet-with-copy-button-wrapper cluster-link-fingerprint"
        blocks={[
          {
            title: "Certificate fingerprint",
            code: (
              <div className="command-wrapper">
                <span id="certificate-fingerprint" className="command">
                  {fingerprint}
                </span>
                <CopyToClipboard
                  value={fingerprint}
                  tooltipMessage="Copy fingerprint"
                />
              </div>
            ),
          },
        ]}
      />
      <CheckboxInput
        label="I confirm this fingerprint matches the LXD server at the remote address."
        checked={isConfirmed}
        onChange={() => {
          setConfirmed(!isConfirmed);
        }}
      />
    </>
  );
};

export default ClusterLinkVerifyCertificate;
