const mongoose = require('mongoose')

/**
 * 小区
 */
module.exports = new mongoose.Schema({
  // 所在城市
  cityName: String,
  // 所在行政区
  district: String,
  // 所在区域
  region: String,
  // 房子id
  hid: String,
  // 链接
  url: String,
  // 标题
  title: String,
  // 小区id
  community: {
    type: mongoose.ObjectId,
    ref: 'community'
  },
  // 类型 1:新房 2:二手房
  type: Number,
  // 总价万
  price: Number,
  // 建筑面积
  buildArea: Number,
  // 建面单价
  buildPrice: Number,
  // 套内面积
  innerArea: Number,
  // 套内单价
  innerPrice: Number,
  // 户型
  houseType: String,
  houseTypeDetail: [
    {
      // 房间
      room: String,
      // 面积
      area: String,
      // 朝向
      orientation: String,
      // 窗户
      window: String
    }],
  // 朝向
  orientation: String,
  // 装修
  decoration: String,
  // 电梯
  elevator: Boolean,
  // 楼层
  floor: String,
  // 户型结构
  houseStructure: String,
  // 建筑类型
  buildType: String,
  // 建筑结构
  buildStructure: String,
  // 梯户比例
  ladderRat: String,
  // 挂牌时间
  putawayAt: Date,
  // 上次交易时间
  lastDealAt: Date,
  // 房屋年限
  houseYear: String,
  // 抵押
  pledge: String,
  // 产权类型
  propertyType: String,
  // 产权所属
  propertyBelong: String,
  // 房屋用途
  useWay: String,
  // 上传房本备件
  certificate: String
}, {
  timestamps: true
})
