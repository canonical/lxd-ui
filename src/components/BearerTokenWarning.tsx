import { useEffect, useState } from "react";
import { Icon } from "@canonical/react-components";
import { useSettings } from "context/useSettings";
import { formatSeconds } from "util/seconds";

const BearerTokenWarning: React.FC = () => {
  const { data: settings } = useSettings();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (settings?.expires_in) {
      setSecondsLeft(settings.expires_in);
    }
  }, [settings?.expires_in]);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [secondsLeft]);

  return (
    <div className="u-sv1 u-align--center u-flex u-gap--small u-margin-left--small">
      <Icon name="warning" />
      <span className="u-no-margin">
        Temporary session.{" "}
        {secondsLeft && secondsLeft > 0
          ? `Expires in ${formatSeconds(secondsLeft)}.`
          : ""}{" "}
        <a href="/ui/login/authentication-setup" className="u-text--link">
          Set up permanent access
        </a>
      </span>
    </div>
  );
};

export default BearerTokenWarning;
