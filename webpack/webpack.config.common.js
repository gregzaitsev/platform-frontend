const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { mapValues } = require("lodash");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const { default: InjectPlugin, ENTRY_ORDER } = require("webpack-inject-plugin");

const paths = require("./paths");
const loadAppEnv = require("./loadAppEnv");

const getEnvPlugin = () => {
  const applicationEnv = loadAppEnv();

  // Use env proxy for cypress and commit deployment
  if (process.env.IS_CYPRESS === "1" || process.env.TYPE_OF_DEPLOYMENT === "commit") {
    return new InjectPlugin(
      () => {
        return `
          const handler = {
            get(obj, prop) {
             return localStorage.getItem(prop) || obj[prop];
            }
          };

          process.env = new Proxy(${JSON.stringify(applicationEnv)}, handler);
        `;
      },
      {
        entryOrder: ENTRY_ORDER.First,
      },
    );
  }

  return new webpack.DefinePlugin({
    "process.env": mapValues(applicationEnv, JSON.stringify),
  });
};

module.exports = {
  entry: ["babel-regenerator-runtime", "./app/index.tsx"],
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  output: {
    path: paths.dist,
    publicPath: "/",
  },
  plugins: [
    getEnvPlugin(),
    new CopyWebpackPlugin([{ from: "./app/external/*", to: "./external/", flatten: true }]),
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      favicon: paths.favicon,
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new WorkboxPlugin.GenerateSW({
      swDest: "sw.js",
      clientsClaim: true,
      skipWaiting: true,
      importWorkboxFrom: "local",
    }),
  ],
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(jpg|png|svg|gif)$/,
            loader: "url-loader",
            exclude: paths.inlineIcons,
            options: {
              limit: 5000,
              name: "images/[hash:8].[ext]",
            },
          },
          {
            test: /\.(mp4|webm)$/,
            loader: "url-loader",
            exclude: paths.inlineIcons,
            options: {
              limit: 5000,
              name: "videos/[hash:8].[ext]",
            },
          },
          // raw-loader for svg is used inside `paths.inlineIcons` directory only
          {
            test: /\.(svg)$/,
            loader: "raw-loader",
            include: paths.inlineIcons,
          },
          {
            test: /\.(woff2|woff|ttf|eot|otf)$/,
            loader: "file-loader",
            options: {
              name: "fonts/[name].[hash:8].[ext]",
            },
          },
        ],
      },
    ],
  },
};
