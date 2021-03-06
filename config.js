const path = require('path')

module.exports = {
  mongoConn: process.env.MONGO_CONN,
  logDir: path.join(__dirname, 'logs'),
  consoleLevel: 'debug',
  fileLevel: 'info',
  type: process.argv[ 2 ] || 'lianjiaNew',
  lianjiaDistrict: {
    baseUrl: 'https://cq.lianjia.com',
    // 开始爬取页面
    // startUrl: '/ershoufang/jiangbei/',
    startUrl: '/ershoufang/chengkouxian/',
    // 同时爬取几个详情
    // concurrence: 5,
    // 请求间隔ms，在这基础上随机+-2000ms
    requestInterval: 0
  },
  lianjiaErshou: {
    baseUrl: 'http://cq.lianjia.com',
    // 开始爬取页面
    // startUrl: '/ershoufang/fuling1/co32sf1ba115ea10000/',
    // maxPage: 0,
    // 同时爬取几个详情
    concurrence: 8,
    // 请求间隔ms，在这基础上随机+-1500ms
    requestInterval: 2500
  },
  lianjiaNew: {
    startUrl: '/ershoufang/co32sf1/',
    baseUrl: 'http://cq.lianjia.com',
    // 同时爬取几个详情
    concurrence: 8,
    // 请求间隔ms，在这基础上随机+-1500ms
    requestInterval: 2500
  }
}
