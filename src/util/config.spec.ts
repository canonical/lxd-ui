import { configDescriptionToHtml, toConfigFields } from "./config";
import { LxcConfigOptionCategories } from "types/config";

const exampleConfig: LxcConfigOptionCategories = {
  acme: {
    keys: [
      {
        "acme.agree_tos": {
          defaultdesc: "`false`",
          shortdesc: "Agree to ACME terms of service",
          type: "bool",
        },
      },
      {
        "acme.ca_url": {
          defaultdesc: "`https://acme-v02.api.letsencrypt.org/`",
          shortdesc: "",
          type: "string",
        },
      },
    ],
  },
  cluster: {
    keys: [
      {
        "cluster.healing_threshold": {
          defaultdesc: "`0` (medium)",
          shortdesc: "Threshold when to evacuate",
          type: "integer",
        },
      },
      {
        "cluster.https_address": {
          shortdesc: "Address to use for clustering traffic",
          type: "string",
        },
      },
    ],
  },
};

describe("toConfigFields and replaceDocLinks", () => {
  it("translates config categories to flat array of fields", () => {
    const fields = toConfigFields(exampleConfig);

    expect(fields.length).toBe(4);

    expect(fields[0].key).toBe("acme.agree_tos");
    expect(fields[0].shortdesc).toBe("Agree to ACME terms of service");
    expect(fields[0].type).toBe("bool");
    expect(fields[0].default).toBe("false");
    expect(fields[0].category).toBe("acme");

    expect(fields[1].key).toBe("acme.ca_url");
    expect(fields[1].shortdesc).toBe("");
    expect(fields[1].type).toBe("string");
    expect(fields[1].default).toBe("https://acme-v02.api.letsencrypt.org/");
    expect(fields[1].category).toBe("acme");

    expect(fields[2].key).toBe("cluster.healing_threshold");
    expect(fields[2].shortdesc).toBe("Threshold when to evacuate");
    expect(fields[2].type).toBe("integer");
    expect(fields[2].default).toBe("0");
    expect(fields[2].category).toBe("cluster");

    expect(fields[3].key).toBe("cluster.https_address");
    expect(fields[3].shortdesc).toBe("Address to use for clustering traffic");
    expect(fields[3].type).toBe("string");
    expect(fields[3].default).toBe("");
    expect(fields[3].category).toBe("cluster");
  });

  it("converts config description to html", () => {
    const input =
      "Specify a Pongo2 template string that represents the snapshot name.\nThis template is used for scheduled snapshots and for unnamed snapshots.\n\nSee {ref}`instance-options-snapshots-names` for more information.";

    const result = configDescriptionToHtml(
      input,
      "https://docs.example.org",
      objectsInvTxt.split("\n"),
    );

    expect(result).toBe(
      'Specify a Pongo2 template string that represents the snapshot name.<br>This template is used for scheduled snapshots and for unnamed snapshots.<br><br>See <a href="https://docs.example.org/reference/instance_options/#instance-options-snapshots-names" target="_blank" rel="noopener noreferrer">instance options snapshots names</a> for more information.',
    );
  });

  it("converts link tag in config description to html link", () => {
    const input =
      "the value of {config:option}`storage-zfs-volume-conf:zfs.block_mode`,\nthe specified";

    const result = configDescriptionToHtml(
      input,
      "https://docs.example.org",
      objectsInvTxt.split("\n"),
    );

    expect(result).toBe(
      'the value of <a href="https://docs.example.org/reference/storage_zfs/#storage-zfs-volume-conf:zfs.block_mode" target="_blank" rel="noopener noreferrer">zfs.block_mode</a>,<br>the specified',
    );
  });

  it("converts admonition markup to html bold tag", () => {
    const input = "Foo bar baz.  ```{important}  Some important addition.```";

    const result = configDescriptionToHtml(
      input,
      "https://docs.example.org",
      objectsInvTxt.split("\n"),
    );

    expect(result).toBe(
      "Foo bar baz.  <b>Important</b>  Some important addition.",
    );
  });
});

const objectsInvTxt =
  "config:option\n" +
  "    instance-options-nvidia                  NVIDIA and CUDA configuration           : reference/instance_options/#instance-options-nvidia\n" +
  "    instance-options-qemu                    Override QEMU configuration             : reference/instance_options/#instance-options-qemu\n" +
  "    instance-options-raw                     Raw instance configuration overrides    : reference/instance_options/#instance-options-raw\n" +
  "    instance-options-security                Security policies                       : reference/instance_options/#instance-options-security\n" +
  "    instance-options-snapshots               Snapshot scheduling and configuration   : reference/instance_options/#instance-options-snapshots\n" +
  "    instance-options-snapshots-names         Automatic snapshot names                : reference/instance_options/#instance-options-snapshots-names\n" +
  "    zfs.block_mode                                                                   : reference/storage_zfs/#storage-zfs-volume-conf:zfs.block_mode\n";
