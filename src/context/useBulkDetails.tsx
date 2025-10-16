import type { BulkOperationResult } from "util/promises";
import type { NotificationAction } from "@canonical/react-components";
import { Icon, MainTable, Modal } from "@canonical/react-components";
import { useModal } from "context/useModal";
import ResourceLink from "components/ResourceLink";

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
                      <Icon name={isSuccess ? "success" : "error"} />{" "}
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
