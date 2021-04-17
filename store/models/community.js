const { Schema } = require('mongoose')

/**
 * 小区
 */
module.exports = new Schema({
  // 所在城市
  cityName: String,
  // 所在行政区
  district: String,
  // 所在区域
  region: String,
  // 小区名称
  name: String,
  // 小区id
  cid: String,
  // 小区链接
  url: String,
  // 参考均价
  avgPrice: Number,
  // 建成年代
  builtYear: Number,
  // 建筑类型
  buildType: String,
  // 物业公司
  serviceCompany: String,
  // 物业费
  servicePrice: String,
  // 开发商
  buildCompany: String,
  // 楼数
  buildingCount: Number,
  // 房屋数
  houseCount: Number,
  // 位置
  location: String,
  // 容积率居然没有
  // 成交记录
  dealRecords:[{
    // 户型
    houseType: String,
    // 面积
    area: Number,
    // 日期
    date: Date,
    // 成交价万
    price: Number,
    // 单价元
    unitPrice: Number
  }],
  subWays:[{
    // 站点名称
    name: String,
    // 线路
    line: String,
    // 距离米
    distance: Number
  }]
},{
  timestamps: true
})
