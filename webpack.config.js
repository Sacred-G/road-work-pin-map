module.exports = {
    module:  {
    
      rules: [
        {
          test: /\.css$/i,
          use: [
            "style-loader",
            "css-loader",
            {
                loader: "postcss-loader",
                options: {  import: true,
                    modules: true,
                  postcssOptions: {  import: true,
                    plugins: [
                      [ "postcss-preset-env",
                        "autoprefixer",
                        {
                            import: true,
                        },
                      ],
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
    };