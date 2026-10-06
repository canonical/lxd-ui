import type { FC } from "react";
import { Link } from "react-router-dom";
import {
  Icon,
  MainTable,
  Spinner,
  TablePagination,
} from "@canonical/react-components";
import { useCurrentProject } from "context/useCurrentProject";
import { useWarnings } from "context/useWarnings";
import { ITEMS_PER_PAGE } from "pages/overview/overviewConstants";
import WarningExplanationTooltip from "pages/warnings/WarningExplanationTooltip";
import { useServerEntitlements } from "util/entitlements/server";
import { ROOT_PATH } from "util/rootPath";
import { getWarningHeaders, getWarningRows } from "util/warnings";
import CardEmptyState from "./CardEmptyState";
import { renderOverviewCard } from "util/overview";

const WarningsCard: FC = () => {
  const { canViewWarnings } = useServerEntitlements();
  const {
    data: warnings = [],
    error,
    isLoading,
  } = useWarnings(canViewWarnings());
  const { project, isAllProjects } = useCurrentProject();
  const newWarnings = warnings.filter(
    (warning) =>
      warning.status === "new" &&
      (!warning.project || isAllProjects || warning.project === project?.name),
  );
  const footerLink = (
    <Link to={`${ROOT_PATH}/ui/warnings?status=new`}>Warnings list</Link>
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
    return renderOverviewCard(
      cardClassName,
      cardTitle,
      <Spinner className="u-loader" text="Loading warnings..." />,
      footerLink,
    );
  }

  if (error && canViewWarnings()) {
    return renderOverviewCard(
      cardClassName,
      cardTitle,
      <div className="error-message">
        <Icon name="error" className="margin-right--large" /> Error while
        loading warnings: {error.message}
      </div>,
      footerLink,
    );
  }

  if (newWarnings.length === 0 || !canViewWarnings()) {
    return renderOverviewCard(
      cardClassName,
      cardTitle,
      <CardEmptyState title="No warnings found" />,
      footerLink,
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
      responsive
    />
  );

  return renderOverviewCard(
    cardClassName,
    cardTitle,
    newWarnings.length > ITEMS_PER_PAGE ? (
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
    ),
    footerLink,
  );
};

export default WarningsCard;
