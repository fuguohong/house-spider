const fs = require('fs')
const path = require('path')
const config = require('../config')
const Spider = require('../spiders/lianjiaErshou')
const Store = require('../store')

const store = new Store(config.mongoConn)

const spider = new Spider(config.lianjiaErshou, store)
const communityHtml = fs.readFileSync(path.join(__dirname, 'community.html'))
const ershouHtml = fs.readFileSync(path.join(__dirname,'ershou.html'))

async function main () {
  await spider.init()
  // const result = await spider.processHouse({
  //   config: {
  //     url: '/xiaoqu/2411048614076/',
  //     baseURL: 'https://sz.lianjia.com'
  //   },
  //   data: ershouHtml
  // })

  const result = await spider.getCommunityId('/xiaoqu/3620035116289697/')
  console.log(result)
}

main().catch(console.error)
