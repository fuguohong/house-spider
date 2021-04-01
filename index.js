const config = require('./config')
const Lianjia = require('./spiders/lianjia')
const Store = require('./store')

const lianjia = new Lianjia(config.lianjia)
const store = new Store(config.mongoConn)

store.init()
  .then(lianjia.start.bind(lianjia))
  .then(() => {
    console.log(`爬取完成， 共写入${lianjia.count}条数据`)
    process.exit(0)
  }).catch(e => {
  console.error(lianjia.lastUrl + '爬取出错')
  console.error(e)
  process.exit(2)
})
