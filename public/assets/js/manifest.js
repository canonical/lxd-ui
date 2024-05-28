var screenshot = window.location.origin + "/ui/assets/img/";

const manifestElement = document.getElementById("manifest");
const dynamicManifest = JSON.stringify({
  short_name: "LXD " + window.location.origin,
  name: "LXD-UI - " + window.location.origin,
  icons: [
    {
      src: window.location.origin + "/ui/assets/img/canonical-lxd-512.png",
      type: "image/png",
      sizes: "512x512",
    },
  ],
  id: "LXDID-"  + window.location.origin,
  start_url: window.location.origin,
  background_color: "#E95420",
  display: "standalone",
  scope: window.location.origin,
  theme_color: "#262626",
  shortcuts: [],
  description:
    "LXD provides a unified user experience for managing system containers and virtual machines.",
  screenshots: [
    {
      src: screenshot + "LXD-screenshot.png",
      type: "image/png",
      sizes: "954x953",
      form_factor: "wide",
    },
    {
      src: screenshot + "LXD-screenshot2.png",
      type: "image/png",
      sizes: "954x953",
      form_factor: "wide",
    },
    {
      src: screenshot + "LXD-screenshot3.png",
      type: "image/png",
      sizes: "1920x1075",
    },
  ],
});

manifestElement?.setAttribute(
  "href",
  "data:application/json;charset=utf-8," + encodeURIComponent(dynamicManifest),
);
