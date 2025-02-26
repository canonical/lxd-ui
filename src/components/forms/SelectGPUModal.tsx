import type { FC } from "react";
import {
  Button,
  MainTable,
  Modal,
  Notification,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchResources } from "api/server";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import type { GpuCard } from "types/resources";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  onSelect: (image: GpuCard) => void;
  onClose: () => void;
}

const SelectGPUModal: FC<Props> = ({ onSelect, onClose }) => {
  const { canViewResources } = useServerEntitlements();

  const { data: resources, isLoading } = useQuery({
    queryKey: [queryKeys.resources],
    queryFn: () => fetchResources(),
    enabled: canViewResources(),
  });

  const headers = [
    { content: "Vendor" },
    { content: "Driver" },
    { content: "PCI address" },
    { content: "ID" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = isLoading
    ? []
    : resources?.gpu?.cards?.map((card) => {
        const selectCard = () => onSelect(card);

        return {
          key: card.pci_address,
          className: "u-row",
          columns: [
            {
              content: card.vendor,
              role: "cell",
              "aria-label": "Vendor",
              onClick: selectCard,
            },
            {
              content: (
                <>
                  {card.driver}{" "}
                  <span className="u-text--muted">{card.driver_version}</span>
                </>
              ),
              role: "cell",
              "aria-label": "Driver",
              onClick: selectCard,
            },
            {
              content: card.pci_address,
              role: "cell",
              "aria-label": "PCI Address",
              onClick: selectCard,
            },
            {
              content: card.drm?.id ?? "-",
              role: "cell",
              "aria-label": "ID",
              onClick: selectCard,
            },
            {
              content: (
                <Button
                  onClick={selectCard}
                  dense
                  aria-label={`Select ${card.pci_address}`}
                >
                  Select
                </Button>
              ),
              role: "cell",
              "aria-label": "Actions",
              className: "u-align--right",
              onClick: selectCard,
            },
          ],
        };
      });

  const getContent = () => {
    if (!canViewResources()) {
      return (
        <Notification severity="caution" title="Restricted permissions">
          You do not have permission to view available GPUs on the server.
        </Notification>
      );
    }

    return (
      <ScrollableTable
        dependencies={[resources, rows]}
        belowIds={["modal-footer"]}
        tableId="gpu-select-table"
      >
        <MainTable
          id="gpu-select-table"
          headers={headers}
          rows={rows}
          sortable
          className="u-selectable-table-rows u-table-layout--auto"
          emptyStateMsg={
            isLoading ? <Loader text="Loading GPUs..." /> : "No GPUs found"
          }
        />
      </ScrollableTable>
    );
  };

  return (
    <Modal close={onClose} title="Select GPU">
      {getContent()}
      <footer className="p-modal__footer" id="modal-footer">
        <Button
          className="u-no-margin--bottom"
          onClick={() => onSelect({ pci_address: "" })}
        >
          Enter details manually
        </Button>
      </footer>
    </Modal>
  );
};
export default SelectGPUModal;
