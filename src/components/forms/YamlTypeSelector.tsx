import type { FC } from "react";
import { RadioInput } from "@canonical/react-components";

interface Props {
  yamlType: "local" | "expandInheritedValues";
  setYamlType: (yamlType: "local" | "expandInheritedValues") => void;
}

const YamlTypeSelector: FC<Props> = ({ yamlType, setYamlType }) => {
  return (
    <div className="yaml-type-radio-wrapper">
      <RadioInput
        label="Local"
        checked={yamlType === "local"}
        onChange={() => {
          setYamlType("local");
        }}
      />
      <RadioInput
        label="Expand inherited values"
        checked={yamlType === "expandInheritedValues"}
        onChange={() => {
          setYamlType("expandInheritedValues");
        }}
      />
    </div>
  );
};

export default YamlTypeSelector;
