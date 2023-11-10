const path = require('path');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');

const compiler = (entry) => {
    const compiler = webpack({
        mode: 'development',
        context: __dirname,
        entry: entry,
        resolve: {
            extensions: ['.graphql', '.js'],
        },
        output: {
            path: path.resolve(__dirname),
            filename: 'bundle.js',
        },
        module: {
            rules: [
                {
                    test: /\.(graphql|gql)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: '@evo/graphql-tag-loader',
                    },
                },
            ],
        },
    });

    compiler.outputFileSystem = createFsFromVolume(new Volume());
    compiler.outputFileSystem.join = path.join.bind(path);

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) reject(err);
            if (stats.hasErrors()) reject(stats.toJson().errors);

            resolve(stats);
        });
    });
};

module.exports = compiler;
