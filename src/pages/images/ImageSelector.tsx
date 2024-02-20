import { FC, OptionHTMLAttributes, useState } from "react";
import {
  Button,
  Col,
  MainTable,
  Modal,
  Row,
  SearchBox,
  Select,
} from "@canonical/react-components";
import { LxdImageType, RemoteImage, RemoteImageList } from "types/image";
import { handleResponse } from "util/helpers";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import {
  byLtsFirst,
  localLxdToRemoteImage,
  isContainerOnlyImage,
  isVmOnlyImage,
  LOCAL_ISO,
} from "util/images";
import Loader from "components/Loader";
import { getArchitectureAliases } from "util/architectures";
import { instanceCreationTypes } from "util/instanceOptions";
import { useSettings } from "context/useSettings";
import ScrollableTable from "components/ScrollableTable";
import { fetchImageList } from "api/images";
import { useParams } from "react-router-dom";

interface Props {
  onSelect: (image: RemoteImage, type: LxdImageType | null) => void;
  onClose: () => void;
}

const canonicalJson =
  "https://cloud-images.ubuntu.com/releases/streams/v1/com.ubuntu.cloud:released:download.json";
const canonicalServer = "https://cloud-images.ubuntu.com/releases";

const minimalJson =
  "https://cloud-images.ubuntu.com/minimal/releases/streams/v1/com.ubuntu.cloud:released:download.json";
const minimalServer = "https://cloud-images.ubuntu.com/minimal/releases/";

const ANY = "any";
const CONTAINER = "container";
const VM = "virtual-machine";

const ImageSelector: FC<Props> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState<string>("");
  const [os, setOs] = useState<string>("");
  const [release, setRelease] = useState<string>("");
  const [arch, setArch] = useState<string>("amd64");
  const [type, setType] = useState<LxdImageType | null>(null);
  const [variant, setVariant] = useState<string>(ANY);
  const { project } = useParams<{ project: string }>();

  const loadImages = (file: string, server: string): Promise<RemoteImage[]> => {
    return new Promise((resolve, reject) => {
      void fetch(file)
        .then(handleResponse)
        .then((data: RemoteImageList) => {
          const images = Object.entries(data.products).map((product) => {
            const { os, ...image } = product[1];
            const formattedOs = os.charAt(0).toUpperCase() + os.slice(1);
            return { ...image, os: formattedOs, server: server };
          });
          resolve(images);
        })
        .catch(reject);
    });
  };

  const { data: settings, isLoading: isSettingsLoading } = useSettings();

  const { data: canonicalImages = [], isLoading: isCiLoading } = useQuery({
    queryKey: [queryKeys.images, canonicalServer],
    queryFn: () => loadImages(canonicalJson, canonicalServer),
  });

  const { data: minimalImages = [], isLoading: isMinimalLoading } = useQuery({
    queryKey: [queryKeys.images, minimalServer],
    queryFn: () => loadImages(minimalJson, minimalServer),
  });

  const { data: localImages = [], isLoading: isLocalImageLoading } = useQuery({
    queryKey: [queryKeys.images, project],
    queryFn: () => fetchImageList(project ?? ""),
  });

  const isLoading =
    isCiLoading || isMinimalLoading || isLocalImageLoading || isSettingsLoading;
  const archSupported = getArchitectureAliases(
    settings?.environment?.architectures ?? [],
  );
  const images = isLoading
    ? []
    : localImages
        .filter((image) => !image.cached)
        .map(localLxdToRemoteImage)
        .concat([...minimalImages].reverse().sort(byLtsFirst))
        .concat([...canonicalImages].reverse().sort(byLtsFirst))
        .filter((image) => archSupported.includes(image.arch));

  const archAll = [...new Set(images.map((item) => item.arch))]
    .filter((arch) => arch !== "")
    .sort();
  const variantAll = [...new Set(images.map((item) => item.variant))].sort();

  if (!isLoading && !archAll.includes(arch)) {
    setArch(archAll[0]);
  }

  const getOptionList: (
    mapper: (item: RemoteImage) => string,
    filter?: (item: RemoteImage) => boolean,
  ) => OptionHTMLAttributes<HTMLOptionElement>[] = (
    mapper,
    filter = () => true,
  ) => {
    const options = [...new Set(images.filter(filter).map(mapper))].map(
      (item: string) => {
        return {
          label: item,
          value: item,
        };
      },
    );
    options.unshift({
      label: "Any",
      value: "",
    });
    return options;
  };

  const rows: MainTableRow[] = images
    .filter((item) => {
      const isLocalIso = item.server === LOCAL_ISO;
      if (type === VM && isContainerOnlyImage(item)) {
        return false;
      }
      if (type === CONTAINER && isVmOnlyImage(item)) {
        return false;
      }
      if (arch !== item.arch && !isLocalIso) {
        return false;
      }
      if (variant !== ANY && variant !== item.variant) {
        return false;
      }
      if (os && item.os !== os) {
        return false;
      }
      if (release && item.release !== release) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        item.aliases.includes(query) ||
        item.arch.includes(query) ||
        item.os.includes(query) ||
        item.release.includes(query)
      );
    })
    .map((item) => {
      const figureType = () => {
        if (item.type) {
          return item.type;
        }
        if (isVmOnlyImage(item)) {
          return VM;
        }
        if (isContainerOnlyImage(item)) {
          return CONTAINER;
        }
        return "all";
      };
      const itemType = figureType();

      const selectImage = () => onSelect(item, item.type ?? type);

      const displayRelease =
        item.os === "Ubuntu" &&
        item.release_title &&
        !item.release.includes(item.release_title)
          ? item.release_title
          : item.release;

      const displayVariant =
        item.os === "Ubuntu" &&
        item.release_title &&
        !item.variant &&
        !item.release.includes(item.release_title)
          ? item.release
          : item.variant;

      const getSource = () => {
        if (item.created_at) {
          return "Local";
        }
        if (item.server === canonicalServer) {
          return "Ubuntu";
        }
        if (item.server === minimalServer) {
          return "Ubuntu Minimal";
        }
        return "Custom";
      };

      return {
        className: "u-row",
        columns: [
          {
            content: item.os,
            role: "cell",
            "aria-label": "Distribution",
            onClick: selectImage,
          },
          {
            content: displayRelease,
            role: "cell",
            "aria-label": "Release",
            onClick: selectImage,
          },
          {
            content: displayVariant,
            role: "cell",
            "aria-label": "Variant",
            onClick: selectImage,
          },
          {
            content: itemType,
            role: "cell",
            "aria-label": "Type",
            onClick: selectImage,
          },
          {
            className: "u-hide--small u-hide--medium",
            content: item.aliases.split(",").pop(),
            role: "cell",
            "aria-label": "Alias",
            onClick: selectImage,
          },
          {
            content: getSource(),
            role: "cell",
            "aria-label": "Source",
            onClick: selectImage,
          },
          {
            content: (
              <Button
                onClick={selectImage}
                type="button"
                dense
                className="u-no-margin--bottom"
              >
                Select
              </Button>
            ),
            role: "cell",
            "aria-label": "Action",
            onClick: selectImage,
          },
        ],
        sortData: {
          os: item.os.toLowerCase(),
          release: displayRelease.toLowerCase(),
          variant: displayVariant?.toLowerCase(),
          type: itemType,
          alias: item.aliases,
        },
      };
    });

  const headers = [
    { content: "Distribution", sortKey: "os" },
    { content: "Release", sortKey: "release" },
    { content: "Variant", sortKey: "variant" },
    { content: "Type", sortKey: "type" },
    {
      content: "Alias",
      sortKey: "alias",
      className: "u-hide--small u-hide--medium",
    },
    {
      content: "Source",
    },
    {
      content: "",
      "aria-label": "Actions",
    },
  ];

  return (
    <Modal
      close={onClose}
      title="Select base image"
      className="image-select-modal"
    >
      <Row className="u-no-padding--left u-no-padding--right">
        <Col size={3}>
          <div className="image-select-filters">
            <Select
              id="imageFilterDistribution"
              label="Distribution"
              name="distribution"
              onChange={(v) => {
                setOs(v.target.value);
                setRelease("");
              }}
              options={getOptionList((item: RemoteImage) => item.os)}
              value={os}
            />
            <Select
              id="imageFilterRelease"
              label="Release"
              name="release"
              onChange={(v) => {
                setRelease(v.target.value);
              }}
              options={getOptionList(
                (item) => item.release,
                (item) => item.os === os,
              )}
              value={release}
              disabled={os === ""}
            />
            <Select
              id="imageFilterVariant"
              label="Variant"
              name="variant"
              onChange={(v) => {
                setVariant(v.target.value);
              }}
              options={[
                {
                  label: "Any",
                  value: ANY,
                },
              ].concat(
                variantAll
                  .filter((item) => Boolean(item))
                  .map((item) => {
                    return {
                      label: item ?? "",
                      value: item ?? "",
                    };
                  }),
              )}
              value={variant}
            />
            <Select
              id="imageFilterArchitecture"
              label="Architecture"
              name="architecture"
              onChange={(v) => {
                setArch(v.target.value);
              }}
              options={archAll.map((item) => {
                return {
                  label: item,
                  value: item,
                };
              })}
              value={arch}
            />
            <Select
              id="imageFilterType"
              label="Type"
              name="type"
              onChange={(v) => {
                setType(
                  v.target.value === ANY
                    ? "container"
                    : (v.target.value as LxdImageType),
                );
              }}
              options={[
                {
                  label: "Any",
                  value: ANY,
                },
                ...instanceCreationTypes,
              ]}
              value={type ?? ""}
            />
          </div>
        </Col>
        <Col size={9}>
          <div className="image-select-header">
            <div>
              <SearchBox
                autoFocus
                className="search-image"
                name="search-image"
                type="text"
                onChange={(value) => {
                  setQuery(value);
                  setOs("");
                  setRelease("");
                }}
                placeholder="Search an image"
                value={query}
              />
            </div>
          </div>
          <div className="image-list">
            <ScrollableTable
              dependencies={[images]}
              tableId="image-selector-table"
            >
              <MainTable
                id="image-selector-table"
                className="table-image-select"
                emptyStateMsg={
                  isLoading ? (
                    <Loader text="Loading images..." />
                  ) : (
                    "No matching images found"
                  )
                }
                headers={headers}
                rows={rows}
                paginate={null}
                sortable
              />
            </ScrollableTable>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default ImageSelector;
