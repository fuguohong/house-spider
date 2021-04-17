const path = require('path')
const config = require('./config')
const Store = require('./store')

const Spider = require(path.join(__dirname, 'spiders', config.type))

const store = new Store(config.mongoConn)
const spider = new Spider(config[ config.type ], store)

spider.start()
  .then(() => {
    console.log(`爬取完成， 写入情况：`, store.counts)
    process.exit(0)
  }).catch(e => {
  console.error(spider.lastUrl + '爬取出错')
  console.error(e)
  process.exit(2)
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('unhandledRejection：', promise, '原因：', reason)
  process.exit(2)
  // 记录日志、抛出错误、或其他逻辑。
})
