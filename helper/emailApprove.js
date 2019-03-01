const nodemailer = require('nodemailer')
const oldi = require('../oldi')
module.exports = (emailTo, emailFrom, firstName, lastName, jobName, date, company) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: oldi[0],
            pass: oldi[1]
        }
    });

    // let link = `http://localhost:3001/user/verify/${username}`
    let HelperOptions = {
        from: 'oldia9@gmail.com',
        to: 'oldia9@gmail.com',
        subject: 'Job Applicant',
        html: `Hello ${firstName} ${lastName},<br> At ${company} we never stand still and we never give up. We are always looking for top players to join our team.
        <br>With that we would like to share some interesting new jobs that matched your search agent.<br>
        Job Name: <br>
        ${jobName}
        We like to interiew for your applicant so you can come to our oofice at ${date}<br>
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