var path = require('path');

module.exports = {
    entry: {
        main: './js/app.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\..*json$/,
                loader: 'json-loader',
            },
        ],
    },
};
