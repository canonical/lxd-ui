import React, { FC, OptionHTMLAttributes, useState } from "react";
import {
  Button,
  Col,
  MainTable,
  Modal,
  Row,
  SearchBox,
  Select,
} from "@canonical/react-components";
import { RemoteImage, RemoteImageList } from "types/image";
import { handleResponse } from "util/helpers";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { isContainerOnlyImage, isVmOnlyImage } from "util/images";
import Loader from "components/Loader";
import { getArchitectureAliases } from "util/architectures";
import { instanceCreationTypes } from "util/instanceOptions";
import { useSettings } from "context/useSettings";
import ScrollableTable from "components/ScrollableTable";

interface Props {
  onClose: () => void;
  onSelect: (image: RemoteImage, type: string | null) => void;
}

const canonicalJson = "/ui/assets/data/canonical-images.json";
const canonicalServer = "https://cloud-images.ubuntu.com/releases";
const linuxContainersJson = "/ui/assets/data/linuxcontainers-images.json";
const linuxContainersServer = "https://images.linuxcontainers.org";

const ANY = "any";
const CONTAINER = "container";
const VM = "virtual-machine";

const ImageSelector: FC<Props> = ({ onClose, onSelect }) => {
  const [query, setQuery] = useState<string>("");
  const [os, setOs] = useState<string>("");
  const [release, setRelease] = useState<string>("");
  const [arch, setArch] = useState<string>("amd64");
  const [type, setType] = useState<string>(ANY);
  const [variant, setVariant] = useState<string>(ANY);

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

  const { data: linuxContainerImages = [], isLoading: isLciLoading } = useQuery(
    {
      queryKey: [queryKeys.images, linuxContainersServer],
      queryFn: () => loadImages(linuxContainersJson, linuxContainersServer),
    }
  );

  const { data: canonicalImages = [], isLoading: isCiLoading } = useQuery({
    queryKey: [queryKeys.images, canonicalServer],
    queryFn: () => loadImages(canonicalJson, canonicalServer),
  });
  const isLoading = isCiLoading || isLciLoading || isSettingsLoading;
  const archSupported = getArchitectureAliases(
    settings?.environment?.architectures ?? []
  );
  const images = isLoading
    ? []
    : canonicalImages
        .reverse()
        .concat(linuxContainerImages)
        .filter((image) => archSupported.includes(image.arch))
        .sort((a, b) => {
          if (a.aliases.includes("lts")) {
            return -1;
          }
          if (b.aliases.includes("lts")) {
            return 1;
          }
          return 0;
        });

  const archAll = [...new Set(images.map((item) => item.arch))].sort();
  const variantAll = [...new Set(images.map((item) => item.variant))].sort();

  const getOptionList: (
    mapper: (item: RemoteImage) => string,
    filter?: (item: RemoteImage) => boolean
  ) => OptionHTMLAttributes<HTMLOptionElement>[] = (
    mapper,
    filter = () => true
  ) => {
    const options = [...new Set(images.filter(filter).map(mapper))].map(
      (item: string) => {
        return {
          label: item,
          value: item,
        };
      }
    );
    options.unshift({
      label: "Any",
      value: "",
    });
    return options;
  };

  const rows: MainTableRow[] = images
    .filter((item) => {
      if (type === VM && isContainerOnlyImage(item)) {
        return false;
      }
      if (type === CONTAINER && isVmOnlyImage(item)) {
        return false;
      }
      if (arch !== item.arch) {
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
        if (isVmOnlyImage(item)) {
          return VM;
        }
        if (isContainerOnlyImage(item)) {
          return CONTAINER;
        }
        return "all";
      };
      const itemType = figureType();

      const selectImage = () => onSelect(item, type === ANY ? null : type);

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

      return {
        className: "u-row",
        columns: [
          {
            content: item.os,
            role: "rowheader",
            "aria-label": "Distribution",
            onClick: selectImage,
          },
          {
            content: displayRelease,
            role: "rowheader",
            "aria-label": "Release",
            onClick: selectImage,
          },
          {
            content: displayVariant,
            role: "rowheader",
            "aria-label": "Variant",
            onClick: selectImage,
          },
          {
            content: itemType,
            role: "rowheader",
            "aria-label": "Type",
            onClick: selectImage,
          },
          {
            className: "u-hide--small u-hide--medium",
            content: item.aliases.split(",").pop(),
            role: "rowheader",
            "aria-label": "Alias",
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
            role: "rowheader",
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
                (item) => item.os === os
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
                  })
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
                setType(v.target.value);
              }}
              options={[
                {
                  label: "Any",
                  value: ANY,
                },
                ...instanceCreationTypes,
              ]}
              value={type}
            />
          </div>
        </Col>
        <Col size={9}>
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
          <div className="image-list">
            <ScrollableTable dependencies={[images]}>
              <MainTable
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
