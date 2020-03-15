function extractCellValue(cell){
    var res = null
    try {
        res = cell.childNodes['0'].nodeValue.trim()
    } catch (TypeError) {
        console.log('Missing value in', cell)
    }
    return res
}

module.exports ={
    extractCellValue
}