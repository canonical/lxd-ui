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
import { fetchSettings } from "api/server";
import { getArchitectureAliases } from "util/architectures";

interface Props {
  onClose: () => void;
  onSelect: (image: RemoteImage, type: string | null) => void;
}

const canonicalJson = "/ui/static/assets/data/canonical-images.json";
const canonicalServer = "https://cloud-images.ubuntu.com/releases";
const linuxContainersJson =
  "/ui/static/assets/data/linuxcontainers-images.json";
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

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: [queryKeys.settings],
    queryFn: fetchSettings,
  });

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
      if (!arch.includes(item.arch)) {
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
      return {
        columns: [
          {
            content: item.os,
            role: "rowheader",
            "aria-label": "Distribution",
          },
          {
            content: item.release,
            role: "rowheader",
            "aria-label": "Release",
          },
          {
            content: item.variant,
            role: "rowheader",
            "aria-label": "Variant",
          },
          {
            content: item.aliases.replaceAll(",", " "),
            role: "rowheader",
            "aria-label": "Alias",
          },
          {
            content: (
              <Button
                appearance="positive"
                onClick={() => onSelect(item, type === ANY ? null : type)}
                type="button"
              >
                Select
              </Button>
            ),
            role: "rowheader",
            "aria-label": "Action",
          },
        ],
        sortData: {
          os: item.os,
          release: item.release,
          variant: item.variant,
          alias: item.aliases,
        },
      };
    });

  const headers = [
    { content: "Distribution", sortKey: "os" },
    { content: "Release", sortKey: "release" },
    { content: "Variant", sortKey: "variant" },
    { content: "Alias", sortKey: "alias" },
    { content: "" },
  ];

  return (
    <Modal
      close={onClose}
      title="Select base image"
      className="image-select-modal"
    >
      <Row className="u-no-padding--left u-no-padding--right">
        <Col size={3}>
          <div style={{ height: "100%" }}>
            <Select
              label="Distribution"
              name="distribution"
              onChange={(v) => {
                setOs(v.target.value);
                setRelease("");
              }}
              options={getOptionList((item: RemoteImage) => item.os)}
              value={os}
              stacked
            />
            <Select
              disabled={os === ""}
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
              stacked
            />
            <Select
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
                {
                  label: "container",
                  value: CONTAINER,
                },
                {
                  label: "virtual-machine",
                  value: VM,
                },
              ]}
              value={type}
              stacked
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
              stacked
            />
          </div>
        </Col>
        <Col size={9}>
          <SearchBox
            autoFocus
            className="search-image"
            id="search-image-catalog"
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
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default ImageSelector;
