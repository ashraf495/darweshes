module.exports = function override(config, env) {
    config.module.rules.push({
      test: /\.(ttf|eot|woff|woff2|otf)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
          },
        },
      ],
    });
    return config;
  };
  