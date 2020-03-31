const axios = require('axios')
const DOMParser = require('xmldom').DOMParser
const extractCellValue = require('../fund_utils/common').extractCellValue
const dbUtils = require('../fund_utils/db')
const consts = require("../fund_utils/const")

const MGO_DB = consts.MGO_DB
const SYMBOL_CLC = consts.SYMBOLS_CLC
const COMPONENT_CLC = consts.COMPONENT_CLC
const SYMBOL_EN = consts.SYMBOL_EN
const SYMBOL_ZH = consts.SYMBOL_ZH
const TYPE = consts.TYPE
const COMPONENT_CODE = consts.COMPONENT_CODE
const COMPONENT_NAME = consts.COMPONENT_NAME
const WEIGHT = consts.WEIGHT// weight on the net value
const MARKET_CAP = consts.MARKET_CAP
const SHARES = consts.SHARES
const VALID_UNTIL = consts.VALID_UNTIL
const COMPONENT_TYPE = consts.COMPONENT_TYPE
const FUND_CODE = consts.FUND_CODE

// fund |<- bonds
//      |<- stocks 

function decodeComponentTable(html, fundCode, type){
    var doc = new DOMParser().parseFromString(html, 'text/xml')

    // this to prevent multi table return
    var latestDom =  doc.getElementsByTagName('div')['0'].firstChild
    // console.log(latestDom)
    var dt = latestDom.firstChild.lastChild.lastChild.childNodes['0'].nodeValue.trim()
    var trs = latestDom.childNodes['2'].lastChild.childNodes
    var rows = trs.length
    result = []
    for (var i=0;i<rows;i++){
        var mgoEntry = {}
        var rowEle = trs[i.toString()]

        mgoEntry[VALID_UNTIL] = new Date(dt)
        if (type == 'bond'){
            mgoEntry[COMPONENT_CODE] = extractCellValue(rowEle.childNodes['1'])
            mgoEntry[COMPONENT_NAME] = extractCellValue(rowEle.childNodes['2'])
            mgoEntry[WEIGHT] = extractCellValue(rowEle.childNodes['3'])
            mgoEntry[SHARES] = null
            mgoEntry[MARKET_CAP] = extractCellValue(rowEle.childNodes['4'])
        }else if (type == 'stock'){
            mgoEntry[COMPONENT_CODE] = extractCellValue(rowEle.childNodes['1'].firstChild)
            mgoEntry[COMPONENT_NAME] = extractCellValue(rowEle.childNodes['2'].firstChild)
            mgoEntry[WEIGHT] = extractCellValue(rowEle.childNodes['6'])
            mgoEntry[SHARES] = extractCellValue(rowEle.childNodes['7'])
            mgoEntry[MARKET_CAP] = extractCellValue(rowEle.childNodes['8'])
        }
        mgoEntry[COMPONENT_TYPE] = type
        mgoEntry[FUND_CODE] = fundCode
        result.push(mgoEntry)
    }
    return result
}


async function fetchStockComponents(fundCode){
    var res = await axios.get('http://fund.eastmoney.com/f10/FundArchivesDatas.aspx', {
            params: {
                type: 'jjcc',
                code: fundCode,
                topline: 100
            }
        }
    )
    eval(res.data)
    if (apidata['content']==""){
        console.log("No stocks info provided for ", fundCode)
    }else{
        let html = apidata['content']
        let stocks = decodeComponentTable(html, fundCode, 'stock')
        dbUtils.batch_write(stocks, [VALID_UNTIL, FUND_CODE, COMPONENT_CODE], MGO_DB, COMPONENT_CLC)
    }
}

async function fetchBondComponents(fundCode){
    var res = await axios.get('http://fundf10.eastmoney.com/FundArchivesDatas.aspx', {
            params: {
                type: 'zqcc',
                code:fundCode
            }
        }
    )
    eval(res.data)
    if (apidata['content']==""){
        console.log("No bonds info provided for ", fundCode)
    }else{
        let html = apidata['content']
        let bonds = decodeComponentTable(html, fundCode, 'bond')
        dbUtils.batch_write(bonds, [VALID_UNTIL, FUND_CODE, COMPONENT_CODE], MGO_DB, COMPONENT_CLC)
    }
}

async function fetchFundInfo(){
    var res = await axios.get('http://fund.eastmoney.com/js/fundcode_search.js')
    eval(res.data)
    var data = r
    symbols = []
    for (var d of data){
        entry = {}
        entry[FUND_CODE] = d[0]
        entry[SYMBOL_EN] = d[1]
        entry[SYMBOL_ZH] = d[2]
        entry[TYPE] = d[3]
        symbols.push(entry)
    }
    dbUtils.batch_write(symbols, [FUND_CODE], MGO_DB, SYMBOL_CLC)
}

var code = ''
fetchBondComponents(code)
fetchStockComponents(code)
// fetchFundInfo()