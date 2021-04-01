module.exports = {
  mongoConn: process.env.MONGO_CONN,
  lianjia:{
    baseUrl: 'https://cq.lianjia.com',
    // 开始爬取页面
    startUrl: '/ershoufang/co32/',
    maxPage: 2,
    // 跳过这之前的数据
    offset: 'https://cq.lianjia.com/ershoufang/106107695902.html',
    // 同时爬取几个详情
    concurrence: 5,
    // 请求间隔ms，在这基础上随机+-2000ms
    requestInterval: 2000
  }
}
