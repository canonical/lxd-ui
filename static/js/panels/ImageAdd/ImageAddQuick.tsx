import React, { FC, OptionHTMLAttributes, useEffect, useState } from "react";
import {
  Col,
  MainTable,
  Row,
  SearchBox,
  Select,
  Tooltip,
} from "@canonical/react-components";
import { handleResponse } from "../../util/helpers";
import ImportImageBtn from "../../buttons/images/ImportImageBtn";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { RemoteImage, RemoteImageList } from "../../types/image";
import { NotificationHelper } from "../../types/notification";

const canonicalJson = "/static/assets/data/canonical-images.json";
const linuxContainersJson = "/static/assets/data/linuxcontainers-images.json";

type Props = {
  notify: NotificationHelper;
};

const ImageAddQuick: FC<Props> = ({ notify }) => {
  const [images, setImages] = useState<RemoteImage[]>([]);
  const [query, setQuery] = useState<string>("");
  const [distribution, setDistribution] = useState<string>("Ubuntu");
  const [architecture, setArchitecture] = useState<string>("amd64");
  const [release, setRelease] = useState<string>("jammy");

  const loadImagesFromJson = (file: string, server: string) => {
    fetch(file)
      .then(handleResponse)
      .then((data: RemoteImageList) => {
        const images = Object.entries(data.products).map((product) => {
          const { os, ...image } = product[1];
          const formattedOs = os.charAt(0).toUpperCase() + os.slice(1);
          return { ...image, os: formattedOs, server: server };
        });
        setImages((prev) => images.concat(prev));
      });
  };

  useEffect(() => {
    loadImagesFromJson(
      linuxContainersJson,
      "https://images.linuxcontainers.org"
    );
    loadImagesFromJson(
      canonicalJson,
      "https://cloud-images.ubuntu.com/releases"
    );
  }, []);

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
      if (architecture && item.arch !== architecture) {
        return false;
      }
      if (distribution && item.os !== distribution) {
        return false;
      }
      if (release && item.release !== release) {
        return false;
      }
      if (
        query &&
        !item.aliases.includes(query) &&
        !item.os.includes(query) &&
        !item.arch.includes(query) &&
        !item.release.includes(query)
      ) {
        return false;
      }
      return true;
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
            content: item.arch,
            role: "rowheader",
            "aria-label": "Architecture",
          },
          {
            content: item.release,
            role: "rowheader",
            "aria-label": "Release",
          },
          {
            content: item.aliases,
            role: "rowheader",
            "aria-label": "Aliases",
          },
          {
            content: (
              <Tooltip message="Import image" position="left">
                <ImportImageBtn image={item} notify={notify} />
              </Tooltip>
            ),
          },
        ],
      };
    });

  const headers = [
    {
      content: (
        <>
          <span className="u-sv1">Distribution</span>
          <Select
            name="distribution"
            className="is-dense"
            onChange={(v) => {
              setDistribution(v.target.value);
              setRelease("");
            }}
            options={getOptionList((item: RemoteImage) => item.os)}
            value={distribution}
          />
        </>
      ),
    },
    {
      content: (
        <>
          <span className="u-sv1">Architecture</span>
          <Select
            name="architecture"
            className="is-dense"
            onChange={(v) => {
              setArchitecture(v.target.value);
            }}
            options={getOptionList(
              (item) => item.arch,
              distribution ? (item) => item.os === distribution : undefined
            )}
            value={architecture}
          />
        </>
      ),
    },
    {
      content: (
        <>
          <span className="u-sv1">Release</span>
          <Select
            name="releases"
            className="is-dense"
            onChange={(v) => {
              setRelease(v.target.value);
            }}
            options={getOptionList(
              (item) => item.release,
              distribution ? (item) => item.os === distribution : undefined
            )}
            value={release}
          />
        </>
      ),
    },
    { content: "Aliases" },
    { content: "Actions" },
  ];

  return (
    <>
      <Row>
        <Col size={8}>
          <SearchBox
            id="search"
            type="text"
            onChange={(value) => {
              setQuery(value);
              setDistribution("");
              setRelease("");
            }}
            placeholder="Search for distribution, release, alias, etc. "
            value={query ?? ""}
          />
        </Col>
      </Row>
      <MainTable
        headers={headers}
        rows={rows}
        paginate={15}
        responsive
        sortable
        className="u-table-layout--auto"
      />
    </>
  );
};

export default ImageAddQuick;
