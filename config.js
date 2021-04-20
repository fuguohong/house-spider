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
    startUrl: '/ershoufang/danzishi/pg36co32sf1/',
    // startDst: 0,
    // startRegion: 0,
    // startPage: '32',
    maxPage: 0,
    // 跳过这之前的数据
    // offset: 'https://cq.lianjia.com/ershoufang/106107695902.html',
    // 同时爬取几个详情
    concurrence: 10,
    // 请求间隔ms，在这基础上随机+-2000ms
    requestInterval: 2000
  }
}
