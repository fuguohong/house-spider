const { Schema } = require('mongoose')

module.exports = new Schema({
  cityName: String,
  name: String,
  code: String,
  regions: [
    {
      name: String,
      code: String
    }]
},{
  timestamps: true
})
