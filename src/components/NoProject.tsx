import type { FC } from "react";
import { Row, Col } from "@canonical/react-components";
import CustomLayout from "./CustomLayout";

const NoProject: FC = () => {
  const url = location.pathname;
  const hasProjectInUrl = url.startsWith("/ui/project/");
  const project = hasProjectInUrl ? url.split("/")[3] : "default";

  return (
    <CustomLayout mainClassName="no-match">
      <Row>
        <Col size={6} className="col-start-large-4">
          {hasProjectInUrl ? (
            <>
              <h1 className="p-heading--4">Project not found</h1>
              <p>
                The project <code>{project}</code> is missing or you do not have
                the <code>viewer</code> permission for it.
              </p>
            </>
          ) : (
            <>
              <h1 className="p-heading--4">Permission denied</h1>
              <p>
                You do not have permission to view any project on this server.
              </p>
            </>
          )}
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default NoProject;
