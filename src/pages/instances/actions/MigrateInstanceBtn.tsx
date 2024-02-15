import { FC } from "react";
import { Button } from "@canonical/react-components";
import MigrateInstanceForm from "pages/instances/MigrateInstanceForm";
import usePortal from "react-useportal";
import { migrateInstance } from "api/instances";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchClusterMembers } from "api/cluster";
import Loader from "components/Loader";
import { useEventQueue } from "context/eventQueue";
import ItemName from "components/ItemName";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  instance: string;
  location: string;
  project: string;
  onFinish: (newLocation: string) => void;
}

const MigrateInstanceBtn: FC<Props> = ({
  instance,
  location,
  project,
  onFinish,
}) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: fetchClusterMembers,
  });

  if (isLoading) {
    return <Loader />;
  }

  const handleSuccess = (newTarget: string) => {
    toastNotify.success(
      <>
        Migration finished for instance{" "}
        <ItemName item={{ name: instance }} bold />
      </>,
    );
    onFinish(newTarget);
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.instances, instance],
    });
  };

  const notifyFailure = (e: unknown) => {
    toastNotify.failure(`Migration failed on instance ${instance}`, e);
  };

  const handleFailure = (msg: string) => {
    notifyFailure(new Error(msg));
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.instances, instance],
    });
  };

  const handleMigrate = (target: string) => {
    migrateInstance(instance, project, target)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => handleSuccess(target),
          handleFailure,
        );
        toastNotify.info(`Migration started for instance ${instance}`);
        closePortal();
      })
      .catch((e) => {
        notifyFailure(e);
        closePortal();
      });
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <MigrateInstanceForm
            close={closePortal}
            migrate={handleMigrate}
            instance={instance}
            location={location}
            members={members}
          />
        </Portal>
      )}
      <Button className="instance-migrate" onClick={openPortal} type="button">
        Migrate
      </Button>
    </>
  );
};

export default MigrateInstanceBtn;
