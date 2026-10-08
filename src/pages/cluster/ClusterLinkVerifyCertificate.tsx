import type { FC } from "react";
import { CheckboxInput, Field, OutputField } from "@canonical/react-components";
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
      <Field
        forId="certificate-fingerprint"
        label="Certificate fingerprint"
        help="Verify that this fingerprint matches the target LXD server's certificate before connecting."
        labelClassName="u-no-margin--bottom"
        className="output-field"
      >
        <div className="u-sv2">
          <CopyToClipboard
            value={fingerprint}
            tooltipMessage="Copy fingerprint"
          >
            <output
              id="certificate-fingerprint"
              title={fingerprint}
              className="mono-font output-field-truncate"
            >
              <b>{fingerprint}</b>
            </output>
          </CopyToClipboard>
        </div>
      </Field>
      <CheckboxInput
        label="I confirm this certificate fingerprint is correct"
        checked={isConfirmed}
        onChange={() => {
          setConfirmed(!isConfirmed);
        }}
      />
    </>
  );
};

export default ClusterLinkVerifyCertificate;
