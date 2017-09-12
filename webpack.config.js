module.exports = {
    entry: './lib/index.js',

    output: {
        filename: './bundle.js',
    },

    module: {
        loaders: [{
            test: /\.html$/,
            loader: "ejs-loader?variable=data"
        }],
    }
}
