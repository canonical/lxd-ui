import { RadioInput } from "@canonical/react-components";
import type { FC } from "react";

export type InstanceFileType = "instance-backup" | "external-format";

interface Props {
  value: InstanceFileType;
  onChange: (value: InstanceFileType) => void;
}

const InstanceFileTypeSelector: FC<Props> = ({ value, onChange }) => {
  return (
    <>
      <label htmlFor="file-type">Select upload file type</label>
      <div id="file-type">
        <div className="u-sv1">
          <RadioInput
            label="LXD backup archive (.tar.gz)"
            checked={value === "instance-backup"}
            onChange={() => onChange("instance-backup")}
          />
        </div>
        <div className="u-sv3">
          <RadioInput
            label={
              <span>
                External format (.qcow2, .vmdk,{" "}
                <abbr title=".qcow, .vdi, .vhdx">etc...</abbr>)
              </span>
            }
            checked={value === "external-format"}
            onChange={() => onChange("external-format")}
          />
        </div>
      </div>
    </>
  );
};

export default InstanceFileTypeSelector;
