const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 开发服务器配置
  devServer: {
    port: 8080,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  
  // 生产环境配置
  productionSourceMap: false,
  
  // 输出目录
  outputDir: 'dist',
  assetsDir: 'static',
  
  // 配置webpack
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  },
  
  // 链式配置
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '企业管理系统';
      return args;
    });
  }
});
