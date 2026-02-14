const { getDefaultConfig } = require("expo/metro-config");
const nativewindMetro = require("nativewind/metro");

const withNativeWind = nativewindMetro.withNativeWind ?? nativewindMetro.default;

module.exports = withNativeWind(getDefaultConfig(__dirname));