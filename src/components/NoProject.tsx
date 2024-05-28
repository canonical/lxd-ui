import { FC } from "react";
import { Row, Col } from "@canonical/react-components";
import CustomLayout from "./CustomLayout";

const NoProject: FC = () => {
  const url = location.pathname;
  const project = url.startsWith("/ui/project/")
    ? url.split("/")[3]
    : "default";

  return (
    <CustomLayout mainClassName="no-match">
      <Row>
        <Col size={6} className="col-start-large-4">
          <h1 className="p-heading--4">Project not found</h1>
          <p>
            The project <code>{project}</code> is missing or you do not have
            access.
            <br />
            If you think this is an error in our product, please{" "}
            <a
              href="https://github.com/canonical/lxd-ui/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              title="Report a bug"
            >
              Report a bug
            </a>
            .
          </p>
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default NoProject;
