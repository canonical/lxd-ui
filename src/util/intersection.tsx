// returns array of items present in all lists
export const intersection = (lists: string[][]): string[] => {
  const result: string[] = [];

  lists[0].forEach((candidate) => {
    const isInAllLists = lists.every((list) => list.includes(candidate));
    if (isInAllLists) {
      result.push(candidate);
    }
  });

  return result;
};
