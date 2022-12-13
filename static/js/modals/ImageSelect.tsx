import React, { FC, OptionHTMLAttributes, useState } from "react";
import {
  Button,
  Card,
  CheckboxInput,
  Col,
  Label,
  MainTable,
  Modal,
  RadioInput,
  Row,
  SearchBox,
  Select,
} from "@canonical/react-components";
import { RemoteImage, RemoteImageList } from "../types/image";
import { handleResponse } from "../util/helpers";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../util/queryKeys";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { isContainerOnlyImage, isVmOnlyImage } from "../util/images";

interface Props {
  onClose: () => void;
  onSelect: (image: RemoteImage) => void;
}

const canonicalJson = "/static/assets/data/canonical-images.json";
const canonicalServer = "https://cloud-images.ubuntu.com/releases";
const linuxContainersJson = "/static/assets/data/linuxcontainers-images.json";
const linuxContainersServer = "https://images.linuxcontainers.org";

const ANY = "any";
const CONTAINER = "container";
const VM = "vm";

const ImageSelect: FC<Props> = ({ onClose, onSelect }) => {
  const [query, setQuery] = useState<string>("");
  const [os, setOs] = useState<string>("");
  const [release, setRelease] = useState<string>("");
  const [arch, setArch] = useState<string[]>(["amd64"]);
  const [archDisplayCount, setArchDisplayCount] = useState(2);
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

  const { data: linuxContainerImages = [] } = useQuery({
    queryKey: [queryKeys.images, linuxContainersServer],
    queryFn: () => loadImages(linuxContainersJson, linuxContainersServer),
  });

  const { data: canonicalImages = [] } = useQuery({
    queryKey: [queryKeys.images, canonicalServer],
    queryFn: () => loadImages(canonicalJson, canonicalServer),
  });

  const images = canonicalImages.concat(linuxContainerImages);
  images.sort((a, b) => {
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

  const toggleArch = (item: string) => {
    setArch((oldList) => {
      return oldList.includes(item)
        ? oldList.filter((i) => i !== item)
        : [...oldList, item];
    });
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
            content: item.arch,
            role: "rowheader",
            "aria-label": "Architecture",
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
                onClick={() => onSelect(item)}
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
          arch: item.arch,
          alias: item.aliases,
        },
      };
    });

  const headers = [
    { content: "Distribution", sortKey: "os" },
    { content: "Release", sortKey: "release" },
    { content: "Architecture", sortKey: "arch" },
    { content: "Alias", sortKey: "alias" },
    { content: "" },
  ];

  return (
    <Modal
      close={onClose}
      title="Image selection"
      className="p-image-select-modal"
    >
      <Row className="u-no-padding--left u-no-padding--right">
        <Col size={4}>
          <Card title="Filters" style={{ height: "100%" }}>
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
            <Label>Type</Label>
            <RadioInput
              label="Any"
              checked={type === ANY}
              onChange={() => setType(ANY)}
            />
            <RadioInput
              label="Container"
              checked={type === CONTAINER}
              onChange={() => setType(CONTAINER)}
            />
            <RadioInput
              label="Virtual-machine"
              checked={type === VM}
              onChange={() => setType(VM)}
            />
            <Label>Architecture</Label>
            {archDisplayCount < archAll.length ? (
              archAll
                .slice(0, archDisplayCount)
                .map((item) => (
                  <CheckboxInput
                    key={item}
                    label={item}
                    value={item}
                    checked={arch.includes(item)}
                    onChange={() => toggleArch(item)}
                  />
                ))
            ) : (
              <Row>
                <Col size={2}>
                  {archAll
                    .slice(0, Math.ceil(archDisplayCount / 2))
                    .map((item) => (
                      <CheckboxInput
                        key={item}
                        label={item}
                        value={item}
                        checked={arch.includes(item)}
                        onChange={() => toggleArch(item)}
                      />
                    ))}
                </Col>
                <Col size={2}>
                  {archAll
                    .slice(Math.ceil(archDisplayCount / 2), archDisplayCount)
                    .map((item) => (
                      <CheckboxInput
                        key={item}
                        label={item}
                        value={item}
                        checked={arch.includes(item)}
                        onChange={() => toggleArch(item)}
                      />
                    ))}
                </Col>
              </Row>
            )}
            {archDisplayCount < archAll.length ? (
              <Button
                appearance="link"
                className="u-no-margin--bottom"
                small
                onClick={() => setArchDisplayCount(archAll.length)}
              >
                see all
              </Button>
            ) : arch.length !== archAll.length ? (
              <Button
                appearance="link"
                className="u-no-margin--bottom"
                small
                onClick={() => setArch(archAll)}
              >
                select all
              </Button>
            ) : (
              <Button
                appearance="link"
                className="u-no-margin--bottom"
                small
                onClick={() => setArch([])}
              >
                unselect all
              </Button>
            )}
          </Card>
        </Col>
        <Col size={8}>
          <SearchBox
            autoFocus
            id="search-image-catalog"
            type="text"
            onChange={(value) => {
              setQuery(value);
              setOs("");
              setRelease("");
            }}
            placeholder="Search for distributions, releases or or aliases"
            value={query}
          />
          <div className="p-image-list">
            <MainTable
              className="p-table-image-select"
              emptyStateMsg="No matching images found"
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

export default ImageSelect;
