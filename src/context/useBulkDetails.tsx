import type { BulkOperationResult } from "util/promises";
import {
  MainTable,
  Modal,
  type NotificationAction,
} from "@canonical/react-components";
import { useModal } from "context/useModal";
import ResourceLink from "components/ResourceLink";
import DsIcon from "components/DsIcon";

export function useBulkDetails() {
  const { showModal, hideModal } = useModal();

  return (results: BulkOperationResult[]): NotificationAction[] => {
    const modal = (
      <Modal close={hideModal} title="Bulk operation details">
        <MainTable
          style={{ width: "auto" }}
          headers={[
            {
              content: "Item",
            },
            {
              content: "Details",
            },
          ]}
          rows={results.map((result) => {
            const isSuccess = result.status === "fulfilled";

            return {
              columns: [
                {
                  content: (
                    <ResourceLink
                      value={result.item.name}
                      type={result.item.type}
                      to={result.item.href}
                    />
                  ),
                },
                {
                  content: (
                    <>
                      <DsIcon
                        icon={isSuccess ? "success-fill" : "error-fill"}
                      />{" "}
                      {isSuccess ? "Success" : "Error: " + result.reason}
                    </>
                  ),
                },
              ],
            };
          })}
        />
      </Modal>
    );

    return [
      {
        label: "View details",
        onClick: () => {
          showModal(modal);
        },
      },
    ];
  };
}
