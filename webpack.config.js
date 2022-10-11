const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const config = {
  entry: {
    app: "./static/js/App.js",
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
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
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "static/html/index.html",
          to: "index.html"
        },
        {
          from: "static/img",
          to: "static/img"
        },
      ],
    }),
  ],

};

module.exports = (env) => {
  const production = process.env.ENVIRONMENT !== "devel";

  if (production) {
    config.mode = "production";
  } else {
    config.devtool = "source-map";
    config.mode = "development";
  }

  return config;
};
