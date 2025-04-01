const { getDefaultConfig } = require("@react-native/metro-config");

const config = {
  ...getDefaultConfig(__dirname),
  resolver: {
    assetExts: ["png", "jpg", "jpeg", "gif", "webp"],
    sourceExts: ["js", "jsx", "ts", "tsx", "json"],
  },
};

module.exports = config;
