import { type FC } from "react";
import { EmptyState, Icon, Row } from "@canonical/react-components";
import DocLink from "components/DocLink";
import EnableClusteringBtn from "pages/cluster/actions/EnableClusteringBtn";

interface Props {
  text?: string;
}

const NotClusteredEmptyState: FC<Props> = ({ text }) => {
  return (
    <Row>
      <EmptyState
        className="empty-state"
        image={<Icon name="cluster-host" className="empty-state-icon" />}
        title="This server is not clustered"
      >
        {text && <p>{text}</p>}
        <p>
          <DocLink docPath="/explanation/clustering/" hasExternalIcon>
            Learn more about clustering
          </DocLink>
        </p>
        <EnableClusteringBtn />
      </EmptyState>
    </Row>
  );
};

export default NotClusteredEmptyState;
