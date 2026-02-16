module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            [
                'babel-preset-expo',
                {jsxImportSource: 'nativewind'}],
            'nativewind/babel',
        ],
        // Ensure there is no 'plugins' key if you moved nativewind/babel to presets
    };
};