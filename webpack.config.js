/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const config = {
  entry: {
    app: "./src/index.tsx",
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/ui/",
    filename: "ui/[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.tsx?/,
        use: ["ts-loader"],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "index-prd.html",
          to: "index.html",
          toType: "file",
        },
        {
          from: "index-prd.html",
          to: "ui/index.html",
          toType: "file",
        },
        {
          from: "public/assets",
          to: "ui/assets",
          toType: "dir",
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      api: path.join(__dirname, "src/api"),
      context: path.join(__dirname, "src/context"),
      components: path.join(__dirname, "src/components"),
      pages: path.join(__dirname, "src/pages"),
      types: path.join(__dirname, "src/types"),
      util: path.join(__dirname, "src/util"),
    },
  },
};

module.exports = () => {
  const production = process.env.ENVIRONMENT !== "devel";

  if (production) {
    config.mode = "production";
  } else {
    config.devtool = "source-map";
    config.mode = "development";
  }

  return config;
};
