module.exports = {
  mongoConn: process.env.MONGO_CONN,
  type: 'lianjiaErshou',
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
    startUrl: '/ershoufang/liangping1/co32sf1ba100ea10000/',
    maxPage: 0,
    // 同时爬取几个详情
    concurrence: 10,
    // 请求间隔ms，在这基础上随机+-1500ms
    requestInterval: 2000
  }
}
