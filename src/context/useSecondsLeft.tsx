import { useState, useEffect } from "react";

// expiresAt is expected to be in ISO format, e.g. "2036-02-15T12:55:06Z"
export const useSecondsLeft = (expiresAt: string | null | undefined) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(null);
      return;
    }

    const calculateSeconds = () => {
      const expiryDate = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiryDate - now) / 1000));
      return diff;
    };

    setSecondsLeft(calculateSeconds());

    const timer = setInterval(() => {
      const remaining = calculateSeconds();
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [expiresAt]);

  return secondsLeft;
};
