const cheerio = require('cheerio')
const BaseSpider = require('./base')

/**
 * 链家区爬取
 * @type {module.LianjiaDistrict}
 */
module.exports = class LianjiaDistrict extends BaseSpider {

  getNext () {
    if (this._index === this.districts.length - 1) {
      return
    }
    return this.districts[ ++this._index ].href
  }

  async processData (resData) {
    const $ = cheerio.load(resData)
    if (!this.districts) {
      const as = $('div[data-role=ershoufang]>div:first').children('a').toArray()
      this.districts = as.map(a => ({
        href: a.attribs.href,
        code: a.attribs.href.split('/')[ 2 ],
        name: a.children[ 0 ].data
      }))
      this._index = -1
    } else {
      const as = $('div[data-role=ershoufang]>div:last').children('a').toArray()
      const regions = as.map(a => ({
        code: a.attribs.href.split('/')[ 2 ],
        name: a.children[ 0 ].data
      }))
      await this.store.saveDistrict({
        ...this.districts[ this._index ],
        regions
      })
    }
  }

}
