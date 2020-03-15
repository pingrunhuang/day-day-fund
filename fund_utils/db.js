const mongo = require('mongodb')

const db_client = mongo.MongoClient

const mgo_adr = "mongodb://localhost:27017/"
const UPDATE_AT = "update_at"

function batch_write(entries, filters, database, collection, isUnique=true){
    db_client.connect(mgo_adr, { useUnifiedTopology: true}, (err, dbConn)=>{
        if (err) throw err
        
        var dbo = dbConn.db(database)
        
        var fils = {}
        for (var i in filters){
            var fil = filters[i]
            fils[fil] = 1
        }

        dbo.createIndex(collection, fils, {unique: isUnique}, (err, indexName)=>{
            if (err) throw err

            console.log(indexName, "is created")
            var clc = dbo.collection(collection)

            var batch = clc.initializeOrderedBulkOp()
            var utc_now = new Date() // utc by default

            for (var x in entries){
                var fils = {}
                var entry = entries[x]
                for (var y in filters){
                    var fil = filters[y]
                    fils[fil] = entry[fil]
                }
                entry[UPDATE_AT] = utc_now
                batch.find(fils).upsert().updateOne({$set: entry})
            }

            batch.execute(function(err, result){
                if (err) throw err
                console.log("Finished: ", result)
                dbConn.close()
            })
        })
    })
}

async function query(filter, returnFields, database, collection){
    

}

module.exports = {
    batch_write,
    mgo_adr,
    db_client
}

