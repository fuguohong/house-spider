const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

module.exports = class MongoStore {
  constructor (conn) {
    this.connStr = conn
    this.count = 0
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
    this.count++
    data.cityName = '重庆'
    return this.models.district.create(data)
  }
}


