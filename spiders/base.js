const axios = require('axios')

module.exports = class BaseSpider {
  constructor (config, store) {
    this.config = config
    this.store = store
    this.startUrl = this.config.startUrl
    // 上次爬取的页面
    this.lastUrl = ''
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
    if (waitTime > 5) {
      return new Promise(resolve => {setTimeout(resolve, waitTime)})
    }
  }

  getHeader () {
    let Referer = this.lastUrl
    if (Referer && !Referer.startsWith('http')) {
      Referer = this.config.baseUrl + Referer
    }
    return {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Cache-Control': 'max-age=0',
      'Host': 'cq.lianjia.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
      'Referer': Referer
    }
  }

  async start () {
    await this.init()
    let url = this.startUrl
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
      responseType: 'text',
      maxRedirects: 0,
      timeout: 5500,
      validateStatus: function (status) {
        return (status >= 200 && status <= 302) || status === 404
      }
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
    await this.wait()
    console.log('requesting:', url)
    const res = await tryAfter(() => {
      return axios.get(url, config)
    }, 5000, 3, url)
    // const res = await axios.get(url, config)
    this.running--
    console.log('finish job.running', this.running, 'waiting join len:', this.jobs.length)
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
    await this.processData(res)
  }

  getNext () {
    throw new Error('implement getNext')
  }

  async processData (resData) {
    throw new Error('implement processData')
  }

}

function tryAfter (func, ms = 3000, maxTimes = 2, jobName) {
  let times = 1
  let finish = false
  return new Promise(async(resolve, reject) => {
    while (!finish && times <= maxTimes) {
      let hasTimeout = false
      await new Promise(resolve1 => {
        const timer = setTimeout(() => {
          console.warn('===== time out ' + jobName)
          hasTimeout = true
          resolve1()
        }, ms)

        func().then(res => {
          if (!hasTimeout) {
            clearTimeout(timer)
            resolve1()
            resolve(res)
            finish = true
          }
        }).catch(e => {
          if (!hasTimeout) {
            clearTimeout(timer)
            resolve1()
            reject(e)
            finish = true
          }
        })
      })
      times++
    }
    reject(new Error('exec time out' + jobName))
  })
}
