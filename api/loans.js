var request = require('request');
const fs = require('fs')
const reader = require('xlsx')
var dateFormat = require('date-format');
// var dateFormat = require('dateformat');
var EventEmitter = require("events").EventEmitter;
var MongoClient = require('mongodb').MongoClient;
const date = require('date-and-time')
//var url = "mongodb://localhost:27017/IntainMarkets";
// var url = "mongodb://104.42.155.78:27017/IntainMarkets";
// var url = "mongodb://mongoservice:27017/IntainMarkets";
var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";
const winlog = require("../log/winstonlog");
var path = require("path");
const previewjs = require('./Preview');
const pools = require('./pools')
var loans = {

    // onboardloans: function (req, res, next) {
    //     if (!req.body.filename) {
    //         res.status(400).send({ "message": "Missing Arguments!" })
    //     }
    //     else {

    //         var filename = req.body.filename;
    //         var uploadname;

    //         //check file path
    //         if (fs.existsSync("./uploads/" + filename)) {
    //             winlog.info("file found");
    //             uploadname = "./uploads/" + filename;

    //             const path = uploadname;
    //             winlog.info("pathhhhh" + path);

    //             var key = [];
    //             var finalarr = [];

    //             var wb = xl.readFile(path, { cellDates: true }, { sheetStubs: true });
    //             var ws = wb.Sheets[wb.SheetNames[0]];

    //             var rows = xl.utils.sheet_to_json(ws, {
    //                 header: 0,
    //                 defval: ""
    //             });

    //             winlog.info("first:  " + JSON.stringify(rows[0]) + "   len: " + rows.length);

    //             var t1 = Object.keys(rows[0]);
    //             winlog.info("t1:::" + t1);

    //             var names = String(t1).split(",");
    //             winlog.info("key::;" + key.length + "   keys:   " + JSON.stringify(names));


    //             for (var k = 0; k < names.length; ++k) {

    //                 if ((names[k].toLowerCase()).includes("empty")) {

    //                 }
    //                 else {
    //                     key.push(names[k]);
    //                 }
    //             }

    //             k = 0;
    //             while (k < rows.length) {
    //                 var json = {};
    //                 for (var p = 0; p < key.length; p++) {
    //                     if (String(key[p]).includes("date") || (String(key[p]).includes("Date")) || String(rows[k][key[p]]).includes(':')) {

    //                         if (String(rows[k][key[p]]) == "null" || String(rows[k][key[p]]) == "" || rows[k][key[p]] == "") {
    //                             json[key[p]] = "";
    //                         }
    //                         else {
    //                             if (rows[k][key[p]] instanceof Date) {
    //                                 // //yyyy-mm-dd
    //                                 var d1 = new Date(rows[k][key[p]]);
    //                                 var arr = [1, 3, 5, 7, 8, 10, 12];

    //                                 if (!arr.includes(d1.getMonth() + 1)) {
    //                                     if (d1.getDate() == 30) {
    //                                         var tempdate = "1";
    //                                         var d = d1.getMonth() + 2;
    //                                     } else {
    //                                         var tempdate = d1.getDate() + 1;
    //                                         if (d1.getMonth() < 9) {
    //                                             var d = "0" + String(d1.getMonth() + 1);
    //                                         } else {
    //                                             var d = d1.getMonth() + 1;
    //                                         }
    //                                     }
    //                                 } else {
    //                                     var tempdate = d1.getDate() + 1;
    //                                     if (d1.getMonth() < 9) {
    //                                         var d = "0" + String(d1.getMonth() + 1);
    //                                     } else {
    //                                         var d = d1.getMonth() + 1;
    //                                     }
    //                                 }
    //                                 if (k == 0) {
    //                                     winlog.info(d1 + "   year:: " + d1.getFullYear() + "  month:: " + (d) + "  date:: " + (d1.getDate() + 1));
    //                                 }
    //                                 rows[k][key[p]] = d1.getFullYear() + "-" + d + "-" + (tempdate);
    //                             }
    //                         }
    //                         json[key[p]] = String(rows[k][key[p]]);
    //                     }
    //                     else {
    //                         json[key[p]] = String(rows[k][key[p]]);
    //                     }
    //                     json['loandata'] = "yes";
    //                     json['contractdata'] = "no";
    //                     json['status'] = "Unmapped";
    //                     json['createddate'] = String(new Date().toJSON()).substring(0, 10);
    //                 }//end of for
    //                 finalarr.push(json);
    //                 ++k;
    //             }//end of while

    //             winlog.info("finalar:: " + JSON.stringify(finalarr[finalarr.length - 1]) + "   len:: " + finalarr.length);
    //             winlog.info("finalar:: " + JSON.stringify(finalarr[0]));

    //             // save to db
    //             MongoClient.connect(url, function (err, client) {
    //                 const db = client.db("IntainMarkets");
    //                 winlog.info("connected");
    //                 db.collection('LoanData').insertMany(finalarr, function (err, result) {
    //                     if (err) return winlog.info(err)
    //                     winlog.info("Number of documents inserted: " + result);
    //                     winlog.info('saved to database')
    //                     res.send({ "success": true, "result": "Data Saved!" });
    //                 });
    //             });
    //         } else {
    //             res.send({ "success": false, "result": "File not found!" });
    //         }
    //     }
    // },//end of onboardloans




    fetchkeysofonboardedloans: function (req, res, next) {
        // check for the args 
        if (!req.body.filename || !req.body.issuerId || !req.body.asset_class) {
            res.status(400).send({ "message": "Missing Arguments!" })
        }
        else {
            //  var lmscollection = req.query.poolname + "_lms"
            //    var filename = req.query.poolname + req.query.filetype;
            var filetype = req.body.filename.split('.');
            //  var poolid = req.query.poolid;
            var uploadname = "./uploads/" + req.body.filename;
            //  const path = uploadname;
            var dealids = [];

            var event1 = new EventEmitter();
            var saveLMS = new EventEmitter();

            var getAttributeNames = new EventEmitter();
            var readFile = new EventEmitter();
            var key = [];
            var count = 0;
            var count1 = 0;
            var attributeList = [];
            var darray = [];
            var finalarr = [];

            var filepath1 = path.join(uploadname);

            if (fs.existsSync(filepath1)) {
                var file = filepath1;
                const workbook = reader.readFile(file);
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const options = { header: 1 };
                const sheetData = reader.utils.sheet_to_json(worksheet, options);
                const header = sheetData.shift();
                console.log(header)
                let finaljson = {}
                finaljson.asset_class = req.body.asset_class;
                finaljson.verificationtemplate = req.body.verificationtemplate;
                finaljson.filename = req.body.filename
                finaljson.key = header
                res.send({ "sucess": "true", "data": finaljson })

            } else {
                res.send({ "sucess": "false", "data": "File doesnot exist" })
                console.log("file doesnot exist")
            }
            //check filetype
            /*       if (filetype[1] == "xlsx" || filetype[1] == "xls" || filetype[1] == "xlsm") {
                        winlog.info(filetype[0] + " :::pathhhhh" + path + ":::" + filetype[1]);
        
                        if (fs.existsSync(path)) {
                            winlog.info("File exist!");
                            MongoClient.connect(url, async function (err, client) {
                                if (err) throw err;
                                const db = client.db("IntainMarkets");
                                winlog.info('CONNECTED');
                                const file = reader.readFile(path);
                                var duplicate = 0;
                                var Num = [];
                                var dateArr = [];
                                var flag = 0;
                                let data = []
                                winlog.info(file.SheetNames + "::");
                                
                                const temp = reader.utils.sheet_to_json(
                                    file.Sheets[file.SheetNames[0]])
                                temp.forEach((res) => {
                                    data.push(res)
        
                                })
                                key = Object.keys(data[0])
                                const key1 = Object.keys(data[0]).length;
                                winlog.info("key1::lenghth " + key1);
                                let finaljson = {}
                                finaljson.asset_class = req.body.asset_class;
                                finaljson.verificationtemplate = req.body.verificationtemplate;
                                finaljson.filename = req.body.filename
                                finaljson.key = key
                                res.send({ "sucess": "true", "data": finaljson })
                                // finalarraykey = Object.keys(req.body.finalarr[0])
                                //  var loc = key.indexOf("Loan ID");
                                // var loc = finalarraykey.indexOf("Loan ID")
                            })
                        }
        
                    }*/
        }
    },
    //-----------------------------------------------------------------------------------------------------------------

    getallloans: function (req, res, next) {
        if (!req.query.issuerId) {
            res.status(400).send({ "message": "Missing Arguments!" })
        }
        else {
            MongoClient.connect(url, function (err, client) {
                if (err) {
                    var responseMessage = {
                        "isSuccess": false,
                        "statuscode": 500,
                        "message": "Internal Server Error: Database connection failed."
                    };
                    winlog.error(JSON.stringify(responseMessage));
                    winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                    return res.status(500).send(responseMessage);
                }
                const db = client.db("IntainMarkets");
                const projection = { "Loan ID": 1, "Asset Class": 1, "Originator Name": 1, "Original Principal Balance": 1, "As Of Date": 1, "Loan Data": 1, "Contract Digitized": 1, "Status": 1 };
                db.collection('previewstdloantape').find({ 'issuerId': req.query.issuerId, "Loan ID": { $exists: true } }).project(projection).toArray(function (err, result) {
                    if (err) {
                        var responseMessage = {
                            "isSuccess": false,
                            "statuscode": 500,
                            "message": "Internal Server Error: Database connection failed."
                        };
                        winlog.error(JSON.stringify(responseMessage));
                        winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                       client.close();
                        return res.status(500).send(responseMessage);
                    }
                    if (result.length > 0) {
                        res.send(result);
                    } else {
                        res.send([]);
                    }
                    client.close();

                });
            });
             
        
        }
    },//end of getallloans   updateLoanStatus
    getloansbyarayofloanhashes: function (req, res, next) {

        if (!req.query.loanhashes) {
            res.status(400).send({ "message": "Missing Arguments!" })
        }
        else {
            var loanids = String(req.query.loanhashes).split(",");
            var finalarr = [];
            MongoClient.connect(url, function (err, client) {
                if (err) {
                    var responseMessage = {
                        "isSuccess": false,
                        "statuscode": 500,
                        "message": "Internal Server Error: Database connection failed."
                    };
                    winlog.error(JSON.stringify(responseMessage));
                    winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                    return res.status(500).send(responseMessage);
                }
                const db = client.db("IntainMarkets");
                for (var i = 0; i < loanids.length; ++i) {
                    winlog.info(loanids[i]);
                    db.collection('previewstdloantape').find({ 'Loan ID': String(loanids[i]) }).toArray(function (err, result) {
                        if (err) {
                            var responseMessage = {
                                "isSuccess": false,
                                "statuscode": 500,
                                "message": "Internal Server Error: Database connection failed."
                            };
                            winlog.error(JSON.stringify(responseMessage));
                            winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                            client.close();
                            return res.status(500).send(responseMessage);
                        }
                        winlog.info("res:: " + result.length);
                        if (result.length > 0) {
                            finalarr.push(result[0]);
                        }
                    });
                }
                client.close();

            });
        

            setTimeout(function () {
                res.send(finalarr);
            }, 1000);


        }
    },//end of getloansbyarayofloanhashes
    updateLoanStatus: function (req, res, next) {

        if (!req.query.loanid || !req.query.status) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            let userid = ""
           
            MongoClient.connect(url, async function (err, client) {
                if (err) {
                    var responseMessage = {
                        "isSuccess": false,
                        "statuscode": 500,
                        "message": "Internal Server Error: Database connection failed."
                    };
                    winlog.error(JSON.stringify(responseMessage));
                    winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                    return res.status(500).send(responseMessage);
                }
                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');

                // db.collection('lms').updateOne({ "LoanID": req.query.loanid }, { $set: { Status: req.query.status } }, function (err, result) {
                console.log("inside")
                let query = {
                    Status: req.query.status
                }
                if (req.query.status === "Unmapped") {
                    console.log("inside")
                    query = {
                        Status: req.query.status,
                        "poolid": "",

                    }
                }
                let loandocument = await db.collection('previewstdloantape').findOne({ "Loan ID": req.query.loanid, "poolid": req.query.poolid })
                console.log(loandocument)
                await db.collection('previewstdloantape').updateOne({ "Loan ID": req.query.loanid, "poolid": req.query.poolid }, { $set: query })
                if (req.query.status == "Unmapped") {
                    let latestDocument = await db.collection('pool_detail').findOne({ "poolID": req.query.poolid });

                    let loanid = [];
                    let originalbalance = 0;
                    console.log(latestDocument)
                    if (latestDocument.loanids.length > 0) {
                        loanid = (latestDocument.loanids).split("#")
                        loanid = loanid.filter(item => item !== req.query.loanid);
                        originalbalance = latestDocument.originalbalance - loandocument["Original Principal Balance"]

                    }
                    console.log(loanid)
                    let loanids = "";
                    let poolquery = {
                        loanids: loanid.join("#"),
                        numberofloans: String(loanid.length),
                        originalbalance: String(originalbalance)
                    }
                    console.log(poolquery)
                    await db.collection('pool_detail').updateOne({ "poolID": req.query.poolid }, { $set: poolquery });
                    
    
                        const result2 = await db.collection('previewnotification').updateMany(
                            { poolid: req.query.poolid },
                            { $pull: { unreadloanlist: req.query.loanid } }
                        );
                        console.log("count::::  " + result2.modifiedCount)
                    
                   
                    res.send({
                        "isSuccess": true,
                        "message": "Loan UnMapped from the Pool successfully"
                    });
                    client.close();

                } else {
                    if (req.query.status === "Reconsider") {
                        console.log("inside notification update::::::" + loandocument.issuerId)

                        const result2 = await db.collection('previewnotification').updateMany(
                            { poolid: req.query.poolid, userid: loandocument.issuerId },
                            { $addToSet: { unreadloanlist: req.query.loanid } }
                        );
                        console.log("count::::  " + result2.modifiedCount)
                    }
                    res.send({
                        "isSuccess": true,
                        "message": "Loan Status Updated successfully"
                    });
                    client.close();
                }

                //bdb inside
                var bdbjs = {

                    loanid: [req.query.loanid],
                    functiontodo: "update",
                    issuerId: loandocument.issuerId
                }
                pools.bdbpost(req, res, db, bdbjs);

            })
        
       
            //     console.log(lastestDocument)
            // await db.collection('previewstdloantape').updateOne({ "Loan ID": req.query.loanid }, { $set: query }, function (err, result) {
            //     //winlog.info("Lengthof result" + result.length);
            //     // if (result.length > 0) {
            //     if (err) throw err;


            //         res.send({
            //             "isSuccess": true,
            //             "message": "loan status updated sucessfully"
            //         });

            //     // }
            //     // else {
            //     //     var json = {
            //     //         "isSuccess": false,
            //     //         "message": "No loan data found with loanid " + req.query.loanid
            //     //     }

            //     //     res.send(json);

            //     // }
            // })



        }
    },

    updateArrayofLoanStatus: function (req, res, next) {

        if (!req.body.loanid || !req.body.status) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            var loanid = req.body.loanid;
            var count = 0;
            
            MongoClient.connect(url, function (err, client) {
                if (err) {
                    var responseMessage = {
                        "isSuccess": false,
                        "statuscode": 500,
                        "message": "Internal Server Error: Database connection failed."
                    };
                    winlog.error(JSON.stringify(responseMessage));
                    winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                    return res.status(500).send(responseMessage);
                } const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');


                loanid.forEach(ID => {

                    db.collection('previewstdloantape').updateOne({ "Loan ID": ID }, { $set: { Status: req.body.status } }, function (err, result) {
                        winlog.info("Lengthof result" + JSON.stringify(result));
                        // if (result.length > 0) {
                        if (err) {
                            var responseMessage = {
                                "isSuccess": false,
                                "statuscode": 500,
                                "message": "Internal Server Error: Database connection failed."
                            };
                            winlog.error(JSON.stringify(responseMessage));
                            winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                            return res.status(500).send(responseMessage);
                        } count++;
                        if (count == loanid.length) {
                            winlog.info(`updated: ${count} documents`)

                            res.send({
                                "isSuccess": true,
                                "message": "loan status updated sucessfully"
                            });
                            client.close();
                        }
                        // }
                        // else {
                        //     var json = {
                        //         "isSuccess": false,
                        //         "message": "No loan data found with loanid " + req.query.loanid
                        //     }

                        //     res.send(json);

                        // }
                    })

                });
            });
        

        }
    },



    // filterloans: function (req, res, next) {
    //     if (
    //         !req.body.mindate || !req.body.maxdate || !req.body.assetclass || !req.body.issuerId) {
    //         res.status(400).send({ "message": "Missing Arguments!" })
    //     } else {
    //         MongoClient.connect(url, function (err, client) {
    //             const db = client.db("IntainMarkets");


    //             // var key = 'Amount';//'current_principal';
    //             var query = {
    //                 'Asset Class': req.body.assetclass,
    //                 'Created Date': { $gte: String(req.body.mindate), $lte: String(req.body.maxdate) }, 'issuerId': req.body.issuerId, 'Status': 'Unmapped'
    //             };
    //             //   query[key] = { $gt: String(req.body.minprincipalamt), $lt: String(req.body.maxprincipalamt) }
    //             winlog.info(JSON.stringify(query));

    //             db.collection('lms').find(query).toArray(function (err, result) {
    //                 winlog.info("res:: " + result.length);
    //                 if (result.length > 0) {
    //                     var json = { "success": true, "data": result }
    //                     winlog.info("json::  " + JSON.stringify(json));
    //                     res.send(json);
    //                 } else {
    //                     var json = { "success": false, "data": [] }
    //                     winlog.info("json::  " + JSON.stringify(json));
    //                     res.send(json);
    //                 }
    //             });

    //         }); // mongo end
    //     }
    // },

    filterloans: function (req, res, next) {
        if (
            !req.body.mindate || !req.body.maxdate || !req.body.assetclass || !req.body.issuerId || !req.body.minprincipalamt || !req.body.maxprincipalamt || !req.body.contractdata) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            MongoClient.connect(url, function (err, client) {
                if (err) {
                    var responseMessage = {
                        "isSuccess": false,
                        "statuscode": 500,
                        "message": "Internal Server Error: Database connection failed."
                    };
                    winlog.error(JSON.stringify(responseMessage));
                    winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                    return res.status(500).send(responseMessage);
                }
                const db = client.db("IntainMarkets");

                const minLoanAmount = parseFloat(req.body.minprincipalamt);
                const maxLoanAmount = parseFloat(req.body.maxprincipalamt);

                // var key = 'Amount';//'current_principal';

                var query = {
                    'Asset Class': req.body.assetclass,
                    'As Of Date': { $gte: String(req.body.mindate), $lte: String(req.body.maxdate) },
                    'issuerId': req.body.issuerId,
                    'Status': 'Unmapped',
                    'Contract Data': req.body.contractdata,
                    $and: [
                        { "Original Principal Balance": { $ne: null } }, // Exclude null values
                        { "Original Principal Balance": { $ne: "" } },   // Exclude empty strings
                        {
                            $or: [
                                { "Original Principal Balance": { $not: { $type: "string" } } }, // Exclude strings
                                {
                                    $and: [
                                        {
                                            "Original Principal Balance": {
                                                $ne: null,
                                                $ne: "",
                                                $type: "string", // Check if it's a string
                                                $regex: /^[0-9]*(\.[0-9]*)?$/, // Ensure it matches a numeric pattern
                                            },
                                        },
                                        {
                                            $expr: {
                                                $gte: [
                                                    { $toDouble: "$Original Principal Balance" }, // Convert to double
                                                    minLoanAmount,
                                                ],
                                            },
                                        },
                                        {
                                            $expr: {
                                                $lte: [
                                                    { $toDouble: "$Original Principal Balance" }, // Convert to double
                                                    maxLoanAmount,
                                                ],
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                }


                //   query[key] = { $gt: String(req.body.minprincipalamt), $lt: String(req.body.maxprincipalamt) }
                winlog.info(JSON.stringify(query));

                db.collection('previewstdloantape').find(query).toArray(function (err, result) {
                    if (err) {
                        var responseMessage = {
                            "isSuccess": false,
                            "statuscode": 500,
                            "message": "Internal Server Error: Database connection failed."
                        };
                        winlog.error(JSON.stringify(responseMessage));
                        winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                        return res.status(500).send(responseMessage);
                    }
                    winlog.info("res:: " + result.length);
                    if (result.length > 0) {
                        

                        var json = { "success": true, "data": result }
                        winlog.info("json::  " + JSON.stringify(json));
                        res.send(json);
                        client.close();
                    } else {
                      

                        var json = { "success": false, "data": [] }
                        winlog.info("json::  " + JSON.stringify(json));
                        res.send(json);
                        client.close();
                    }
                });

            }); // mongo end
        }
    },

    updatedata: function (req, res, next) {
        if (!req.body.poolid) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            // var arr = req.body.data;
            var arrlms = [];
            var arrcontract = [];
            var lmscollection = 'previewstdloantape';
            var contractcollection = 'contract';
            var b = 0;
            var event1 = new EventEmitter();
            var event2 = new EventEmitter();

            var event3 = new EventEmitter();

            var event4 = new EventEmitter();

            var findAttributes = new EventEmitter();


            // for (var i = 0; i < arr.length; ++i) {
            //     arrlms[i] = arr[i].lms;
            //     arrcontract[i] = arr[i].contract;
            // }

            MongoClient.connect(url, function (err, client) {
                if (err) {
                    var responseMessage = {
                        "isSuccess": false,
                        "statuscode": 500,
                        "message": "Internal Server Error: Database connection failed."
                    };
                    winlog.error(JSON.stringify(responseMessage));
                    winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                    return res.status(500).send(responseMessage);
                } const db = client.db("IntainMarkets");

                var resjson = {
                    "isSuccess": true,
                    "message": "Data Updated"
                }


                var lmsData = "";
                var contractData = "";
                var attributeData = [];
                var count1 = 0;
                var count2 = 0;
                var count = 0;
                var finacount = 0;
                var lmsloancount = 0;
                var dealidKey = "";
                var contractKey = "";

                winlog.info(req.body.poolid)
                db.collection('pool_detail').find({ poolID: req.body.poolid }).toArray(function (err, result) {
                    if (err) {
                        var responseMessage = {
                            "isSuccess": false,
                            "statuscode": 500,
                            "message": "Internal Server Error: Database connection failed."
                        };
                        winlog.error(JSON.stringify(responseMessage));
                        winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                        return res.status(500).send(responseMessage);
                    }
                    winlog.info("Lengthof result" + result.length);
                    if (result.length > 0) {

                        //  lmscollection = (result[0].poolname) + "_lms"
                        //contractcollection = (result[0].poolname) + "_contract"
                        winlog.info(result[0].attributes);
                        var attList = result[0].attributes.split('#');
                        //  winlog.info('---------------------------------------');
                        // winlog.info(attList);
                        // res.send(result);

                        if (attList.length < 2) {
                            var json = {
                                "isSuccess": false,
                                "message": "No Fields found for the poolid " + req.body.poolid
                            }
                           
                            res.send(json);
                            client.close();

                        } else {
                            //for (var c = 0; c < attList.length; c++) {

                            findAttributes.emit("getAttributes", attList);

                            // }
                        }

                    }
                    else {
                        var json = {
                            "isSuccess": false,
                            "message": "No Pool with poolid " + req.body.poolid
                        }

                        res.send(json);
                        client.close();
                    }
                   
                }); // end of get pool details 

                findAttributes.on('getAttributes', function (attList) {

                    // winlog.info(attList);
                    db.collection('Attribute_details').find({ attributeId: { $in: attList } }).toArray(function (err, result) {
                        if (err) {
                            var responseMessage = {
                                "isSuccess": false,
                                "statuscode": 500,
                                "message": "Internal Server Error: Database connection failed."
                            };
                            winlog.error(JSON.stringify(responseMessage));
                            winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                            return res.status(500).send(responseMessage);
                        }
                        winlog.info(JSON.stringify(result));


                        winlog.info(Object.keys(result).length + "::::::::::::::::::::::::::::::::::::::::::");
                        if (Object.keys(result).length > 0) {

                            attributeData = result;
                            //    winlog.info(JSON.stringify(attributeData));

                        }
                        // b++;
                        // if (b == size) {
                        for (var a = 0; a < attributeData.length; a++) {
                            // winlog.info(JSON.stringify(attributeData[c]) + "::::::::")
                            if (attributeData[a].attributeStandardName == 'loanid') {
                                dealidKey = attributeData[a].attributeName;
                                event1.emit('modifyLMS', req.body.agreementloan);
                                // winlog.info(dealidKey + " :: dealidKey");
                            }
                            if (attributeData[a].attributeStandardName == 'agreementid') {
                                contractKey = attributeData[a].attributeName;
                            }
                        }


                        winlog.info("\n get loans")
                        //  event1.emit('modifyLMS');

                        //}

                    });

                }); //end of find attributes emit



                // db.collection('Attribute_details').find().toArray(function (err, result) {
                //     winlog.info("Lengthof result" + result.length);

                //     attributeData = result;

                //     //  winlog.info(JSON.stringify(result[0]) + ":;;;;;");
                //     event1.emit('modifyLMS');

                // });
                event1.on('modifyLMS', function () {

                    winlog.info(dealidKey + "::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::" + req.body.lmsloan[dealidKey]);
                    var query = {};
                    var poolidKey = "poolid"
                    query[dealidKey] = req.body.lmsloan[dealidKey];
                    query[poolidKey] = req.body.poolid;
                    db.collection('previewstdloantape').find(query).toArray(function (err, result) {
                        if (err) {
                            var responseMessage = {
                                "isSuccess": false,
                                "statuscode": 500,
                                "message": "Internal Server Error: Database connection failed."
                            };
                            winlog.error(JSON.stringify(responseMessage));
                            winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                            return res.status(500).send(responseMessage);
                        }
                        winlog.info("Lengthof result ------  " + JSON.stringify(result));
                        lmsData = result[0];
                        count = Object.keys(req.body.lmsloan).length;
                        winlog.info(JSON.stringify(lmsData) + " :before lms update::");
                        Object.keys(req.body.lmsloan).forEach(function (key) {
                            // winlog.info('Key : ' + key + ', Value : ' + req.body.lmsloan[key]);
                            //winlog.info(JSON.stringify(attributeData) + "::legth   :: " + attributeData.length)
                            for (var c = 0; c < attributeData.length; c++) {
                                // winlog.info(JSON.stringify(attributeData[c]) + "::::::::")
                                if (attributeData[c].attributeName == key) {

                                    //  winlog.info(key + "  :::key");
                                    //    winlog.info(attributeData[c].attributeName + " ::value");
                                    lmsData[attributeData[c].attributeName] = req.body.lmsloan[key];

                                    count1++
                                    if (count == count1) {
                                        winlog.info("lms data::::::" + JSON.stringify(lmsData));
                                        lmsData['Status'] = 'Reviewed';
                                        lmsData['Matched'] = req.body.matched;
                                        event2.emit('updateLMS');
                                    }

                                }
                            }

                        });
                        //                    winlog.info(JSON.stringify(lmsData) + " :after update::");
                    });
                }); //end of event1
                event2.on('updateLMS', function () {
                    var query = {};
                    var poolidKey = "poolid"
                    query[dealidKey] = req.body.lmsloan[dealidKey];
                    query[poolidKey] = req.body.poolid;
                    //   winlog.info(query);
                    db.collection('previewstdloantape').updateOne(query, { $set: lmsData }, function (err, result) {
                        if (err) {
                            var responseMessage = {
                                "isSuccess": false,
                                "statuscode": 500,
                                "message": "Internal Server Error: Database connection failed."
                            };
                            winlog.error(JSON.stringify(responseMessage));
                            winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                            return res.status(500).send(responseMessage);
                        } winlog.info("1 document updated");
                        //res.send(resjson);
                        event3.emit('modifyContract');
                    });

                }); //end of event2

                event3.on('modifyContract', function () {

                    winlog.info(req.body.agreementloan[dealidKey] + "aggrement loan : " + JSON.stringify(req.body.agreementloan))
                    db.collection('contract').find({ loanid: req.body.agreementloan[dealidKey], poolid: req.body.poolid }).toArray(function (err, result) {
                        if (err) {
                            var responseMessage = {
                                "isSuccess": false,
                                "statuscode": 500,
                                "message": "Internal Server Error: Database connection failed."
                            };
                            winlog.error(JSON.stringify(responseMessage));
                            winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                            return res.status(500).send(responseMessage);
                        }
                        //  winlog.info("Lengthof result" + JSON.stringify(result));
                        contractData = result[0];
                        var count = Object.keys(req.body.agreementloan).length;
                        winlog.info(JSON.stringify(contractData) + " :before update::contract data");
                        Object.keys(req.body.agreementloan).forEach(function (key) {
                            // winlog.info('Key : ' + key + ', Value : ' + req.body.lmsloan[key]);
                            //  winlog.info(JSON.stringify(attributeData)+ "::legth   :: "+attributeData.length)
                            for (var c = 0; c < attributeData.length; c++) {
                                // winlog.info(JSON.stringify(attributeData[c]) + "::::::::")
                                if (attributeData[c].attributeName == key) {
                                    count2++;
                                    //    winlog.info(key + "  ::contarct:key");
                                    //     winlog.info(attributeData[c].attributeStandardName + " :contarct:value");
                                    contractData[attributeData[c].attributeStandardName] = req.body.agreementloan[key];

                                    if (count2 == count) {
                                        event4.emit('updateContract');
                                        winlog.info("final data::::::::" + JSON.stringify(contractData))
                                    }

                                }
                            }


                        });
                        //                    winlog.info(JSON.stringify(lmsData) + " :after update::");

                    });


                }); //end of event3
                event4.on('updateContract', function () {

                    db.collection('contract').updateOne({ loanid: contractData['loanid'], poolid: req.body.poolid }, { $set: contractData }, function (err, result) {
                        if (err) {
                            var responseMessage = {
                                "isSuccess": false,
                                "statuscode": 500,
                                "message": "Internal Server Error: Database connection failed."
                            };
                            winlog.error(JSON.stringify(responseMessage));
                            winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                            return res.status(500).send(responseMessage);
                        } winlog.info("1 contract document updated");

                        res.send(resjson);
                        client.close();

                    });
                });


            });//end of db
        }
    },

    deleteloans: function (req, res, next) {
        if (!req.body.loanid || !req.body.issuerId) {
            res.status(400).send({ message: "Missing Arguments!" });
        } else {
            MongoClient.connect(url, function (err, client) {
                if (err) {
                    var responseMessage = {
                        "isSuccess": false,
                        "statuscode": 500,
                        "message": "Internal Server Error: Database connection failed."
                    };
                    winlog.error(JSON.stringify(responseMessage));
                    winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                    return res.status(500).send(responseMessage);
                }
                const db = client.db("IntainMarkets");
                winlog.info("CONNECTED");
                var issuerId = req.body.issuerId;
                const deletedLoanIds = [];
                var loanids = req.body.loanid;
                let list1 = [];

                //find th einput loanids in collection
                db.collection("previewstdloantape").find(
                    { issuerId: issuerId, "Loan ID": { $in: loanids } }).toArray(
                        (err, doc) => {
                            if (err) {
                                var responseMessage = {
                                    "isSuccess": false,
                                    "statuscode": 500,
                                    "message": "Internal Server Error: Database connection failed."
                                };
                                winlog.error(JSON.stringify(responseMessage));
                                winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                                return res.status(500).send(responseMessage);
                            }

                            //  console.log(doc);
                            if (doc.length > 0) {
                                const updateQuery = {};

                                doc.forEach((document) => {
                                    Object.keys(document).forEach((key) => {
                                        if (
                                            key !== "System ID" &&
                                            key !== "_id" &&
                                            key !== "issuerId" &&
                                            !updateQuery[key]
                                        ) {
                                            updateQuery[key] = 1;
                                        }
                                    });
                                });
                                // console.log("update");
                                console.log(updateQuery);
                                db.collection("previewstdloantape").updateMany(
                                    { issuerId: issuerId, "Loan ID": { $in: loanids } },
                                    { $unset: updateQuery },
                                    (err, result) => {
                                        if (err) {
                                            var responseMessage = {
                                                "isSuccess": false,
                                                "statuscode": 500,
                                                "message": "Internal Server Error: Database connection failed."
                                            };
                                            winlog.error(JSON.stringify(responseMessage));
                                            winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                                            return res.status(500).send(responseMessage);
                                        } else {
                                            var bdbjs = {
                                                loanid: loanids,
                                                functiontodo: "delete",
                                                issuerId: issuerId
                                            }
                                            pools.bdbpost(req, res, db, bdbjs);
                                            res.send({
                                                success: true,
                                                message: "Loans updated successfully",
                                            });
                                            client.close();
                                        }
                                    }
                                );
                            } else {
                                res.send({
                                    success: false,
                                    message: loanids + " Loan ID Not  Found",
                                });
                                client.close();
                            }
                        }
                    );
            });
        }
    },
    getFileListByDealName: function (req, res, next) {

        var arr = [];
        var c = 0;
        if (!req.query.verificationtemplate) {
            res.status(400).send({ "message": "Missing Arguments!" })
        }
        else {

            //joining path of directory 
            const directoryPath = path.resolve(__dirname + '/../uploads/uploads/' + req.query.verificationtemplate);
            winlog.info(directoryPath)
            //passsing directoryPath and callback function
            fs.readdir(directoryPath, function (err, files) {
                //handling error
                if (err) {
                    var json = {
                        "isSuccess": false,
                        "message": "No directory found with the deal name " + req.query.verificationtemplate
                    }

                    res.send(json);
                    //return winlog.info('Unable to scan directory: ' + err);
                }
                else {
                    winlog.info(files.length);
                    //listing all files using forEach
                    files.forEach(function (file) {
                        // Do whatever you want to do with the file
                        arr.push(file);
                        c++;
                        winlog.info(file);
                        if (c == files.length) {
                            res.send(arr);
                        }
                    });
                }
            });

        }
    },


}
module.exports = loans;