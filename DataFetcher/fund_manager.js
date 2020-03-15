// a very common situation where we need to iterate over the whole web page

const axios = require("axios")
const dbUtils = require("../fund_utils/db")

const MGO_DB = 'fund'
const MANAGER_CLC = 'managers'

const MANAGER_CODE = 'manager_code'
const MANAGER_NAME_CH = "manager_name_ch"
const FIRM_NAME = 'firm_name'
const FIRM_CODE = 'firm_code'
const MANAGED_FUNDS = 'managed_funds'
const BEST_RETURN_FUND_CODE = 'best_return_fund_code'
const BEST_RETURN_FUND_NAME = 'best_return_fund_name'
const BEST_RETURN_RATE = 'best_return_rate'
const BEST_RETURN_DAYS = 'best_return_days'
const MANAGED_CAPITAL = 'managed_capital'


function save(data){
    var entries = []
    for (var i in data){ // this is traversing the index
        var entry = data[i]
        if (entry.length != 12){
            console.log(entry, "not valid")
            break
        }
        var temp_entry = {}
        temp_entry[MANAGER_CODE] = entry[0]
        temp_entry[MANAGER_NAME_CH] = entry[1]
        temp_entry[FIRM_CODE] = entry[2]
        temp_entry[FIRM_NAME] = entry[3]
        temp_entry[MANAGED_FUNDS] = {}
        var fundCodes = entry[4].split(',')
        var fundNames = entry[5].split(',')
        for (var i=0; i<fundCodes.length;i++){
            temp_entry[MANAGED_FUNDS][fundCodes[i]] = fundNames[i]
        }
        temp_entry[BEST_RETURN_DAYS] = parseInt(entry[6])
        temp_entry[BEST_RETURN_RATE] = entry[7]
        temp_entry[BEST_RETURN_FUND_CODE] = entry[8]
        temp_entry[BEST_RETURN_FUND_NAME] = entry[9]
        temp_entry[MANAGED_CAPITAL] = entry[10]
        entries.push(temp_entry)
    }
    if (entries.length>0){
        console.log(entries[0])
        dbUtils.batch_write(entries, [MANAGER_CODE], MGO_DB, MANAGER_CLC)
    }else{
        throw TypeError("No qualified data")
    }
    
}

async function fetchManagers(page, size=100){
    var res = await axios.get('http://fund.eastmoney.com/Data/FundDataPortfolio_Interface.aspx', {
        params:{
            dt: 14, // data type
            mc: 'returnjson', 
            ft: 'all',
            pn: size,
            pi: page,
            sc: 'abbname',
            st: 'asc'
        }
    })
    eval(res.data)
    var data = returnjson['data']
    if (data.length > 0){
        save(data)
        return true
    }else{
        return false
    }
}

// TODO: fetch only one manager by name 

async function main() {
    var isContinue = true
    var page = 1
    while (isContinue){
        console.log("Running on page", page)
        isContinue = await fetchManagers(page)
        page+=1 
    }
}

main()