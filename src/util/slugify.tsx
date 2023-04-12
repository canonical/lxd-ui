export const slugify = (name: string) => {
  return name.replace(" ", "-").toLowerCase();
};
