module.exports = (time) => {
    time = new Date(time).getTime()/1000
    let dateNow = new Date().getTime()/1000
    let temp = dateNow - time
    day = Math.floor(temp / (3600 * 24))
    hh = Math.floor(temp/ 3600)
    mm = Math.floor(temp/60)
    let result = null
    if (day === 0 && hh === 0) {
        if (mm === 1) {
            result = `${mm} minute ago`
        }
        else {
            result = `${mm} minutes ago`
        }
        
    } else if (day === 0) {
        if (hh === 1) {
            result = `${hh} hour ago` 
        }
        else {
            result = `${hh} hours ago`
        }
         
    } else if (day) {
        if (day === 1) {
            result = `${day} day ago`
        }
        else {
            result = `${day} days ago`
        }
        
    }
    return result
}