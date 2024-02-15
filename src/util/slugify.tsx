export const slugify = (name: string): string => {
  return name.replace(" ", "-").toLowerCase();
};
