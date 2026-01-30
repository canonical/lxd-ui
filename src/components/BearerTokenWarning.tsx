import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div>
      <Icon name="warning" />
      <span className="u-margin-left--small u-hide--small">
        Temporary session.
      </span>
      {secondsLeft && secondsLeft > 0 ? (
        <span className="u-margin-left--small u-hide--medium u-hide--small">
          Expires in {formatSeconds(secondsLeft)}.
        </span>
      ) : (
        ""
      )}
      <Link
        to="/ui/login/authentication-setup"
        className="u-text--link u-margin-left--small"
      >
        Set up permanent access
      </Link>
    </div>
  );
};

export default BearerTokenWarning;
