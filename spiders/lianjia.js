const cheerio = require('cheerio')
const Promise = require('bluebird')
const BaseSpider = require('./base')

module.exports = class Lianjia extends BaseSpider{

  getNext (dom) {
    if (this.config.maxPage && this.pageCount >= this.config.maxPage) {
      return ''
    }
    let pageData = dom('div.house-lst-page-box.page-box').attr('page-data')
    if (pageData) {
      pageData = JSON.parse(pageData)
      if (pageData.totalPage > pageData.curPage) {
        return `/ershoufang/pg${pageData.curPage + 1}co32`
      }
    }
    return ''
  }

  async request (url) {
    const headers = this.getHeader()
    this.lastUrl = url
    const res = await axios.get(url, {
      baseURL: this.config.baseUrl,
      headers,
      responseType: 'document'
    })
    const $ = cheerio.load(res.data)
    const a = $('ul.sellListContent>li div.title>a')
    const detailUrls = []
    for (let x of a) {
      detailUrls.push(x.attribs.href)
    }
    await Promise.map(detailUrls, this.getHouseDetail.bind(this), { concurrency: this.config.detailBatch || 3 })
    return this.getNext($)
  }

  async getHouseDetail (url) {
    await this.wait()
    console.log(url)
  }

}
