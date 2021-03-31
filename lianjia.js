const axios = require('axios')
const cheerio = require('cheerio')
const Promise = require('bluebird')

module.exports = class Lianjia {

  constructor (config, store) {
    this.config = config
    this.lastUrl = this.config.startUrl
    this.count = 0
    this.pageCount = 1
  }

  wait () {
    const random = (Math.random() * 4000) - 2000
    const waitTime = this.config.requestInterval + random
    if (waitTime > 0) {
      return new Promise(resolve => {setTimeout(resolve, waitTime)})
    }
  }

  getHeader () {
    return {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Host': 'cq.lianjia.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
      'Referer': this.config.baseUrl + this.lastUrl
    }
  }

  async start () {
    throw new Error('终止执行')
    let url = this.config.startUrl
    while (url) {
      try {
        console.log('开始爬取列表页:' + url)
        url = await this.request(url)
        this.pageCount++
      } catch (e) {
        console.error('爬取错误，失败url：' + url)
        console.error(e)
        process.exit(1)
      }
    }
  }

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
    await Promise.map(detailUrls, this.getDetail.bind(this), { concurrency: this.config.detailBatch || 3 })
    return this.getNext($)
  }

  async getDetail (url) {
    await this.wait()
    console.log(url)
  }

}
