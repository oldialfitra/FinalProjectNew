module.exports = (req, res, next) => {
    if (req.session.company) {
        next()
    } else {
        res.redirect('/company/login')
    }
}