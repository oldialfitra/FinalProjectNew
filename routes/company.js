const router = require('express').Router()
const sequelize = require('sequelize')
const Op = sequelize.Op
const { User, Job, UserJob, Company } = require('../models')
const emailApproved = require('../helper/emailApprove')
const emailDisapproved = require('../helper/emailDisapprove')
const bcrypt = require('bcryptjs')
const userMiddleWare = require('../middleware/companyMiddleware')

router.get('/register', (req, res) => {
    if (req.query.err) {
        errMessage = req.query.err
    }
    res.render('companyRegister', { errMessage })
})

router.post('/register', (req, res) => {
    Company.create({
            companyname: req.body.companyname,
            address: req.body.address,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            verified: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        .then(function() {
            res.redirect('/company/login')
        })
        .catch(function(err) {
            res.redirect(`/company/register?err=${err}`)
        })
})

router.get('/verify/:usernameCompany', (req, res) => {
    Company.update({
            verified: 1
        }, {
            where: {
                username: req.params.usernameCompany
            }
        })
        .then(function() {
            res.redirect('/company/login')
        })
        .catch(function(err) {
            res.send(err)
        })
})

router.get('/login', (req, res) => {
    let errMessage
    if (req.query.err) {
        errMessage = req.query.err
    }
    res.render('companyLogin', { errMessage })
})

router.post('/login', (req, res) => {
    Company.findOne({
            where: {
                username: req.body.username
            }
        })
        .then(function(dataOne) {
            console.log(dataOne.dataValues)
            if (dataOne === null) {
                res.send(`No username ${req.body.username} registered`)
            } else {
                if (dataOne.verified === 0) {
                    console.log('gagagagagagagagagal')
                    res.redirect('/')
                } else {
                    console.log(dataOne.dataValues)
                    if (bcrypt.compareSync(req.body.password, dataOne.password)) {
                        req.session.company = {
                            id: dataOne.id,
                            username: dataOne.username
                        }
                        res.redirect(`/company/profile`)
                    } else {
                        throw 'wrong password'
                    }
                }
            }
        })
        .catch(function(err) {
            res.redirect(`/company/login?err=${err}`)
        })
})

router.get('/profile', userMiddleWare, (req, res) => {
    Company.findOne({
            where: {
                id: req.session.company.id
            },
            include: {
                model: Job,
                include: {
                    model: User
                }
            }
        })
        .then(company => {
            // res.send(company)
            res.render('homeCompany', { data: company })
        })
        .catch(err => {
            res.send(err)
        })
})

router.get('/createJob', userMiddleWare, (req, res) => {
    res.render('companyCreateJob')
})

router.post('/createJob', (req, res) => {
    Job.create({
            jobname: req.body.jobname,
            position: req.body.position,
            salary: req.body.salary,
            requirement_ipk: req.body.requirement_ipk,
            requirement_skill: req.body.requirement_skill,
            CompanyId: req.session.company.id
        })
        .then(function() {
            res.redirect('/company/profile')
        })
        .catch(function(err) {
            res.send(err)
        })
})

router.post('/approve/:UserId/:JobId', userMiddleWare, (req, res) => {
    UserJob.update({
            status: 'approved',
            interviewDate: req.params.date
        }, {
            where: {
                UserId: req.params.UserId,
                JobId: req.params.JobId
            }
        })
        .then(data => {
            User.findOne({
                    where: {
                        id: req.params.UserId
                    },
                    include: [{
                        model: Job,
                        include: {
                            model: Company
                        },
                        where: {
                            id: req.params.JobId
                        }
                    }]
                })
                .then(function(dataOne) {
                    // res.send(dataOne.Jobs[0])
                    return emailApproved(dataOne.email, dataOne.Jobs[0].Company.email, dataOne.firstname, dataOne.lastname, dataOne.Jobs[0].jobname, dataOne.Jobs[0].UserJob.interviewDate, dataOne.Jobs[0].Company.companyname)

                })
                .then(function() {
                    res.redirect('/company/profile')
                })
                .catch(function(err) {
                    res.send(err)
                })
        })
        .catch(err => {
            res.send(err)
        })
})

router.post('/disapprove/:UserId/:JobId', userMiddleWare, (req, res) => {
    UserJob.update({
            status: 'disapproved'
        }, {
            where: {
                UserId: req.params.UserId,
                JobId: req.params.JobId
            }
        })
        .then(data => {
            User.findOne({
                    where: {
                        id: req.params.UserId
                    },
                    include: [{
                        model: Job,
                        include: {
                            model: Company
                        },
                        where: {
                            id: req.params.JobId
                        }
                    }]
                })
                .then(function(dataOne) {
                    // res.send(dataOne.Jobs[0])
                    return emailDisapproved(dataOne.email, dataOne.Jobs[0].Company.email, dataOne.firstname, dataOne.lastname, dataOne.Jobs[0].jobname, dataOne.Jobs[0].Company.companyname)

                })
                .then(function() {
                    res.redirect('/company/profile')
                })
                .catch(function(err) {
                    res.send(err)
                })
        })
        .catch(err => {
            res.send(err)
        })
})

router.get('/:userId/download', userMiddleWare, (req, res) => {
    User.findByPk(req.params.userId)
        .then(function(data) {
            res.download(data.CV)
        })
        .catch(function(err) {
            res.send(err)
        })
})


router.get('/getSession', (req, res) => {
    res.send(req.session)
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})


module.exports = router