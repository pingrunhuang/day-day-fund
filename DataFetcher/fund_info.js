const rp = require('request-promise')
const fs = require('fs')
const mongo = require('mongodb')
const axios = require('axios')
const DOMParser = require('xmldom').DOMParser
const extractCellValue = require('../fund_utils/common').extractCellValue
const dbUtils = require('../fund_utils/db')
const db_client = mongo.MongoClient

var mgo_adr = "mongodb://localhost:27017/";

const url = 'http://fund.eastmoney.com/js/fundcode_search.js';
const COMPONENT_CLC = 'components'
const MGO_DB = 'fund'

const COMPONENT_CODE = 'component_code'
const COMPONENT_NAME = 'component_name'
const WEIGHT = 'weight' // weight on the net value
const MARKET_CAP = 'market_cap_10000rmb'
const SHARES = 'shares'
const VALID_UNTIL = 'valid_until'
const COMPONENT_TYPE = 'component_type'
const FUND_CODE = 'fund_code'


var options = {
    method: 'GET',
    uri: url,
    gzip: true
};


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

fetchBondComponents('519688')
fetchStockComponents('519688')


// ['000985', '000297', '001178', '001562', '001718', '166002', '460005', '519069', '159905']

// rp(options).then(function (htmlString) {
//         // return data are stored in variable r
//         eval(htmlString)
//         console.log(r[0])
//         var N = r.length

//         db_client.connect(mgo_adr, function (err, db){
//             if (err) throw err
//             var dbo = db.db("fund")

//             dbo.createIndex(
//                 'symbols', {code: 1, symbol_en: 1}, {unique:true}, function (err, indexName){
//                     if (err) throw err

//                     console.log(indexName, "created");
//                     // Initialize the Ordered Batch
//                     var collection = dbo.collection("symbols");
//                     var batch = collection.initializeOrderedBulkOp();
//                     var utc_now = new Date(); // utc by default
//                     for (var i=0;i<N;i++){
//                         entry = r[i];
//                         var obj = { code: entry[0], symbol_en: entry[1], symbol_zh: entry[2], type: entry[3], update_at: utc_now};
//                         batch.find({code: entry[0]}).upsert().updateOne({$set: obj});
//                     };
//                     batch.execute(function(err, result){
//                         if (err) throw err
//                         console.log("Finished: ", result);
//                         db.close();
//                     });        
//                 }
//             )
//         })

//         fs.writeFile('codes.json', r, (err) => {
//             // throws an error, you could also catch it here
//             if (err) throw err;
//             // success case, the file was saved
//             console.log('fund codes saved!');
//         });


//     })
//     .catch(function (err) {
//         console.error("Failed", err)
//     });
