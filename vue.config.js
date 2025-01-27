const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const cspBuilder = require('content-security-policy-builder')
const packageJson = require('./package.json')

const blocks = []

if (process.env.VENDOR === 'chrome') {
  blocks.push({
    block: 'is-firefox',
    start: '<!--',
    end: '-->'
  }, {
    block: 'is-firefox',
    start: '/*',
    end: '*/'
  })
} else if (process.env.VENDOR === 'firefox') {
  blocks.push({
    block: 'is-chrome',
    start: '<!--',
    end: '-->'
  }, {
    block: 'is-chrome',
    start: '/*',
    end: '*/'
  })
}

const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  filenameHashing: false,
  outputDir: process.env.VENDOR ? `dist/${process.env.VENDOR}` : 'dist',
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      title: 'Publisher Dashboard for Unity'
    },
    background: {
      entry: 'src/background.js',
      chunks: ['background']
    },
    trends: {
      entry: 'src/trends/main.js',
      title: 'Trend Analysis'
    }
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  },
  configureWebpack: {
    module: {
      rules: [{
        test: /\.vue$/,
        enforce: 'pre',
        exclude: /(node_modules|bower_components|\.spec\.js)/,
        use: [{
          loader: 'webpack-remove-blocks',
          options: {
            blocks
          }
        }]
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /(node_modules|bower_components|\.spec\.js)/,
        use: [{
          loader: 'webpack-remove-blocks',
          options: {
            blocks
          }
        }]
      }
      ]
    },
    plugins: [
      new CopyWebpackPlugin([
        {
          from: 'node_modules/x2js/x2js.js',
          to: 'vendor/x2js',
          toType: 'dir'
        },
        {
          from: './src/manifest.json',
          to: 'manifest.json',
          transform (content) {
            const manifestContent = JSON.parse(content)

            manifestContent.version = packageJson.version

            manifestContent.content_security_policy = cspBuilder({
              directives: {
                connectSrc: ['https://publisher.assetstore.unity3d.com'],
                defaultSrc: ["'none'"],
                imgSrc: ["'self'", 'data:'],
                scriptSrc: process.env.NODE_ENV === 'production' ? ["'self'"] : ["'self'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'"]
              }
            })

            manifestContent.background = process.env.NODE_ENV === 'production' ? manifestContent.backgroundProd : manifestContent.backgroundDev

            delete manifestContent.backgroundProd
            delete manifestContent.backgroundDev

            return JSON.stringify(manifestContent, null, 2)
          }
        }
      ]),
      new VuetifyLoaderPlugin()
    ]
  }
}
