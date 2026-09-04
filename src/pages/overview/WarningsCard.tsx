import { type FC } from "react";
import {
  Card,
  MainTable,
  Spinner,
  TablePagination,
} from "@canonical/react-components";
import { Link } from "react-router-dom";
import { useCurrentProject } from "context/useCurrentProject";
import { useWarnings } from "context/useWarnings";
import { ITEMS_PER_PAGE } from "pages/overview/overviewConstants";
import WarningExplanationTooltip from "pages/warnings/WarningExplanationTooltip";
import { ROOT_PATH } from "util/rootPath";
import { getWarningHeaders, getWarningRows } from "util/warnings";
import DsIcon from "components/DsIcon";

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
        <DsIcon icon="warning" /> Warnings
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
          <DsIcon icon="error-fill" className="margin-right--large" /> Error
          while loading warnings: {error.message}
        </div>
      </Card>
    );
  }

  const rows = getWarningRows(newWarnings, "overview");
  const warningsTable = (
    <MainTable
      id="warning-table"
      headers={getWarningHeaders("overview")}
      rows={newWarnings.length > ITEMS_PER_PAGE ? undefined : rows}
      sortable={true}
      defaultSort="severity"
      defaultSortDirection="descending"
      className="warnings-table overview-table"
      emptyStateMsg="No warnings found"
      responsive
    />
  );

  return (
    <Card className={cardClassName} title={cardTitle}>
      {newWarnings.length > ITEMS_PER_PAGE ? (
        <TablePagination
          id="warnings-pagination"
          data={rows}
          pageLimits={[ITEMS_PER_PAGE]}
          itemName="warning"
          position="below"
          className="u-no-margin--bottom"
          aria-label="Warnings pagination control"
        >
          {warningsTable}
        </TablePagination>
      ) : (
        warningsTable
      )}
      <div className="card-footer">
        <Link to={`${ROOT_PATH}/ui/warnings?status=new`}>Warnings list</Link>
      </div>
    </Card>
  );
};

export default WarningsCard;
