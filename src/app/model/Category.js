const Base = require('./Base')
const db = require('../../config/db')

Base.init({ table: 'categories' })
module.exports = {
    ...Base
}