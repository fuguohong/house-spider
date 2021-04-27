const path = require('path')
const config = require('./config')
const Store = require('./store')
const logger = require('./logger')

const Spider = require(path.join(__dirname, 'spiders', config.type))

const store = new Store(config.mongoConn)
const spider = new Spider(config[ config.type ], store)

spider.start()
  .then(() => {
    logger.on('finish', () => {
      process.exit(2)
    })
    logger.info('爬取完成， 写入情况：%O', store.counts)
  }).catch(e => {
  logger.on('finish', () => {
    process.exit(2)
  })
  logger.error('爬取出错，url:' + spider.lastUrl)
  logger.error(e)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('unhandledRejection: %O, reason: %O', promise, reason)
  process.exit(2)
})

