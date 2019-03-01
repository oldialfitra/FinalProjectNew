const nodemailer = require('nodemailer')
const oldi = require('../oldi')
module.exports = (email, username) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: oldi[0],
            pass: oldi[1]
        }
    });

    let link = `http://localhost:3001/company/verify/${username}`
    let HelperOptions = {
        from: oldi[0],
        to: email,
        subject: 'Authentification',
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
    }

    transporter.sendMail(HelperOptions, (err, info) => {
        if (err) {
            return console.log(err)
        } else {
            console.log('berhasil')
            console.log(info)
        }
    })
}