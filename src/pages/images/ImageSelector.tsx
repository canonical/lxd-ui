import { useState, type FC, type OptionHTMLAttributes } from "react";
import {
  Button,
  CheckboxInput,
  Col,
  Icon,
  MainTable,
  Modal,
  Notification,
  Row,
  ScrollableTable,
  SearchBox,
  Select,
  Spinner,
} from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import type { LxdImageType, RemoteImage } from "types/image";
import { capitalizeFirstLetter } from "util/helpers";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import {
  byOSRelease,
  localLxdToRemoteImage,
  isContainerOnlyImage,
  isVmOnlyImage,
  LOCAL_ISO,
  LOCAL_IMAGE,
} from "util/images";
import { getArchitectureAliases } from "util/architectures";
import { instanceCreationTypes } from "util/instanceOptions";
import { useSettings } from "context/useSettings";
import { useParams } from "react-router-dom";
import { useRemoteImages, useLocalImagesInProject } from "context/useImages";
import {
  canonicalServer,
  imagesLxdServer,
  minimalServer,
} from "util/imageLegacy";

interface Props {
  onSelect: (image: RemoteImage, type?: LxdImageType) => void;
  onClose: () => void;
}

const ANY = "any";
const CONTAINER = "container";
const VM = "virtual-machine";

const ImageSelector: FC<Props> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState<string>("");
  const [os, setOs] = useState<string>("");
  const [release, setRelease] = useState<string>("");
  const [arch, setArch] = useState<string>("amd64");
  const [type, setType] = useState<LxdImageType | undefined>(undefined);
  const [variant, setVariant] = useState<string>(ANY);
  const [hideRemote, setHideRemote] = useState(false);
  const [error, setError] = useState("");
  const [hideError, setHideError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { project } = useParams<{ project: string }>();

  const isCardView = useIsScreenBelow(1090);

  const { data: settings, isLoading: isSettingsLoading } = useSettings();
  const { data: remoteImages, isLoading: isRemoteImagesLoading } =
    useRemoteImages();
  const { data: localImages = [], isLoading: isLocalImageLoading } =
    useLocalImagesInProject(project ?? "default");

  if (remoteImages?.error && remoteImages?.error !== error) {
    setError(remoteImages?.error ?? "");
    setHideError(false);
  }

  const isWaitingForRemoteImages = !hideRemote && isRemoteImagesLoading;
  const isLoading =
    isWaitingForRemoteImages || isLocalImageLoading || isSettingsLoading;

  const archSupported = getArchitectureAliases(
    settings?.environment?.architectures ?? [],
  );
  const images = isLoading
    ? []
    : localImages
        .map(localLxdToRemoteImage)
        .sort(byOSRelease)
        .concat(remoteImages?.images ?? [])
        .filter((image) => archSupported.includes(image.arch));

  const archAll = [...new Set(images.map((item) => item.arch))]
    .filter((arch) => arch !== "")
    .sort();
  const variantAll = [...new Set(images.map((item) => item.variant))].sort();

  if (!isLoading && !archAll.includes(arch) && archAll.length > 0) {
    setArch(archAll[0]);
  }

  const getOptionList: (
    mapper: (item: RemoteImage) => string,
    filter?: (item: RemoteImage) => boolean,
  ) => OptionHTMLAttributes<HTMLOptionElement>[] = (
    mapper,
    filter = () => true,
  ) => {
    const options = [...new Set(images.filter(filter).map(mapper))]
      .sort()
      .map((item: string) => {
        return {
          label: item,
          value: item,
        };
      });
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
        item.aliases.toLowerCase().includes(query) ||
        item.arch.toLowerCase().includes(query) ||
        item.os.toLowerCase().includes(query) ||
        item.release.toLowerCase().includes(query)
      );
    })
    .filter((item) => {
      if (!hideRemote) {
        return true;
      }
      return item.server === LOCAL_IMAGE || item.cached;
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

      const selectImage = () => {
        onSelect(item, item.type ?? type);
      };

      const onCellClick = isCardView ? undefined : selectImage;

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
        let source = "Custom";
        if (!item.cached && item.created_at) {
          source = "Local";
        }
        if (item.registryName) {
          source = item.registryBuiltIn
            ? item.registryName.split("-").map(capitalizeFirstLetter).join(" ")
            : item.registryName;
        }
        const isKnownRegistry = [
          "images",
          "ubuntu",
          "ubuntu-minimal",
          "",
        ].includes(item.registryName ?? "");
        if (item.server === canonicalServer && isKnownRegistry) {
          source = "Ubuntu";
        }
        if (item.server === minimalServer && isKnownRegistry) {
          source = "Ubuntu Minimal";
        }
        if (item.server === imagesLxdServer && isKnownRegistry) {
          source = "LXD Images";
        }
        return source;
      };

      return {
        key:
          itemType +
          item.os +
          displayRelease +
          displayVariant +
          item.server +
          item.fingerprint +
          item.registryName,
        className: "u-row",
        columns: [
          {
            content: item.os,
            role: "rowheader",
            "aria-label": "Distribution",
            onClick: onCellClick,
          },
          {
            content: displayRelease,
            role: "cell",
            "aria-label": "Release",
            onClick: onCellClick,
          },
          {
            content: displayVariant,
            role: "cell",
            "aria-label": "Variant",
            onClick: onCellClick,
          },
          {
            content: itemType,
            role: "cell",
            "aria-label": "Type",
            onClick: onCellClick,
          },
          {
            content: item.aliases.split(",").pop(),
            title: item.aliases.split(",").pop(),
            role: "cell",
            "aria-label": "Alias",
            onClick: onCellClick,
          },
          {
            content: getSource(),
            role: "cell",
            "aria-label": "Source",
            onClick: onCellClick,
          },
          {
            content: item.cached ? "Cached" : "Remote",
            role: "cell",
            "aria-label": "Cached",
            onClick: onCellClick,
          },
          {
            content: (
              <Button
                onClick={selectImage}
                type="button"
                dense={!isCardView}
                className="u-no-margin--bottom"
                appearance={
                  item.cached || item.server === LOCAL_IMAGE
                    ? "positive"
                    : "default"
                }
              >
                Select
              </Button>
            ),
            role: "cell",
            "aria-label": "Action",
            onClick: onCellClick,
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
    },
    {
      content: "Source",
    },
    {
      content: "Cached",
    },
    {
      content: "",
      "aria-label": "Actions",
    },
  ];

  const filters = (
    <div className="image-select-filters">
      <Select
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
        label="Type"
        name="type"
        onChange={(v) => {
          setType(
            v.target.value === ANY
              ? undefined
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
      <CheckboxInput
        checked={hideRemote}
        label="Show only cached images"
        onChange={() => {
          setHideRemote((prev) => !prev);
        }}
      />
    </div>
  );

  return (
    <Modal
      close={onClose}
      title="Select base image"
      className="image-select-modal"
    >
      <Row className="u-no-padding--left u-no-padding--right">
        <Col size={3} className="u-hide--small u-hide--medium">
          {filters}
        </Col>
        <Col size={9} small={12} medium={12}>
          <div className="image-select-header">
            {error && !hideError ? (
              <Notification
                severity="negative"
                title="Failed loading images"
                onDismiss={() => {
                  setHideError(true);
                }}
              >
                {error}
              </Notification>
            ) : (
              <div>
                <SearchBox
                  autoFocus
                  className="search-image"
                  name="search-image"
                  type="text"
                  onChange={(value) => {
                    setQuery(value.toLowerCase());
                    setOs("");
                    setRelease("");
                  }}
                  placeholder="Search an image"
                />
              </div>
            )}
            <Button
              type="button"
              hasIcon
              className="image-filter-toggle u-no-margin--bottom u-hide--large"
              aria-expanded={showFilters}
              aria-label={showFilters ? "Hide filters" : "Show filters"}
              onClick={() => {
                setShowFilters((prev) => !prev);
              }}
            >
              <Icon name="filter" />
            </Button>
          </div>
          {isCardView && showFilters && filters}
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
                    <Spinner className="u-loader" text="Loading images..." />
                  ) : (
                    "No matching images found"
                  )
                }
                headers={headers}
                rows={rows}
                paginate={null}
                responsive
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
