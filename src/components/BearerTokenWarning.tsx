import { Link } from "react-router-dom";

import { getExpiryMessage } from "util/seconds";
import { useSecondsLeft } from "context/useSecondsLeft";
import { useAuth } from "context/auth";
import { ROOT_PATH } from "util/rootPath";
import DsIcon from "components/DsIcon";

const BearerTokenWarning: React.FC = () => {
  const { authExpiresAt } = useAuth();
  const secondsLeft = useSecondsLeft(authExpiresAt);
  const expiryMessage = getExpiryMessage(secondsLeft);

  return (
    <div>
      <DsIcon icon="warning" />
      {expiryMessage && (
        <span className="u-margin-left--small u-hide--medium u-hide--small">
          {expiryMessage}
        </span>
      )}
      <Link
        to={`${ROOT_PATH}/ui/authentication-setup`}
        className="u-text--link u-margin-left--small"
      >
        Set up permanent access
      </Link>
    </div>
  );
};

export default BearerTokenWarning;
