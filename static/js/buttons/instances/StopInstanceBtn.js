import React, { useState } from "react";
import { stopInstance } from "../../api/instances";
import PropTypes from "prop-types";

function StopInstanceBtn({ instance, onSuccess, onFailure }) {
  const [isLoading, setLoading] = useState(false);

  const handleStop = () => {
    setLoading(true);
    stopInstance(instance)
      .then(() => {
        setLoading(false);
        onSuccess();
      })
      .catch(() => {
        setLoading(false);
        onFailure("Error on instance stop.");
      });
  };

  return (
    <button onClick={handleStop} className="is-dense" disabled={isLoading || instance.status !== "Running"}>
      <i className={isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--power-off"}>Stop</i>
    </button>
  );
}

StopInstanceBtn.propTypes = {
  instance: PropTypes.shape({
    status: PropTypes.string.isRequired,
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
};

export default StopInstanceBtn;
