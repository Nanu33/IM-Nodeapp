var request = require("request");
const fs = require("fs");
const reader = require("xlsx");
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
var formulaParser = require("hot-formula-parser").Parser;
const parser = new formulaParser();
var moment = require("moment");
require("moment-timezone");
const xl = require("excel4node");
const wb = new xl.Workbook();
const ws = wb.addWorksheet("Worksheet Name");
const { Parser } = require('json2csv')//const CSVparser = new csvParser();
let nodemailer = require("nodemailer");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const Web3 = require('web3');
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
//const web3 = new Web3("http://20.253.174.32:9650/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");

const SUser = require('./abi/User')
const loansjs = require("./loans");
const poolsjs = require('./pools')
const previewjs = require('./Preview');
const Iaaggregatesummary = require('./Iaaggregatesummary')
var Preview = {
  querystandardfieldnames: async function (req, res, next) {

    let asstypearr = ["Default Fields",req.query.AssetType];

   let result = await Iaaggregatesummary.definitionbyassettype(asstypearr);
    res.send({"stdfields": result});
    // MongoClient.connect(url, function (err, client) {
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
    //   const db = client.db("IntainMarkets");

    //   db.collection("IntainMasterFields")
    //     .find({})
    //     .toArray(function (err, result) {
    //       if (err) {
    //         var responseMessage = {
    //           "isSuccess": false,
    //           "statuscode": 500,
    //           "message": "Internal Server Error: Database connection failed."
    //         };
    //         winlog.error(JSON.stringify(responseMessage));
    //         winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
    //         return res.status(500).send(responseMessage);
    //       }
    //       if (result.length > 0) {
    //         res.send(result);
    //         client.close();
    //       } else {
    //         res.send([]);
    //         client.close();
    //       }
    //     });
    // });
  },
  Maprawtostdfields: function (req, res, next) {
    if (!req.body.issuerId) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var stdEmiiter = new EventEmitter();
      console.log(req.body);
      this.processTape(req, res);
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
        //save all the loan mapping in mongo
        client.close();
      });
    }
  },
  processTape: function (req, res, next) {
    var arr = [];
    var arr2 = [];
    var arr3 = [];
    var arr4 = [];

    var finalarr = [];
    var bdbarr = [];
    var totalinvoke;
    var invokecount = 1;
    var data_exist;
    //  var paymentdate = `${req.body.Month}/25/${req.body.Year}`
    var seq_num = 0;
    var DelinquencyMethod = "";
    var falsecount = 0;
    var currentdate = "";
    var a = [];
    var eventemit = new EventEmitter();
    var eventemit1 = new EventEmitter();
    var eventemit2 = new EventEmitter();
    var eventemit3 = new EventEmitter();
    var saveToBC = new EventEmitter();
    var eventemit5 = new EventEmitter();
    var createexcel = new EventEmitter();

    const getDate = (month, year) => {
      const updatedMonth = month - 1;
      const initDay = "01";
      const dateObj = moment({ year, month: updatedMonth, day: initDay });
      let formattedDate = dateObj.subtract(1, "month").format("MM-DD-YYYY");

      // winlog.info({ month, year, day: initDay, formattedDate })

      let rangeCount = 7;
      const dateRanges = [];

      while (rangeCount) {
        const tempRange = new Array(2);
        const rangeEnd = formattedDate;
        const rangeStart = moment(formattedDate, "MM-DD-YYYY")
          .subtract(1, "month")
          .add(1, "day")
          .format("MM-DD-YYYY");

        formattedDate = moment(rangeStart, "MM-DD-YYYY")
          .subtract(1, "day")
          .format("MM-DD-YYYY");

        tempRange[0] = rangeStart;
        tempRange[1] = rangeEnd;
        dateRanges.push(tempRange);
        rangeCount--;
      }
      return dateRanges;
    };
    // const resultDates = getDate(req.body.Month, req.body.Year)
    // resultDates.unshift([moment(new Date(resultDates[0][1])).add(1, "day").format("MM-DD-YYYY"), `${String(req.body.Month).length == 1 ? '0' + req.body.Month : req.body.Month}-01-${req.body.Year}`])

    var filepath1 = path.join("./uploads/" + req.body.filename);
    //var filename1 =  req.body.filename ;
    var filetype = path.extname(req.body.filename);
    console.log(filetype);
    if (filetype == ".xlsx" || filetype == ".xls") {
      // mapquery();
      renovation(req.body.MappingData);
    } else {
      var test2 = {
        Success: false,
        Result: "Some Error Occurred!",
      };
      res.status(404).send(test2);

    }

    function renovation(uiinputs) {
      var inputs = uiinputs;
      winlog.info("ibside renovatiopn::::::::::::::::::::\n");

      var path1 = filepath1;
      winlog.info(filetype + " " + filepath1);

      MongoClient.connect(url, async function (err, client) {
        const db = client.db("IntainMarkets");

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
        if (filetype == ".xlsx" || filetype == ".xls") {
          console.log("exist");
          if (fs.existsSync(path1)) {
            winlog.info("File exist!");

            var key = [];
            var key1 = [];
            const file = xl1.readFile(path1);
            let data = [];
            const rows = xl1.utils.sheet_to_json(
              file.Sheets[file.SheetNames[0]],
              { raw: true, defval: null }
            );
            rows.forEach((res) => {
              data.push(res);
            });
            Object.keys(rows[0]).forEach(function (tempkey) {
              if (tempkey.toLowerCase().includes("empty")) {
              } else {
                key.push(tempkey.trim());
              }
            });
            var ind = 0;
            console.log(":::::::::::: " + inputs.length);
            var finalrawtapejson = [];
            for (var i = 0; i < inputs.length; i++) {
              for (var j = 0; j < key.length; j++) {
                if (String(inputs[i]["Expression"]).toLowerCase() != "yes") {
                  if (inputs[i]["Value " + i] == key[j]) {
                    if (key1.length == 0) {
                      key1[j] = inputs[i]["Key " + i];
                    } else {
                      key1.push(inputs[i]["Key " + i]);
                    }
                    if (inputs[i]["Key " + i] === "Loan ID") {
                      console.log("LOAN ID in xl ::::: " + value);
                      req.body.loankey = String(inputs[i]["Value " + i]);
                    }
                    break;
                    // }
                  }
                } else {
                  var keys = inputs[i]["Key " + i];
                  var value = String(inputs[i]["Value " + i]);
                  var temp = { [keys]: value };
                  winlog.info("temp::" + JSON.stringify(temp));

                  if (key1.length == 0) {
                    key1[ind] = temp;
                  } else {
                    key1.push(temp);
                  }
                  ind++;
                  break;
                }
              }
            }
            // key1 = key1.filter(Boolean)
            winlog.info(
              "length::keys::" + JSON.stringify(key) + "    " + key.length
            );
            winlog.info(
              "\nlength::keys1::" + JSON.stringify(key1) + "    " + key1.length
            );
            var t = 1;
            var seqno;

            winlog.info(
              "no of cols: " +
              Object.keys(rows[0]).length +
              " no of rows: " +
              rows.length +
              " orginal:" +
              JSON.stringify(rows[0])
            );
            var count = 0;
            finalrawtapejson.push(rows[0]);

            function replaceKeysWithValues(obj, formula) {
              return new Promise((resolve, reject) => {
                var LastPaymentDate;
                const DateObj = inputs.find((item) =>
                  Object.entries(item).some(
                    ([key, value]) => value === "Last Payment Date"
                  )
                );
                LastPaymentDate = DateObj
                  ? Object.values(DateObj)[1]
                  : undefined;
                const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/;
                formula = formula.replace(datePattern, (match) => {
                  const excelDate =
                    moment(String(match), "MM/DD/YYYY").diff(
                      moment("1900-01-01"),
                      "days"
                    ) + 2;
                  // winlog.info({ match })
                  return excelDate.toString();
                });
                var temparr = [];
                Object.keys(obj).forEach((keys) => {
                  temparr.push(keys);
                });
                formula = formula.replace(
                  /(\b\d+\b|(?<=\[')[^\]]+(?='\]))/g,
                  "'$1'"
                );
                formula = formula.replace(/\[(.*?)\]/g, (match, key) => {
                  return obj[key] == null ? "0.00" : `'${obj[key]}'`;
                });
                var output = parser.parse(formula.replace(/\[|\]/g, ""));
                // winlog.info("output:: " + JSON.stringify(output))

                if (String(formula).toLowerCase().includes("foreclosure")) {
                  if (output.result == "") {
                    var nextPaymentDate = obj[LastPaymentDate];
                    if (
                      nextPaymentDate == "n/a" ||
                      nextPaymentDate == "" ||
                      nextPaymentDate == null
                    ) {
                      output.result = "n/a";
                    } else {
                      var date = moment("1900-01-01")
                        .add(nextPaymentDate - 2, "days")
                        .format("MM/DD/YYYY");
                      // winlog.info({ nextPaymentDate })
                      // winlog.info({ date })
                      var temp = moment(new Date(date)).toISOString();
                      if (
                        req.body.functiontodo != "reupload" &&
                        req.body.functiontodo != "upload"
                      ) {
                        resultDates.forEach((n, count) => {
                          if (count == 0) {
                            if (
                              (temp >= moment(new Date(n[0])).toISOString() &&
                                temp <= moment(new Date(n[1])).toISOString()) ||
                              temp > moment(new Date(n[1])).toISOString()
                            ) {
                              output.result = "current";
                            }
                          } else if (count >= 1 && count <= 6) {
                            if (
                              temp >= moment(new Date(n[0])).toISOString() &&
                              temp <= moment(new Date(n[1])).toISOString()
                            ) {
                              if (count == 1) {
                                output.result = "01-29_days_dq";
                              } else if (count == 2) {
                                output.result = "30-59_days_dq";
                              } else if (count == 3) {
                                output.result = "60-89_days_dq";
                              } else if (count == 4) {
                                output.result = "90-119_days_dq";
                              } else if (count == 5) {
                                output.result = "120-149_days_dq";
                              } else if (count == 6) {
                                output.result = "150-179_days_dq";
                              }
                            }
                          } else if (count == 7) {
                            if (
                              (temp >= moment(new Date(n[0])).toISOString() &&
                                temp <= moment(new Date(n[1])).toISOString()) ||
                              temp < moment(new Date(n[0])).toISOString()
                            ) {
                              output.result = "180+_days_dq";
                            }
                          }
                        });
                      } else {
                        //  output.result = "n/a";
                      }
                    }
                  }
                  // winlog.info("output acc af:: " + JSON.stringify(output))
                  resolve(output.result);

                } else {
                  winlog.info("output af:: " + JSON.stringify(output));
                  resolve(output.result);
                }
                winlog.info({ formula });
              });
            }

            //var k = key_check;
            var t = 1;
            var seqno;
            for (var k = 0; k < rows.length; k++) {
              seqno = t;
              ++t;
              var value = Object.assign({}, rows[k]);
              var value1 = {};

              var x = 0;
              var json = {};
              // json["DealName"] = String(DealName);
              // json["Month"] = String(month);
              // json["Year"] = String(year);
              // //json["MovedToBlockchain"] = String(movetoblockchain);
              // json["SeqNo"] = String(seqno);

              json["Loan Data"] = "Yes";
              json["Contract Data"] = "No";
              json["Contract Digitized"] = "No";
              json["Status"] =
                req.body.functiontodo === "upload" ? "Unmapped" : "Mapped";
              json["Created Date"] = String(new Date().toJSON()).substring(
                0,
                10
              );
              json["issuerId"] = req.body.issuerId;
              json["poolid"] = req.body.poolid;
              json["Asset Class"] = req.body.asset_class;
              json["Matched"] = "0";
              json["Verificationtemplate"] = "";
              json["As Of Date"] = req.body.AsOfDate
              // json['System ID'] = uuidv4();

              //  json["poolid"] = req.body.poolid
              // winlog.info("\nb4 value::" + JSON.stringify(value));
              // winlog.info("\nb4 inputs::" + JSON.stringify(inputs));

              var y = 0;

              for (const x in inputs) {
                Object.keys(value).forEach(function (jsonkey) {
                  // value is a json
                  if (jsonkey == inputs[x][`Value ${x}`]) {
                    // winlog.info("jsonkey::" + jsonkey + " inputs[x][`Value ${x}`]::" + inputs[x][`Value ${x}`]);
                    // if (jsonkey.toLowerCase().includes("empty") && y == key1.length) {
                    //     delete value[jsonkey];
                    // } else if (jsonkey.toLowerCase().includes("empty")) {
                    //     delete value[jsonkey];
                    // }
                    // else if (key1[y] == jsonkey || key1[y] == null) {
                    //     y++;
                    // }
                    // else {
                    // value1[key1[x]] = value[jsonkey];
                    // delete value[jsonkey];
                    // y++;
                    // }
                    value1[inputs[x][`Key ${x}`]] = value[jsonkey];
                    return;
                  }
                  // else {
                  // winlog.info("else::::::: "+jsonkey+"   "+inputs[x][`Value ${x}`])
                  // }
                });
              }
              // winlog.info("\nvalue1::" + JSON.stringify(value1));

              for (var p = 0; p < key1.length; p++) {
                if (String(typeof key1[p]) != "object") {
                  if (key1[p] != null && String(key1[p]) != "null") {
                    if (
                      String(value1[key1[p]]) == "null" ||
                      String(value1[key1[p]]) == ""
                    ) {
                      json[key1[p]] = "";
                    } else {
                      json[key1[p]] = String(value1[key1[p]]);
                    }
                  }
                } else {
                  var key = String(Object.keys(key1[p]));
                  var formula = String(Object.values(key1[p]));
                  var finalval = await replaceKeysWithValues(rows[k], formula);
                  json[key] = finalval.toString();
                  rows[k][key] = finalval.toString();
                }

                if (
                  req.body.functiontodo != "reupload" &&
                  req.body.functiontodo != "upload"
                ) {
                  if (
                    String(json["Last Payment Date"]).toLowerCase() == "n/a" ||
                    String(json["Last Payment Date"]).toLowerCase() ==
                    "undefined"
                  ) {
                    json["Number Of Days In Arrears"] = "";
                  } else {
                    if (
                      /\d{2}\/\d{2}\/\d{4}/g.exec(json["Last Payment Date"]) ==
                      null
                    ) {
                      var date = moment("1900-01-01")
                        .add(json["Last Payment Date"] - 2, "days")
                        .format("MM/DD/YYYY");
                      // winlog.info({ nextPaymentDate })
                      // winlog.info({ date })
                      var temp = moment(new Date(date)).toISOString();
                      resultDates.forEach((n, count) => {
                        if (count == 0) {
                          if (
                            (temp >= moment(new Date(n[0])).toISOString() &&
                              temp <= moment(new Date(n[1])).toISOString()) ||
                            temp > moment(new Date(n[1])).toISOString()
                          ) {
                            json["Number Of Days In Arrears"] = "current";
                          }
                        } else if (count >= 1 && count <= 6) {
                          if (
                            temp >= moment(new Date(n[0])).toISOString() &&
                            temp <= moment(new Date(n[1])).toISOString()
                          ) {
                            if (count == 1) {
                              json["Number Of Days In Arrears"] =
                                "01-29_days_dq";
                            } else if (count == 2) {
                              json["Number Of Days In Arrears"] =
                                "30-59_days_dq";
                            } else if (count == 3) {
                              json["Number Of Days In Arrears"] =
                                "60-89_days_dq";
                            } else if (count == 4) {
                              json["Number Of Days In Arrears"] =
                                "90-119_days_dq";
                            } else if (count == 5) {
                              json["Number Of Days In Arrears"] =
                                "120-149_days_dq";
                            } else if (count == 6) {
                              json["Number Of Days In Arrears"] =
                                "150-179_days_dq";
                            }
                          }
                        } else if (count == 7) {
                          if (
                            (temp >= moment(new Date(n[0])).toISOString() &&
                              temp <= moment(new Date(n[1])).toISOString()) ||
                            temp < moment(new Date(n[0])).toISOString()
                          ) {
                            json["Number Of Days In Arrears"] = "180+_days_dq";
                          }
                        }
                      });
                    }
                  }
                } else {
                  //insdie else
                }
                if (
                  /\bdate\b/i.test(key1[p]) ||
                  String(value[key1[p]]).includes(":")
                ) {
                  if (
                    String(value1[key1[p]]) == "null" ||
                    String(value1[key1[p]]) == "NULL" ||
                    String(value1[key1[p]]) == "" ||
                    value1[key1[p]] == ""
                  ) {
                    value1[key1[p]] = "";
                    json[key1[p]] = value1[key1[p]];
                  } else if (
                    String(value1[key1[p]]).toLowerCase() == "n/a" ||
                    String(value1[key1[p]]).toLowerCase() == "pif" ||
                    String(value1[key1[p]]) == "NA" ||
                    String(value1[key1[p]]) == "na" ||
                    String(value1[key1[p]]).toLowerCase() == "sold" ||
                    String(value1[key1[p]]).toLowerCase() == "paid off"
                  ) {
                  } else {
                    var date = moment("1900-01-01")
                      .add(value1[key1[p]] - 2, "days")
                      .format("MM/DD/YYYY");
                    json[key1[p]] = date;
                  }
                }
              }
              const Principalbal = "Original Principal Balance";
              json["Original Principal Balance"] =
                Principalbal in json ? json["Original Principal Balance"] : "0.00";
              finalarr.push(json);
              bdbarr.push(json);
            }
            if (finalarr.length == rows.length) {
              var excelarr = JSON.parse(JSON.stringify(finalarr));
              var dataId = uuidv4();
              var currentdatearr = new Date().toLocaleDateString().split("/");
              if (currentdatearr[0].length == 1) {
                currentdatearr[0] = "0" + currentdatearr[0];
              }
              if (currentdatearr[1].length == 1) {
                currentdatearr[1] = "0" + currentdatearr[1];
              }
              currentdate = currentdatearr.join("/");

              // var savetodb = [{
              //   DataId: dataId,
              //   DealName: req.body.DealName,
              //   Month: req.body.Month,
              //   Year: req.body.Year,
              //   ServicerName: req.body.ServicerName,
              //   // MovetoBlockchainStatus: "No",
              //   ModifiedDate: currentdate,
              //   LoanTapeData: JSON.stringify(finalarr)
              // }]

              winlog.info(
                "final arr length NEW: " +
                finalarr.length +
                " " +
                JSON.stringify(finalarr)
              );
              // res.send(finalarr)
              console.log("next:::: ");
              //let loanid = finalarr.map((obj) => obj["Loan ID"]);
              //console.log(loanid)
              // db.collection('previewstdloantape').deleteMany({ "Loan ID": { $in: loanid }, "issuerId": req.body.issuerId }, async function (err, result) {
              //   if (err) return winlog.info(err)
              //   else {
              //     console.log(`Delete Count ${result.deletedCount}`)
              req.body.finalarr = finalarr;
              // req.body.finalrawtapejson = finalrawtapejson
              // req.body.key1 = key1
              console.log("next:::: 1");

              Preview.onboardloans(req, res);
              client.close();


              // }

              //checkfrombc(DealName, month, year, ServicerName, finalarr, bdbarr);
              //createexcel(DealName, month, year, excelarr);
              // });
            }
          }
        }
      });
    }

    // async function getNextUniqueID() {
    //   const currentYear = new Date().getFullYear().toString().substr(-2);

    //   // Find the last document in MongoDB collection sorted in descending order by ID
    //   const lastDocument = await collectionName.findOne({}, { sort: { _id: -1 } });

    //   let currentNumber = 1;
    //   let currentAlphabet = 'A';
    //   let currentLastThreeDigits = '001';

    //   if (lastDocument) {
    //     // Extract the parts from the last document's ID
    //     const lastID = lastDocument._id;
    //     const lastYear = lastID.substr(0, 2);
    //     const lastNumberDigit = lastID.substr(2, 1);
    //     const lastAlphabet = lastID.substr(3, 1);
    //     const lastLastThreeDigits = lastID.substr(4);

    //     if (lastYear === currentYear) {
    //       currentLastThreeDigits = (parseInt(lastLastThreeDigits, 10) + 1).toString().padStart(3, '0');

    //       // If the last three digits reach 999, reset to '000'
    //       if (currentLastThreeDigits === '999') {
    //         currentLastThreeDigits = '001';

    //         // If the year matches the current year, then increment the number part
    //         currentNumber = parseInt(lastNumberDigit, 10) + 1;
    //         if (currentNumber > 9) {
    //           // If the number part reaches 9, then increment the alphabet and reset the number part
    //           currentNumber = 1;
    //           currentAlphabet = String.fromCharCode(lastAlphabet.charCodeAt(0) + 1);
    //           if (currentAlphabet.charCodeAt(0) > 90) { // 90 is 'Z' in ASCII code
    //             // If the alphabet reaches 'Z', then reset to 'A' and increment the year
    //             currentAlphabet = 'A';
    //             currentYear = (parseInt(lastYear) + 1).toString().padStart(2, '0');
    //           }
    //         }
    //       }
    //     } else {
    //       // If the lastYear is different from the currentYear, start fresh with the currentYear
    //       currentNumber = 1;
    //       currentAlphabet = 'A';
    //       currentLastThreeDigits = '001';
    //     }
    //   }

    //   // Create the new unique ID using the parts
    //   const newUniqueID = `${currentYear}${currentNumber}${currentAlphabet}${currentLastThreeDigits}`;
    //   return newUniqueID;
    // }

    // Example usage:
  },
  onboardloans: function (req, res, next) {
    // check for the args 
    if (!req.body.filename || !req.body.issuerId || !req.body.asset_class) {
      res.status(400).send({ "message": "Missing Arguments!" })
    }
    else {
      //  var lmscollection = req.query.poolname + "_lms"
      //    var filename = req.query.poolname + req.query.filetype;
      var filetype = path.extname(req.body.filename);
      //  var poolid = req.query.poolid;
      var uploadname = path.join('./uploads/' + req.body.filename);
      const path1 = uploadname;
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
      console.log("in" + filetype)
      //check filetype
      if (filetype === ".xlsx" || filetype === ".xls" || filetype === ".xlsm") {
        winlog.info(filetype[0] + " :::pathhhhh" + path1 + ":::" + filetype);

        if (fs.existsSync(path1)) {
          winlog.info("File exist!");
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
            } const db = client.db("IntainMarkets");
            winlog.info('CONNECTED');
            const file = reader.readFile(path1);
            var duplicate = 0;
            var Num = [];
            var dateArr = [];
            var flag = 0;
            let data = []
            winlog.info(file.SheetNames + "::");
            const temp = reader.utils.sheet_to_json(
              file.Sheets[file.SheetNames[0]], { raw: true, defval: null })
            temp.forEach((res) => {
              data.push(res)

            })
            key = Object.keys(data[0])
            const key1 = Object.keys(data[0]).length;
            winlog.info("key1::lenghth " + key1);
            console.log("final arr " + JSON.stringify(data))
            // finalarraykey = Object.keys(req.body.finalarr[0])
            //  var loc = key.indexOf("Loan ID");
            // var loc = finalarraykey.indexOf("Loan ID")
            var loanlist = req.body.finalarr.map((obj) => obj["Loan ID"]);
            const hasDuplicates = [];
            const uniqueElements = new Set();

            loanlist.forEach((element) => {

              if (uniqueElements.has(element)) {
                hasDuplicates.push(element);
              } else {
                uniqueElements.add(element);
              }
            });
            if (hasDuplicates.length != 0) {
              console.log("Duplicate Loan IDs found in data.");
              console.log(loanlist);
              const response = {
                "success": false,
                "message": "Duplicate Loan IDs found in the Excel.",
                "Loan ID's": hasDuplicates
              };
              client.close();
              return res.status(400).send(response); // Use 'return' to stop the API execution
            }
            else {
              console.log("duplicates Loan IDs not found in Excel")
            }
            req.body.loanid = loanlist
            console.log(`LIST ${loanlist} ${JSON.stringify(finalarr)}`)
            const result1 = await db.collection('previewstdloantape').find({ "Loan ID": { $in: loanlist }, "issuerId": req.body.issuerId })
            const result = await result1.toArray();
            console.log("RESULT::::: " + JSON.stringify(result))
            const duploanIds = result.map(item => item['Loan ID']);
            var loanId = []
            var Finalmappingarr = []
            if (loanlist.length > 0) {

              winlog.info("find started " + loanId);
              //return list of loan details already exist
              console.log(result1.length)

              console.log("inside reupload loantape:::: ")
              let lastDocument = await db.collection('previewstdloantape').findOne({ "issuerId": req.body.issuerId }, { sort: { "System ID": -1 } });
              console.log(lastDocument)
              lastDocument = lastDocument ? lastDocument["System ID"] : "0"
              for (const obj of req.body.finalarr) {
                const exists = result.some(obj2 => obj2["Loan ID"] === obj["Loan ID"]);
                const newobj = {}
                console.log(exists)
                if (exists) {
                  const index = result.findIndex(obj2 => obj2["Loan ID"] === obj["Loan ID"]);
                  obj["System ID"] = result[index]["System ID"]
                  newobj["Loan ID"] = obj["Loan ID"]
                  newobj["mappingData"] = req.body.MappingData
                  newobj["issuerId"] = req.body.issuerId
                  newobj["System ID"] = lastDocument
                  newobj["poolid"] = req.body.poolid
                } else {
                  newobj["Loan ID"] = obj["Loan ID"]
                  newobj["mappingData"] = req.body.MappingData
                  newobj["issuerId"] = req.body.issuerId
                  obj["System ID"] = await generateUniqueID(lastDocument);
                  lastDocument = obj["System ID"]
                  console.log("ID::::: " + obj["System ID"]);
                  newobj["System ID"] = lastDocument
                  newobj["poolid"] = req.body.poolid
                }

                Finalmappingarr.push(newobj)
              }

              console.log("updated" + JSON.stringify(req.body.finalarr));
              // find1();
              // if loan already exist then update the system id in req.body.finalarr . req.body.finalarr need to be updated with result system ID

              // find1();
              if (result.length > 0 && req.body.functiontodo == "reupload") {
                const result3 = await db
                  .collection("previewstdloantape")
                  .find({ "Loan ID": { $in: duploanIds }, issuerId: req.body.issuerId, poolid: req.body.poolid });

                const result2 = await result3.toArray();
                const loanIds1 = result2.map(item => item['Loan ID']);

                console.log("inside reupload check::::::::::")

                console.log(result.length);
                console.log(result2.length);


                if (result.length !== result2.length) {
                  //console.log(duploanIds)
                  const result3 = duploanIds.filter(x => !loanIds1.includes(x));
                  const response = {
                    "success": false, "message": "The following LoanID's Already Exists",
                    "Loan ID's": result3
                  };

                  res.send(response);
                  client.close();
                } else {
                  console.log("dupliacte loans are part of same pool ")
                  find1();
                }
              }
              else if (result.length > 0 && req.body.functiontodo == "upload") {
                // winlog.info("result length ="+result.length);
                loanId = result.map((obj) => obj["Loan ID"])
                // darray.push(loanId);
                // winlog.info("darray = " + darray.length);
                duplicate = 1;
                let uniqueArray = loanId.filter((item, index) => loanId.indexOf(item) === index)

                // for (const item of loanId) {
                //     console.log(item+" next")
                //     if (!uniqueArray.includes(item)) {
                //         uniqueArray.push(item);
                //     }
                // }
                res.send({
                  "success": false, "message": "The following LoanID's Already Exists",
                  "Loan ID's": uniqueArray
                });
                client.close();


              }
              else {
                winlog.info(loanId + 'not matched')
                find1();
              }

            }
            //winlog.info("loc = " + loc);
            const validTypes = ['date', 'string', 'number'];
            async function find1() {
              var flag1 = 0;
              for (var j = 0; j < key1; j++) {
                //  if( String(data[0][key[j]]).toLocaleLowerCase() === 'date' || String(data[0][key[j]]).toLocaleLowerCase() === 'number' || String(data[0][key[j]]).toLocaleLowerCase() === 'string' ){
                if (1) {
                  for (var i = 0; i < data.length; i++) {

                    // winlog.info("present value is "+ data[i][key[j]]);
                    // if (String(data[0][key[j]]).toLocaleLowerCase() === 'number') {

                    //     // winlog.info("Number at ");                                  
                    //     if (a == 0 && isNaN(data[i][key[j]])) {
                    //         Num.push(key[j]);
                    //         // winlog.info("key"+key[j]);
                    //         a = 1;
                    //         flag = 1
                    //     }
                    // }
                    // else if (String(data[0][key[j]]).toLocaleLowerCase() === 'date') {
                    //     // winlog.info("date at ");
                    //     if (b == 0 && isNaN(new Date(data[i][key[j]]))) {
                    //         // winlog.info("key date"+key[j]);
                    //         dateArr.push(key[j]);
                    //         flag = 1
                    //         b = 1;
                    //     }
                    // }
                    //  console.log(loc + " " + j)


                  }
                }
                else {
                  var flag1 = 1;
                  winlog.info(j);

                }
                a = 0;
                b = 0;
              }

              //winlog.info("duplicate " + duplicate);

              if (flag1 == 1) {
                res.send({
                  "success": false, "message": "Second row in the xl should define the column value data type such as String / Number / Date.",
                  "ColumnName": []
                });
                client.close();
              }
              // else if (duplicate == 1 && flag == 0) {
              //     res.send({
              //         "success": false, "message": "LoanID Already Exists",
              //         "Loan ID's": darray
              //     });
              // }

              else if (duplicate == 1 || flag == 1) {

                Num = Num.concat(dateArr);
                res.send({
                  "success": false, "message": "The below columns are not in the proper format",
                  "ColumnName": Num
                  //"Date": dateArr
                  //"Loan ID's": darray
                });
                client.close();
              }
              else if (duplicate == 0) {
                saveLMS.on('saveData', async function () {


                  winlog.info('hii');
                  winlog.info(JSON.stringify(finalarr));
                  // finalarr = finalarr.slice(1);
                  console.log(JSON.stringify(Finalmappingarr) + " loan list::: " + loanlist)
                  let loankey = req.body.loankey
                  const mappingdeleteresult = await db.collection('previewsavemapping').deleteMany({ "issuerId": req.body.issuerId, "Loan ID": { $in: loanlist } })
                  const savemappingresult = await db.collection('previewsavemapping').insertMany(Finalmappingarr)
                  const stddeleteresult = await db.collection('previewstdloantape').deleteMany({ "issuerId": req.body.issuerId, "Loan ID": { $in: loanlist } })
                  // const lmsdeleteresult = await db.collection('lms').deleteMany({ "issuerId": req.body.issuerId, [loankey]: { $in: loanlist } })
                  // const insertresult = await db.collection('lms').insertMany(finalarr)
                  const insertmanyresult = db.collection('previewstdloantape').insertMany(req.body.finalarr);
                  console.log(`count ${mappingdeleteresult.deletedCount}  ${stddeleteresult.deletedCount} ${(await insertmanyresult).insertedCount}`)
                  if (req.body.functiontodo === "reupload") {
                    console.log("Inside map loans to pool funtion")

                    poolsjs.mappoolstoloans(req, res);

                  } else {
                    res.send({ "success": true, "message": "Standard loantape save success" });
                    client.close();
                  }
                  //Use this collection "previewsavemapping" to save the mapping details
                  //if already exist delete the loans 
                  //save the mapping of individual loans



                  //   function (err, result) {
                  //         if (err) throw err;
                  //         winlog.info(" document inserted");
                  //         // res.send({ "success": true, "result": key });
                  //         //res.send(resjson);
                  //         //  event1.emit("querypool", finalarr.length);
                  //     });
                  //     , function (err, result) {

                  //     if (err) return winlog.info(err)
                  //     else {
                  //         winlog.info("Number of documents inserted: " + result.insertedCount);
                  //         winlog.info('saved to database')
                  //         res.send({ "success": true, "message": "Standard loantape save success" });
                  //     }
                  // })

                }); //end of save LMS emit

                // let lastDocument = await db.collection('previewstdloantape').findOne({ "issuerId": req.body.issuerId }, { sort: { "System ID": -1 } });
                // console.log(lastDocument)
                // lastDocument = lastDocument["System ID"] ? lastDocument["System ID"] : "0"
                // for (const obj of req.body.finalarr) {
                //     const exists = result.some(obj2 => obj2["Loan ID"] === obj["Loan ID"]);
                //     console.log(exists)
                //     if (!exists) {
                //         obj["System ID"] = await generateUniqueID(lastDocument);
                //         lastDocument = obj["System ID"]
                //         console.log("ID::::: " + obj["System ID"]);
                //     }
                // }

                console.log(`arrray after id replace ${JSON.stringify(req.body.finalarr)}`)

                for (var i = 0; i < data.length; i++) {
                  winlog.info(JSON.stringify(data[i]) + " :: index :  " + i);

                  let json = {}
                  for (var l = 0; l < key.length; l++) {
                    // winlog.info(JSON.stringify(key[l]) + "/////////////////////////////////");
                    var position = String(key[l]).toLocaleLowerCase().search(/date/i);
                    //var position = -1;
                    //   winlog.info(key[l].attributeStandardName + "--------------------------------------------------------------------position:: " + position);
                    if (position == -1) {
                      json[key[l]] = String(data[i][key[l]]);
                    } else {
                      //winlog.info("+++++++++++++++++++++++++++++++++++++++++++++++++++");
                      var utc_days = Math.floor(data[i][key[l]] - 25569);
                      var utc_value = utc_days * 86400;
                      var date_info = new Date(utc_value * 1000);

                      // Creating object of current date and time 
                      // by using Date() 
                      const now = new Date();

                      // Formatting the date and time
                      // by using date.format() method
                      const value = date.format(date_info, 'MM-DD-YYYY');

                      winlog.info(date_info + " :: date_info  :: " + value);

                      json[key[l]] = value;
                    }

                  }
                  json['System ID'] = req.body.finalarr[i]["System ID"]
                  // json['Loan Data'] = "Yes";
                  // json['Contract Data'] = "No";
                  // json['Contract Digitized'] = "No";
                  json['Status'] = req.body.functiontodo === "upload" ? "Unmapped" : "Mapped";
                  json['Created Date'] = String(new Date().toJSON()).substring(0, 10);
                  json['issuerId'] = req.body.issuerId;
                  json['poolid'] = req.body.poolid;
                  json['Asset Class'] = req.body.asset_class;
                  // json['Matched'] = '0';
                  // json['Verificationtemplate'] = "";

                  finalarr.push(json);
                  count1++;

                  if (count1 == data.length) {
                    saveLMS.emit('saveData');
                  }


                }
                //  });  // end of readfile emit
              }
            }
            //  });  // end of readfile emit
          }); // end of mongo connection 
        } else {
          winlog.info("file does not exist");
        }

        async function generateUniqueID(lastDocument) {
          return new Promise((resolve, reject) => {
            const currentYear = new Date().getFullYear().toString().substr(-2);
            const Assetclass = req.body.asset_class.substr(0, 1).toUpperCase()
            const IssuerName = req.body.IssuerName.substr(0, 2).toUpperCase()
            // Find the last document in MongoDB collection sorted in descending order by ID
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
              } const db = client.db("IntainMarkets");
              winlog.info('CONNECTED');
              // const test = await db.collection('previewstdloantape').deleteMany({"Loan_ID": { $in: ["12","13"] }});
              // console.log(test.deletedCount)

              let currentNumber = 1;
              let currentAlphabet = 'A';
              let currentLastThreeDigits = '001';

              if (lastDocument) {
                // Extract the parts from the last document's ID
                const lastID = lastDocument
                //const lastID = "23RNE9Z999";
                const lastYear = lastID.substr(0, 2);
                const lastNumberDigit = lastID.substr(5, 1);
                const lastAlphabet = lastID.substr(6, 1);
                const lastLastThreeDigits = lastID.substr(7);
                console.log("Series " + lastNumberDigit + " " + lastAlphabet + " " + lastLastThreeDigits)
                if (lastYear === currentYear) {
                  currentNumber = lastNumberDigit;
                  currentAlphabet = lastAlphabet

                  currentLastThreeDigits = (parseInt(lastLastThreeDigits, 10) + 1).toString().padStart(3, '0');
                  console.log(currentLastThreeDigits)
                  // If the last three digits reach 999, reset to '000'
                  if (currentLastThreeDigits === '1000') {
                    currentLastThreeDigits = '001';
                    currentAlphabet = String.fromCharCode(lastAlphabet.charCodeAt(0) + 1);
                    if (currentAlphabet.charCodeAt(0) > 90) { // 90 is 'Z' in ASCII code
                      // If the alphabet reaches 'Z', then reset to 'A' and increment the year
                      currentAlphabet = 'A';
                      currentNumber = parseInt(lastNumberDigit, 10) + 1;
                      console.log("currrent number +" + currentNumber)
                      if (currentNumber > 9) {
                        // If the number part reaches 9, then increment the alphabet and reset the number part
                        currentNumber = 1;
                        res.send({ "success": "false", "message": "onboarding of loans limit reached for this year" })
                        //currentYear = (parseInt(lastYear) + 1).toString().padStart(2, '0');
                        console.log("poo " + lastYear + " " + currentYear)
                        client.close();
                        reject();
                      }

                    }
                    // If the year matches the current year, then increment the number part
                  }
                }
              } else {
                // If the lastYear is different from the currentYear, start fresh with the currentYear
                console.log("inside else")
                currentNumber = 1;
                currentAlphabet = 'A';
                currentLastThreeDigits = '001';
              }

              console.log("currrent number +" + currentNumber)

              // Create the new unique ID using the parts
              const newUniqueID = `${currentYear}${Assetclass}${IssuerName}${currentNumber}${currentAlphabet}${currentLastThreeDigits}`;
              console.log("final system ID" + newUniqueID);
              resolve(newUniqueID);
              client.close();
            })
          })
        }

      }
    }

  },

  downloadexcel: function (req, res, next) {
    if (!req.body.poolid || !req.body.issuerId || !req.body.selectedFormat) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var poolid = req.body.poolid;
      var issuerId = req.body.issuerId;
      const selectedFormat = req.body.selectedFormat; // Get the selected format

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
        winlog.info("CONNECTED");

        try {
          const result1 = await db
            .collection("previewstdloantape")
            .find({ poolid: req.body.poolid, issuerId: issuerId })
            .toArray();

          if (result1.length <= 0) {
            res.send("No Data Found");
            client.close();
          } else {
            const keysToRemove = [
              "Loan Data",
              "Contract Data",
              "Contract Digitized",
              "Status",
              "Created Date",
              "issuerId",
              "poolid",
              "Asset Class",
              "Matched",
              "Verificationtemplate",
              "System ID",
              "_id",
              "As Of Date"
            ];

            const modifiedArray = result1.map((obj) => {
              const newObj = { ...obj };
              keysToRemove.forEach((key) => delete newObj[key]);
              return newObj;
            });

            if (selectedFormat === 'xlsx') {

              const workbook = new xl.Workbook();
              const worksheet = workbook.addWorksheet("Sheet 1");
              var headers = Object.keys(modifiedArray[0]);
              headers = headers.filter(
                (item) => item !== headers[headers.indexOf("_id")]
              );



              const headerStyle = workbook.createStyle({
                font: {
                  bold: true,
                },
                alignment: {
                  horizontal: "center",
                },
              });



              headers.forEach((header, colIndex) => {
                worksheet
                  .cell(1, colIndex + 1)
                  .string(header)
                  .style(headerStyle);
              });

              modifiedArray.forEach((data, rowIndex) => {
                headers.forEach((header, colIndex) => {
                  worksheet.cell(rowIndex + 2, colIndex + 1).string(data[header]);
                });
              });


              const filePath = `${poolid}.xlsx`;
              workbook.write(filePath, (err, stats) => {
                if (err) {
                  console.error("Error writing Excel file:", err);
                  res.status(500).send('Error generating Excel file');
                  console.log('Selected Format:', selectedFormat);

                } else {
                  console.log("Excel file saved successfully:", filePath);
                  res.download(filePath);
                  client.close();
                }
              });

            } else if (selectedFormat === 'csv') {
              const csvFilePath = `${poolid}.csv`;

              var headers = Object.keys(modifiedArray[0]);


              const json2csvParser = new Parser({ fields: headers });
              const csvData = json2csvParser.parse(modifiedArray);

              fs.writeFileSync(csvFilePath, csvData, 'utf-8');

              console.log('CSV file written successfully:', csvFilePath);
              res.download(csvFilePath);
              client.close();
            }
            else {
              res.status(400).send('Invalid format selected');
              client.close();
            }
          }
        } catch (error) {
          console.error('An error occurred:', error);
          res.status(500).send('Internal Server Error');
        }
      });
    }
  },
  querypoolmapping: function (req, res, next) {
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
      console.log("connected:::::::");

      db.collection("previewsavemapping").findOne(
        { poolid: req.query.poolid },
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
          if (result) {
            console.log(result);
            //  db.collection('previewsavemapping').deleteOne({ "Loan ID":  "test loan1" })
            // if (err) return winlog.info(err)
            // else {
            //   console.log(`Delete Count ${result.deletedCount}`)
            const updatedresult = result.mappingData.map((item) => {
              const modifiedItem = {};

              for (const key in item) {
                let newKey = key;
                if (key.startsWith("Key ")) {
                  newKey = "Key";
                } else if (key.startsWith("Value ")) {
                  newKey = "Value";
                }

                modifiedItem[newKey] = item[key];
              }

              return modifiedItem;
            });

            res.send({ mappingData: updatedresult });
            client.close();
          } else {
            res.send({ mappingData: [] });
            client.close();
          }
        }
      );
    });
  },
  // deleteloans: function (req, res, next) {
  //   if (!req.body.loanid || !req.body.issuerId) {
  //     res.status(400).send({ message: "Missing Arguments!" });
  //   } else {
  //     MongoClient.connect(url, function (err, client) {
  //       if (err) {
  //         var responseMessage = {
  //           "isSuccess": false,
  //           "statuscode": 500,
  //           "message": "Internal Server Error: Database connection failed."
  //         };
  //         winlog.error(JSON.stringify(responseMessage));
  //         winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
  //         return res.status(500).send(responseMessage);
  //       }
  //       const db = client.db("IntainMarkets");
  //       winlog.info("CONNECTED");
  //       var issuerId = req.body.issuerId;
  //       const deletedLoanIds = [];
  //       var loanids = req.body.loanid;
  //       let list1 = [];

  //       //find th einput loanids in collection
  //       db.collection("previewstdloantape").find(
  //         { issuerId: issuerId, "Loan ID": { $in: loanids } }).toArray(
  //           (err, doc) => {
  //             if (err) {
  //               var responseMessage = {
  //                 "isSuccess": false,
  //                 "statuscode": 500,
  //                 "message": "Internal Server Error: Database connection failed."
  //               };
  //               winlog.error(JSON.stringify(responseMessage));
  //               winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
  //               return res.status(500).send(responseMessage);
  //             }

  //             //  console.log(doc);
  //             if (doc.length > 0) {
  //               const updateQuery = {};

  //               doc.forEach((document) => {
  //                 Object.keys(document).forEach((key) => {
  //                   if (
  //                     key !== "System ID" &&
  //                     key !== "_id" &&
  //                     key !== "issuerId" &&
  //                     !updateQuery[key]
  //                   ) {
  //                     updateQuery[key] = 1;
  //                   }
  //                 });
  //               });
  //               // console.log("update");
  //               console.log(updateQuery);
  //               db.collection("previewstdloantape").updateMany(
  //                 { issuerId: issuerId, "Loan ID": { $in: loanids } },
  //                 { $unset: updateQuery },
  //                 (err, result) => {
  //                   if (err) {
  //                     var responseMessage = {
  //                       "isSuccess": false,
  //                       "statuscode": 500,
  //                       "message": "Internal Server Error: Database connection failed."
  //                     };
  //                     winlog.error(JSON.stringify(responseMessage));
  //                     winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
  //                     return res.status(500).send(responseMessage);
  //                   } else {
  //                     res.send({
  //                       success: true,
  //                       message: "Loans Deleted Successfully",
  //                     });
  //                   }
  //                 }
  //               );
  //             } else {
  //               res.send({
  //                 success: false,
  //                 message: loanids + " Loan ID Not  Found",
  //               });
  //             }
  //           }
  //         );
  //     });
  //   }
  // },
  previewunderwriterpool: function (req, res) {
    if (!req.query.underwriterId || !req.query.mailid) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var userid = String(req.query.underwriterId);
      var poolIDs = [];
      var response = {}
      // connect to the mongo client
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
        console.log("Database connected!");

        async function retrievePoolsForUser() {
          try {
            const finalresult = await db.collection("pool_detail").find({ assignunderwriter: { $regex: `\\b${userid}\\b` }, previewOrverify: "Preview" }).toArray();
            poolIDs = finalresult.map((pool) => pool.poolID);
            if (finalresult.length === 0) {
              console.log("No loans found for " + userid);
              res
                .status(200)
                .send({ message: "No pools found for the " + userid });
              client.close();
            } else {
              var finalresult1 = RestrictPool.Getfinalpool(finalresult, req.query.mailid, "pool")
              // res.send({"PoolIDs": finalresultIDs})

              db.collection("previewnotification").find({ userid: userid, poolid: { $in: poolIDs }, unreadloanlist: { $exists: true, $ne: [] } }).project({ poolid: 1, _id: 0 }).toArray(function (err, result) {
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
                  response['pooldetails'] = finalresult1;
                  response['notificationlist'] = notificationlist;
                  res.send(response);
                  client.close();
                }
              });
            }
          } catch (err) {
            console.error("Error retrieving Pools:", err);
            client.close();
            return res.status(500).send(responseMessage);

          }
        }
        retrievePoolsForUser();
      });
    }
  },
  previewupdatePoolStatus: function (req, res, next) {
    if (!req.body.poolid || !req.body.status || !req.body.userid) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var userEmitter = new EventEmitter();
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
        winlog.info("CONNECTED");


        db.collection("pool_detail").updateOne(
          { poolID: req.body.poolid },
          {
            $set: {
              [`previewstatus.${req.body.userid}`]: req.body.status
            }
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
            }
            if (req.body.status.toLowerCase().includes("rejected")) {
              userEmitter.emit('sendmail')
            }
            res.send({
              success: true,
              message: "Pool status updated successfully",
              // previewstatus: previewstatus,
            });
            client.close();
          }
        );
      });

      userEmitter.on('sendmail', function () {
        MongoClient.connect(url, async function (err, client) {

          const db = client.db("IntainMarkets");
          const poolresult = await db.collection("pool_detail").findOne({ poolID: req.body.poolid });
          console.log(poolresult.issuerId)

          const abi = SUser.abi;
          const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)
          const contractPath = path.resolve(__dirname, 'contracts', 'User.sol');
          const incrementer = new web3.eth.Contract(abi, contractAddress);
          let errcount = 0;
          const get1 = async () => {
            try {
              const data = await incrementer.methods
                .getUserById(poolresult.issuerId)
                .call({ from: address });
              winlog.info("data:: 3333" + JSON.stringify(data));

              var arr1 = JSON.parse(JSON.stringify(data));
              winlog.info(`The current string is ${arr1[1]}`);

              var mailString = `Hi,<br>  ${req.body.username} - ${req.body.organizationname} has rejected the Pool ${req.body.userid} `
              if (req.body.message.length > 0) {
                mailString = mailString + `with the following message "${req.body.message}"`
              }

              let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "demo_emulya@intainft.com",
                  pass: "Intain@1234"
                }
              });
              // winlog.info("Value----"+JSON.stringify(obj.EmailID[i].EmailID));
              winlog.info("---------------------");
              winlog.info("Running Email Job");
              let mailOptions = {

                from: "demo_emulya@intainft.com",
                to: arr1[1],
                // to: "pavithra.v@intainft.com",
                subject: "Preview Pool Rejection - REG",
                html: mailString
              };

              winlog.info("mailOptions::" + JSON.stringify(mailOptions));

              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  // throw error;
                  winlog.info(error + "Email : " + req.query.EmailAddress);
                  res.send(error + "Email : " + req.query.EmailAddress);
                  client.close();


                } else {
                  winlog.info("Email successfully sent!");
                  res.send({ "message": "Email successfully sent!" });
                  client.close();


                }
              });
            } catch (e) {
              console.log(e)
              errcount++;
              if (errcount <= 3) {
                winlog.info("error occ" + e); get1();
              } else {
                var r = { "message": e.message }
                res.status(500).send(r);
                client.close();

              }
            }
          }
          get1();
        })
      })
    }
  },
  savefeedback: function (req, res, next) {
    if (
      !req.body.poolid || !req.body.loanid || !req.body.userid || !req.body.username || !req.body.feedback || !req.body.organizationname) {
      res.status(400).send({ "message": "Missing Arguments!" });
    } else {


      MongoClient.connect(url,  function (err, client) {
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
        let ts = Date.now();

        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        let hour = date_ob.getHours();
        let minute = date_ob.getMinutes();
        let second = date_ob.getSeconds();
        let createddate = month + "-" + date + "-" + year + " " + hour + ":" + minute + ":" + second;
        var json = {
          poolid: req.body.poolid,
          loanid: req.body.loanid,
          userid: req.body.userid,
          username: req.body.username,
          feedback: req.body.feedback,
          organizationname: req.body.organizationname,
          createddateandtime: createddate
        };

        db.collection('previewfeedback').insertOne(json, async function (err, result) {
          console.log(result);

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
          if (result.acknowledged == true) {
            winlog.info(`Feedback saved `)
            const result2 = await db.collection('previewnotification').updateMany(
              { poolid: json.poolid, userid: { $nin: [json.userid, req.body.issuerId] } },
              { $addToSet: { unreadloanlist: json.loanid } }
            );
            console.log(result2)
            res.send({
              "success": true,
              "message": "Feedback uploaded"
            });
            client.close();

          }


        });

      })
    }
  },
  retrievefeedback: function (req, res, next) {
    if (!req.query.loanid || !req.query.poolid) {
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
        } const db = client.db("IntainMarkets");
        winlog.info('CONNECTED');


        db.collection('previewfeedback').find({ loanid: req.query.loanid, poolid: req.query.poolid }).toArray(function (err, result) {
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

          // db.collection("previewnotification").updateOne({ "poolid": req.query.poolid, "userid": req.query.userid }, {
          //   $pull: { "unreadloanlist": req.query.loanid }
          // }, function (err, result) {
          //   if (err) {
          //     var responseMessage = {
          //       "isSuccess": false,
          //       "statuscode": 500,
          //       "message": "Internal Server Error: Database connection failed."
          //     };
          //     return res.status(500).send(responseMessage);
          //   }


          // })
          if (result.length > 0) {
            res.send(result);
            client.close();

          }
          else {

            res.send([]);
            client.close();


          }
        });


      });
    }
  },
  previewinvestorpool: function (req, res) {
    if (!req.query.investorId || !req.query.mailid) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var userid = String(req.query.investorId);
      var poolIDs = [];
      var response = {}

      // connect to the mongo client
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
        console.log("Database connected!");

        async function retrievePoolsForUser() {
          try {
            const finalresult = await db
              .collection("pool_detail")
              .find({ assigninvestor: { $regex: `\\b${userid}\\b` }, previewOrverify: "Preview" })
              .toArray();

            // const finalresultIDs = finalresult.map((pool) => pool.poolname);

            if (finalresult.length === 0) {
              console.log("No loans found for " + userid);
              res.send({ "pooldetails": [], "notificationlist": [] });
              client.close();
            } else {
              var finalresult1 = RestrictPool.Getfinalpool(finalresult, req.query.mailid, "pool")
              // res.send(finalresult1);
              // console.log("Pool ids for " + userid + ": " + finalresultIDs);
              // res.send({"PoolIDs": finalresultIDs})
              poolIDs = finalresult1.map((pool) => pool.poolID);
              db.collection("previewnotification").find({ userid: userid, poolid: { $in: poolIDs }, unreadloanlist: { $exists: true, $ne: [] } }).project({ poolid: 1, _id: 0 }).toArray(function (err, result) {
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
                  response['pooldetails'] = finalresult1;
                  response['notificationlist'] = notificationlist;
                  res.send(response);
                  client.close();

                }
              });
            }
          } catch (err) {
            console.error("Error retrieving Pools:", err);
            client.close();
            return res.status(500).send(responseMessage);

          }
        }
        retrievePoolsForUser();
      });
    }
  },

  deleteloans1: function (req, res, next) {
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
        const updateQuery = {};
        const deletedLoanIds = [];
        var loanids = req.body.loanid;
        let list1 = [];
        const bulkWriteOperations = [];

        //find th einput loanids in collection
        db.collection("previewstdloantape").find(
          { issuerId: issuerId, "Loan ID": { $in: loanids } }).toArray(
            async (err, doc) => {
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


              const mappedDocs = doc.filter(loandocument => loandocument.Status === "Mapped");
              console.log("Mapped Documents:", mappedDocs);
              const poolids = mappedDocs.map(loandocument => loandocument.poolid);
              console.log(poolids)
              const latestDocument = await db.collection('pool_detail').find({ "poolID": { $in: poolids } }).toArray();


              // Create an array to store bulk write operation


              // Iterate through mappedDocs
              for (const loandocument of doc) {
                const status = loandocument.Status;


                if (status != "Unmapped") {

                  // Find the corresponding pool document in latestDocument
                  const poolDocument = latestDocument.find(pool => pool.poolID === loandocument.poolid);

                  if (poolDocument) {

                    console.log("Updating Loanid " + loandocument["Loan ID"])

                    //       console.log(poolDocument.loanids, poolDocument.originalbalance, poolDocument.numberofloans)

                    //Updating loanids , originalbalance , numberofloans
                    const loanidsArray = poolDocument.loanids.split("#");
                    const filteredLoanids = loanidsArray.filter(item => item !== loandocument["Loan ID"]);

                    poolDocument.loanids = filteredLoanids.join("#")
                    poolDocument.originalbalance = poolDocument.originalbalance - loandocument["Original Principal Balance"];
                    poolDocument.numberofloans = poolDocument.numberofloans - 1;

                    //filter  (individual update for each pool)
                    const filter = { "poolID": poolDocument.poolID };

                    // Define the update operation
                    const update = {
                      $set: {
                        loanids: poolDocument.loanids,
                        originalbalance: poolDocument.originalbalance,
                        numberofloans: poolDocument.numberofloans,
                      },
                    };

                    // Create the updateMany operation and add it to the bulk write operations array
                    bulkWriteOperations.push({
                      updateMany: {
                        filter: filter,
                        update: update,
                      },
                    });
                  }
                }
                Object.keys(loandocument).forEach((key) => {
                  if (
                    key !== "System ID" &&
                    key !== "_id" &&
                    key !== "issuerId" &&
                    !updateQuery[key]
                  ) {
                    updateQuery[key] = 1;
                  }
                });
              }

              const mappingDeleteResult = await db.collection('previewsavemapping').deleteMany({
                "issuerId": issuerId,
                "Loan ID": { $in: loanids }
              });

              console.log("previewsavemapping", mappingDeleteResult);


              if (bulkWriteOperations.length > 0) {
                const bulkresult = await db.collection('pool_detail').bulkWrite(bulkWriteOperations);
                console.log(`Modified ${bulkresult.modifiedCount} documents in pool_detail collection`);
              }

              //delete the loans
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
                    winlog.error("Database Error while accessing previewstdloantape database: " + JSON.stringify(err));
                    return res.status(500).send(responseMessage);
                  } else if (result.modifiedCount > 0) {
                    var bdbjs = {

                      loanid: loanids,
                      functiontodo: "delete",
                      issuerId: issuerId
                    }

                    poolsjs.bdbpost(req, res, db, bdbjs);
                    console.log("previewstdloantape", result);
                    res.send({
                      success: true,
                      message: "Loans Deleted Successfully",
                    });
                    client.close();

                  }
                  else {
                    res.send({
                      success: false,
                      message: "Loans Not Deleted",
                    })
                    client.close();

                  }
                }
              );


            }
          );


      });
    }
  },

  GetOriginator: function (req, res, next) {
    if (!req.query.poolid) {
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
        } const db = client.db("IntainMarkets");
        winlog.info('CONNECTED');


        db.collection('previewstdloantape').distinct("Originator Name", { poolid: req.query.poolid }, function (err, result) {
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
          // winlog.info("Lengthof result" + result.length);
          else {
            res.send({
              "success": true,
              "result": result
            });
            client.close();

          }


        });


      });
    }
  },

  UpdateVerificationTemplate: function (req, res, next) {
    if (!req.body.poolid || !req.body.originatorname || !req.body.verificationtemplate) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {

      let poolemitter = new EventEmitter();

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

        db.collection("previewstdloantape").updateMany(
          { "poolid": req.body.poolid, "Originator Name": req.body.originatorname },
          { $set: { "Verificationtemplate": req.body.verificationtemplate } },
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
            } else if (result.matchedCount > 0) {
              console.log("Modified count " + result.modifiedCount);
              poolemitter.emit('updatepooltemplate')
              // res.send({
              //   success: true,
              //   message: "Loans updated Successfully",
              // });
            }
            else {
              res.send({
                success: false,
                message: "No records found",
              });
              client.close();

            }
          });




        poolemitter.on("updatepooltemplate", async () => {
          console.log("inside pool update template");
          const result1 = await db.collection("pool_detail").findOne({ poolID: req.body.poolid });
          console.log(result1)

          let contractpath = path.resolve(__dirname + '/../uploads/uploads/' + req.body.poolname)
          //  console.log(update)
          db.collection("pool_detail").updateOne(
            { poolID: req.body.poolid },
            {
              $set: {
                [`fieldstoverify.${req.body.verificationtemplate}`]: req.body.verificationfields,
                [`contractpath.${req.body.verificationtemplate}`]: req.body.contractpath,
              }
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
              }
              // poolData = result;
              res.send({
                isSuccess: true,
                message: "pool status updated sucessfully",
              });
              client.close();

            }
          );
        })
      });
    }
  },

  editissuerid: function (req, res, next) {

    var userEmitter = new EventEmitter();
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
      winlog.info("CONNECTED");


      db.collection("pool_detail").updateOne(
        { poolID: req.body.poolid },
        {
          $set: {
            "issuerId": "a31bdb61-60c4-49e2-8795-338ae81abbff1",
            "assigninvestor": "",
            "assignunderwriter": ""
          }
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
          }

          res.send({
            success: true,
            message: "Pool status updated successfully",
            // previewstatus: previewstatus,
          });
          client.close();

        }
      );
    });

  },

  notificationlist: function (req, res, next) {

    console.log("inside notification list:::::: ")
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

      let query = req.query.poolid ? { "poolid": req.query.poolid, "userid": req.query.userid } : { "userid": req.query.userid }
      db.collection("previewnotification").find(query, { projection: { "unreadloanlist": 1, "poolid": 1, "_id": 0 } }).toArray(
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

            if (req.query.poolid) {
              res.send(result[0].unreadloanlist);
              client.close();

            }


          }
        });

    })
  },

  updaterreadlist: function (req, res) {

    if (!req.body.poolid || !req.body.userid) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var userEmitter = new EventEmitter();
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
        winlog.info("CONNECTED");

        db.collection("previewnotification").updateOne({ "poolid": req.body.poolid, "userid": req.body.userid }, {
          $pull: { "unreadloanlist": req.body.loanid }
        }, function (err, result) {
          if (err) {
            var responseMessage = {
              "isSuccess": false,
              "statuscode": 500,
              "message": "Internal Server Error: Database connection failed."
            };
            return res.status(500).send(responseMessage);
          } else {
            res.send({
              success: true,
              message: "Unreadlist  updated successfully",
              // previewstatus: previewstatus,
            });
            client.close();
            // notificationlist()
          }


        })

      });

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
          const finalresult = await db.collection("pool_detail").find({ ratingagency: { $regex: `\\b${userid}\\b` }, previewOrverify: "Preview" }).toArray();
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

module.exports = Preview;