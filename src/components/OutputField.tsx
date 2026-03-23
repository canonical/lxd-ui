import type { FC } from "react";
import { Field } from "@canonical/react-components";

interface Props {
  id: string;
  label: string;
  value: string;
  help?: string;
}

const OutputField: FC<Props> = ({ id, label, value, help }) => {
  return (
    <Field
      forId={id}
      label={label}
      help={help}
      labelClassName="u-no-margin--bottom"
      className="output-field"
    >
      <output id={id} className="mono-font u-sv2">
        <b>{value}</b>
      </output>
    </Field>
  );
};

export default OutputField;
