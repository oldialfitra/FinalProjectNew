const bcrypt = require('bcryptjs')

function cek(password, hash) {
    return bcrypt.compareSync(password, hash)
}

module.exports = cek