const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

module.exports = class MongoStore {
  constructor (conn) {
    this.connStr = conn
    this.counts = {
      house: 0,
      community: 0
    }
  }

  async init () {
    this.client = await mongoose.connect(this.connStr, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    const models = fs.readdirSync(path.join(__dirname, './models'))
    for (let m of models) {
      this.client.model(path.basename(m, '.js'), require(path.join(__dirname, './models', m)))
    }
    this.models = this.client.models
  }

  saveDistrict (data) {
    // this.count
    return this.models.district.create(data)
  }

  async getDistricts () {
    const data = await this.models.district.find()
    return data.map(d => d.toObject())
  }

  communityExists (cid) {
    return this.models.community.findOne({ cid })
  }

  saveCommunity (data) {
    this.counts.community++
    return this.models.community.create(data)
  }

  saveHouse (data) {
    if (Array.isArray(data)) {
      this.counts.house += data.length
      return this.models.house.insertMany(data)
    } else {
      this.counts.house += 1
      return this.models.house.create(data)
    }

  }

  houseExists (hid) {
    return this.models.community.findOne({ hid })
  }
}


