import React, { useState } from "react";
import { startInstance } from "../../api/instances";
import PropTypes from "prop-types";

function StartInstanceBtn({ instance, onSuccess, onFailure }) {
  const [isLoading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    startInstance(instance)
      .then(() => {
        setLoading(false);
        onSuccess();
      })
      .catch(() => {
        setLoading(false);
        onFailure("Error on instance start.");
      });
  };

  return (
    <button onClick={handleStart} className="is-dense" disabled={isLoading || instance.status !== "Stopped"}>
      <i className={isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--video-play"}>Start</i>
    </button>
  );
}

StartInstanceBtn.propTypes = {
  instance: PropTypes.shape({
    status: PropTypes.string.isRequired,
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
};

export default StartInstanceBtn;
