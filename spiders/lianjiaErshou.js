const cheerio = require('cheerio')
const BaseSpider = require('./base')

module.exports = class LianjiaErshou extends BaseSpider {

  async init () {
    await super.init()
    this.districts = await this.store.getDistricts()
    if (this.config.startUrl) {
      this.startUrl = this.config.startUrl
      const re = /.+\/(\w+)\/.+/
      const code = this.startUrl.match(re)[ 1 ]
      this.runningComunity = new Map()

      for (let i = 0; i < this.districts.length; i++) {
        let dst = this.districts[ i ]
        for (let j = 0; i < dst.regions.length; j++) {
          if (dst.regions[ j ].code === code) {
            this.i = i
            this.subI = j
            this.currentDst = dst
            this.currentRegion = dst.regions[ j ]
            return
          }
        }
      }
      throw new Error('未能解析startUrl')
    } else {
      this.i = 0
      this.subI = 0
      this.currentDst = this.districts[ 0 ]
      this.currentRegion = this.currentDst.regions[ 0 ]
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
    return `/ershoufang/${this.currentRegion.code}/${pageNum ? 'pg' +
      this.config.startPage : ''}co32sf1/`
  }

  processPage (dom) {
    if (this.config.maxPage && this.pageCount >= this.config.maxPage) {
      this.nextPage = ''
      return
    }
    const pageDom = dom('div.house-lst-page-box.page-box')
    const pageData = JSON.parse(pageDom.attr('page-data'))
    if (pageData.totalPage > pageData.curPage) {
      this.nextPage = pageDom.attr('page-url').replace('{page}', pageData.curPage + 1)
      return
    }
    if (this.subI < this.currentDst.regions.length - 1) {
      this.subI++
      this.currentRegion = this.currentDst.regions[ this.subI ]
      this.nextPage = this.buildPageUrl()
      return
    }
    if (this.i < this.districts.length - 1) {
      this.i++
      this.subI = 0
      this.currentDst = this.districts[ this.i ]
      this.currentRegion = this.currentDst.regions[ this.subI ]
      this.nextPage = this.buildPageUrl()
      return
    }
    this.nextPage = ''
  }

  async processData (res) {
    const $ = cheerio.load(res.data)
    this.processPage($)
    const a = $('ul.sellListContent>li div.title>a').toArray()
    let houseArray = await Promise.all(a.map(async(x, i) => {
      const url = x.attribs.href
      const hid = url.slice(url.lastIndexOf('/') + 1, -5)
      const exists = await this.store.houseExists(hid)
      if (exists) {
        return null
      }
      const res = await this.request(url)
      return this.processHouse(res)
    }))
    console.log('当前列表页数据已爬完，开始存储数据')
    houseArray = houseArray.filter(h => h)
    await this.store.saveHouse(houseArray)
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

    const data = {
      cityName: this.currentDst.cityName,
      district: this.currentDst.name,
      region: this.currentRegion.name,
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
    const locationTmp = $('span.xiaoquInfoContent>span').attr('xiaoqu').split(',')
    const location = `${locationTmp[ 1 ].slice(0, -1)},${locationTmp[ 0 ].slice(1)}`
    const idTmp = res.config.url.split('/')
    const url = res.config.url.startsWith('http') ? res.config.url : res.config.baseURL + res.config.url

    const data = {
      cityName: this.currentDst.cityName,
      district: this.currentDst.name,
      region: this.currentRegion.name,
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
