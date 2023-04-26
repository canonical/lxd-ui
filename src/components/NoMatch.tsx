import React, { FC } from "react";
import { Row, Col } from "@canonical/react-components";

const NoMatch: FC = () => {
  return (
    <main className="l-main no-match">
      <Row>
        <Col size={6} className="col-start-large-4">
          <h1 className="p-heading--4">404 Page not found</h1>
          <p>
            Sorry, we cannot find the page that you are looking for.
            <br />
            If you think this is an error in our product, please{" "}
            <a
              href="https://github.com/canonical/lxd-ui/issues/new"
              target="_blank"
              rel="noreferrer"
              title="Report a bug"
            >
              Report a bug
            </a>
            .
          </p>
        </Col>
      </Row>
    </main>
  );
};

export default NoMatch;
