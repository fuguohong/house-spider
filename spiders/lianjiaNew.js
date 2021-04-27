const LianjiaErshou = require('./lianjiaErshou')
const cheerio = require('cheerio')
const logger = require('../logger')

module.exports = class LianjiaNew extends LianjiaErshou {
  constructor (...arg) {
    super(...arg)
    this.page = 1
    this.findExist = false
  }

  init () {
    this.runningComunity = new Map()
    return this.store.init()
  }

  getNext () {
    if (this.findExist) {
      return null
    }
    this.page++
    return `/ershoufang/pg${this.page}co32sf1/`
  }

  async processData (res) {
    const $ = cheerio.load(res.data)
    const a = $('ul.sellListContent>li div.title>a').toArray()

    let count = 0
    await Promise.all(a.map(async(x, i) => {
      const url = x.attribs.href
      const hid = url.slice(url.lastIndexOf('/') + 1, -5)
      const exists = await this.store.houseExists(hid)
      if (exists) {
        this.findExist = true
        return null
      }
      const res = await this.request(url)
      const house = await this.processHouse(res)
      await this.store.saveHouse(house)
      count++
      return house
    }))
    logger.info('列表页爬取完成:%s  共存储房源%d个', res.config.url, count)
    // houseArray = houseArray.filter(h => h)
    // await this.store.saveHouse(houseArray)
  }
}
