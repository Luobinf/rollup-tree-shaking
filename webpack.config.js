const path = require('path');

module.exports = {
  entry: './src/index.js',
  devtool: false,
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
 mode: 'development',
 optimization: {
   usedExports: true,
 },
 module: {
    rules: [
        {
            test: /\.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        [
                           '@babel/preset-env',{
                                // modules: 'commonjs'
                           } 
                        ]
                    ]
                }
            }
        }
    ]
 }
}