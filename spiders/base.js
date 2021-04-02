const axios = require('axios')

module.exports = class BaseSpider {
  constructor (config, store) {
    this.config = config
    this.store = store
    // 上次爬取的页面
    this.lastUrl = this.config.startUrl
    // 爬取的页面数
    this.pageCount = 1
    // 运行中的请求
    this.running = 0
    // 最大并发请求
    this.maxJobs = config.concurrence || 5
    // 等待中的请求
    this.jobs = []
  }

  init () {
    return this.store.init()
  }

  wait () {
    const random = (Math.random() * 3000) - 1500
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
    await this.init()
    let url = this.config.startUrl
    while (url) {
      try {
        console.log('开始爬取列表页:' + url)
        await this.requestList(url)
        url = this.getNext()
      } catch (e) {
        console.error('爬取错误，失败url：' + url)
        console.error(e)
        process.exit(1)
      }
    }
  }

  async request (url, config) {
    const headers = this.getHeader()
    const baseConfig = {
      baseURL: this.config.baseUrl,
      headers,
      responseType: 'text'
    }
    Object.assign(baseConfig, config)
    let result = {}
    if (this.running >= this.maxJobs) {
      return new Promise(resolve => {
        this.jobs.push(() => {
          this._doRequest(url, baseConfig, result)
            .then(() => resolve(result.res))
        })
      })
    } else {
      await this._doRequest(url, baseConfig, result)
    }
    return result.res
  }

  async _doRequest (url, config, result) {
    this.running++
    console.log('running:', this.running)
    console.log('requesting:', url)
    await this.wait()
    const res = await axios.get(url, config)
    this.running--
    if (this.jobs.length) {
      const job = this.jobs.shift()
      job()
    }
    result.res = res
  }

  async requestList (url) {
    const res = await this.request(url)
    this.lastUrl = url
    this.pageCount++
    await this.processData(res.data)
  }

  getNext () {
    throw new Error('implement getNext')
  }

  async processData (resData) {
    throw new Error('implement processData')
  }

}
