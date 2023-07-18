import React, { FC, useEffect, useState } from "react";
import {
  Col,
  MainTable,
  Row,
  SearchBox,
  useNotify,
} from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import { handleResponse } from "util/helpers";
import { LxdConfigOption } from "types/config";
import SettingForm from "./SettingForm";
import Loader from "components/Loader";
import { useSettings } from "context/useSettings";
import NotificationRow from "components/NotificationRow";

const configOptionsUrl = "/ui/assets/data/config-options.json";

const Settings: FC = () => {
  const [configOptions, setConfigOptions] = useState<LxdConfigOption[]>([]);
  const [query, setQuery] = useState("");
  const notify = useNotify();

  const loadConfigOptions = () => {
    void fetch(configOptionsUrl)
      .then(handleResponse)
      .then((data: LxdConfigOption[]) => {
        setConfigOptions(data);
      });
  };

  useEffect(() => {
    loadConfigOptions();
  }, []);

  const { data: settings, error, isLoading } = useSettings();

  if (error) {
    notify.failure("Loading settings failed", error);
  }

  const getValue = (option: LxdConfigOption): string | undefined => {
    for (const [key, value] of Object.entries(settings?.config ?? {})) {
      if (key === option.key) {
        return value;
      }
    }
    if (typeof option.default === "boolean") {
      return option.default ? "true" : "false";
    }
    if (option.default === "-") {
      return undefined;
    }
    return option.default;
  };

  const headers = [
    { content: "Group" },
    { content: "Key" },
    { content: "Value" },
  ];

  let lastGroup = "";
  const rows = configOptions
    .filter((option) => {
      if (!query) {
        return true;
      }
      return option.key.toLowerCase().includes(query.toLowerCase());
    })
    .map((option) => {
      const isDefault = !Object.keys(settings?.config ?? {}).some(
        (key) => key === option.key
      );
      const value = getValue(option);

      const group = option.key.split(".")[0];
      const isNewGroup = lastGroup !== group;
      lastGroup = group;

      return {
        columns: [
          {
            content: isNewGroup && <h2 className="p-heading--5">{group}</h2>,
            role: "rowheader",
            "aria-label": "Group",
          },
          {
            content: (
              <>
                {isDefault ? option.key : <strong>{option.key}</strong>}{" "}
                <p className="p-text--small u-no-margin u-text--muted">
                  {option.description}
                </p>
              </>
            ),
            role: "rowheader",
            "aria-label": "Key",
          },
          {
            content: <SettingForm option={option} value={value} />,
            role: "rowheader",
            "aria-label": "Value",
            className: "u-vertical-align-middle",
          },
        ],
      };
    });

  return (
    <>
      <BaseLayout title="Settings">
        <NotificationRow />
        <Row>
          <Col size={8}>
            <SearchBox
              name="search-setting"
              type="text"
              onChange={(value) => {
                setQuery(value);
              }}
              placeholder="Search for group or key"
              value={query}
            />
          </Col>
        </Row>
        <Row>
          <MainTable
            className="u-table-layout--auto"
            headers={headers}
            rows={rows}
            sortable
            emptyStateMsg={
              isLoading ? (
                <Loader text="Loading settings..." />
              ) : (
                "No data to display"
              )
            }
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default Settings;
