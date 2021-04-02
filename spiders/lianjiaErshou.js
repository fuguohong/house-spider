const cheerio = require('cheerio')
const BaseSpider = require('./base')

module.exports = class LianjiaErshou extends BaseSpider {

  async init(){
    await super.init()
    console.log('init')
  }

  getNext () {
    return this.nextPage
  }

  processPage (dom) {
    let nextPage = ''
    if (this.config.maxPage && this.pageCount >= this.config.maxPage) {
      this.nextPage = nextPage
    } else {
      const pageDom = dom('div.house-lst-page-box.page-box').attr('page-data')
      const pageData = JSON.parse(pageDom.attr('page-data'))
      if (pageData.totalPage > pageData.curPage) {
        nextPage = pageDom.attr('page-url').replace('{page}', pageData.curPage + 1)
      }
    }
    this.nextPage = nextPage
  }

  async processData (resData) {
    const $ = cheerio.load(resData)
    this.processPage($)
    const a = $('ul.sellListContent>li div.title>a').toArray()
    await Promise.all(a.map((x) => {
      return this.request(x.attribs.href)
    }))
    return null
  }

}
