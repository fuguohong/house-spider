const cheerio = require('cheerio')
const BaseSpider = require('./base')
const logger = require('../logger')

const areaTypes = {
  0: 'ba0ea85',
  1: 'ba85ea115',
  2: 'ba115ea10000'
}

module.exports = class LianjiaErshou extends BaseSpider {

  async init () {
    await super.init()
    this.areaType = 0
    this.i = 0
    this.runningComunity = new Map()

    const districts = await this.store.getDistricts()
    this.codes = []
    for (let d of districts) {
      for (let sd of d.regions) {
        if (!this.codes.includes(sd.code)) {
          this.codes.push(sd.code)
        }
      }
    }

    if (this.config.startUrl) {
      this.startUrl = this.config.startUrl
      const re = /.+\/(\w+)\/.+/
      const code = this.startUrl.match(re)[ 1 ]
      const gtArea = this.startUrl.match(/ba(\d+)ea\d+\/?$/)[ 1 ]
      if (gtArea === '0') {
        this.areaType = 0
      } else if (gtArea === '85') {
        this.areaType = 1
      } else {
        this.areaType = 2
      }

      for (let i = 0; i < this.codes.length; i++) {
        if (code === this.codes[ i ]) {
          this.i = i
          return
        }
      }
      throw new Error('未能解析startUrl')
    } else {
      this.startUrl = this.buildPageUrl()
    }
  }

  getNext () {
    this.runningComunity.clear()
    let next = this.nextPage
    if (!next.endsWith('/')) {
      next = next + '/'
    }
    return next
  }

  buildPageUrl (pageNum) {
    const areaStr = areaTypes[ this.areaType ]
    return `/ershoufang/${this.codes[ this.i ]}/${pageNum ? 'pg' + pageNum : ''}co32sf1${areaStr}/`
  }

  processPage (dom) {
    if (this.config.maxPage && this.pageCount >= this.config.maxPage) {
      this.nextPage = ''
      return
    }
    const total = parseInt(dom('h2.total>span').text().trim())
    if (total !== 0) {
      const pageDom = dom('div.house-lst-page-box.page-box')
      const pageData = JSON.parse(pageDom.attr('page-data'))
      if (pageData.totalPage > pageData.curPage) {
        this.nextPage = this.buildPageUrl(pageData.curPage + 1)
        // pageDom.attr('page-url').replace('{page}', pageData.curPage + 1)
        return
      }
    }
    if (this.areaType < 2) {
      this.areaType++
      this.nextPage = this.buildPageUrl()
      return
    }
    if (this.i < this.codes.length - 1) {
      this.i++
      this.areaType = 0
      this.nextPage = this.buildPageUrl()
      return
    }
    this.nextPage = ''
  }

  async processData (res) {
    const $ = cheerio.load(res.data)
    const total = parseInt($('h2.total>span').text().trim())
    if (total > 3000) {
      throw new Error('找到大于3000条数据，无法获取全部数据，请细化搜索条件:' + res.config.url)
    }
    this.processPage($)
    const a = $('ul.sellListContent>li div.title>a').toArray()

    let count = 0
    await Promise.all(a.map(async(x, i) => {
      const url = x.attribs.href
      const hid = url.slice(url.lastIndexOf('/') + 1, -5)
      const exists = await this.store.houseExists(hid)
      if (exists) {
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

  async processHouse (res) {
    if (res.status === 404) {
      return null
    }
    const $ = cheerio.load(res.data)
    const url = res.config.url.startsWith('http') ? res.config.url : res.config.baseURL + res.config.url
    const hid = url.slice(url.lastIndexOf('/') + 1, -5)
    const communityUrl = $('.communityName>a:first').attr('href')

    const baseInfoDom = $('div.base li')
    baseInfoDom.find('span').remove()
    const transactionDom = $('div.transaction li>span:last-child')

    const totalPrice = parseFloat($('.total').text())
    const buildArea = parseFloat(baseInfoDom.eq(2).text()) || null
    const buildPrice = buildArea ? (totalPrice * 10000) / buildArea : null
    const innerArea = parseFloat(baseInfoDom.eq(4).text()) || null
    const innerPrice = innerArea ? (totalPrice * 10000) / innerArea : null

    let lastDealAt = transactionDom.eq(2).text()
    lastDealAt = lastDealAt.length > 4 ? new Date(lastDealAt) : null
    let putawayAt = transactionDom.eq(0).text()
    putawayAt = putawayAt.length > 4 ? new Date(putawayAt) : null

    const navDom = $('div.fl.l-txt>a')

    const data = {
      cityName: navDom.eq(1).text().trim().slice(0, -3),
      district: navDom.eq(2).text().trim().slice(0, -3),
      region: navDom.eq(3).text().trim().slice(0, -3),
      // 房子id
      hid: hid,
      // 链接
      url: url,
      title: $('h1.main').text(),
      // 小区id
      // community: null,
      // 类型 1:新房 2:二手房
      type: 2,
      // 户型
      houseType: baseInfoDom.eq(0).text(),
      // 总价万
      price: totalPrice,
      // 建筑面积
      buildArea: buildArea,
      // 建面单价
      buildPrice: buildPrice,
      // 套内面积
      innerArea: innerArea,
      // 套内单价
      innerPrice: innerPrice,
      // 朝向
      orientation: baseInfoDom.eq(6).text().trim(),
      // 装修
      decoration: baseInfoDom.eq(8).text().trim(),
      // 电梯
      elevator: baseInfoDom.eq(10).text().trim() === '有',
      // 楼层
      floor: baseInfoDom.eq(1).text().trim(),
      // 户型结构
      houseStructure: baseInfoDom.eq(3).text().trim(),
      // 建筑类型
      buildType: baseInfoDom.eq(5).text().trim(),
      // 建筑结构
      buildStructure: baseInfoDom.eq(7).text().trim(),
      // 梯户比例
      ladderRat: baseInfoDom.eq(9).text().trim(),
      // 挂牌时间
      putawayAt: putawayAt,
      // 上次交易时间
      lastDealAt: lastDealAt,
      // 房屋年限
      houseYear: transactionDom.eq(4).text().trim(),
      // 抵押
      pledge: transactionDom.eq(6).text().trim(),
      // 产权类型
      propertyType: transactionDom.eq(1).text().trim(),
      // 房屋用途
      useWay: transactionDom.eq(3).text().trim(),
      // 产权所属
      propertyBelong: transactionDom.eq(5).text().trim(),
      // 上传房本备件
      certificate: transactionDom.eq(7).text().trim()
    }

    const houseTypeDetailDom = $('#infoList>div')
    data.houseTypeDetail = houseTypeDetailDom.map(i => {
      const temp = houseTypeDetailDom.eq(i).find('div')
      return {
        // 房间
        room: temp.eq(0).text().trim(),
        // 面积
        area: temp.eq(1).text().trim(),
        // 朝向
        orientation: temp.eq(2).text().trim(),
        // 窗户
        window: temp.eq(3).text().trim()
      }
    }).toArray()

    data.community = await this.getCommunityId(communityUrl)
    return data
  }

  async getCommunityId (url) {
    const self = this
    let cid = url.split('/')
    cid = cid[ cid.length - 2 ]
    let p = this.runningComunity.get(cid)
    if (!p) {
      p = findCommunity(cid)
      this.runningComunity.set(cid, p)
    }
    return p

    async function findCommunity (cid) {
      let exists = await self.store.communityExists(cid)
      if (!exists) {
        const res = await self.request(url)
        const data = await self.processCommunity(res)
        if (data) {
          exists = await self.store.saveCommunity(data)
        } else {
          return null
        }
      }
      return exists._id
    }
  }

  async processCommunity (res) {
    if (res.status !== 200) {
      return null
    }
    const $ = cheerio.load(res.data)
    const infos = $('span.xiaoquInfoContent').map((_, i) => i.children[ 0 ].data).toArray()
    let locationTmp = $('span.xiaoquInfoContent>span').attr('xiaoqu')
    if (!locationTmp) {
      const scripts = $('script[type=\'text/javascript\']:eq(3)').html()
      locationTmp = scripts.match(/resblockPosition:'(.+)',/)[ 1 ]
    }
    locationTmp = locationTmp.split(',')
    const location = `${locationTmp[ 1 ].slice(0, -1)},${locationTmp[ 0 ].slice(1)}`
    const idTmp = res.config.url.split('/')
    const url = res.config.url.startsWith('http') ? res.config.url : res.config.baseURL + res.config.url

    const navDom = $('div.fl.l-txt>a')

    const data = {
      cityName: navDom.eq(1).text().trim().slice(0, -2),
      district: navDom.eq(2).text().trim().slice(0, -2),
      region: navDom.eq(3).text().trim().slice(0, -2),
      url: url,
      cid: idTmp[ idTmp.length - 2 ],
      name: $('h1.detailTitle').text(),
      avgPrice: parseFloat($('span.xiaoquUnitPrice').text()) || null,
      builtYear: parseInt(infos[ 0 ]) || null,
      buildType: infos[ 1 ],
      serviceCompany: infos[ 3 ],
      servicePrice: infos[ 2 ],
      buildCompany: infos[ 4 ],
      buildingCount: parseInt(infos[ 5 ]) || null,
      houseCount: parseInt(infos[ 6 ]) || null,
      location: location
    }

    const dealRecordsDom = $('ol.frameDealListItem>li')
    data.dealRecords = dealRecordsDom.map((i, e) => {
      const li = dealRecordsDom.eq(i)
      const date = li.find('div.frameDealDate').text()
      return {
        houseType: li.find('div>div>a').text(),
        area: parseFloat(li.find('div.frameDealArea').text()) || null,
        date: date.length > 4 ? new Date(date) : null,
        price: parseFloat(li.find('div.frameDealPrice').text()) || null,
        unitPrice: parseFloat(li.find('div.frameDealUnitPrice').text()) || null
      }
    }).toArray()

    // const subWaysDom = $('#mapListContainer>ul>li')
    // data.subWays = subWaysDom.map(i => {
    //   const li = subWaysDom.eq(i)
    //   return {
    //     name: li.find('span.itemTitle').text(),
    //     line: li.find('div.itemInfo').text(),
    //     distance: li.find('span.itemdistance').text()
    //   }
    // }).toArray()

    return data
  }

}
