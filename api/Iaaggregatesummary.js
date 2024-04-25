var request = require("request");
const fs = require("fs");
const XLSX = require("xlsx");
var dateFormat = require("date-format");
// var dateFormat = require('dateformat');
var EventEmitter = require("events").EventEmitter;
var MongoClient = require("mongodb").MongoClient;
const date = require("date-and-time");
const RestrictPool = require("./RestrictTestPool");
//var url = "mongodb://localhost:27017/IntainMarkets";
// var url = "mongodb://104.42.155.78:27017/IntainMarkets";
// var url = "mongodb://mongoservice:27017/IntainMarkets";
var url =
  "mongodb://root:" +
  encodeURIComponent("oAq2hidBW5hHHudL") +
  "@104.42.155.78:27017/IntainMarkets";
const xl1 = require("xlsx");
const { v4: uuidv4 } = require("uuid");
const winlog = require("../log/winstonlog");
var path = require("path");
const multer = require("multer");
const SLoanProcessStatus = require("./abi/LoanProcessStatus");
const SMasterFields = require("./abi/MasterFields");
const SMapping1 = require("./abi/Mapping");

//const contractAddress = SLoanProcessStatus.address

var formulaParser = require("hot-formula-parser").Parser;
const parser = new formulaParser();
var moment = require("moment");
require("moment-timezone");
const xl = require("excel4node");
const wb = new xl.Workbook();
const ws = wb.addWorksheet("Worksheet Name");
const { Parser } = require("json2csv"); //const CSVparser = new csvParser();
let nodemailer = require("nodemailer");
const privKey =
  "476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6"; //replcae
const address = "0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D";
const Web3 = require("web3");
const web3 = new Web3(
  "http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc"
);
//const web3 = new Web3("http://20.253.174.32:9650/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
function updatedocument(data, callback) {
  // Simulating a successful response
  setTimeout(() => {
    callback(null, { statusCode: 200 }, JSON.stringify({ success: true }));
  }, 1000); // Simulating 1 second delay
}
var iaaggregatesummary = {
  updateAggDB: function (req, res) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, function (err, client) {
        const db = client.db("IntainMarkets");

        var LastModifiedDate = moment(new Date()).format("MM/DD/YYYY");

        db.collection("LoanProcessing").remove(
          {
            DealName: req.body.DealName,
            Month: req.body.Month,
            Year: req.body.Year,
            ServicerName: req.body.ServicerName,
          },
          function (err, result) {
            if (err) reject(err);
            winlog.info("LoanProcessing res: " + JSON.stringify(result));

            var dataId = uuidv4();
            var savetodb = [
              {
                DataId: dataId,
                DealName: req.body.DealName,
                Month: req.body.Month,
                Year: req.body.Year,
                ServicerName: req.body.ServicerName,
                MovetoBlockchainStatus: "No",
                ModifiedDate: LastModifiedDate,
                SummaryData: {},
              },
            ];

            db.collection("LoanProcessing").insert(
              savetodb,
              function (err, result) {
                if (err) reject(err);
                db.collection("ConsolidatedLoanSummary").remove(
                  {
                    DealName: req.body.DealName,
                    Month: req.body.Month,
                    Year: req.body.Year,
                  },
                  function (err, result) {
                    if (err) reject(err);
                    winlog.info(
                      "ConsolidatedLoanSummary res: " + JSON.stringify(result)
                    );

                    var dataId = uuidv4();
                    var savetodb = [
                      {
                        DataId: dataId,
                        DealName: req.body.DealName,
                        Month: req.body.Month,
                        Year: req.body.Year,
                        MovetoBlockchainStatus: "No",
                        ModifiedDate: LastModifiedDate,
                        SummaryData: {},
                      },
                    ];
                    db.collection("ConsolidatedLoanSummary").insert(
                      savetodb,
                      (err, result) => {
                        if (err) return winlog.info(err);
                        resolve({
                          Success: true,
                          Result: "Data saved successfully!",
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  },
  saveloanprocessdate: function (req, res, next) {
    if (!req.headers.authorization) {
      res.status(400).send({ message: "Missing Argument Token !" });
    } else if (!req.body.peers) {
      res.status(400).send({ message: "Missing Argument Peer !" });
    } else {
      var finalemit = new EventEmitter();
      var servicerlist = "";
      var currentdate = "";
      var AssetType = "";
      var PaymentDateLogic = "";


      // for current date added this

      finalemit.on('getdetails', () => {
        console.log("in::::::")
        var currentdatearr = String(new Date().toLocaleDateString()).split("/")
        if (currentdatearr[0].length == 1) {
          currentdatearr[0] = "0" + currentdatearr[0]
        }
        if (currentdatearr[1].length == 1) {
          currentdatearr[1] = "0" + currentdatearr[1]
        }
        currentdate = currentdatearr.join("-")
        finalemit.emit('getloanprocessdetails')
      })

      /*var getData = {
            peer: req.body.peers[0],
            fcn: "getAllDetailsByDealName",
            args: '[\"' + String(req.body.DealName) + '\"]'
        };
        winlog.info("---" + JSON.stringify(getData));
        request.get({
            uri: fabricURL + '/channels/' + process.env.ChannelName + '/chaincodes/' + process.env.DealServicerDateCC + '?' + require('querystring').stringify(getData),
            headers: {
                'content-type': 'application/json',
                'authorization': 'Bearer ' + String(req.headers.authorization).split(' ')[1]
            }
        },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    winlog.info("body::" + body);
                    if (body.length > 0) {
                        var response = JSON.parse(body);
                        id = response.Id
                        servicerlist = response.ServicerList
                        AssetType = response.AssetClass
                        PaymentDateLogic = response.PaymentDateLogic
                        finalemit.emit('getdetails', id, servicerlist, AssetType, PaymentDateLogic)
                    }
                    else {
                        id = uuidv4().toString();
                        finalemit.emit('getdetails', id, servicerlist, AssetType, PaymentDateLogic)
                    }
                }
                else {
                    winlog.info(response.statusCode + response.body);
                    res.send({ token: -1 });
                }
            });*/

      /* finalemit.on('getdetails', function (id, servicerlist, AssetType, PaymentDateLogic) {

            var currentdatearr = String(new Date().toLocaleDateString()).split("/")
            if (currentdatearr[0].length == 1) {
                currentdatearr[0] = "0" + currentdatearr[0]
            }
            if (currentdatearr[1].length == 1) {
                currentdatearr[1] = "0" + currentdatearr[1]
            }
            currentdate = currentdatearr.join("/")

            var DealServicerDateCC = {
                peers: req.body.peers,
                fcn: "saveDealServicerDateDetails",
                args: [id, String(req.body.DealName), servicerlist, AssetType, PaymentDateLogic, currentdate]
            };
            winlog.info("Post Data DealServicerDateCC:::::::" + JSON.stringify(DealServicerDateCC));
            request.post({
                uri: fabricURL + '/channels/' + process.env.ChannelName + '/chaincodes/' + process.env.DealServicerDateCC,
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + String(req.headers.authorization).split(' ')[1]
                },
                body: JSON.stringify(DealServicerDateCC)
            },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        winlog.info("body::" + body);
                        response = JSON.parse(body);
                        if (response.success == true) {
                            finalemit.emit('getloanprocessdetails')
                        } else {
                            finalemit.emit('getloanprocessdetails')
                        }
                    } else {
                        winlog.info(response.statusCode + response.body);
                        res.send({ token: -1 });
                    }
                });
        })*/
      // Import or define the saveLoanData function if it's not already imported or defined
      // For example:
      // const saveLoanData = require('./saveLoanData'); // Assuming saveLoanData is defined in a separate file

      finalemit.on("getloanprocessdetails", function () {
        const contractPath = path.join(
          process.cwd() + "/api/contracts/LoanProcessStatus.sol"
        );
        winlog.info("contractpath:: " + contractPath);
        const contractname = "LoanProcessStatus";

        const abi = SLoanProcessStatus.abi;
        const contractAddress = SLoanProcessStatus.address;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        let errcount = 0;

        const get1 = async () => {
          winlog.info(
            `Making a call to contract at address ${contractAddress}`
          );
          try {
            const data = await incrementer.methods
              .getDataByDealNameMonthYearServicerId(
                req.body.DealName,
                req.body.Month,
                req.body.Year,
                req.body.ServicerName
              )
              .call({ from: address });

            var response = { result: JSON.stringify(data) };
            console.log(response);
            var finalresponse = JSON.parse(response.result);
            winlog.info("final updated array::::::::::::::");
            winlog.info(finalresponse.length);
            if (finalresponse.length > 0) {
              var id = finalresponse[0][0];
              var Status = finalresponse[0][5];
              var SummaryData = finalresponse[0][7];
              console.log("SummaryData" + SummaryData);
              // Set functiontodo based on finalresponse
              var functiontodo = "updateLoanData";
              console.log(functiontodo);
              finalemit.emit(
                "saveloanprocessdetails",
                id,
                Status,
                SummaryData,
                functiontodo
              );
            } else {
              var id = uuidv4().toString();
              console.log("id" + id);

              var functiontodo = "saveLoanData";
              console.log(functiontodo);
              finalemit.emit(
                "saveloanprocessdetails",
                id,
                "No",
                "[]",
                functiontodo
              );
            }
          } catch (e) {
            errcount++;
            if (errcount <= 3) {
              winlog.info("error occ" + e);
            } else {
              var r = { message: e.message };
              res.status(500).send(r);
            }
          }
        };

        get1();
      });

      finalemit.emit("getdetails");

      finalemit.on(
        "saveloanprocessdetails",
        async function (id, Status, SummaryData, functiontodo) {
          try {
            console.log("Inside 'saveloanprocessdetails' event handler");

            const abi = SLoanProcessStatus.abi;
            const contractAddress = SLoanProcessStatus.address;

            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const dataToSave = [
              [
                id,
                String(req.body.DealName),
                req.body.Month,
                req.body.Year,
                req.body.ServicerName,
                Status,
                currentdate,
                SummaryData,
              ],
            ];
            console.log("Data to save:", dataToSave);

            // Dynamically call the appropriate function based on functiontodo
            console.log(functiontodo);
            const encoded =
              incrementer.methods[functiontodo](dataToSave).encodeABI();

            const transactionDetails = {
              from: address,
              to: contractAddress,
              data: encoded,
              gasLimit: 6000000,
              chainId: "101122",
            };

            const createTransaction = await web3.eth.accounts.signTransaction(
              transactionDetails,
              privKey
            );

            const createReceipt = await web3.eth.sendSignedTransaction(
              createTransaction.rawTransaction
            );
            //console.log("Transaction sent, receipt:", createReceipt);

            if (createReceipt.logs.length > 0) {
              const event = createReceipt.logs[0];
              const decodedEvent = web3.eth.abi.decodeParameters(
                [
                  {
                    type: "string[]", // Assuming 'id' is a string type, adjust if necessary
                    name: "id",
                  },
                ],
                event.data
              );
              // console.log("Decoded event:", decodedEvent);

              if (decodedEvent.id.length > 0) {
                console.log("Data saved successfully");
                res.send({
                  isSuccess: true,
                  message: "LoanProcess modified Date saved",
                });
              } else {
                console.log("No valid data found in the event");
                res.send({ isSuccess: false, message: "Data saving failed" });
              }
            } else {
              res.send({
                isSuccess: false,
                message: "Transaction failed or no logs emitted",
              });
            }
          } catch (error) {
            res.status(500).send({
              isSuccess: false,
              message: "Error occurred while saving data",
            });
          }
        }
      );
    }
  },
  StdfieldsQuery: async function (req, res) {
    if (!req.headers.authorization) {
      res.status(400).send({ message: "Missing Argument Token !" });
    } else if (!req.query.peer) {
      res.status(400).send({ message: "Missing Argument Peer !" });
    } else {
      MongoClient.connect(url, async function (err, client) {
        const db = client.db("IntainMarkets");

        var DealName = req.query.DealName;
        var Month = req.query.Month;
        var Year = req.query.Year;
        var ServicerName = req.query.ServicerName;
        var AssetType = [];
        let errcount = 0
        AssetType.push("Default Fields");

        var file1 =
          DealName + "-" + Month + "-" + Year + "-" + ServicerName + ".xlsx";
        var file2 =
          DealName + "-" + Month + "-" + Year + "-" + ServicerName + ".xls";
        var filepath1 = path.join("./uploads/" + file1);
        var filepath2 = path.join("./uploads/" + file2);
        console.log(file1)
        if (fs.existsSync(filepath1)) {
          var file = filepath1;
        } else if (fs.existsSync(filepath2)) {
          var file = filepath2;
        }
        const workbook = XLSX.readFile(file);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const options = { header: 1 };
        const sheetData = XLSX.utils.sheet_to_json(worksheet, options);
        const header = sheetData.shift();
        var Peer = req.query.peer;
        var token = req.headers.authorization.split(" ")[1];


        // else {
        db.collection("TableExpression")
          .find({ DealName: DealName, TableName: "General" })
          .toArray(async function (err, result) {
            if (err) {
              winlog.info("Error in finding the data in mongoDB");
              res.sendStatus(500);
            } else if (result.length > 0) {
              console.log("IN::::::::::::::::")
              var json = JSON.parse(result[0].TableData);
              json = json["General"]["General"];
              AssetType.push(json["Asset Class"]);
              console.log(JSON.stringify(AssetType));
              let stdfieldresult = await iaaggregatesummary.definitionbyassettype(AssetType);
              if (stdfieldresult) {
                res.send({ stdfields: stdfieldresult, loantapefields: header });
              } else {
                res.send({ token: -1 })
              }

              //definitionbyassettype();
            } else {
              let stdfieldresult = await iaaggregatesummary.definitionbyassettype(AssetType);
              if (stdfieldresult) {
                res.send({ stdfields: stdfieldresult, loantapefields: header });
              } else {
                res.send({ token: -1 })
              }
              //  console.log("else");
              // definitionbyassettype();
            }
          });
        // }



      });
    }
  },
  definitionbyassettype: function (AssetType, errcount = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        let stdfields = [];
        let c = 0;

        console.log("Inside definiton :" + AssetType)
        for (let i = 0; i < AssetType.length; i++) {
          const abi = SMasterFields.abi;
          const contractAddress = SMasterFields.address;
          const incrementer = new web3.eth.Contract(abi, contractAddress);
          console.log("i :::::::::::::::::::::::" + i, AssetType[i])

          const response = await iaaggregatesummary.GetDefinitonbyOffset(AssetType[i], 0, 0);


          //console.log("Response for index", i, ":", response);
          winlog.info("getDataaa++++++" + JSON.stringify(response));

          if (response.length > 0) {
            c++;

            winlog.info(
              "No of std fields stored into bc1: " + response.length
            );

            for (let j = 0; j < response.length; j++) {

              var json = JSON.parse(response[j][1]);


              if (
                json[0].def.indexOf("Z-") === -1 &&
                json[0].def.indexOf("Z_") === -1
              ) {
                stdfields.push(json[0].def);

              }
            }
          } else {
            console.log("else called ")
            c++;
          }
        }

        if (c === AssetType.length) {
          stdfields = [...new Set(stdfields)];
          winlog.info(
            "No of std fields stored into bc after omitting Z- fields: " +
            stdfields.length
          );

          resolve(stdfields);
          //res.send({ stdfields: stdfields, loantapefields: header });
        } else {
          resolve("-1");
          // res.send({ token: -1 });
        }
      } catch (e) {
        errcount++;
        if (errcount <= 3) {
          winlog.info("error occ" + e);
          this.definitionbyassettype(AssetType, errcount);
        } else {
          const r = { message: e.message };
          res.status(500).send(r);
        }
      }
    })
  },
  getMapping: function (req, res, next) {
    if (!req.headers.authorization) {
      res.status(400).send({ message: "Missing Argument Token !" });
    } else if (!req.query.peer) {
      res.status(400).send({ message: "Missing Argument Peer !" });
    } else {
      var DealName = req.query.DealName;
      var Month = req.query.Month;
      var Year = req.query.Year;
      var servicerName = req.query.servicerName;
      var eventemit = new EventEmitter();
      var maparr = [];
      var count = 0;
      const contractPath = path.join(
        process.cwd(),
        "/api/contracts/" + "Mapping1.sol"
      );

      MongoClient.connect(url, function (err, client) {
        const db = client.db("IntainMarkets");

        function querymap() {
          db.collection('LoanTapeMapping').find({ DealName: DealName, Month: Month, Year: Year, ServicerName: req.query.ServicerName }).toArray(function (err, result) {
            console.log('loan tape mapping resulttttt')
            console.log(result)
            console.log(result.length)
            if (result.length > 0) {
              var response = JSON.parse(result[0].Data);
              if (response.length > 0) {
                for (var i = 0; i < response.length; ++i) {
                  var json = {
                    "id": uuidv4().toString(),
                    "Key": response[i]['Key ' + i],
                    "Value": response[i]['Value ' + i],
                    "Expression": response[i]['Expression'],
                    "Description": ""
                  }
                  maparr.push(json);
                }
                res.send(maparr);

              } else {
                // eventemit.emit('getMappingforServicer');
                count++;
                if (count > 1) {
                  res.status(200).send([])
                } else {
                  if (Month == '01') {
                    Month = "12";
                    Year = parseInt(Year) - 1;
                  } else {
                    Month = parseInt(Month) - 1;
                    if (Month < 10) {
                      Month = "0" + Month;
                    }
                  }
                  querymap();
                }
              }
            } else {
              // eventemit.emit('getMappingforServicer');
              count++;
              if (count > 1) {
                res.status(200).send([])
              } else {
                if (Month == '01') {
                  Month = "12";
                  Year = parseInt(Year) - 1;
                } else {
                  Month = parseInt(Month) - 1;
                  if (Month < 10) {
                    Month = "0" + Month;
                  }
                }
                querymap();
              }
            }
          })
        }
        querymap();

        eventemit.on("getMappingforServicer", function () {
          // var getData = {
          //   peer: req.query.peer,
          //   fcn: "getMappingByServicerName",
          //   args: '["' + req.query.ServicerName + '"]',
          // };
          //winlog.info("getDataaa++++++" + JSON.stringify(getData));
          const get1 = async () => {
            const abi = SMapping1.abi;
            const contractAddress = SMapping1.address;
            const incrementer = new web3.eth.Contract(abi, contractAddress);
            try {
              const data = await incrementer.methods
                .getMappingByServicerName(
                  req.query.DealName,
                  req.query.Month,
                  req.query.Year,
                  req.query.ServicerName
                )
                .call({ from: address });

              var response = { result: JSON.stringify(data) };
              console.log(response);
              var body = JSON.parse(response.result);
              winlog.info("final updated array::::::::::::::");
              winlog.info(body.length);

              if (body.length > 2) {
                response = JSON.parse(body);
                response = JSON.parse(response[0].MappingData);
                winlog.info(
                  "Length of mapping:" +
                  JSON.stringify(response) +
                  "   " +
                  response.length
                );

                if (response.length > 0) {
                  for (var i = 0; i < response.length; ++i) {
                    var json = {
                      id: uuidv4().toString(),
                      Key: response[i]["Key " + i],
                      Value: response[i]["Value " + i],
                      Expression: response[i]["Expression"],
                      Description: "",
                    };
                    maparr.push(json);
                  }
                  res.send(maparr);
                } else {
                  res.status(200).send([]);
                }
              } else {
                res.status(200).send([]);
              }
            } catch (e) {
              errcount++;
              if (errcount <= 3) {
                winlog.info("error occ" + e);
              } else {
                var r = { message: e.message };
                res.status(500).send(r);
              }
            }
          };
          get1();
        });
      })
    }
  },

  saveMapping: function (req, res) {
    if (!req.headers.authorization) {
      res.status(400).send({ message: "Missing Argument Token !" });
    } else if (!req.body.peers) {
      res.status(400).send({ message: "Missing Argument Peer !" });
    } else {
      return new Promise((resolve, reject) => {
        var dataId = "";
        var data = req.body.MappingData;
        var currentdatearr = new Date().toLocaleDateString().split("/");
        if (currentdatearr[0].length == 1) {
          currentdatearr[0] = "0" + currentdatearr[0];
        }
        if (currentdatearr[1].length == 1) {
          currentdatearr[1] = "0" + currentdatearr[1];
        }
        var currentdate = currentdatearr.join("/");


        const abi = SMapping1.abi;
        const contractAddress = SMapping1.address;
        const incrementer = new web3.eth.Contract(abi, contractAddress);
        let errcount = 0;
        const get1 = async () => {
          winlog.info(
            `Making a call to contract at address ${contractAddress}`
          );
          try {
            const data1 = await incrementer.methods
              .getMappingByDealNameMonthYearAndServicerName(
                req.body.DealName,
                req.body.Month,
                req.body.Year,
                req.body.ServicerName
              )
              .call({ from: address });

            var finalresponse = { result: JSON.stringify(data1) };
            console.log(finalresponse);
            winlog.info("final updated array::::::::::::::");

            winlog.info(finalresponse.length);
            if (finalresponse.length > 0) {
              winlog.info("getMappingByDealNameMonthYearAndServicerName")
              var response2 = JSON.parse(finalresponse[0][6]);
              winlog.info(
                "No of key value pairs stored into bc: : " +
                "   " +
                response2.length
              );

              dataId = finalresponse[0][0];
              winlog.info("dataId: " + dataId);
              var functiontodo = "updateMapping";
              updatedata(dataId, data, functiontodo);
            }
            else {
              dataId = uuidv4().toString();
              winlog.info("dataId" + dataId);
              var functiontodo = "saveMapping";
              updatedata(dataId, data, functiontodo);
            }
          } catch (e) {
            errcount++;
            if (errcount <= 3) {
              winlog.info("error occ" + e);
            } else {
              var r = { message: e.message };
              res.status(500).send(r);
            }
          }
        };
        get1();

        async function updatedata(dataId, input, functiontodo) {
          try {
            const abi = SMapping1.abi;
            const contractAddress = SMapping1.address;

            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const dataToSave = [
              [
                dataId,
                req.body.DealName,
                req.body.Month,
                req.body.Year,
                req.body.ServicerName,
                currentdate,
                JSON.stringify(req.body.MappingData),
              ],
            ];
            console.log("Data to save:", dataToSave);
            winlog.info("functiontodo" + functiontodo);

            // Dynamically call the appropriate function based on functiontodo
            // console.log(functiontodo);
            const encoded =
              incrementer.methods[functiontodo](dataToSave).encodeABI();


            const transactionDetails = {
              from: address,
              to: contractAddress,
              data: encoded,
              gasLimit: 6000000,
              chainId: "101122",
            };

            const createTransaction = await web3.eth.accounts.signTransaction(
              transactionDetails,
              privKey
            );

            const createReceipt = await web3.eth.sendSignedTransaction(
              createTransaction.rawTransaction
            );
            console.log("Transaction sent, receipt:", createReceipt);
            winlog.info("createReceipt.logs.length" + createReceipt.logs.length)
            if (createReceipt.logs.length > 0) {
              const event = createReceipt.logs[0];
              const decodedEvent = web3.eth.abi.decodeParameters(
                [
                  {
                    type: "string[]", // Assuming 'id' is a string type, adjust if necessary
                    name: "id",
                  },
                ],
                event.data
              );
              console.log("Decoded event:", decodedEvent);

              if (decodedEvent.id.length > 0) {
                MongoUpdate();
                resolve({ "Success": true, "Result": "Mapping saved" })
                console.log("SaveMapping Data saved successfully");
              } else {
                console.log("No valid data found in the event");
                reject({ "Success": false, "Result": "Mapping not saved" })

              }
            } else {
              res.send({
                isSuccess: false,
                message: "SaveMapping Data not saved",
              });
            }
          } catch (e) {
            errcount++;
            if (errcount <= 3) {
              winlog.info("error occ" + e);
            } else {
              var r = { message: e.message };
              res.status(500).send(r);
            }
          }
        }
        function MongoUpdate() {
          MongoClient.connect(url, function (err, client) {
            const db = client.db("IntainMarkets");
            db.collection("LoanTapeMapping")
              .find({
                DealName: req.body.DealName,
                Month: req.body.Month,
                Year: req.body.Year,
              })
              .toArray(function (err, result) {
                console.log("loan tape mapping resulttttt");
                console.log(result);
                if (result.length > 0) {
                  var myquery = {
                    DealName: req.body.DealName,
                    Month: req.body.Month,
                    Year: req.body.Year,
                  };
                  var newvalues = {
                    $set: {
                      ServicerName: req.body.ServicerName,
                      ModifiedDate: currentdate,
                      Data: JSON.stringify(req.body.MappingData),
                    },
                  };
                  db.collection("LoanTapeMapping").update(
                    myquery,
                    newvalues,
                    (err, result) => {
                      if (err) res.sendStatus(500);
                      winlog.info("Loan Tape Mapping Updated");

                    }
                  );
                } else {
                  var savetodb = {
                    DataId: uuidv4(),
                    DealName: String(req.body.DealName),
                    Month: String(req.body.Month),
                    Year: String(req.body.Year),
                    ServicerName: req.body.ServicerName,
                    ModifiedDate: currentdate,
                    Data: JSON.stringify(req.body.MappingData),
                  };
                  db.collection("LoanTapeMapping").insertOne(
                    savetodb,
                    function (err, result) {
                      if (err) res.sendStatus(500);
                      winlog.info("Loan Tape Mapping Inserted");

                    }
                  );
                }
              });
          });
        }
      });
    }
  },

  GetDefinitonbyOffset: function (AssetType, errcount, offset) {
    return new Promise(async (resolve, reject) => {

      try {
        let stdfields = [];


        console.log("Inside definiton :::" + AssetType)

        while (true) {
          const abi = SMasterFields.abi;
          const contractAddress = SMasterFields.address;
          const incrementer = new web3.eth.Contract(abi, contractAddress);

          const response = await incrementer.methods
            .GetDefinitionByAssetTypeOffset(AssetType, 40, offset)
            .call({ from: address });

          offset = offset + 40;
          //  winlog.info("final ++++++" + JSON.stringify(response)+" "+response["0"].length);

          if (response["0"].length > 0) {
            // console.log(response["0"])
            stdfields = [...stdfields, ...response["0"]]

            if (response["1"]) {
              resolve(stdfields)
              break;
            }
          } else {
            resolve(stdfields)
            break;
          }
        }

      } catch (e) {
        console.log("Error ::::::::" + e)
        errcount++;
        if (errcount <= 3) {
          winlog.info("error occured " + e);
          definitionbyassettype(AssetType, errcount);
        } else {
          const r = { message: e.message };
          res.status(500).send(r);
        }
      }
    })
  },

  previewMappedFields: function (req, res) {

    
      var getallloans = [];

      MongoClient.connect(url, async function (err, client) {
        const db = client.db("IntainMarkets");
        winlog.info('CONNECTED');
        const result = await db.collection('LoanTape').find({ DealName: req.query.DealName, Month: req.query.Month, Year: req.query.Year, ServicerName: req.query.ServicerName }).toArray();
        if (result.length > 0) {
          getallloans = JSON.parse(result[0].LoanTapeData);
          winlog.info("\ndata len from bc:: " + JSON.stringify(getallloans[0]) + "    " + getallloans.length);
          for (var j = 0; j < getallloans.length; j++) {
            delete getallloans[j].DealName;
            delete getallloans[j].Month;
            delete getallloans[j].Year;
            delete getallloans[j].SeqNo;
            let val = getallloans[j]["Number Of Days In Arrears"];
            delete getallloans[j]["Number Of Days In Arrears"];
            getallloans[j]["Number Of Days In Arrears"] = val;
          }
          var output = { isSuccess: true, result: getallloans };
          res.send(output);
        } else {
          var output = { isSuccess: false, result: "Please run the Map fields section again" };
          res.send(output);
        }
      })
    
  },

  prepareAggregateSummary: function (req, res) {
    if (!req.headers.authorization) {
      res.status(400).send({ message: "Missing Argument Token !" });
    } else if (!req.body.peers) {
      res.status(400).send({ message: "Missing Argument Peer !" });
    } else {
      var getallloans = {};
      var collateral = [];
      var principal = [];
      var interest = [];
      var collections = [];
      var priorinterestbalance = 0.0;
      var priorprincipalbalance = 0.0;
      var aggregation = new EventEmitter();
      var finalemit = new EventEmitter();

      MongoClient.connect(url, function (err, client) {
        const db = client.db("IntainMarkets");

        db.collection("LoanProcessing")
          .find({
            DealName: req.body.DealName,
            Month: req.body.Month,
            Year: req.body.Year,
            ServicerName: req.body.ServicerName,
          })
          .toArray(function (err, result) {
            winlog.info(result.length);
            if (err) {
              winlog.info("Error in finding the data in mongoDB");
              res.sendStatus(500);
            } else if (result.length == 0) {
              aggregation.emit("prepareAggregateSummary", client);
            } else if (result.length > 0) {
              //   winlog.log("resulttttttttttt"+ result.length);
              var MovetoBlockchainStatus = result[0].MovetoBlockchainStatus;
              console.log(MovetoBlockchainStatus)
              if (String(MovetoBlockchainStatus).toLowerCase() == "no") {
                aggregation.emit("prepareAggregateSummary", client);
              } else if (
                String(MovetoBlockchainStatus).toLowerCase() == "yes"
              ) {
                finalemit.emit("queryfromloanprocessstatuscc", client);
              }
            }
          });
      });

      finalemit.on("queryfromloanprocessstatuscc", function (client) {
        const contractname = "LoanProcessStatus";
        const abi = SLoanProcessStatus.abi;
        const contractAddress = SLoanProcessStatus.address;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        let errcount = 0;
        const get1 = async () => {
          try {
            const data = await incrementer.methods
              .getDataByDealNameMonthYearServicerId(
                req.body.DealName,
                req.body.Month,
                req.body.Year,
                req.body.ServicerName
              )
              .call({ from: address });

            var response = { result: JSON.stringify(data) };
            console.log(response);
            var body = JSON.parse(response.result);
            // winlog.info("final updated array::::::::::::::");
            if (body.length > 0) {
              let response = body[0][7] !== undefined ? body[0][7] : '';
              res.send({
                Success: true,
                Data: JSON.parse(response),
                Result: "Data Saved!",
                Status: "Disable",
              });
            } else {
              aggregation.emit("prepareAggregateSummary", client);
            }
          } catch (e) {
            errcount++;
            if (errcount <= 2) {
              winlog.info("error occ" + e);
            } else {
              var r = { message: e.message };
              res.status(500).send(r);
            }
          }
        };
        get1();
      });

      aggregation.on("prepareAggregateSummary", async function (client) {
        const db = client.db("IntainMarkets");
        console.log("Connected!");
        const result = await db
          .collection("LoanTape")
          .find({
            DealName: req.body.DealName,
            Month: req.body.Month,
            Year: req.body.Year,
            ServicerName: req.body.ServicerName,
          })
          .toArray();
        if (result.length > 0) {
          getallloans = JSON.parse(result[0].LoanTapeData);
          winlog.info(
            "\ndata len from bc:: " +
            JSON.stringify(getallloans[0]) +
            "    " +
            getallloans.length
          );
          // querypriordata(getallloans);
          mappingfunc(getallloans);
        } else {
          res.status(200).send([]);
        }
      });

      function querypriordata(a) {
        //if req.body.month == 1 then query for 12th month of previous year
        //else query for req.body.month - 1
        var month = req.body.Month;
        var year = req.body.Year;
        var month1 = 0;
        var year1 = 0;
        if (month == "01") {
          month1 = 12;
          year1 = year - 1;
        } else {
          month1 = month - 1;
          if (month1 < 10) {
            month1 = "0" + month1;
          }
          year1 = year;
        }

        var getData = {
          peer: req.body.peers[0],
          fcn: "getTempReportDataByDealMonthYear",
          args:
            '["' +
            req.body.DealName +
            '","' +
            String(month1) +
            '","' +
            String(year1) +
            '","' +
            req.body.ServicerName +
            '"]',
        };
        winlog.info("---" + JSON.stringify(getData));
        request.get(
          {
            uri:
              fabricURL +
              "/channels/" +
              process.env.ChannelName +
              "/chaincodes/" +
              process.env.PaymentCC +
              "?" +
              require("querystring").stringify(getData),
            headers: {
              "content-type": "application/json",
              authorization:
                "Bearer " + req.headers.authorization.split(" ")[1],
            },
          },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              // winlog.info("body::" + body.length)
              if (body.length > 2) {
                var response = JSON.parse(body);
                var SummaryData = JSON.parse(response[0].SummaryData);
                var collections = SummaryData.Collections;
                winlog.info("collections::" + JSON.stringify(collections));
                priorinterestbalance = parseFloat(collections[0].Balance);
                priorprincipalbalance = parseFloat(collections[1].Balance);
                winlog.info(
                  "priorinterestbalance::" +
                  priorinterestbalance +
                  "priorprincipalbalance::" +
                  priorprincipalbalance
                );
                mappingfunc(a);
              } else {
                MongoClient.connect(url, function (err, client) {
                  const db = client.db("IntainMarkets");
                  db.collection("TableExpression")
                    .find({ DealName: req.body.DealName, TableName: "General" })
                    .toArray(function (err, result) {
                      if (err) {
                        winlog.info("Error in finding the data in mongoDB");
                        res.sendStatus(500);
                      } else if (result.length == 0) {
                        res.status(200).send([]);
                      } else if (result.length > 0) {
                        // winlog.info(result)
                        var json = JSON.parse(result[0].TableData);
                        var FPD =
                          json["General"]["General"]["First Payment Date"];
                        var FPD1 = FPD.split("/");
                        //split the date and get the month and year
                        var month2 = 0;
                        var year2 = 0;

                        if (FPD1[0] == "01") {
                          month2 = 12;
                          year2 = FPD1[2] - 1;
                        } else {
                          month2 = FPD1[0] - 1;
                          if (month2 < 10) {
                            month2 = "0" + month2;
                          }
                          year2 = FPD1[2];
                        }

                        winlog.info("month2:: " + month2 + "year2:: " + year2);
                        //check if month2 and year2 is equal to month and year
                        if (
                          month2 == req.body.Month &&
                          year2 == req.body.Year
                        ) {
                          // priorinterestbalance = 0.00;
                          // priorprincipalbalance = 0.00;
                          finalexpquery(a);
                          mappingfunc(a);
                        } else {
                          res.status(200).send([]);
                        }
                      }
                    });
                });
              }
            } else {
              winlog.info(response.statusCode + response.body);
              res.send({ token: -1 });
            }
          }
        );
      }

      function mappingfunc(loandata) {
        var count_col_bal1 = 0;
        var count_col_bal2 = 0;
        var count_col_bal3 = 0;
        var count_col_bal4 = 0;
        var count_col_bal5 = 0;
        var count_col_bal6 = 0;
        var count_col_bal7 = 0;
        var count_col_bal8 = 0;
        var count_col_bal9 = 0;
        var count_col_bal10 = 0;
        var count_col_bal11 = 0;
        var count_col_bal12 = 0;
        var count_col_bal13 = 0;

        var col_bal1 = 0.0;
        var col_bal2 = 0.0;
        var col_bal3 = 0.0;
        var col_bal4 = 0.0;
        var col_bal5 = 0.0;
        var col_bal6 = 0.0;
        var col_bal7 = 0.0;
        var col_bal8 = 0.0;
        var col_bal9 = 0.0;
        var col_bal10 = 0.0;
        var col_bal11 = 0.0;
        var col_bal12 = 0.0;
        var col_bal13 = 0.0;

        var int_bal1 = 0.0;
        var int_bal2 = 0.0;
        var int_bal3 = 0.0;
        var int_bal4 = 0.0;
        var int_bal5 = 0.0;

        var prin_bal1 = 0.0;
        var prin_bal2 = 0.0;
        var prin_bal3 = 0.0;
        var prin_bal4 = 0.0;
        var prin_bal5 = 0.0;
        var prin_bal6 = 0.0;
        var prin_bal7 = 0.0;
        var prin_bal8 = 0.0;

        var from_date = req.body.Month + "/01/" + req.body.Year;
        var getDaysInMonth = function (month1, year1) {
          return new Date(year1, month1, 0).getDate();
        };
        var to_noofdays = getDaysInMonth(
          parseInt(req.body.Month),
          parseInt(req.body.Year)
        );
        var to_date = req.body.Month + "/" + to_noofdays + "/" + req.body.Year;
        winlog.info("from_date: " + from_date + "  to_date:  " + to_date);

        for (var i = 0; i < loandata.length; i++) {
          //if prior principal balance is  > 0, increment count by 1
          if (parseFloat(loandata[i]["Prior Principal Balances"]) > 0) {
            count_col_bal1++;
          }
          if (
            loandata[i]["Prior Principal Balances"] != null &&
            loandata[i]["Prior Principal Balances"] != undefined &&
            loandata[i]["Prior Principal Balances"] != "" &&
            loandata[i]["Prior Principal Balances"] != "null"
          ) {
            col_bal1 += parseFloat(loandata[i]["Prior Principal Balances"]);
          }

          if (parseFloat(loandata[i]["Purchased Amount"]) > 0) {
            count_col_bal2++;
          }
          if (
            loandata[i]["Purchased Amount"] != null &&
            loandata[i]["Purchased Amount"] != undefined &&
            loandata[i]["Purchased Amount"] != "" &&
            loandata[i]["Purchased Amount"] != "null"
          ) {
            col_bal2 += parseFloat(loandata[i]["Purchased Amount"]);
          }

          if (parseFloat(loandata[i]["Funded"]) > 0) {
            count_col_bal3++;
          }
          if (
            loandata[i]["Funded"] != null &&
            loandata[i]["Funded"] != undefined &&
            loandata[i]["Funded"] != "" &&
            loandata[i]["Funded"] != "null"
          ) {
            col_bal3 += parseFloat(loandata[i]["Funded"]);
          }

          if (
            loandata[i]["Principal Payment - Scheduled"] != null &&
            loandata[i]["Principal Payment - Scheduled"] != undefined &&
            loandata[i]["Principal Payment - Scheduled"] != "" &&
            loandata[i]["Principal Payment - Scheduled"] != "null"
          ) {
            col_bal4 += parseFloat(
              loandata[i]["Principal Payment - Scheduled"]
            );
          }

          if (
            loandata[i]["Principal Payment - Curtailments"] != null &&
            loandata[i]["Principal Payment - Curtailments"] != undefined &&
            loandata[i]["Principal Payment - Curtailments"] != "" &&
            loandata[i]["Principal Payment - Curtailments"] != "null"
          ) {
            col_bal5 += parseFloat(
              loandata[i]["Principal Payment - Curtailments"]
            );
          }

          if (parseFloat(loandata[i]["Principal Payment - PIF"]) > 0) {
            count_col_bal6++;
          }

          if (
            loandata[i]["Principal Payment - PIF"] != null &&
            loandata[i]["Principal Payment - PIF"] != undefined &&
            loandata[i]["Principal Payment - PIF"] != "" &&
            loandata[i]["Principal Payment - PIF"] != "null"
          ) {
            col_bal6 += parseFloat(loandata[i]["Principal Payment - PIF"]);
          }

          if (parseFloat(loandata[i]["Principal Payment - Sold"]) > 0) {
            count_col_bal7++;
          }
          if (
            loandata[i]["Principal Payment - Sold"] != null &&
            loandata[i]["Principal Payment - Sold"] != undefined &&
            loandata[i]["Principal Payment - Sold"] != "" &&
            loandata[i]["Principal Payment - Sold"] != "null"
          ) {
            col_bal7 += parseFloat(loandata[i]["Principal Payment - Sold"]);
          }

          if (parseFloat(loandata[i]["Principal Payment - Repurchase"]) > 0) {
            count_col_bal8++;
          }
          if (
            loandata[i]["Principal Payment - Repurchase"] != null &&
            loandata[i]["Principal Payment - Repurchase"] != undefined &&
            loandata[i]["Principal Payment - Repurchase"] != "" &&
            loandata[i]["Principal Payment - Repurchase"] != "null"
          ) {
            col_bal8 += parseFloat(
              loandata[i]["Principal Payment - Repurchase"]
            );
          }

          if (parseFloat(loandata[i]["Principal Liquidated"]) > 0) {
            count_col_bal9++;
          }
          if (
            loandata[i]["Principal Liquidated"] != null &&
            loandata[i]["Principal Liquidated"] != undefined &&
            loandata[i]["Principal Liquidated"] != "" &&
            loandata[i]["Principal Liquidated"] != "null"
          ) {
            col_bal9 += parseFloat(loandata[i]["Principal Liquidated"]);
          }

          if (
            loandata[i]["Allocated Losses"] != null &&
            loandata[i]["Allocated Losses"] != undefined &&
            loandata[i]["Allocated Losses"] != "" &&
            loandata[i]["Allocated Losses"] != "null"
          ) {
            col_bal10 += parseFloat(loandata[i]["Allocated Losses"]);
          }

          if (
            loandata[i]["Principal Payment Adjustment (remit+bal)"] != null &&
            loandata[i]["Principal Payment Adjustment (remit+bal)"] !=
            undefined &&
            loandata[i]["Principal Payment Adjustment (remit+bal)"] != "" &&
            loandata[i]["Principal Payment Adjustment (remit+bal)"] != "null"
          ) {
            col_bal11 += parseFloat(
              loandata[i]["Principal Payment Adjustment (remit+bal)"]
            );
          }

          if (
            loandata[i]["Principal Payment Adjustment (bal)"] != null &&
            loandata[i]["Principal Payment Adjustment (bal)"] != undefined &&
            loandata[i]["Principal Payment Adjustment (bal)"] != "" &&
            loandata[i]["Principal Payment Adjustment (bal)"] != "null"
          ) {
            col_bal12 += parseFloat(
              loandata[i]["Principal Payment Adjustment (bal)"]
            );
          }

          if (parseFloat(loandata[i]["Current Principal Balance"]) > 0) {
            count_col_bal13++;
          }

          //Interest Collection
          if (
            loandata[i]["Interest Payment"] != null &&
            loandata[i]["Interest Payment"] != undefined &&
            loandata[i]["Interest Payment"] != "" &&
            loandata[i]["Interest Payment"] != "null"
          ) {
            int_bal2 += parseFloat(loandata[i]["Interest Payment"]);
          }
          if (
            loandata[i]["Fee Payment"] != null &&
            loandata[i]["Fee Payment"] != undefined &&
            loandata[i]["Fee Payment"] != "" &&
            loandata[i]["Fee Payment"] != "null"
          ) {
            int_bal3 += parseFloat(loandata[i]["Fee Payment"]);
          }
          if (
            loandata[i]["Asset Manager Fee"] != null &&
            loandata[i]["Asset Manager Fee"] != undefined &&
            loandata[i]["Asset Manager Fee"] != "" &&
            loandata[i]["Asset Manager Fee"] != "null"
          ) {
            int_bal3 += parseFloat(loandata[i]["Asset Manager Fee"]);
          }
          if (
            loandata[i]["Servicing Fees"] != null &&
            loandata[i]["Servicing Fees"] != undefined &&
            loandata[i]["Servicing Fees"] != "" &&
            loandata[i]["Servicing Fees"] != "null"
          ) {
            int_bal4 += parseFloat(loandata[i]["Servicing Fees"]);
          }

          //Principal Collection
          if (
            loandata[i]["Principal Payment - Scheduled"] != null &&
            loandata[i]["Principal Payment - Scheduled"] != undefined &&
            loandata[i]["Principal Payment - Scheduled"] != "" &&
            loandata[i]["Principal Payment - Scheduled"] != "null"
          ) {
            prin_bal2 += parseFloat(
              loandata[i]["Principal Payment - Scheduled"]
            );
          }
          if (
            loandata[i]["Principal Payment - Curtailments"] != null &&
            loandata[i]["Principal Payment - Curtailments"] != undefined &&
            loandata[i]["Principal Payment - Curtailments"] != "" &&
            loandata[i]["Principal Payment - Curtailments"] != "null"
          ) {
            prin_bal3 += parseFloat(
              loandata[i]["Principal Payment - Curtailments"]
            );
          }
          if (
            loandata[i]["Principal Payment - PIF"] != null &&
            loandata[i]["Principal Payment - PIF"] != undefined &&
            loandata[i]["Principal Payment - PIF"] != "" &&
            loandata[i]["Principal Payment - PIF"] != "null"
          ) {
            prin_bal4 += parseFloat(loandata[i]["Principal Payment - PIF"]);
          }
          if (
            loandata[i]["Principal Payment - Sold"] != null &&
            loandata[i]["Principal Payment - Sold"] != undefined &&
            loandata[i]["Principal Payment - Sold"] != "" &&
            loandata[i]["Principal Payment - Sold"] != "null"
          ) {
            prin_bal5 += parseFloat(loandata[i]["Principal Payment - Sold"]);
          }
          if (
            loandata[i]["Principal Payment Adjustment (remit+bal)"] != null &&
            loandata[i]["Principal Payment Adjustment (remit+bal)"] !=
            undefined &&
            loandata[i]["Principal Payment Adjustment (remit+bal)"] != "" &&
            loandata[i]["Principal Payment Adjustment (remit+bal)"] != "null"
          ) {
            prin_bal7 += parseFloat(
              loandata[i]["Principal Payment Adjustment (remit+bal)"]
            );
          }
        }

        col_bal13 =
          parseFloat(col_bal1) +
          parseFloat(col_bal2) +
          parseFloat(col_bal3) -
          (parseFloat(col_bal4) +
            parseFloat(col_bal5) +
            parseFloat(col_bal6) +
            parseFloat(col_bal7) +
            parseFloat(col_bal8) +
            parseFloat(col_bal9) +
            parseFloat(col_bal10) +
            parseFloat(col_bal11) +
            parseFloat(col_bal12));

        int_bal1 = priorinterestbalance;
        prin_bal1 = priorprincipalbalance;

        //prin_bal6 is Principal Liquidated minus Allocated Losses
        prin_bal6 = col_bal9 - col_bal10;
        // prin_bal8 = col_bal3

        int_bal5 = int_bal1 + int_bal2 - int_bal3 - int_bal4;
        prin_bal8 =
          prin_bal1 +
          prin_bal2 +
          prin_bal3 +
          prin_bal4 +
          prin_bal5 +
          prin_bal6 +
          prin_bal7;
        var total = parseFloat(int_bal5) + parseFloat(prin_bal8);

        var arr = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        var str =
          "Collateral Balance (1st " +
          arr[parseInt(req.body.Month) - 1] +
          " " +
          req.body.Year +
          " to " +
          to_noofdays +
          " " +
          arr[parseInt(req.body.Month) - 1] +
          " " +
          req.body.Year +
          ")";

        //collateral
        var json = {
          [str]: "Beginning Collateral Balance",
          Count: count_col_bal1,
          Balance: parseFloat(col_bal1).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [str]: "Add: Purchased",
          Count: count_col_bal2,
          Balance: parseFloat(col_bal2).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [str]: "Add: Funded",
          Count: count_col_bal3,
          Balance: parseFloat(col_bal3).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [str]: "Less: Scheduled Principal",
          Count: count_col_bal4,
          Balance: parseFloat(col_bal4).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [str]: "Less: Curtailments",
          Count: count_col_bal5,
          Balance: parseFloat(col_bal5).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [str]: "Less: Paid in Full",
          Count: count_col_bal6,
          Balance: parseFloat(col_bal6).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [str]: "Less: Sale",
          Count: count_col_bal7,
          Balance: parseFloat(col_bal7).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [str]: "Less: Repurchase",
          Count: count_col_bal8,
          Balance: parseFloat(col_bal8).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [str]: "Less: Liquidation",
          Count: count_col_bal9,
          Balance: parseFloat(col_bal9).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [str]: "Less: Realized Losses / (Gain)",
          Count: count_col_bal10,
          Balance: parseFloat(col_bal10).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [str]: "Less: Other (+/-)",
          Count: count_col_bal11,
          Balance: parseFloat(col_bal11).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [[str]]: "Less: Other(+/-)(non-cash)",
          Count: count_col_bal12,
          Balance: parseFloat(col_bal12).toFixed(2),
        };
        collateral.push(json);
        var json = {
          [str]: "Ending Collateral Balance",
          Count: count_col_bal13,
          Balance: parseFloat(col_bal13).toFixed(2),
        };
        collateral.push(json);

        //Interest
        var json = {
          "Interest Collections": "Beginning Interest Collections",
          Balance: parseFloat(int_bal1).toFixed(2),
        };
        interest.push(json);

        var json = {
          "Interest Collections": "Interest Received",
          Balance: parseFloat(int_bal2).toFixed(2),
        };
        interest.push(json);
        var json = {
          "Interest Collections": "Less: Others (+/-)",
          Balance: parseFloat(int_bal3).toFixed(2),
        };
        interest.push(json);

        var json = {
          "Interest Collections": "Less: Servicing Fees",
          Balance: parseFloat(int_bal4).toFixed(2),
        };
        interest.push(json);

        var json = {
          "Interest Collections": "Ending Interest Collections",
          Balance: parseFloat(int_bal5).toFixed(2),
        };
        interest.push(json);

        //principal
        var json = {
          "Principal Collections": "Beginning Principal Collections",
          Balance: parseFloat(prin_bal1).toFixed(2),
        };
        principal.push(json);
        var json = {
          "Principal Collections": "Scheduled Principal",
          Balance: parseFloat(prin_bal2).toFixed(2),
        };
        principal.push(json);
        var json = {
          "Principal Collections": "Curtailments",
          Balance: parseFloat(prin_bal3).toFixed(2),
        };
        principal.push(json);
        var json = {
          "Principal Collections": "Paid in Full",
          Balance: parseFloat(prin_bal4).toFixed(2),
        };
        principal.push(json);
        var json = {
          "Principal Collections": "Sale",
          Balance: parseFloat(prin_bal5).toFixed(2),
        };
        principal.push(json);
        var json = {
          "Principal Collections": "Liquidation",
          Balance: parseFloat(prin_bal6).toFixed(2),
        };
        principal.push(json);
        var json = {
          "Principal Collections": "Other (+/-)",
          Balance: parseFloat(prin_bal7).toFixed(2),
        };
        principal.push(json);
        // var json = {
        //     "Principal Collections": "Less: Funded",
        //     "Balance": parseFloat(prin_bal8).toFixed(2)
        // }
        // principal.push(json)
        var json = {
          "Principal Collections": "Ending Principal Collections",
          Balance: parseFloat(prin_bal8).toFixed(2),
        };
        principal.push(json);

        //collections
        var json = {
          Collections: "Interest Collections",
          Balance: parseFloat(int_bal5).toFixed(2),
        };
        collections.push(json);
        var json = {
          Collections: "Principal Collections",
          Balance: parseFloat(prin_bal8).toFixed(2),
        };
        collections.push(json);
        var json = {
          Collections: "Total Collections",
          Balance: parseFloat(total).toFixed(2),
        };
        collections.push(json);

        setTimeout(function () {
          aggregation.emit("mongosave");
        }, 1000);
      }

      aggregation.on("mongosave", function () {
        var aggsummary = {};
        aggsummary = {
          Collateral: collateral,
          Interest: interest,
          Principal: principal,
          Collections: collections,
        };

        MongoClient.connect(url, function (err, client) {
          const db = client.db("IntainMarkets");
          winlog.info("Database----" + db);
          var response = {
            success: false,
            result: "Data Already Exist",
          };
          db.collection("LoanProcessing").remove(
            {
              DealName: req.body.DealName,
              Month: req.body.Month,
              Year: req.body.Year,
              ServicerName: req.body.ServicerName,
            },
            function (err, result) {
              if (err) throw err;
              winlog.info("resultttt" + JSON.stringify(result));
              // winlog.info(result.result.n + " document(s) deleted");
              winlog.info("length " + result.length);

              winlog.info(
                "collateral:  " +
                JSON.stringify(collateral) +
                "  " +
                collateral.length
              );
              winlog.info(
                "principal:  " +
                JSON.stringify(principal) +
                "  " +
                principal.length
              );
              winlog.info(
                "interest:  " +
                JSON.stringify(interest) +
                "  " +
                interest.length
              );
              winlog.info(
                "collections:  " +
                JSON.stringify(collections) +
                "  " +
                collections.length
              );

              //saving it into mongodb starts
              var dataId = uuidv4();
              var currentdatearr = new Date().toLocaleDateString().split("/");
              if (currentdatearr[0].length == 1) {
                currentdatearr[0] = "0" + currentdatearr[0];
              }
              if (currentdatearr[1].length == 1) {
                currentdatearr[1] = "0" + currentdatearr[1];
              }
              var currentdate = currentdatearr.join("/");

              if (err) throw err;

              var savetodb = [
                {
                  DataId: dataId,
                  DealName: req.body.DealName,
                  Month: req.body.Month,
                  Year: req.body.Year,
                  ServicerName: req.body.ServicerName,
                  MovetoBlockchainStatus: "No",
                  ModifiedDate: currentdate,
                  SummaryData: aggsummary,
                },
              ];

              winlog.info("CONNECTED");
              winlog.info("savetodb+++++++++" + JSON.stringify(savetodb));

              winlog.info("Adding the new Data into DB......");
              db.collection("LoanProcessing").insert(
                savetodb,
                (err, result) => {
                  // winlog.info(result);
                  if (err) return winlog.info(err);

                  setTimeout(function () {
                    res.send({
                      Success: true,
                      Data: aggsummary,
                      Result: "Data Saved!",
                      Status: "Enable",
                    });
                  }, 1000);
                }
              );
            }
          );
        });
      });
    }
  },
};
module.exports = iaaggregatesummary;