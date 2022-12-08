import React, { FC, OptionHTMLAttributes, useState } from "react";
import {
  Button,
  Card,
  CheckboxInput,
  Col,
  Label,
  MainTable,
  Modal,
  Row,
  SearchBox,
  Select,
} from "@canonical/react-components";
import { RemoteImage, RemoteImageList } from "../types/image";
import { handleResponse } from "../util/helpers";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../util/queryKeys";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  onClose: () => void;
  onSelect: (image: RemoteImage) => void;
}

const canonicalJson = "/static/assets/data/canonical-images.json";
const canonicalServer = "https://cloud-images.ubuntu.com/releases";
const linuxContainersJson = "/static/assets/data/linuxcontainers-images.json";
const linuxContainersServer = "https://images.linuxcontainers.org";

const ImageSelect: FC<Props> = ({ onClose, onSelect }) => {
  const [query, setQuery] = useState<string>("");
  const [distribution, setDistribution] = useState<string>("");
  const [release, setRelease] = useState<string>("");
  const [architectures, setArchitectures] = useState<string[]>(["amd64"]);

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
    queryKey: [queryKeys.images, "linuxcontainers.org"],
    queryFn: () => loadImages(linuxContainersJson, linuxContainersServer),
  });

  const { data: canonicalImages = [] } = useQuery({
    queryKey: [queryKeys.images, "cloud-images.ubuntu.com"],
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

  const allArchitectures = [...new Set(images.map((item) => item.arch))].sort();

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

  const toggleArchitecture = (item: string) => {
    setArchitectures((oldList) => {
      return oldList.includes(item)
        ? oldList.filter((i) => i !== item)
        : [...oldList, item];
    });
  };

  const rows: MainTableRow[] = images
    .filter((item) => {
      if (architectures.length > 0 && !architectures.includes(item.arch)) {
        return false;
      }
      if (distribution && item.os !== distribution) {
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
            "aria-label": "Architecture",
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
            "aria-label": "Actions",
          },
        ],
      };
    });

  const headers = [
    { content: "Distribution" },
    { content: "Release" },
    { content: "Architecture" },
    { content: "Alias" },
    { content: "" },
  ];

  return (
    <Modal
      close={onClose}
      title="Image selection"
      className="p-image-select-modal"
    >
      <Row>
        <Col size={4}>
          <Card title="Filters">
            <Select
              label="Distribution"
              name="distribution"
              onChange={(v) => {
                setDistribution(v.target.value);
                setRelease("");
              }}
              options={getOptionList((item: RemoteImage) => item.os)}
              value={distribution}
              stacked
            />
            <Select
              disabled={distribution === ""}
              label="Release"
              name="release"
              onChange={(v) => {
                setRelease(v.target.value);
              }}
              options={getOptionList(
                (item) => item.release,
                (item) => item.os === distribution
              )}
              value={release}
              stacked
            />
            <Row>
              <Col size={2}>
                <Label>Architecture</Label>
              </Col>
              <Col size={2} className="u-align-text--right">
                {architectures.length !== allArchitectures.length ? (
                  <Button
                    appearance="link"
                    onClick={() => setArchitectures(allArchitectures)}
                  >
                    select all
                  </Button>
                ) : (
                  <Button
                    appearance="link"
                    onClick={() => setArchitectures([])}
                  >
                    unselect all
                  </Button>
                )}
              </Col>
            </Row>
            {allArchitectures.map((item) => (
              <CheckboxInput
                key={item}
                label={item}
                value={item}
                checked={architectures.includes(item)}
                onChange={() => toggleArchitecture(item)}
              />
            ))}
          </Card>
        </Col>
        <Col size={8}>
          <SearchBox
            autoFocus
            id="search-image-catalog"
            type="text"
            onChange={(value) => {
              setQuery(value);
              setDistribution("");
              setRelease("");
            }}
            placeholder="Search for distributions, release or architecture"
            value={query}
          />
          <div className="p-image-list">
            <MainTable
              headers={headers}
              rows={rows}
              paginate={null}
              responsive
              sortable
              className="u-table-layout--auto"
            />
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default ImageSelect;
