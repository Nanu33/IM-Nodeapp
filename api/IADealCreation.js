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

var dealcreation = {
saveaggregatesummarytobc: function (req, res, next) {
    if (!req.headers.authorization) {
      res.status(400).send({ message: "Missing Argument Token !" });
    } else if (!req.body.peers) {
      res.status(400).send({ message: "Missing Argument Peer !" });
    } else {
      var finalemit = new EventEmitter();
      var id = "";
      var currentdatearr = String(new Date().toLocaleDateString()).split("/");
      if (currentdatearr[0].length == 1) {
        currentdatearr[0] = "0" + currentdatearr[0];
      }
      if (currentdatearr[1].length == 1) {
        currentdatearr[1] = "0" + currentdatearr[1];
      }
      var currentdate = currentdatearr.join("/");

      const get1 = async () => {
        const abi = SLoanProcessStatus.abi;
        const contractAddress = SLoanProcessStatus.address;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        let errcount = 0;
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
          winlog.info("final updated array::::::::::::::");
          winlog.info(body)
          if (body.length > 0) {
            id = body[0][0]
            finalemit.emit("saveaggregatesummarytobc","updateLoanData");
          } else {
            id = uuidv4().toString();
            finalemit.emit("saveaggregatesummarytobc","saveLoanData");
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

      finalemit.on("saveaggregatesummarytobc", async function (functiontodo) {
        try {
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
              "Yes",
              currentdate,
              JSON.stringify(req.body.SummaryData),
            ],
          ];
          console.log("Data to save:", dataToSave);
          const encoded = incrementer.methods
            [functiontodo](dataToSave)
            .encodeABI();

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
            console.log("Decoded event:",decodedEvent, decodedEvent.id.length);
            if (decodedEvent.id.length > 0) {
              finalemit.emit('updatestatusinDB');
            } else {
              res.send({ "Success": false, "Result": "Aggregate Summary not saved!", "Status": "Enable" });
            }
          }
        } catch (error) {
          res.status(500).send({
            isSuccess: false,
            message: "Error occurred while saving data in saveaggregatesummarytobc",
          });
        }
      });

      finalemit.on("updatestatusinDB", function () {
        console.log("inside updatestatsDB:::::")
        MongoClient.connect(url, function (err, client) {
          const db = client.db("IntainMarkets");

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

              var dataId = uuidv4();
              var savetodb = [
                {
                  DataId: dataId,
                  DealName: req.body.DealName,
                  Month: req.body.Month,
                  Year: req.body.Year,
                  ServicerName: req.body.ServicerName,
                  MovetoBlockchainStatus: "Yes",
                  ModifiedDate: currentdate,
                  SummaryData: req.body.SummaryData,
                },
              ];

              winlog.info("CONNECTED");
              winlog.info("savetodb+++++++++" + JSON.stringify(savetodb));

              winlog.info("Adding the new Data into DB......");
              db.collection("LoanProcessing").insertMany(
                savetodb,
                (err, result) => {
                  if (err) return winlog.info(err);

                  db.collection("ConsolidatedLoanSummary")
                    .find({
                      DealName: req.body.DealName,
                      Month: req.body.Month,
                      Year: req.body.Year,
                    })
                    .toArray(function (err, result) {
                      if (err) {
                        winlog.info("Error in finding the data in mongoDB");
                        res.sendStatus(500);
                      } else if (result.length == 0) {
                        var dataId = uuidv4();

                        var savetodb = [
                          {
                            DataId: dataId,
                            DealName: req.body.DealName,
                            Month: req.body.Month,
                            Year: req.body.Year,
                            MovetoBlockchainStatus: "No",
                            ModifiedDate: currentdate,
                            SummaryData: {},
                          },
                        ];
                        winlog.info(
                          "savetodb+++++++++" + JSON.stringify(savetodb)
                        );
                        db.collection("ConsolidatedLoanSummary").insert(
                          savetodb,
                          (err, result) => {
                            if (err) return winlog.info(err);
                            setTimeout(function () {
                              res.send({
                                Success: true,
                                Result: "Aggregate Summary saved!",
                                Status: "Disable",
                              });
                            }, 2000);
                          }
                        );
                      } else if (result.length > 0) {
                        //update the currentdata and movetoblockchainstatus
                        //set the summary data as it is from the result
                        var updateData = {
                          $set: {
                            ModifiedDate: currentdate,
                            MovetoBlockchainStatus: "No",
                            SummaryData: result[0].SummaryData,
                          },
                        };
                        winlog.info(
                          "updateindb+++++++++" + JSON.stringify(updateData)
                        );
                        db.collection("ConsolidatedLoanSummary").updateOne(
                          {
                            DealName: req.body.DealName,
                            Month: req.body.Month,
                            Year: req.body.Year,
                          },
                          updateData,
                          (err, result) => {
                            if (err) return winlog.info(err);
                            setTimeout(function () {
                              res.send({
                                Success: true,
                                Result: "Aggregate Summary saved!",
                                Status: "Disable",
                              });
                            }, 2000);
                          }
                        );
                      }
                    });
                }
              );
            }
          );
        });
      });
    }
  },
  viewaggregatesummary: function (req, res, next) {
    if (!req.headers.authorization) {
      res.status(400).send({ message: "Missing Argument Token !" });
    } else if (!req.query.peer) {
      res.status(400).send({ message: "Missing Argument Peer !" });
    } else {
      var finalemit = new EventEmitter();

      MongoClient.connect(url, function (err, client) {
        const db = client.db("IntainMarkets");

        db.collection("LoanProcessing")
          .find({
            DealName: req.query.DealName,
            Month: req.query.Month,
            Year: req.query.Year,
            ServicerName: req.query.ServicerName,
          })
          .toArray(function (err, result) {
            if (err) {
              winlog.info("Error in finding the data in mongoDB");
              res.sendStatus(500);
            } else if (result.length == 0) {
              //disable commit to bc button in ui
              res.send({
                Success: false,
                Data: [],
                Result: "No data found!",
                Status: "Disable",
              });
            } else if (result.length > 0) {
              var MovetoBlockchainStatus = result[0].MovetoBlockchainStatus;
              console.log(MovetoBlockchainStatus)
              if (String(MovetoBlockchainStatus).toLowerCase() == "no") {
                //show the warning in ui
                res.send({
                  Success: true,
                  Data: result[0].SummaryData,
                  Result: "Data Saved!",
                  Status: "Enable",
                });
              } else if (
                String(MovetoBlockchainStatus).toLowerCase() == "yes"
              ) {
                finalemit.emit("queryfromloanprocessstatuscc");
              }
            }
          });
      });

      finalemit.on("queryfromloanprocessstatuscc", function () {
        const abi = SLoanProcessStatus.abi;
        const contractAddress = SLoanProcessStatus.address;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        let errcount = 0;
        const get1 = async () => {
          try {
            winlog.info("getDataByDealNameMonthYearServicerId")
            const data = await incrementer.methods
              .getDataByDealNameMonthYearServicerId(
                req.query.DealName,
                req.query.Month,
                req.query.Year,
                req.query.ServicerName
              )
              .call({ from: address });
              var response = { result: JSON.stringify(data) };
             // console.log(response);
              var finalresponse = JSON.parse(response.result);
              console.log(finalresponse)
            if (finalresponse.length > 0) {
              let response = finalresponse[0][7] !== undefined ? finalresponse[0][7] : '';
              res.send({
                Success: true,
                Data: JSON.parse(response),
                Result: "Data Saved!",
                Status: "Disable",
              });
            } else {
              res.status(200).send([]);
            }
          } catch (e) {
            errcount++;
            if (errcount < 0) {
              winlog.info("error occ" + e);
            } else {
              var r = { message: e.message };
              res.status(500).send(r);
            }
          }
        };

        get1();
      });
    }
  },
}
module.exports = dealcreation;