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
import { LxdConfigField } from "types/config";
import SettingForm from "./SettingForm";
import Loader from "components/Loader";
import { useSettings } from "context/useSettings";
import NotificationRow from "components/NotificationRow";
import ScrollableTable from "components/ScrollableTable";

const configOptionsUrl = "/ui/assets/data/config-options.json";

const Settings: FC = () => {
  const [configOptions, setConfigOptions] = useState<LxdConfigField[]>([]);
  const [query, setQuery] = useState("");
  const notify = useNotify();

  const loadConfigOptions = () => {
    void fetch(configOptionsUrl)
      .then(handleResponse)
      .then((data: LxdConfigField[]) => {
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

  const getValue = (configField: LxdConfigField): string | undefined => {
    for (const [key, value] of Object.entries(settings?.config ?? {})) {
      if (key === configField.key) {
        return value;
      }
    }
    if (typeof configField.default === "boolean") {
      return configField.default ? "true" : "false";
    }
    if (configField.default === "-") {
      return undefined;
    }
    return configField.default;
  };

  const headers = [
    { content: "Group", className: "group" },
    { content: "Key", className: "key" },
    { content: "Value" },
  ];

  let lastGroup = "";
  const rows = configOptions
    .filter((configField) => {
      if (!query) {
        return true;
      }
      return configField.key.toLowerCase().includes(query.toLowerCase());
    })
    .map((configField, index, { length }) => {
      const isDefault = !Object.keys(settings?.config ?? {}).some(
        (key) => key === configField.key
      );
      const value = getValue(configField);

      const group = configField.key.split(".")[0];
      const isNewGroup = lastGroup !== group;
      lastGroup = group;

      return {
        columns: [
          {
            content: isNewGroup && <h2 className="p-heading--5">{group}</h2>,
            role: "cell",
            className: "group",
            "aria-label": "Group",
          },
          {
            content: (
              <>
                {isDefault ? (
                  configField.key
                ) : (
                  <strong>{configField.key}</strong>
                )}{" "}
                <p className="p-text--small u-no-margin u-text--muted">
                  {configField.description}
                </p>
              </>
            ),
            role: "cell",
            className: "key",
            "aria-label": "Key",
          },
          {
            content: (
              <SettingForm
                configField={configField}
                value={value}
                isLast={index === length - 1}
              />
            ),
            role: "cell",
            "aria-label": "Value",
            className: "u-vertical-align-middle",
          },
        ],
      };
    });

  return (
    <>
      <BaseLayout title="Settings" contentClassName="settings">
        <NotificationRow />
        {isLoading && <Loader text="Loading settings..." />}
        {!isLoading && (
          <>
            <Row>
              <Col size={8}>
                <SearchBox
                  name="search-setting"
                  type="text"
                  onChange={(value) => {
                    setQuery(value);
                  }}
                  placeholder="Search"
                  value={query}
                />
              </Col>
            </Row>
            <Row>
              <ScrollableTable dependencies={[notify.notification, rows]}>
                <MainTable
                  headers={headers}
                  rows={rows}
                  emptyStateMsg="No data to display"
                />
              </ScrollableTable>
            </Row>
          </>
        )}
      </BaseLayout>
    </>
  );
};

export default Settings;
