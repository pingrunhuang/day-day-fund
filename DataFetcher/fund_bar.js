const dbUtils = require("../fund_utils/db")
const axios = require("axios")
const common = require('../fund_utils/common')
const DOMParser = require('xmldom').DOMParser
const consts = require('../fund_utils/const')

const extractCellValue = common.extractCellValue
const MGO_DB = consts.MGO_DB
const SYMBOLS_CLC = consts.SYMBOLS_CLC
const BAR_CLC = consts.BAR_CLC
const FUND_CODE = consts.FUND_CODE
const DATETIME = consts.DATETIME
const NET_VALUE_UNIT = consts.NET_VALUE_UNIT
const NET_VALUE_ACC = consts.NET_VALUE_ACC
const DAILY_GROWTH_RATE = consts.DAILY_GROWTH_RATE
const BUYABLE = consts.BUYABLE
const SALEABLE = consts.SALEABLE


function table2List(html, fundCode){
    var doc = new DOMParser().parseFromString(html, 'text/xml')
    var trs = doc.getElementsByTagName('tbody')['0'].childNodes
    var rows = trs.length
    result = []
    for (var i=0;i<rows;i++){
        var mgoEntry = {}
        var rowEle = trs[i.toString()]
        var dtStr = rowEle.childNodes['0'].childNodes['0'].nodeValue.trim()
        if (dtStr == '暂无数据!'){
            break
        }
        mgoEntry[DATETIME] = new Date(dtStr)
        mgoEntry[NET_VALUE_UNIT] = extractCellValue(rowEle.childNodes['1'])
        mgoEntry[NET_VALUE_ACC] = extractCellValue(rowEle.childNodes['2'])
        mgoEntry[DAILY_GROWTH_RATE] = extractCellValue(rowEle.childNodes['3'])
        if (extractCellValue(rowEle.childNodes['4']) == '开放申购'){
            mgoEntry[BUYABLE] = true
        }else{
            mgoEntry[BUYABLE] = false
        }
        if (extractCellValue(rowEle.childNodes['5']) == '开放赎回'){
            mgoEntry[SALEABLE] = true
        }else{
            mgoEntry[SALEABLE] = false
        }
        mgoEntry[FUND_CODE] = fundCode

        result.push(mgoEntry)
    }
    return result
}


async function fetchBar(fundCode, page=null, dt1=null, dt2=null, size=20){

    size = Math.min(49, size) // could not exceed 49
    var params = {
        type: 'lsjz',
        code: fundCode,
        per: size
    }
    if (page != null){
        params['page'] = page
    }
    if (dt1 != null){
        params['sdate'] = dt1
    }
    if (dt2 != null){
        params['edate'] = dt2
    }

    var response = await axios('http://fund.eastmoney.com/f10/F10DataApi.aspx', {
        params: params
    })
    eval(response.data)
    var html = apidata['content']

    var entries = table2List(html, fundCode)

    if (entries.length>0){
        dbUtils.batch_write(entries, [DATETIME, FUND_CODE], MGO_DB, BAR_CLC)
        return true
    }else{
        return false
    }   
}

async function fetchHistoricalBar(fundCode){
    var isContinued = true
    var page = 1
    while (isContinued){
        console.log("current page:", page.toString())
        isContinued = await fetchBar(fundCode, page)
        page+=1
    }
    console.log("Finished")
}

async function fetchAllHistoricalBar(){
    // todo
    var dbConn = await dbUtils.db_client.connect(dbUtils.mgo_adr, {useUnifiedTopology:true})
    var dbo = dbConn.db(MGO_DB)
    var clc = dbo.collection(SYMBOLS_CLC)
    var entries = clc.find({})

    entries.toArray((err, result)=>{
        if (err) throw err
        for (var entry of result){
            console.log(entry['code'])
            fetchHistoricalBar(entry['code'])
        }
        dbConn.close()
    })
}

var fund_code = ''
fetchHistoricalBar(fund_code)
