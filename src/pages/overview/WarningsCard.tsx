import { type FC } from "react";
import { Card, Icon, MainTable, Spinner } from "@canonical/react-components";
import { Link } from "react-router-dom";
import { useCurrentProject } from "context/useCurrentProject";
import { useWarnings } from "context/useWarnings";
import WarningExplanationTooltip from "pages/warnings/WarningExplanationTooltip";
import { ROOT_PATH } from "util/rootPath";
import { getWarningHeaders, getWarningRows } from "util/warnings";

const WarningsCard: FC = () => {
  const { data: warnings = [], error, isLoading } = useWarnings();
  const { project, isAllProjects } = useCurrentProject();
  const newWarnings = warnings.filter(
    (warning) =>
      warning.status === "new" &&
      (!warning.project || isAllProjects || warning.project === project?.name),
  );

  const cardClassName = "overview-card warnings";
  const cardTitle = (
    <>
      <span className="overview-card-title">
        <Icon name="warning-grey" /> Warnings
      </span>
      <WarningExplanationTooltip />
    </>
  );

  if (isLoading) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <Spinner className="u-loader" text="Loading warnings..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <div className="error-message">
          <Icon name="error" className="margin-right--large" /> Error while
          loading warnings: {error.message}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cardClassName} title={cardTitle}>
      <div className="warnings-table-overview-scroll">
        <MainTable
          id="warning-table"
          headers={getWarningHeaders("overview")}
          rows={getWarningRows(newWarnings, "overview")}
          sortable={true}
          defaultSort="severity"
          defaultSortDirection="descending"
          className="warnings-table warnings-table--overview"
          emptyStateMsg="No warnings found"
          responsive
        />
      </div>
      <div className="card-footer">
        <Link to={`${ROOT_PATH}/ui/warnings?status=new`}>See more</Link>
      </div>
    </Card>
  );
};

export default WarningsCard;
