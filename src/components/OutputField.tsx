import type { FC, ReactNode } from "react";
import { Field } from "@canonical/react-components";

interface Props {
  id: string;
  label: string;
  value: string;
  help?: ReactNode;
  suffix?: ReactNode;
  isBold?: boolean;
}

const OutputField: FC<Props> = ({
  id,
  label,
  value,
  help,
  suffix,
  isBold = true,
}) => {
  return (
    <Field
      forId={id}
      label={label}
      help={help}
      labelClassName="u-no-margin--bottom"
      className="output-field"
    >
      <output id={id} className="mono-font u-sv2">
        {isBold ? <b>{value}</b> : value}
        {suffix && <> {suffix}</>}
      </output>
    </Field>
  );
};

export default OutputField;
