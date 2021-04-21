module.exports = {
  mongoConn: process.env.MONGO_CONN,
  type: 'lianjiaErshou',
  lianjiaDistrict: {
    baseUrl: 'https://cq.lianjia.com',
    // 开始爬取页面
    startUrl: '/ershoufang/jiangbei/',
    // maxPage: 2,
    // 同时爬取几个详情
    concurrence: 5,
    // 请求间隔ms，在这基础上随机+-2000ms
    requestInterval: 2000
  },
  lianjiaErshou: {
    baseUrl: 'http://cq.lianjia.com',
    // 开始爬取页面
    // startUrl: '/ershoufang/bishan1/pg42co32sf1/',
    startUrl: '/ershoufang/bishan1/co32sf1ba0ea100/',
    maxPage: 0,
    // 同时爬取几个详情
    concurrence: 10,
    // 请求间隔ms，在这基础上随机+-2000ms
    requestInterval: 2000
  }
}
