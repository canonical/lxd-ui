// returns array of items present in all lists
export const intersection = (lists: string[][]): string[] => {
  const result = [];

  for (let i = 0; i < lists.length; i++) {
    const currentList = lists[i];
    for (let y = 0; y < currentList.length; y++) {
      const currentValue = currentList[y];
      if (result.indexOf(currentValue) === -1) {
        if (
          lists.filter(function (obj) {
            return obj.indexOf(currentValue) == -1;
          }).length == 0
        ) {
          result.push(currentValue);
        }
      }
    }
  }
  return result;
};
