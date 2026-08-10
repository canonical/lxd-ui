import { Input, RadioInput } from "@canonical/react-components";
import { type FC, useId } from "react";

interface Props {
  isCustomExpiry: boolean;
  expiry: string;
  disabled?: boolean;
  error?: string;
  onIsCustomExpiryChange: (isCustom: boolean) => void;
  onExpiryChange: (value: string) => void;
  onExpiryBlur?: () => void;
}

const TokenExpirySelector: FC<Props> = ({
  isCustomExpiry,
  expiry,
  disabled = false,
  error,
  onIsCustomExpiryChange,
  onExpiryChange,
  onExpiryBlur,
}) => {
  const inputId = useId();

  return (
    <div className="token-expiry-selector u-sv1">
      <label id={`${inputId}-label`}>Token expiry</label>
      <RadioInput
        label="Default (10 years)"
        checked={!isCustomExpiry}
        disabled={disabled}
        onChange={() => {
          onIsCustomExpiryChange(false);
        }}
      />
      <div className="token-expiry-custom">
        <RadioInput
          label="Custom"
          checked={isCustomExpiry}
          disabled={disabled}
          onChange={() => {
            onIsCustomExpiryChange(true);
          }}
        />
        <Input
          type="text"
          id={inputId}
          value={isCustomExpiry ? expiry : ""}
          error={isCustomExpiry ? error : undefined}
          onChange={(e) => {
            onExpiryChange(e.target.value);
          }}
          onBlur={onExpiryBlur}
          placeholder="e.g. 1d 3H 5M"
          disabled={disabled || !isCustomExpiry}
          help={
            <>
              Space-separated durations: {"<number><unit>"} <br />
              Units are case-sensitive: y, m, w, d, H, M, S
            </>
          }
        />
        <label htmlFor={inputId} className="u-off-screen">
          Token expiry value
        </label>
      </div>
    </div>
  );
};

export default TokenExpirySelector;
