const path = require('path')
const config = require('./config')
const Store = require('./store')

const Spider = require(path.join(__dirname, 'spiders', config.type))

const store = new Store(config.mongoConn)
const spider = new Spider(config[ config.type ], store)

spider.start()
  .then(() => {
    console.log(`爬取完成， 共写入${store.count}条数据`)
    process.exit(0)
  }).catch(e => {
  console.error(spider.lastUrl + '爬取出错')
  console.error(e)
  process.exit(2)
})
