const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Required for expo-sqlite on web (wa-sqlite.wasm)
config.resolver.assetExts.push("wasm");

module.exports = withNativeWind(config);