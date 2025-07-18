import { pluralize } from "util/instanceBulkActions";

export const formatSeconds = (seconds: number): string => {
  let result = "";

  if (seconds % 60 > 0) {
    result = `${seconds % 60} ${pluralize("second", seconds % 60)}`;
  }

  const minutes = Math.floor(seconds / 60) % 60;
  if (minutes > 0) {
    const suffix = result ? `, ${result}` : "";
    result = `${minutes} ${pluralize("minute", minutes)}${suffix}`;
  }

  const hours = Math.floor(seconds / 60 / 60) % 24;
  if (hours > 0) {
    const suffix = result ? `, ${result}` : "";
    result = `${hours} ${pluralize("hour", hours)}${suffix}`;
  }

  const days = Math.floor(seconds / 60 / 60 / 24);
  if (days > 0) {
    const suffix = result ? `, ${result}` : "";
    result = `${days} ${pluralize("day", days)}${suffix}`;
  }

  return result;
};
