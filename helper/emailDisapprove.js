const nodemailer = require('nodemailer')
const oldi = require('../oldi')
module.exports = (emailTo, emailFrom, firstName, lastName, jobName, company) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: oldi[0],
            pass: oldi[1]
        }
    });

    let HelperOptions = {
        from: 'oldia9@gmail.com',
        to: 'oldia9@gmail.com',
        subject: 'Job Applicant',
        html: `Hello ${firstName} ${lastName},<br>  We are really sorry because requirement for<br>
        Job name:<br>
        ${jobName}
        Not match with your skill, but we hope you have bright future<br>
        Thank You<br>
        ${company}`
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