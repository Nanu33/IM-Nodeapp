const path = require("path");

var request = require("request");
const fs = require("fs");
const xl = require("xlsx");
const { v4: uuidv4 } = require("uuid");
const Web3 = require("web3");
const solc = require("solc");
var EventEmitter = require("events").EventEmitter;
var MongoClient = require("mongodb").MongoClient;
const SftpClient = require('ssh2-sftp-client');
const mime = require("mime-types");
const http = require("http");
//var url = "mongodb://127.0.0.1:27017/";
//var url = "mongodb://mongoservice:27017/IntainMarkets";
var url =
  "mongodb://root:" +
  encodeURIComponent("oAq2hidBW5hHHudL") +
  "@104.42.155.78:27017/IntainMarkets";
// var url = "mongodb://127.0.0.1:27017/";


const address = "0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D";
const web3 = new Web3(
  "http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc"
);
const privKey =
  "476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6"; //replace
const { Pool } = require('pg');

const winlog = require("../log/winstonlog");
const SUser = require("./abi/User");
const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)
const RestrictPool = require("./RestrictTestPool");
const { Invest } = require("./TrancheInvestCommit");
const previewjs = require('./Preview');
const { time, timeStamp } = require("console");
const attributes = require("./addAttributes");

var pools = {
  // createpool: async function (req, res) {
  //     winlog.info("inside createpool");

  //     if (!req.body.poolname || !req.body.assetclass || !req.body.assignverification ||
  //         !req.body.assignservicer || !req.body.assignunderwriter || !req.body.serialno
  //         || !req.body.contractaddress) {
  //         res.status(400).send({ "message": "Missing Arguments!" })
  //     } else {

  //         //invoking the contract
  //         var contractaddress = req.body.contractaddress;
  //         var UA_contract = require('./web3js/createpool');
  //         winlog.info("contractaddress*** " + contractaddress);
  //         let date = String(new Date().toJSON()).substring(0, 10);
  //         winlog.info(date);
  //         var poolid = String(date).substring(0, 1) + String(date).substring(2, 4);
  //         poolid = poolid + "IM" + String(req.body.poolname).charAt(0) + String(req.body.assetclass).charAt(0) +
  //             String(req.body.serialno);

  //         var pooldetails = [[uuidv4(), poolid, req.body.poolname, req.body.assetclass,
  //         req.body.assignverification, req.body.assignservicer, req.body.assignunderwriter,
  //             "0", date, "0", "UnMapped", "", "", "", ""]];

  //         let res1 = await UA_contract.transaction(contractaddress, pooldetails, "CreatePool");
  //         if (res1.success) {
  //             winlog.info("success");
  //             res.send({ "success": true, "message": "Pool Created" });
  //         }
  //     }
  // },

  // createpool: async function (req, res) {
  //     var PoolSaveEmitter = new EventEmitter();
  //     var getAttrStrig = new EventEmitter();
  //     var addPoolEmit = new EventEmitter();
  //     var attrString = '';
  //     var poolid = '';
  //     if (!req.body.poolname && !req.body.assetclass || !req.body.issuerName) {
  //         res.status(400).send({ "message": "Missing Arguments!!" })
  //     }
  //     // else if (req.body.wip == "No" && (!req.body.poolname || !req.body.assetclass || !req.body.assignverification ||
  //     //     !req.body.assignservicer || !req.body.assignunderwriter || !req.body.serialno
  //     //     || !req.body.issuerId || !req.body.issuerName || !req.body.assignpayingagent || !req.body.aitrainedpoolname)) {
  //     //     res.status(400).send({ "message": "Missing Arguments!" })

  //     // }
  //     else {

  //         MongoClient.connect(url, function (err, client) {
  //             if (err) throw err;
  //             const db = client.db("IntainMarkets");
  //             winlog.info('CONNECTED');
  //             let date = String(new Date().toJSON()).substring(0, 10);

  //             db.collection('pool_detail').find({}).toArray(function (err, result) {
  //                 winlog.info("Lengthof result" + result.length);

  //                 poolid = String(req.body.poolname).slice(0, 2) + String(req.body.issuerName).charAt(0) + String(req.body.assetclass).charAt(0) + String(date).substring(2, 4) + String(result.length + 1).padStart(3, '0');
  //                 poolid = poolid.toUpperCase()
  //                 winlog.info(poolid)
  //                 getAttrStrig.emit('getAttr')

  //             })

  //             getAttrStrig.on('getAttr', function () {

  //                 db.collection('Attribute_details').find({ aitrainedpoolname: req.body.aitrainedpoolname }).toArray(function (err, result) {
  //                     winlog.info("Lengthof result" + result.length);
  //                                                 var data = [];
  //                         for (var i in result) {
  //                             data.push(result[i].attributeId);
  //                         }
  //                         winlog.info(data.join('#'));
  //                         winlog.info(data);

  //                         attrString = data.join('#');

  //                         PoolSaveEmitter.emit('savepool');
  //                         // res.send(result);

  //                 });
  //             }); // end of emiter

  //         }); // end of mongo connection

  //         PoolSaveEmitter.on('savepool', function () {
  //             MongoClient.connect(url, function (err, client) {
  //                 if (err) throw err;
  //                 const db = client.db("IntainMarkets");
  //                 winlog.info('CONNECTED');
  //                 var arr = [];
  //                 var attributes = "";

  //                 let ts = Date.now();

  //                 let date_ob = new Date(ts);
  //                 let date = date_ob.getDate();
  //                 let month = date_ob.getMonth() + 1;
  //                 let year = date_ob.getFullYear();
  //                 let hour = date_ob.getHours();
  //                 let minute = date_ob.getMinutes();
  //                 let second = date_ob.getSeconds();

  //                 // prints date & time in YYYY-MM-DD format
  //                 // let tempdate = year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
  //                 //
  //                 let setupdate = String(new Date().toJSON()).substring(0, 10);

  //                 //  setupdate = setupdate + " " + hour + ":" + minute + ":" + second;

  //                 // winlog.info(date);
  //                 // var poolid = String(date).substring(0, 1) + String(date).substring(2, 4);
  //                 // poolid = poolid + "IM" + String(req.body.poolname).charAt(0).toUpperCase() + String(req.body.assetclass).charAt(0).toUpperCase() +
  //                 //     String(req.body.serialno);

  //                 //  attributeEmit.on('getAttribute', function () {

  //                 // db.collection('Attribute_details').find({ attributePoolName: req.body.poolname }).toArray(function (err, result) {
  //                 //     winlog.info("Lengthof result" + result.length);

  //                 //     for (c = 0; c < result.length; c++) {

  //                 //         if (attributes == "") {
  //                 //             attributes = result[c].attributeId;
  //                 //         } else {
  //                 //             attributes = attributes + "#" + result[c].attributeId;
  //                 //         }
  //                 //         if (c == (result.length - 1)) {
  //                 //             addPoolEmit.emit('addPool', poolid);

  //                 //         }

  //                 //     }

  //                 // })
  //                 //  });
  //                 //   addPoolEmit.on('addPool', function (poolid) {
  //                 var assignunderwriterid = String(req.body.assignunderwriter).split(",");
  //                 const assignunderwriterid1 = assignunderwriterid.join('#');

  //                 var json = {
  //                     "uniqueID": uuidv4(),
  //                     "poolID": poolid,
  //                     "poolname": req.body.poolname,
  //                     "issuerId": req.body.issuerId,
  //                     "assetclass": req.body.assetclass,
  //                     "assignverification": req.body.assignverification,
  //                     "assignservicer": req.body.assignservicer,
  //                     "assignunderwriter": assignunderwriterid1,
  //                     "numberofloans": "0",
  //                     "setupdate": setupdate,
  //                     "originalbalance": "0",
  //                     "status": "Created",
  //                     "loanids": "",
  //                     "typename": "",
  //                     "filepath": "",
  //                     "typepurpose": "",
  //                     "attributes": attrString,
  //                     "issuerName": req.body.issuerName,
  //                     "assignpayingagent": req.body.assignpayingagent,
  //                     "contractStatus": "NotUploaded",  // 2. Uploaded 3. Digitized
  //                     "aitrainedpoolname": req.body.aitrainedpoolname,

  //                 }

  //                 arr.push(json);

  //                 console.log(arr)

  //                 db.collection('pool_detail').insertMany(arr, (err, result) => {

  //                     if (err) return winlog.info(err)
  //                     winlog.info('saved to database')
  //                     res.send({ "success": true, "message": "Pool Created" });

  //                 });

  //                 //  }); // end of pool emit

  //             }); // end of mongo connection
  //         })
  //     } // end of else

  // },

  createpool: async function (req, res) {
    var PoolSaveEmitter = new EventEmitter();
    var getAttrStrig = new EventEmitter();
    var addPoolEmit = new EventEmitter();
    var attrString = "";
    var poolid = "";
    if (
      (!req.body.poolname && !req.body.assetclass) ||
      !req.body.issuerName ||
      !req.body.description ||
      !req.body.issuerId
    ) {
      res.status(400).send({ message: "Missing Arguments!!" });
    }
    // else if (req.body.wip == "No" && (!req.body.poolname || !req.body.assetclass || !req.body.assignverification ||
    //     !req.body.assignservicer || !req.body.assignunderwriter || !req.body.serialno
    //     || !req.body.issuerId || !req.body.issuerName || !req.body.assignpayingagent || !req.body.aitrainedpoolname)) {
    //     res.status(400).send({ "message": "Missing Arguments!" })

    // }
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
        } else {
          const db = client.db("IntainMarkets");
          winlog.info("CONNECTED");
          let date = String(new Date().toJSON()).substring(0, 10);

          db.collection("pool_detail")
            .find({})
            .toArray(function (err, result) {
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

              poolid =
                String(req.body.poolname).slice(0, 2) +
                String(req.body.issuerName).charAt(0) +
                String(req.body.assetclass).charAt(0) +
                String(date).substring(2, 4) +
                String(result.length + 1).padStart(3, "0");
              poolid = poolid.toUpperCase();
              winlog.info(poolid);
              //  getAttrStrig.emit('getAttr')
              PoolSaveEmitter.emit("savepool");
            });
          /*
                  getAttrStrig.on('getAttr', function () {
  
                      db.collection('Attribute_details').find({ aitrainedpoolname: req.body.aitrainedpoolname }).toArray(function (err, result) {
                          winlog.info("Lengthof result" + result.length);
                                                      var data = [];
                              for (var i in result) {
                                  data.push(result[i].attributeId);
                              }
                              winlog.info(data.join('#'));
                              winlog.info(data);
  
                              attrString = data.join('#');
  
                             
                              // res.send(result);
                          
                      });
                  }); // end of emiter
              */
        }
      }); // end of mongo connection

      PoolSaveEmitter.on("savepool", function () {
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
          } else {
            const db = client.db("IntainMarkets");
            winlog.info("CONNECTED");
            var arr = [];
            var attributes = "";

            let ts = Date.now();

            let date_ob = new Date(ts);
            let date = date_ob.getDate();
            let month = date_ob.getMonth() + 1;
            let year = date_ob.getFullYear();
            let hour = date_ob.getHours();
            let minute = date_ob.getMinutes();
            let second = date_ob.getSeconds();

            // prints date & time in YYYY-MM-DD format
            // let tempdate = year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
            //
            let setupdate = String(new Date().toJSON()).substring(0, 10);

            //  setupdate = setupdate + " " + hour + ":" + minute + ":" + second;

            // winlog.info(date);
            // var poolid = String(date).substring(0, 1) + String(date).substring(2, 4);
            // poolid = poolid + "IM" + String(req.body.poolname).charAt(0).toUpperCase() + String(req.body.assetclass).charAt(0).toUpperCase() +
            //     String(req.body.serialno);

            //  attributeEmit.on('getAttribute', function () {

            // db.collection('Attribute_details').find({ attributePoolName: req.body.poolname }).toArray(function (err, result) {
            //     winlog.info("Lengthof result" + result.length);

            //     for (c = 0; c < result.length; c++) {

            //         if (attributes == "") {
            //             attributes = result[c].attributeId;
            //         } else {
            //             attributes = attributes + "#" + result[c].attributeId;
            //         }
            //         if (c == (result.length - 1)) {
            //             addPoolEmit.emit('addPool', poolid);

            //         }

            //     }

            // })
            //  });
            //   addPoolEmit.on('addPool', function (poolid) {
            //   var assignunderwriterid = String(req.body.assignunderwriter).split(",");
            //   const assignunderwriterid1 = assignunderwriterid.join('#');

            var json = {
              uniqueID: uuidv4(),
              poolID: poolid,
              poolname: req.body.poolname,
              issuerId: req.body.issuerId,
              assetclass: req.body.assetclass,
              assignverification: "",
              assignservicer: "",
              assignunderwriter: "",
              numberofloans: "0",
              setupdate: setupdate,
              originalbalance: "0",
              status: "Created",
              loanids: "",
              typename: "",
              filepath: "",
              typepurpose: "",
              attributes: "",
              issuerName: req.body.issuerName,
              assignpayingagent: "",
              contractStatus: "NotUploaded", // 2. Uploaded 3. Digitized
              aitrainedpoolname: "",
              description: req.body.description,
              previewOrverify: "",
              previewstatus: {},
              fieldstoverify: {},
              contractpath: {},
              VACertificate: "",
              ratingagency: ""

            };
            console.log(json);

            arr.push(json);

            console.log(arr);

            db.collection("pool_detail").insertMany(arr, (err, result) => {
              if (err) {
                var responseMessage = {
                  "isSuccess": false,
                  "statuscode": 500,
                  "message": "Internal Server Error: Database connection failed."
                };
                winlog.error(JSON.stringify(responseMessage));
                winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                return res.status(500).send(responseMessage);
              } winlog.info("saved to database");
              res.send({ success: true, message: "Pool Created" });
              client.close();
            });
          }
          //  }); // end of pool emit
        }); // end of mongo connection
      });
    } // end of else
  },

  // updatepool: async function (req, res) {
  //     winlog.info("update createpool");

  //     if (!req.body.uniqueid || !req.body.poolid || !req.body.poolname || !req.body.assetclass || !req.body.assignverification ||
  //         !req.body.assignservicer || !req.body.assignunderwriter || !req.body.numberofloans || !req.body.poolcreateddate ||
  //         !req.body.originalbalance || !req.body.status || !req.body.loanids
  //         || !req.body.contractaddress) {
  //         res.status(400).send({ "message": "Missing Arguments!" })
  //     } else {

  //         //invoking the contract
  //         var contractaddress = req.body.contractaddress;
  //         var UA_contract = require('./web3js/update');
  //         winlog.info("contractaddress*** " + contractaddress);

  //         var pooldetails = [[req.body.uniqueid, req.body.poolid, req.body.poolname, req.body.assetclass,
  //         req.body.assignverification, req.body.assignservicer, req.body.assignunderwriter,
  //         req.body.numberofloans, req.body.poolcreateddate, req.body.originalbalance, req.body.status,
  //         req.body.loanids, "", "", ""]];

  //         let res1 = UA_contract.transaction(contractaddress, pooldetails, "CreatePool");
  //         if (res1.success) {
  //             winlog.info("success");
  //             res.send({ "success": true, "message": "Pool Created" });
  //         }
  //     }
  // },
  // getallpools: async function (req, res) {

  //     if (!req.query.contractaddress) {
  //         res.status(400).send({ "message": "Missing Arguments!" })
  //     } else {

  //         //invoking the contract
  //         var UA_contract = require('./web3js/GetAllPools/interact');
  //         winlog.info("contractaddress*** " + req.query.contractaddress);
  //         let res1 = await UA_contract.querygetallpools(req.query.contractaddress, "CreatePool");
  //         if (res1.success) {
  //             var key = ["uniqueID", "poolID", "poolname", "assetclass", "assignverification",
  //                 "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
  //                 "status", "loanids", "typename", "filepath", "typepurpose"];

  //             var arr = [];
  //             var data = JSON.parse(res1.result);
  //             // winlog.info("data:: " + data);
  //             for (var i = 0; i < data.length; ++i) {
  //                 var json = {};
  //                 winlog.info(data[i]);
  //                 for (var j = 0; j < key.length; ++j) {
  //                     json[key[j]] = data[i][j];
  //                     winlog.info(data[i][j]);
  //                 }
  //                 arr.push(json);
  //             }
  //             setTimeout(function () {
  //                 res.send({ "success": true, "message": arr });
  //             }, 1000);
  //         }
  //     }
  // },

  updatePool: async function (req, res) {
    winlog.info("update createpool");

    if (
      !req.body.poolid ||
      !req.body.issuerId ||
      !req.body.poolname ||
      !req.body.assetclass
    ) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      try {
        MongoClient.connect(url, async function (err, client) {
          if (err) {
            var responseMessage = {
              "isSuccess": false,
              "statuscode": 500,
              "message": "Internal Server Error: Database connection failed."
            };
            winlog.error(JSON.stringify(responseMessage));
            winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
            console.log('Stack trace:', err.stack);
            return res.status(500).send(responseMessage);
          }
          else {
            console.log("connected::::: ")
            const currentDate = new Date();
            let timestamp1 = currentDate.getTime();
            var VAEmitter = new EventEmitter();
            const db = client.db("IntainMarkets");
            winlog.info("CONNECTED");

            const updateData = {
              poolname: req.body.poolname,
              assetclass: req.body.assetclass,
              assignverification: req.body.assignverification,
              assignservicer: req.body.assignservicer,
              assignunderwriter: req.body.assignunderwriter,
              // assigninvestor: req.body.assigninvestor,
              // typename: req.body.typename,
              // filepath: req.body.filepath,
              // typepurpose: req.body.typepurpose,
              assignpayingagent: req.body.assignpayingagent,
              description: req.body.description,
              previewOrverify: req.body.previewOrverify,
              ratingagency: req.body.ratingagency
            };

            const result1 = await db.collection("pool_detail").findOne({ poolID: req.body.poolid, issuerId: req.body.issuerId });

            console.log(result1);
            const newUsersStatus = {};
            let resultpreviousjson = result1.previewstatus || {}
            console.log(resultpreviousjson)

            //only if the pool is in preview stage then we will update investor and set userstatus to pending
            if (req.body.previewOrverify == "Preview") {

              updateData.assigninvestor = req.body.assigninvestor;
              req.body.assignverification.split(",").forEach(userkey => {
                if (!resultpreviousjson.hasOwnProperty(userkey)) {
                  newUsersStatus[userkey] = "Pending";
                }
              })

              req.body.assignunderwriter.split(",").forEach(userkey => {
                if (!resultpreviousjson.hasOwnProperty(userkey)) {
                  newUsersStatus[userkey] = "Pending";
                }
              })

              req.body.ratingagency.split(",").forEach(userkey => {
                if (!resultpreviousjson.hasOwnProperty(userkey)) {
                  newUsersStatus[userkey] = "Pending";
                }
              })

              updateData.previewstatus = { ...resultpreviousjson, ...newUsersStatus }

              var assignunderwriterid = String(req.body.assignunderwriter).split(",").filter(Boolean);;
              var assigninvestor = String(req.body.assigninvestor).split(",").filter(Boolean);;
              const userIds = [...assignunderwriterid, ...assigninvestor, req.body.issuerId];
              winlog.info(userIds)
              const jsonarr = [];
              userIds.forEach(id => {
                const userData = {
                  userid: id,
                  poolid: req.body.poolid,
                  unreadloanlist: []

                };
                jsonarr.push(userData);
              });
              winlog.info("unreadloanlist");
              winlog.info("Object content: " + JSON.stringify(jsonarr));

              const bulkOps = jsonarr.map(document => ({
                updateOne: {
                  filter: { poolid: document.poolid, userid: document.userid },
                  update: { $setOnInsert: document },
                  upsert: true
                }
              }));

              if (bulkOps.length > 0) {
                const result2 = await db.collection("previewnotification").bulkWrite(bulkOps, { ordered: false })
                console.log(result2);
              }

            } else {

              updateData.status = "Pending"
            }

            console.log(updateData)

            db.collection("pool_detail").updateOne(
              { poolID: req.body.poolid, issuerId: req.body.issuerId },
              { $set: updateData },
              function (err, result) {
                if (err) {
                  var responseMessage = {
                    "isSuccess": false,
                    "statuscode": 500,
                    "message": "Internal Server Error: Database connection failed."
                  };
                  winlog.error(JSON.stringify(responseMessage));
                  console.log('Stack trace:', err.stack);
                  winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                  return res.status(500).send(responseMessage);
                } else {
                  // console.log('Pool size::::::::', client.topology.s.pool.size);

                  res.send({
                    isSuccess: true,
                    message: "pool status updated sucessfully",
                  });
                  if (req.body.previewOrverify != "Preview") {
                    console.log("in")
                    VAEmitter.emit('VAEmitter')
                  }
                }
              }
            );

            VAEmitter.on("VAEmitter", async () => {

              console.log("inside emitter")
              let loandetails = await db.collection("previewstdloantape").find({ poolid: req.body.poolid, issuerId: req.body.issuerId }).toArray();
              const jsonData = JSON.stringify(loandetails, null, 2);
              fs.writeFileSync('./uploads/' + req.body.poolid + '.json', jsonData);
              console.log(`$pool details ${JSON.stringify(result1)}  and loan details ${JSON.stringify(loandetails)}`)
              const keys = Object.keys(result1["fieldstoverify"]);
              if (keys.length > 0) {

                var attributedetails = await db.collection("Attribute_details").findOne({ "aitrainedpoolname": keys[0] });
                console.log(`attributedetails ${attributedetails}`)
              }
              try {
                const sftpConfig = {
                  host: 'intainvasa.blob.core.windows.net',
                  port: 22,
                  username: 'intainvasa.imuser',
                  password: 's52f4V4dswc3JZV1+jBa6vA6h47fVawj'
                };
                const sftp = new SftpClient();
                await sftp.connect(sftpConfig);
                console.log('Connected to SFTP server');

                await sftp.put('./uploads/' + req.body.poolid + '.json', '/' + timestamp1 + '.json');
                await sftp.end();
                console.log('File uploaded to SFTP server');
                fs.unlinkSync('./uploads/' + req.body.poolid + '.json', jsonData);
                client.close();

                VAEmitter.emit("GetUsertoken", attributedetails.attributePoolName);
              } catch (err) {
                console.log(err);

              }
            })

            VAEmitter.on("GetUsertoken", (poolname) => {
              console.log("in ::")
              let errcount = 0;
              const abi = SUser.abi;

              const get1 = async () => {
                winlog.info(`Making a call to contract at address 11111111 ${contractAddress}`);
                var status = 'Active'
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                try {
                  const data = await incrementer.methods
                    .getUserById("246f63c3-9089-4629-ba3b-e8149f0bea2e")
                    .call({ from: address });
                  winlog.info(`The current string is 22222222: ${data}`);
                  winlog.info("data:: 3333" + JSON.stringify(data));

                  var arr1 = JSON.parse(JSON.stringify(data));
                } catch (e) {
                  errcount++;
                  if (errcount <= 3) {
                    winlog.info("error occ" + e); get1();
                  } else {
                    var r = { "message": e.message }
                    // res.status(500).send(r);
                  }
                }

                winlog.info(arr1.length);
                if (arr1.length > 0) {
                  // console.log("data ::" + arr1[18])
                  const url = 'https://gva.intainva.intainabs.com/v1/JWT_TOKEN';
                  const authHeader = 'Basic ' + arr1[18];


                  request({
                    "method": "POST",
                    headers: {
                      "Authorization": "Basic " + arr1[18],
                    },
                    "url": "https://gva.intainva.intainabs.com/v1/JWT_TOKEN"

                  }, function (error, response, body) {
                    console.log("Inside callback");
                    if (error) {
                      console.log("inside final token if:::::::::")

                      console.log(error)
                    } else {
                      console.log("inside final token else:::::::::")
                      let finaltoken = JSON.parse(body).token;

                      console.log("final token " + finaltoken)

                      let Pooldetails = {
                        "poolid": req.body.poolid,
                        "poolname": poolname,
                        "assetclass": result1["assetclass"],
                        "issuer": result1["issuerName"],
                        "processor": req.body.assignverification, //id will be different from va
                        "datecreated": result1["setupdate"],
                        "noofloans": "", //noofloans and hash do we need to set
                        "loanhash": "",
                        "attributes": "",
                        "noofprocessor": 1,
                        "certIssued": 0,
                        "certCID": "",
                        "status": "Created",
                        "poolSno": "", //not made anychanges
                        "fieldstoVerify": result1["fieldstoverify"]
                        // "contractpath": "/home/azurefileshare/pool1/template1/contract1.pdf"
                      }

                      //traverse fieldstoverify
                      console.log(Pooldetails)

                      let finalVAarr = {
                        "Pooldetails": Pooldetails,
                        "lmspath": '/IntainMarkets/IM_Test/' + timestamp1 + '.json'
                      }

                      console.log(JSON.parse(JSON.stringify(finalVAarr)))
                      //add authorization header to request

                      const requestOption = {
                        "method": "Post",
                        "headers": {
                          "content-type": "application/json", "userrole": "Admin",
                          "authorization": "Bearer " + finaltoken
                        },
                        "url": "https://gva.intainva.intainabs.com/v1/imaddlms",
                        "body": JSON.stringify(finalVAarr)
                      }


                      request(requestOption, function (error, response, body) {
                        if (error) {
                          console.log(error)
                        } else {

                          console.log(body)
                          console.log("verification file moved to SFTP path")
                        }
                      })


                    }
                  })

                }
              }
              get1();
            })

          }
        });
      } catch (err) {
        console.log(err)
      }

    }
  },

  getallpoolsbyIssuerId: function (req, res, next) {
    if (!req.query.issuerId) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var event = new EventEmitter();
      var event1 = new EventEmitter();
      winlog.info("inside fn");
      var poolIDs = [];
      var response = {}

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
        } else {
          const db = client.db("IntainMarkets");
          winlog.info("CONNECTED");
          var dealIds = "";
          var count = 0;
          var Dcount = "";

          db.collection("pool_detail")
            .find({ issuerId: req.query.issuerId })
            .toArray(function (err, result) {
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
                winlog.info("Lengthof result" + result.length);
                poolIDs = result.map((pool) => pool.poolID);
                if (result.length > 0) {
                  var finalresult = RestrictPool.Getfinalpool(
                    result,
                    req.query.mailid,
                    "pool"
                  );
                  //  res.send(finalresult);

                  db.collection("previewnotification").find({ userid: req.query.issuerId, poolid: { $in: poolIDs }, unreadloanlist: { $exists: true, $ne: [] } }).project({ poolid: 1, _id: 0 }).toArray(function (err, result) {
                    if (err) {
                      var responseMessage = {
                        "isSuccess": false,
                        "statuscode": 500,
                        "message": "Internal Server Error: Database connection failed."
                      };
                      winlog.error(JSON.stringify(responseMessage));
                      winlog.error("Database Error while accessing previewnotification database: " + JSON.stringify(err));
                      return res.status(500).send(responseMessage);
                    }
                    //  winlog.info("Lengthof result" + notificationlist.length);
                    else {
                      const notificationlist = result.map(notification => notification.poolid);
                      response['pooldetails'] = finalresult;
                      response['notificationlist'] = notificationlist;
                      res.send(response);
                      client.close();
                    }
                  });


                  // res.send(result);
                } else {
                  // var json = {
                  //     "isSuccess": false,
                  //     "message": "No Pools found for the isuuer  " + req.query.issuerId
                  // }

                  res.send([]);
                  client.close();
                }
              }
            });
        }
      });
    }
  },

  getallpoolsbyVAId: async function (req, res, next) {
    if (!req.query.VAId) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var event = new EventEmitter();
      var event1 = new EventEmitter();
      winlog.info("inside fn");
      var resArr = [];

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
        } else {
          const db = client.db("IntainMarkets");
          winlog.info("CONNECTED");
          var dealIds = "";
          var count = 0;
          var Dcount = "";

          db.collection("pool_detail")
            .find({
              assignverification: req.query.VAId,
              status: { $nin: ["Created"] },
            })
            .toArray(function (err, result) {
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
                winlog.info("Lengthof result" + result.length);
                if (result.length > 0) {
                  var finalresult = RestrictPool.Getfinalpool(
                    result,
                    req.query.mailid,
                    "pool"
                  );
                  res.send(finalresult);
                  client.close();

                  // res.send(result);
                } else {
                  // var json = {
                  //     "isSuccess": false,
                  //     "message": "No Pools found for the verification agent with id  " + req.query.VAId
                  // }

                  res.send([]);
                  client.close();
                }
              }
            });
        }
      });

    }
  },
  getbypoolid: function (req, res, next) {
    if (!req.query.poolid) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var poolid = req.query.poolid;
      var UserEmitter = new EventEmitter();

      var poolData = [];
      var loanData = [];
      var bdb = []

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
        } else {
          const db = client.db("IntainMarkets");
          winlog.info("CONNECTED");

          db.collection("pool_detail")
            .find({ poolID: poolid })
            .toArray(function (err, result) {
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
                winlog.info("Lengthof result" + result.length);
                console.log(result);
                if (result.length > 0) {
                  poolData = result;
                  db.collection("previewstdloantape")
                    .find({ poolid: poolid })
                    .toArray(function (err, result) {
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
                        winlog.info("res:: " + result.length);
                        //if (result.length > 0) {
                        loanData = result;
                        // }
                        //res.send({ "success": true, "pooldetails": poolData, "loandetails": loanData });
                        UserEmitter.emit("getuserdetails");
                        client.close();
                      }
                    });
                  //  res.send(result);


                } else {
                  var json = {
                    isSuccess: false,
                    message: "No Pool with poolid " + poolid,
                  };

                  res.send(json);
                  client.close();
                }
              }
            });
        }
      });
    }



    UserEmitter.on("getuserdetails", function () {
      winlog.info(
        "----------------------------------------------------------------"
      );
      const contractAddress = SUser.address; // Contract Call

      // winlog.info("inputdata:: " + loansave);
      const contractPath = path.join(
        process.cwd(),
        "/api/contracts/" + "User.sol"
      );
      const contractname = "User";

      const abi = SUser.abi;
      const incrementer = new web3.eth.Contract(abi, contractAddress);

      const getloans = async () => {
        winlog.info(`Making a call to user sol at address ${contractAddress}`);
        try {
          const data = await incrementer.methods
            .getAllUsers()
            .call({ from: address });
          winlog.info("data:: " + JSON.stringify(data));
          if (data.length > 0) {
            var response = { result: JSON.stringify(data) };
            var finalresponse = JSON.parse(response.result);
            // 1)UserId 2)EmailAddress 3)UserHash 4)UserSatus 5)UserAccAddress 6) userRole

            var key = [
              "UserId",
              "EmailAddress",
              "UserHash",
              "UserSatus",
              "UserAccAddress",
              "userRole",
              "username",
            ];

            var c2 = 0;
            winlog.info(JSON.stringify(poolData));
            let currentdate = new Date();
            let setupdate = new Date(poolData[0]["ContractUploadedDate"]);

            var Difference_In_Time =
              currentdate.getTime() - setupdate.getTime();
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            console.log("difference in days " + Difference_In_Days);

            if (Difference_In_Days >= 1) {
              poolData[0]["AlertStatus"] = "True"; //maintained to lock the submission to VA for 24 hrs
            } else {
              poolData[0]["AlertStatus"] = "False";
            }
            console.log(
              "underwriter :" + poolData[0]["assignunderwriter"].split("#")
            );
            let underwritername = "";
            for (var i = 0; i < finalresponse.length; ++i) {
              // if (finalresponse[i][0] == poolData[0]["assignverification"])
              if (
                poolData[0]["assignverification"]
                  .split(",")
                  .includes(finalresponse[i][0])
              ) {
                winlog.info("fdv");

                poolData[0]["VAUserName"] = finalresponse[i][6];
              } else if (finalresponse[i][0] == poolData[0]["assignservicer"]) {
                poolData[0]["ServicerUserName"] = finalresponse[i][6];
              } else if (finalresponse[i][0] == poolData[0]["issuerId"]) {
                poolData[0]["IssuerUserName"] = finalresponse[i][6];
              } else if (
                poolData[0]["assignunderwriter"]
                  .split(",")
                  .includes(finalresponse[i][0])
              ) {
                //console.log("Name ::;;"+finalresponse[i][6])
                underwritername =
                  underwritername === ""
                    ? finalresponse[i][6]
                    : underwritername + "," + finalresponse[i][6];
              }

              c2++;

              //   trancheData.push(json);
              if (c2 == finalresponse.length) {
                poolData[0]["UnderWriterUserName"] = underwritername;
                UserEmitter.emit("bdbtiles")
                //getPoolDocument();
                // res.send({
                //   success: true,
                //   pooldetails: poolData,
                //   loandetails: loanData,
                // });
              }
            }

            // res.send(arr)
          } else {
            UserEmitter.emit("bdbtiles")
            // getPoolDocument();
            // res.send({
            //   success: true,
            //   pooldetails: poolData,
            //   loandetails: loanData,
            // });
          }
        } catch (e) {
          winlog.info("Error occured" + e);

          var r = { message: e.message };
          res.status(500).send(r);
        }
      };
      getloans();
    })
    UserEmitter.on("bdbtiles", function () {

      // Get the poolid from the query parameters (req.query)
      const poolid = req.query.poolid;

      const dbConfig = {
        user: 'admin',
        host: 'analytics.data-iaedge.intainabs.com',
        database: 'intainpldm',
        password: 'INtPosyq6@123',
        port: 5432,
      };

      // Create a pool of connections
      const pool = new Pool(dbConfig);

      // Define your SQL query with parameter placeholders
      const sqlQuery = `
      SELECT 
   coalesce (round(cast(sum("Current Principal Balance") as numeric),2),0) as current_principal_balance ,
   CASE
      WHEN NULLIF(Sum("Original Principal Balance" * "Current Interest Rate")::numeric, 0)  / (Sum("Original Principal Balance")::numeric) * 100 IS NULL THEN 'NA'
      ELSE TO_CHAR(ROUND((Sum("Original Principal Balance" * "Current Interest Rate") / Sum("Original Principal Balance") * 100)::numeric, 2), 'FM999999990.00')
   END AS wac,
   CASE
      WHEN round(NULLIF(SUM("Original Principal Balance" * "Borrower FICO") ::numeric, 0) / SUM("Original Principal Balance")) IS NULL THEN 'NA'::text
      ELSE TO_CHAR(round((SUM("Original Principal Balance" * "Borrower FICO") / SUM("Original Principal Balance")) ::numeric,2), 'FM999999990.00') ::text
   END AS fico,
   CASE
      WHEN NULLIF(Sum("Original Principal Balance" * "Current Loan-To-Value") ::numeric, 0)/ (Sum("Original Principal Balance")::numeric) * 100 IS NULL THEN 'NA'
      ELSE TO_CHAR(ROUND((Sum("Original Principal Balance" * "Current Loan-To-Value") / Sum("Original Principal Balance") * 100)::numeric, 2), 'FM999999990.00')
   END AS ltv,
   coalesce (sum(case when "Current Principal Balance">0 then 1 else 0 end),0) as loan_cnt
FROM public.imloantaperreperiodic l
WHERE "poolid"    = $1`;

      const values = [poolid];

      // Fetch data from the database with a parameterized query
      pool.query(sqlQuery, values, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).send('Error executing query');
        } else {
          console.log('Query result:', result.rows);
          bdb = result; // Send the query result as JSON response
          getPoolDocument();
        }
      });
    })

    function getPoolDocument() {

      var poolid = req.query.poolid;
      MongoClient.connect(url, function (err, client) {
        if (err) {
          var responseMessage = {
            isSuccess: false,
            statuscode: 500,
            message: "Internal Server Error: Database connection failed.",
          };
          winlog.error(JSON.stringify(responseMessage));
          winlog.error(
            "Database Error while accessing pool_detail database: " +
            JSON.stringify(err)
          );
          return res.status(500).send(responseMessage);
        } else {

          const db = client.db("IntainMarkets");
          db.collection("pool_document")
            .find(
              { poolid: poolid, issuerId: req.query.issuerId },
              { projection: { _id: 0 } }
            )
            .toArray(async function (err, result) {
              if (err) {
                var responseMessage = {
                  isSuccess: false,
                  statuscode: 500,
                  message: "Internal Server Error: Database connection failed.",
                };
                winlog.error(JSON.stringify(responseMessage));
                winlog.error(
                  "Database Error while accessing pool_detail database: " +
                  JSON.stringify(err)
                );
                return res.status(500).send(responseMessage);
              } else {
                const notificationsresult = await db.collection("previewnotification").findOne({ "poolid": req.query.poolid, "userid": req.query.userid }, { projection: { "unreadloanlist": 1 } });
                res.send({
                  success: true,
                  pooldetails: poolData,
                  loandetails: loanData,
                  documentdetails: result,
                  bdbtiles: bdb.rows,
                  notificationlist: notificationsresult ? notificationsresult.unreadloanlist : []


                });
                client.close();
              }
            });
        }
      });

    }
  },

  updatePoolStatus: function (req, res, next) {
    if (!req.query.poolid || !req.query.status) {
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
        } else {
          const db = client.db("IntainMarkets");
          winlog.info("CONNECTED");

          db.collection("pool_detail").updateOne(
            { poolID: req.query.poolid },
            { $set: { status: req.query.status } },
            function (err, result) {
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
                // poolData = result;
                res.send({
                  isSuccess: true,
                  message: "pool status updated sucessfully",
                });
                client.close();
              }
            }
          );
        }
      });
    }
  },

  updateLoanAndPoolStatus: function (req, res, next) {
    if (!req.query.poolid || !req.query.poolStatus || !req.query.loanStatus) {
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
        } else {
          const db = client.db("IntainMarkets");
          winlog.info("CONNECTED");

          db.collection("pool_detail").updateOne(
            { poolID: req.query.poolid },
            { $set: { status: req.query.poolStatus } },
            function (err, result) {
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
                db.collection("previewstdloantape").updateMany(
                  { poolid: req.query.poolid },
                  { $set: { Status: req.query.loanStatus } },
                  function (err, result) {
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
                    res.send({
                      isSuccess: true,
                      message: "Loan status and pool status updated sucessfully",
                    });
                    client.close();
                  }
                );
              }
            }
          );
        }
      });
    }
  },
  // getbypoolid: async function (req, res) {

  //     if (!req.query.contractaddress || !req.query.poolid) {
  //         res.status(400).send({ "message": "Missing Arguments!" })
  //     } else {

  //         //invoking the contract
  //         var UA_contract = require('./web3js/GetByPoolID/interact');
  //         winlog.info("contractaddress*** " + req.query.contractaddress);
  //         let res1 = await UA_contract.querygetallpools(req.query.contractaddress, req.query.poolid, "CreatePool");
  //         if (res1.success) {
  //             var key = ["uniqueID", "poolID", "poolname", "assetclass", "assignverification",
  //                 "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
  //                 "status", "loanids", "typename", "filepath", "typepurpose"];

  //             var arr = [];
  //             var data = JSON.parse(res1.result);
  //             winlog.info("data:: " + data);
  //             // for (var i = 0; i < data.length; ++i) {
  //             var json = {};
  //             // winlog.info(data[i]);
  //             for (var j = 0; j < key.length; ++j) {
  //                 json[key[j]] = data[j];
  //                 // winlog.info(data[i][j]);
  //             }
  //             arr.push(json);
  //             var loanids = json['loanids'];
  //             loanids = loanids.split("#");
  //             winlog.info(loanids);
  //             var loanarr = [];

  //             //quer loan details from mongo db
  //             MongoClient.connect(url, function (err, client) {
  //                 const db = client.db("IntainMarkets");
  //                 for (var i = 0; i < loanids.length; ++i) {
  //                     winlog.info(loanids[i]);
  //                     db.collection('LoanData').find({ 'loanid': String(loanids[i]) }).toArray(function (err, result) {
  //                         winlog.info("res:: " + result.length);
  //                         if (result.length > 0) {
  //                             loanarr.push(result[0]);
  //                         }
  //                     });
  //                 }
  //             });

  //             setTimeout(function () {
  //                 res.send({ "success": true, "pooldetails": arr, "loandetails": loanarr });

  //             }, 1000);
  //         }
  //     }
  // },
  mappoolstoloans: async function (req, res) {
    if (!req.body.loanid || !req.body.poolid || !req.body.issuerId) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var eventemit1 = new EventEmitter();
      var eventemit2 = new EventEmitter();
      var contractUpdate = new EventEmitter();
      var deleteUnmapedLoans = new EventEmitter();
      var mapLoan = new EventEmitter();
      var getLoan = new EventEmitter();

      var loanidhash = "";
      var originalbal = 0;
      var count = 0;
      var count2 = 0;
      var loanData = "";
      var key = "Original Principal Balance";
      var loanidKey = "Loan ID";
      //add originalbal
      var loans = req.body.loanid;
      winlog.info("loans:: " + loans.length + " " + JSON.stringify(loans));

      // setTimeout(function () {
      //     eventemit2.emit('update');
      // }, 2000)
      //   });

      eventemit2.on("update", function () {
        winlog.info("----------------------------------");

        var loans = req.body.loanid;

        MongoClient.connect(url, function (err, client) {
          if (err) {
            var responseMessage = {
              isSuccess: false,
              statuscode: 500,
              message: "Internal Server Error: Database connection failed.",
            };
            winlog.error(JSON.stringify(responseMessage));
            winlog.error(
              "Database Error while accessing pool_detail database: " +
              JSON.stringify(err)
            );
            return res.status(500).send(responseMessage);
          } else {
            const db = client.db("IntainMarkets");
            winlog.info("CONNECTED");

            // deleteUnmapedLoans.on('delete', async function () {
            //     db.collection('lms').deleteMany({ "Status": "Unmapped" }, function (err, result) {

            //         if (err) throw err;
            //         //winlog.info("44444444444444444444444444444444444444");
            //         res.send({ "success": true, "message": "Pool Upated" });

            //     });
            // }); // end of deleteUnmapedLoans emiter
            contractUpdate.on("update", async function () {
              db.collection("contract").updateMany(
                { loanid: { $in: loans }, issuerId: req.body.issuerId },
                { $set: { poolid: req.body.poolid } },
                function (err, result) {
                  if (err) {
                    var responseMessage = {
                      isSuccess: false,
                      statuscode: 500,
                      message:
                        "Internal Server Error: Database connection failed.",
                    };
                    winlog.error(JSON.stringify(responseMessage));
                    winlog.error(
                      "Database Error while accessing pool_detail database: " +
                      JSON.stringify(err)
                    );
                    return res.status(500).send(responseMessage);
                  } //winlog.info("44444444444444444444444444444444444444");
                  //  res.send({ "success": true, "message": "Pool Upated" });
                  //  deleteUnmapedLoans.emit('delete');
                  else {
                    db.collection("previewsavemapping").updateMany(
                      { "Loan ID": { $in: loans }, issuerId: req.body.issuerId },
                      { $set: { poolid: req.body.poolid } },
                      async function (err, result) {
                        if (err) {
                          var responseMessage = {
                            isSuccess: false,
                            statuscode: 500,
                            message:
                              "Internal Server Error: Database connection failed.",
                          };
                          winlog.error(JSON.stringify(responseMessage));
                          winlog.error(
                            "Database Error while accessing pool_detail database: " +
                            JSON.stringify(err)
                          );
                          return res.status(500).send(responseMessage);
                        } else {
                          //winlog.info("44444444444444444444444444444444444444");
                          //  res.send({ "success": true, "message": "Pool Upated" });
                          //  deleteUnmapedLoans.emit('delete');

                          res.send({ success: true, message: "Pool Upated" });
                          client.close();
                          //BDB:::::::::::::::::

                          var bdbjs = {
                            loanid: loans,
                            functiontodo: "update",
                            issuerId: req.body.issuerId
                          }
                          pools.bdbpost(req, res, db, bdbjs);

                        }
                      }
                    );


                    //  res.send({ success: true, message: "Pool Upated" });
                  }
                }
              );
            });

            eventemit1.on("update", async function () {
              // winlog.info("+++++++++++++++++++++++++++++++++++  " + loanid);
              var lmsUpdateQuery = {};
              var isrId = "issuerId";
              lmsUpdateQuery[loanidKey] = { $in: loans };
              lmsUpdateQuery[isrId] = req.body.issuerId;
              winlog.info(lmsUpdateQuery + " ::::");
              // db.collection('lms').updateMany(lmsUpdateQuery, { $set: { poolid: req.body.poolid, Status: "Mapped" } }, function (err, result) {
              //     if (err) throw err;
              //  winlog.info("33333333333333333333333333333333333333");
              db.collection("previewstdloantape").updateMany(
                lmsUpdateQuery,
                { $set: { poolid: req.body.poolid, Status: "Mapped" } },
                function (err, result) {
                  if (err) {
                    var responseMessage = {
                      isSuccess: false,
                      statuscode: 500,
                      message:
                        "Internal Server Error: Database connection failed.",
                    };
                    winlog.error(JSON.stringify(responseMessage));
                    winlog.error(
                      "Database Error while accessing pool_detail database: " +
                      JSON.stringify(err)
                    );
                    return res.status(500).send(responseMessage);
                  } else {
                    contractUpdate.emit("update");
                  }
                }
              );

              // }); // end of lms update
            }); // end of emit1
            if (req.body.functiontodo == "reupload") {
              let loanlist = loanData.map((obj) => obj["Loan ID"]);
              console.log("Loan LIST::::::::: " + loanlist);
              var updatequery = {
                numberofloans: String(loanData.length),
                originalbalance: String(originalbal),
                loanids: String(loanlist.join("#")),
              };
            } else {
              var updatequery = {
                numberofloans: String(loanData.length),
                originalbalance: String(originalbal),
                status: "Pending",
                loanids: String(loanidhash),
              };
            }

            db.collection("pool_detail").updateOne(
              { poolID: req.body.poolid },
              {
                $set: updatequery,
              },
              function (err, result) {
                if (err) {
                  var responseMessage = {
                    isSuccess: false,
                    statuscode: 500,
                    message: "Internal Server Error: Database connection failed.",
                  };
                  winlog.error(JSON.stringify(responseMessage));
                  winlog.error(
                    "Database Error while accessing pool_detail database: " +
                    JSON.stringify(err)
                  );
                  return res.status(500).send(responseMessage);
                } else {
                  winlog.info("1 document updated");
                  //  winlog.info("22222222222222222222222222222222222222222");
                  //   for (var q = 0; q < loans.length; q++) {
                  eventemit1.emit("update");
                }
                // }
              }
            ); // end of pool update
          }
        }); // end of mongo connection
      });

      MongoClient.connect(url, function (err, client) {
        if (err) {
          var responseMessage = {
            isSuccess: false,
            statuscode: 500,
            message: "Internal Server Error: Database connection failed.",
          };
          winlog.error(JSON.stringify(responseMessage));
          winlog.error(
            "Database Error while accessing pool_detail database: " +
            JSON.stringify(err)
          );
          return res.status(500).send(responseMessage);
        } else {
          const db = client.db("IntainMarkets");
          winlog.info("CONNECTED");
          var dealIds = "";
          var count = 0;
          var Dcount = "";

          // db.collection('Attribute_details').find({ aitrainedpoolname: req.body.aitrainedpoolname }).toArray(function (err, result) {
          //     winlog.info("Lengthof result" + result.length);
          //     var c = 0;
          //     for (var i in result) {
          //         if (result[i].attributeStandardName == 'current_principal') {
          //             key = result[i].attributeName;
          //             c++;
          //             if (c == result.length) {
          //                 getLoan.emit('getLoan');

          //             }
          //         }
          //         else if (result[i].attributeStandardName == 'loanid') {
          //             loanidKey = result[i].attributeName;
          //             c++;
          //             if (c == result.length) {
          //                 getLoan.emit('getLoan');

          //             }
          //         } else {
          //             c++;
          //             if (c == result.length) {
          //                 getLoan.emit('getLoan');

          //             }
          //         }
          //     }

          // });
          var result = db.collection("previewstdloantape")
            .find({ "poolid": req.body.poolid, "Loan ID": { $exists: true } });

          result.toArray(async function (err, documents) {
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
            let loanIds = documents.map(obj => obj["Loan ID"]);
            console.log("hii" + loanIds);
            console.log(documents);

            if (loanIds.length > 0 && req.body.functiontodo != "reupload") {
              console.log("hiiiiiii")
              var responseMessage = {
                success: false,
                message: "Loans Already Mapped to this Pool",
              };
              winlog.error(JSON.stringify(responseMessage));
              var bdbjson = [];

              // try {
              //   const result1 = await db
              //     .collection("previewstdloantape")
              //     .aggregate([
              //       {
              //         $match: {
              //           poolid: req.body.poolid,
              //           "Loan ID": { $exists: true },
              //         },
              //       },
              //       {
              //         $addFields: {
              //         //  "Pool ID": "$poolid", // Rename "poolid" to "Pool ID",
              //         //  "As Of Date":"$As Of Date"

              //           "Asset Category":"$Asset Class",
              //           "As Of Date":"$As Of Date"
              //         },
              //       },
              //       {
              //         $project: {
              //           // poolid: 0, // Exclude the original "poolid" field
              //           "Loan Data": 0,
              //           "Contract Data": 0,
              //           "Contract Digitized": 0,
              //           Status: 0,
              //           "Created Date": 0,
              //           Matched: 0,
              //           Verificationtemplate: 0,
              //           "System ID": 0,
              //           "_id": 0,
              //           "issuerId": 0,
              //           "Asset Class":0,
              //           "As Of Date":0
              //         },
              //       },
              //     ])
              //     .toArray();




              //   bdbjson = result1;
              //   console.log("bdbjson", bdbjson);

              //   winlog.info(
              //     "portfolio chart view bdbarr: " +
              //     JSON.stringify(bdbjson)
              //   );
              //   //https://bdb.imtest.intainmarkets.us/api/v1/imarkets/loantape
              //   await request.post({
              //     headers: { "content-type": "application/json" },
              //     url: "https://bdb.imtest.intainmarkets.us/api/v1/imarkets/loantape",
              //     body: JSON.stringify(bdbjson),
              //   });
              // } catch (error) {
              //   // Handle errors
              //   console.error(error);
              // }
              client.close();
              return res.send(responseMessage);


            } else {
              getLoan.on("getLoan", function () {
                //  var loanid = loanidKey;

                // var json = {
                //     "isSuccess": false,
                //     "message": "No Pools found for the verification agent with id  " + req.query.VAId
                // }

                var query = {};
                if (req.body.functiontodo == "reupload") {
                  query["poolid"] = req.body.poolid;
                } else {
                  query["Loan ID"] = { $in: loans };
                }
                query["issuerId"] = req.body.issuerId;

                db.collection("previewstdloantape")
                  .find(query)
                  .toArray(function (err, result) {
                    if (err) {
                      var responseMessage = {
                        isSuccess: false,
                        statuscode: 500,
                        message:
                          "Internal Server Error: Database connection failed.",
                      };
                      winlog.error(JSON.stringify(responseMessage));
                      winlog.error(
                        "Database Error while accessing pool_detail database: " +
                        JSON.stringify(err)
                      );
                      return res.status(500).send(responseMessage);
                    }
                    winlog.info("Lengthof result" + JSON.stringify(result));
                    if (result.length > 0) {
                      loanData = result;
                      //   winlog.info(JSON.stringify(loanData) + "------------------");
                      mapLoan.emit("map");
                    } else {
                      // var json = {
                      //     "isSuccess": false,
                      //     "message": "No Pools found for the verification agent with id  " + req.query.VAId
                      // }

                      res.send({
                        success: false,
                        message: "No data found for the given loans",
                      });
                      client.close();
                    }
                  });
              }); // end of emiter
            }

            getLoan.emit("getLoan");
          }); // end og mongo connection

          mapLoan.on("map", function () {
            loanidhash = loans.join("#");

            for (var i = 0; i < loanData.length; i++) {
              winlog.info(key + "    **********************");
              //  var j = loans[i];
              originalbal = parseFloat(originalbal) + parseFloat(loanData[i][key]);

              count++;
              // winlog.info(count + " : " + loans.length  + "::: "+originalbal);
              if (count == loanData.length) {
                //   winlog.info("-----------------------------------------");
                if (originalbal) originalbal = originalbal.toFixed(2);
                else {
                  originalbal = 0;
                }
                eventemit2.emit("update");
              }
            }
          });
        }
      }); // end of emit map
    }

  },

  // test: function (req, res, next) {
  //     if (!req.query.poolid) {
  //         res.status(400).send({ "message": "Missing Arguments!" })
  //     } else {

  //         MongoClient.connect(url, function (err, client) {
  //             if (err) throw err;
  //             const db = client.db("IntainMarkets");
  //             winlog.info('CONNECTED');

  //             db.collection('pool_detail').updateOne({ "poolID": req.query.poolid }, { $set: { poolname: req.query.poolname } }, function (err, result) {
  //                 if (err) throw err;

  //                     res.send({
  //                         "isSuccess": true,
  //                         "message": "Loan status and pool status updated sucessfully"
  //                     });

  //                 });

  //         });

  //     }
  // }
  getbypoolname: function (req, res, next) {
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
      } else {
        const db = client.db("IntainMarkets");
        winlog.info("CONNECTED");
        var dealIds = "";
        var count = 0;
        var Dcount = "";
        arr = [];
        db.collection("Attribute_details").distinct(
          "aitrainedpoolname",
          (err, result) => {
            if (err) {
              console.log(err);
              var responseMessage = {
                "isSuccess": false,
                "statuscode": 500,
                "message": "Internal Server Error: Database connection failed."
              };
              winlog.error(JSON.stringify(responseMessage));
              winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
              return res.status(500).send(responseMessage);
            }
            arr = result;
            winlog.info("result:: " + arr);
            res.send({ AITrainedPoolNames: arr });
            client.close();
          }
        );

        //   //calculate sum of num1 and num2
        //   var num1 ="1"
        //   var num2 ="2"
      }
    });
  },

  addaitrainednames: function (req, res) {
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
      } else {
        const db = client.db("IntainMarkets");
        winlog.info("CONNECTED");
        var dealIds = "";
        var count = 0;
        var Dcount = "";


        db.collection("pool_detail").updateOne(
          { poolID: req.body.poolid },
          {
            $set: {
              aitrainedpoolname: "IM Test",
            },
          },
          function (err, result) {
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
              winlog.info("1 document updated");
              client.close();
              //  winlog.info("22222222222222222222222222222222222222222");
              //   for (var q = 0; q < loans.length; q++) {
              // }
            }
          }
        ); // end of pool update
      }
    }); // end of mongo connection

  },

  updatepreviewinvestorlist: async function (req, res) {
    winlog.info("update createpool");

    if (
      !req.body.poolid || !req.body.assigninvestor
    ) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
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
        } else {
          const db = client.db("IntainMarkets");
          winlog.info("CONNECTED");



          const result1 = await db.collection("pool_detail").findOne({ poolID: req.body.poolid });

          console.log(result1);
          // const newUsersStatus = {};
          // let resultpreviousjson = result1.previewstatus || {}
          // console.log(resultpreviousjson)
          let notificationuserlist = []
          let invetsorids = result1.assigninvestor.split(",").filter(item => item != "")
          req.body.assigninvestor.split(",").forEach(async userkey => {
            if (!invetsorids.includes(userkey)) {
              invetsorids.push(userkey)
              notificationuserlist.push({ "userid": userkey, "poolid": req.body.poolid, "unreadloanlist": [] })

            }
          })

          console.log(invetsorids)
          let finalinvetsorids = invetsorids.join(",")
          console.log(finalinvetsorids)
          const restult2 = await db.collection("pool_detail").updateOne(
            { poolID: req.body.poolid },
            { $set: { "assigninvestor": finalinvetsorids } })


          console.log("notificationuserlist " + notificationuserlist)
          const bulkOps = notificationuserlist.map(document => ({
            updateOne: {
              filter: { poolid: document.poolid, userid: document.userid },
              update: { $setOnInsert: document },
              upsert: true
            }
          }));


          if (bulkOps.length > 0) {

            const restult3 = await db.collection("previewnotification").bulkWrite(
              bulkOps)
            console.log('Document inserted in previewnotifications:');

          }
          res.send({
            isSuccess: true,
            message: "Investor List updated",
          });
          client.close();
          // function (err, result) {
          //   if (err) {
          //     var responseMessage = {
          //       "isSuccess": false,
          //       "statuscode": 500,
          //       "message": "Internal Server Error: Database connection failed."
          //     };
          //     winlog.error(JSON.stringify(responseMessage));
          //     winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
          //     return res.status(500).send(responseMessage);
          //   }
          //   // poolData = result;
          //   res.send({
          //     isSuccess: true,
          //     message: "Investor List updated",
          //   });
          // }
          // );
        }
      });
    }
  },
  bdbpost: async function (req, res, db, bdbjs) {


    console.log("bdb function " + bdbjs.loanid + " " + bdbjs.issuerId)
    var bdbjson = [];
    var loanarr = bdbjs.loanid;
    let loanid = bdbjs.loanid.map(id => "'" + id + "'")

    loanid = loanid.join(',')
    console.log("bdb function " + bdbjs.loanid)
    console.log(typeof loanarr)
    try {
      const result1 = await db
        .collection("previewstdloantape")
        .aggregate([
          {
            $match: {
              "issuerId": bdbjs.issuerId,
              "Loan ID": { $in: loanarr }
            },
          },
          {
            $addFields: {
              //  "Pool ID": "$poolid", // Rename "poolid" to "Pool ID",
              //  "As Of Date":"$As Of Date"

              "Asset Category": "$Asset Class",
              "loandataupdatedtill": "$As Of Date"
            },
          },
          {
            $project: {
              // poolid: 0, // Exclude the original "poolid" field
              "Loan Data": 0,
              "Contract Data": 0,
              "Contract Digitized": 0,
              Status: 0,
              "Created Date": 0,
              Matched: 0,
              Verificationtemplate: 0,
              "System ID": 0,
              "_id": 0,
              "Asset Class": 0,
              "As Of Date": 0

            },
          },
        ])
        .toArray();

      bdbjson = result1;
      console.log("bdbjson", bdbjson);
      var finbdbjson = {
        bdbjson: bdbjson,
        functiontodo: bdbjs.functiontodo,
        loanid: loanid,
        issuerid: bdbjs.issuerId
      };

      // finbdbjson.
      winlog.info(
        "portfolio chart view bdbarr: " +
        JSON.stringify(bdbjson)
      );
      winlog.info(
        "final chart view bdbarr: " +
        JSON.stringify(finbdbjson)
      );
      //https://bdb.imtest.intainmarkets.us/api/v1/imarkets/loantape
      request.post({
        headers: { "content-type": "application/json" },
        url: "https://bdb.imtest.intainmarkets.us/api/v1/imarkets/loantape",
        body: JSON.stringify(finbdbjson),
      });
    } catch (error) {
      // Handle errors
      console.error(error);
    }

  },

  MoveVAcontractfiles: function (req, res) {

    if (!req.body.poolid) {
      res.status(400).send({ "message": "Missing Arguments!" })
    } else {
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
        } else {
          const db = client.db("IntainMarkets");
          winlog.info("CONNECTED")
          const result1 = await db.collection("pool_detail").findOne({ poolID: req.body.poolid });
          console.log(result1)

          let VAjson = {
            "poolid": req.body.poolid,
            "filename": [],
            "field_details": {}
          }


          try {
            const sftpConfig = {
              host: 'intainvasa.blob.core.windows.net',
              port: 22,
              username: 'intainvasa.imuser',
              password: 's52f4V4dswc3JZV1+jBa6vA6h47fVawj'
            };
            const sftp = new SftpClient();
            await sftp.connect(sftpConfig);
            console.log('Connected to SFTP server');

            for (let templatename in result1.contractpath) {
              const directoryPath = path.resolve(__dirname + '/../uploads/uploads/' + templatename + "/" + result1.contractpath[templatename]);
              await sftp.put(directoryPath, '/' + result1.contractpath[templatename]);
              // await sftp.end();
              console.log('ZIP File uploaded to SFTP server');

              const attributeresult1 = await db.collection("Attribute_details").find({ "aitrainedpoolname": templatename }).toArray();
              //console.log("data " + JSON.stringify(attributeresult1))

              for (let attributes of result1.fieldstoverify[templatename]) {
                // console.log("in:::::::" + attributes)
                const standardname = attributeresult1.find(Value => {

                  return Value.attributeStandardName === attributes
                })
                console.log(standardname)
                if (standardname) {
                  let json = { "attributeStandardName": attributes, "attributeName": standardname.attributeName }

                  if (!VAjson["field_details"][templatename]) {
                    VAjson["field_details"][templatename] = []
                  }
                  VAjson["field_details"][templatename].push(json)
                }
              }

              console.log("path  " + result1.contractpath[templatename]);

              if (result1.contractpath[templatename]) {
                if (!VAjson.poolname) {
                  VAjson.poolname = attributeresult1[0].attributePoolName
                }

                VAjson.filename.push({ [result1.contractpath[templatename]]: templatename })


              } else {
                console.log("Empty file::::")
              }
            }
            console.log("All the ZIP files moved to SFTP path")
            console.log(JSON.stringify(VAjson))
            const requestOption = {
              "method": "Post",
              "headers": {
                "content-type": "application/json",
                "application_name": "IntainMarkets"

              },
              "url": "https://indumb-test.intainva.intainabs.com/api/upload_documents",
              "body": JSON.stringify(VAjson)
            }


            request(requestOption, function (error, response, body) {
              if (error) {
                console.log(error)
              } else {

                console.log(body)
                console.log("Contract file submitted for digitization:::")
                res.send({
                  "isSuccess": true,
                  "message": "Contract PDF file moved"
                })
              }
            })


            await sftp.end();

          } catch (err) {
            console.log(err);
            await sftp.end();
            var responseMessage = {
              "isSuccess": false,
              "statuscode": 500,
              "message": "Internal Server Error:"
            };
            return res.status(500).send(responseMessage);

          }

        }
      })
    }
  },

  fetchVAToken: function (req, res) {

    const options = {
      url: 'https://gva.intainva.intainabs.com/v1/JWT_TOKEN',
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + req.query.VAToken
      }
    };

    request(options, function (error, response, body) {
      if (error) {
        console.error('Error:', error);
        var responseMessage = {
          "isSuccess": false,
          "statuscode": 500,
          "message": "Internal Server Error:"
        };
        return res.status(500).send(responseMessage);
      } else {
        console.log('Response:', body);
        res.send({ "JWTToken": JSON.parse(body).token })
      }
    });
  },

  updateVAcertificate: async function () {

    try {
      const sftpConfig = {
        host: 'intainvasa.blob.core.windows.net',
        port: 22,
        username: 'intainvasa.imuser',
        password: 's52f4V4dswc3JZV1+jBa6vA6h47fVawj'
      };
      const sftp = new SftpClient();
      await sftp.connect(sftpConfig);
      console.log('Connected to SFTP server');

      const fileList = await sftp.list("/");
      const jsonFiles = fileList.filter(file => file.name.endsWith('.json') && file.name.includes("_"));

      if (jsonFiles.length > 0) {
        for (const jsonFile of jsonFiles) {
          console.log(`Processing JSON file: ${jsonFile.name}`);

          // Fetch the JSON file content
          const filePath = `/${jsonFile.name}`;
          const fileContent = await sftp.get(filePath);
          const jsonData = JSON.parse(fileContent.toString());

          // Traverse the JSON data and fetch specific values
          if (jsonData && jsonData.ipfsUrl) {
            console.log(`Value of 'someKey' in ${jsonFile.name}: ${jsonData.ipfsUrl}`);

            let poolname = jsonFile.name.split("_");
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
              } else {
                const db = client.db("IntainMarkets");
                winlog.info("CONNECTED")
                const poolresult = await db.collection("pool_detail").findOne({ poolID: poolname[0] });
                console.log("Pool result " + JSON.stringify(poolresult))
                if (poolresult) {
                  try {
                    let IPFSURL = ""
                    console.log(JSON.stringify(jsonData))
                    body = jsonData;

                    if (body.lmsdata) {

                      const loans = body.lmsdata;

                      try {
                        const bulkOperations = loans.map((loan) => ({
                          updateOne: {
                            filter: { "Loan ID": loan["Loan ID"], "issuerId": poolresult.issuerId },
                            update: { $set: loan },
                          },
                        }));
                        console.log(bulkOperations)
                        try {
                          const { modifiedCount } = await db
                            .collection("previewstdloantape")
                            .bulkWrite(bulkOperations);
                          console.log(
                            `${modifiedCount} records updated successfully`
                          );

                        } catch (error) {
                          console.error("Update failed:", error);
                          res.status(500)
                            .json({ success: false, error: error.message });
                        }
                      } catch (error) {
                        console.error("MongoDB connection failed:", error);
                        res
                          .status(500)
                          .json({ success: false, error: error.message });
                      }

                      if (IPFSURL == "") {
                        IPFSURL = body.ipfsUrl;
                        const updateData = {
                          "VACertificate": body.ipfsUrl
                        }

                        const pooldetailsres = await db.collection("pool_detail").updateOne({ poolID: poolname[0], issuerId: poolresult.issuerId }, { $set: updateData })
                        console.log("IPFS URL updated :::" + body.ipfsUrl)
                        console.log(filePath)
                        sftp.delete(filePath)
                        console.log("File deleted:::::::::")

                      }
                      //}
                      // })
                    }
                    if (body.ipfsUrl) {
                      console.log(body.ipfsUrl)
                    }

                  } catch (err) {
                    console.log("not found url" + err)
                    // return res.send({
                    //   isSuccess: true,
                    //   message: "VA certificate not found",
                    // });

                  }
                }
              }
            })
          } else {
            console.log(`URL not found in ${jsonFile.name}.`);
          }
        }
      } else {
        console.log("No files found in the root directory.");
      }

    } catch (err) {
      console.error('Error: in cron jobbb', err);
    }

    // } else {

    //   const options = {
    //     url: 'https://gva.intainva.intainabs.com/v1/JWT_TOKEN',
    //     method: 'POST',
    //     headers: {
    //       'Authorization': 'Basic ' + req.body.VAToken
    //     }
    //   };

    //   request(options, function (error, response, body) {
    //     if (error) {
    //       console.error('Error:', error);
    //       var responseMessage = {
    //         "isSuccess": false,
    //         "statuscode": 500,
    //         "message": "Internal Server Error:"
    //       };
    //       return res.status(500).send(responseMessage);
    //     } else {
    //       console.log('Response:', body);
    //       body = JSON.parse(body)
    //       let finalJWTtoken = body.token
    //       let IPFSURL = "";

    //       if (body.isSuccess) {
    //         MongoClient.connect(url, async function (err, client) {
    //           if (err) {
    //             var responseMessage = {
    //               "isSuccess": false,
    //               "statuscode": 500,
    //               "message": "Internal Server Error: Database connection failed."
    //             };
    //             winlog.error(JSON.stringify(responseMessage));
    //             winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
    //             return res.status(500).send(responseMessage);
    //           } else {
    //             const db = client.db("IntainMarkets");
    //             winlog.info("CONNECTED")
    //             const poolresult = await db.collection("pool_detail").findOne({ poolID: req.body.poolid, issuerId: req.body.issuerId });

    //             // console.log(poolresult)
    //             for (let templatekeys in poolresult.fieldstoverify) {
    //               console.log(`${templatekeys} :::::::::::::`)
    //               const attributeresult = await db.collection("Attribute_details").findOne({ aitrainedpoolname: templatekeys });
    //               console.log(attributeresult)
    //               const requestOption = {
    //                 "method": "Get",
    //                 "headers": {
    //                   "content-type": "application/json", "userrole": "Processor",
    //                   "authorization": "Bearer " + finalJWTtoken
    //                 },
    //                 "url": "https://gva.intainva.intainabs.com/v1/getLmsAndCertLink?poolid=" + req.body.poolid + "&poolname=" + attributeresult.attributePoolName + "&verificationTemplate=" + templatekeys,

    //               }

    //               try {
    //                 let { response, body } = await pools.makeRequest(requestOption)
    //                 console.log(JSON.stringify(body))
    //                 body = JSON.parse(body)

    //                 if (body.lmsdata) {

    //                   const loans = body.lmsdata;

    //                   try {
    //                     const bulkOperations = loans.map((loan) => ({
    //                       updateOne: {
    //                         filter: { "Loan ID": loan["Loan ID"],"issuerId": req.body.issuerId},
    //                         update: { $set: loan },
    //                       },
    //                     }));
    //                          console.log(bulkOperations)
    //                     try {
    //                       const { modifiedCount } = await db
    //                         .collection("previewstdloantape")
    //                         .bulkWrite(bulkOperations);
    //                       console.log(
    //                         `${modifiedCount} records updated successfully`
    //                       );

    //                     } catch (error) {
    //                       console.error("Update failed:", error);
    //                       res.status(500)
    //                         .json({ success: false, error: error.message });
    //                     } 
    //                   } catch (error) {
    //                     console.error("MongoDB connection failed:", error);
    //                     res
    //                       .status(500)
    //                       .json({ success: false, error: error.message });
    //                   }

    //                 if (IPFSURL == "") {
    //                   IPFSURL = body.ipfsUrl;
    //                   const updateData = {
    //                     "VACertificate": body.ipfsUrl
    //                   }

    //                   const pooldetailsres = await db.collection("pool_detail").updateOne({ poolID: req.body.poolid, issuerId: req.body.issuerId }, { $set: updateData })
    //                   console.log("IPFS URL updated :::")
    //                 }
    //                 //}
    //                 // })
    //               }
    //                 if (body.ipfsUrl) {
    //                   console.log(body.ipfsUrl)
    //                 }

    //               } catch (err) {
    //                 console.log("not found url" + err)
    //                 // return res.send({
    //                 //   isSuccess: true,
    //                 //   message: "VA certificate not found",
    //                 // });

    //               }
    //             }
    //             console.log("outside the loop")
    //             // client.close();

    //             res.send({
    //               isSuccess: true,
    //               message: "VA certificate updated successfully",
    //             });
    //             client.close();
    //           }
    //         })
    //       } else {
    //         return res.status(500).send(responseMessage);
    //       }
    //     }
    //   })

    // }

  },

  makeRequest: function (requestOption) {
    return new Promise((resolve, reject) => {
      request(requestOption, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve({ response, body });
        }
      });
    });
  },


  downloadVAcertificate: function (req, res) {
    if (
      !req.body.poolid ||
      !req.body.issuerId
    ) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      MongoClient.connect(url, async function (err, client) {
        if (err) {
          var responseMessage = {
            "isSuccess": false,
            "statuscode": 500,
            "message": "Internal Server Error: Database connection failed."
          };
          winlog.error(JSON.stringify(responseMessage));
          winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
          console.log('Stack trace:', err.stack);
          return res.status(500).send(responseMessage);
        }
        else {
          console.log("connected::::: ")
          const db = client.db("IntainMarkets");

          const result1 = await db.collection("pool_detail").findOne({ poolID: req.body.poolid, issuerId: req.body.issuerId });

          if (result1.VACertificate) {
            const file1 = path.resolve(
              __dirname + "/../uploads/" + req.body.poolid + ".pdf"
            );

            console.log(file1);
            http.get(
              result1.VACertificate,
              (response) => {
                // const path = "downloaded-image.jpg";
                const writeStream = fs.createWriteStream(file1);

                response.pipe(writeStream);

                writeStream.on("finish", () => {
                  writeStream.close();
                  res.download(file1);
                  client.close();
                  winlog.info("Download file ready!");
                  //  res.send({ "filepath": '/uploads/' + result.filename })
                });
              }
            );
          } else {
            var responseMessage = {
              "isSuccess": false,
              "message": "Certificate not generated"
            };
            res.send(responseMessage)
          }
        }
      })


    }
  },

  getallpoolsbyratingagency: async function (req, res, next) {
    if (!req.query.ratingagency) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      winlog.info("inside fn");
      var userid = String(req.query.ratingagency);

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
        } else {
          const db = client.db("IntainMarkets");
          winlog.info("CONNECTED");
          const finalresult = await db.collection("pool_detail").find({ ratingagency: { $regex: `\\b${userid}\\b` }, previewOrverify: "Verify" }).toArray();
          if (finalresult.length === 0) {
            console.log("No loans found for " + userid);
          res.send([]);
          } else {
            var finalresult1 = RestrictPool.Getfinalpool(finalresult, req.query.mailid, "pool")

            res.send(finalresult1);
            client.close();
          } 
   
          }
        });

    }
  },
};
module.exports = pools;