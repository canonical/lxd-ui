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

export const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return "00:00:00";

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  const y = Math.floor(seconds / 31536000);
  const mon = Math.floor((seconds % 31536000) / 2592000);
  const d = Math.floor((seconds % 2592000) / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];

  if (y > 0) {
    parts.push(`${y}y`, `${mon}mo`, `${d}d`);
  } else if (mon > 0) {
    parts.push(`${mon}mo`, `${d}d`, `${h}h`);
  } else {
    parts.push(`${d}d`, `${h}h`, `${m}m`);
  }

  return parts.join(" ");
};

export const getExpiryMessage = (secondsLeft: number | null): string | null => {
  if (secondsLeft === null) {
    return null;
  }

  if (secondsLeft <= 0) {
    return "Temporary access has expired";
  }

  const timeString = formatCountdown(secondsLeft);

  return `Temporary access expires in ${timeString}`;
};
