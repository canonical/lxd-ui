import { type ReactNode, type FC } from "react";
import { EmptyState, Row } from "@canonical/react-components";
import DocLink from "components/DocLink";
import EnableClusteringBtn from "pages/cluster/actions/EnableClusteringBtn";
import DsIcon from "components/DsIcon";

interface Props {
  text?: string;
  extraButton?: ReactNode;
}

const NotClusteredEmptyState: FC<Props> = ({ text, extraButton }) => {
  return (
    <Row>
      <EmptyState
        className="empty-state"
        image={<DsIcon icon="cluster-host" className="empty-state-icon" />}
        title="This server is not clustered"
      >
        {text && <p>{text}</p>}
        <p>
          <DocLink docPath="/explanation/clustering/" hasExternalIcon>
            Learn more about clustering
          </DocLink>
        </p>
        {extraButton}
        <EnableClusteringBtn />
      </EmptyState>
    </Row>
  );
};

export default NotClusteredEmptyState;
