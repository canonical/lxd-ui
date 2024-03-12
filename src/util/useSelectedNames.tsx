import { useEffect, useState } from "react";

interface Props<T, F extends keyof T> {
  data: T[];
  nameField: F;
  initialSelectedNames?: T[F][];
}

function useSelectedNames<T, F extends keyof T>(props: Props<T, F>) {
  const { data, nameField, initialSelectedNames } = props;
  const [selectedNames, setSelectedNames] = useState<T[F][]>(
    initialSelectedNames || [],
  );

  useEffect(() => {
    const validNames = new Set(data?.map((datum) => datum[nameField]));
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [data]);

  return {
    selectedNames,
    setSelectedNames,
  };
}

export default useSelectedNames;
