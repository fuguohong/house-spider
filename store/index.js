const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

module.exports = class MongoStore {
  constructor (conn) {
    this.connStr = conn
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
    await this.models.xiaoqu.create({
      name: '龙湖',
      avgPrice: 12000
    })
  }

}


