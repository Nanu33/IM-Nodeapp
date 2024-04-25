var request = require('request');
const { v4: uuidv4 } = require('uuid');
var Parser = require('hot-formula-parser').Parser;
const parser = new Parser();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";
const xl1 = require("xlsx");
// var dateFormat = require('dateformat');
const fs = require('fs');
var toLowerCase = require('to-lower-case');
const privKey =
    "476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6"; //replcae
const address = "0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D";
const Web3 = require("web3");
const web3 = new Web3(
    "http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc"
);
const EventEmitter = require('events');
// var FormulaParser = require('hot-formula-parser').Parser;
// var parser = new FormulaParser();
var path = require("path");
var moment = require('moment');
const Holidays = require('date-holidays');
const holidays = new Holidays('US');
require('moment-timezone');
const SMapping1 = require("./abi/Mapping");
const SIPFSLoanTape = require("./abi/IPFSLoanTape");
const xl = require('excel4node');
var log4js = require("log4js");
var logger = log4js.getLogger();
const wb = new xl.Workbook();
const ws = wb.addWorksheet('Worksheet Name');
const winlog = require("../log/winstonlog")
const NodeRSA = require('node-rsa');
const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('20.59.14.68', '9095', { protocol: 'http' });
// var url = "mongodb://" + process.env.MongoUserName + ":" + encodeURIComponent(process.env.MongoPassword) + process.env.MongoURL + "?authMechanism=SCRAM-SHA-1";


var processTape = {

    processTape: function (req, res, next) {

        // return new Promise((resolve, reject) => {

        var arr = [];
        var arr2 = [];
        var arr3 = [];
        var arr4 = [];

        var finalarr = [];
        var bdbarr = [];
        var totalinvoke;
        var invokecount = 1;
        var data_exist;
        var paymentdate = `${req.body.Month}/25/${req.body.Year}`
        var seq_num = 0;
        var DelinquencyMethod = '';
        var falsecount = 0;
        var currentdate = ""
        var a = [];
        var fileHash = ""

        const getDate = (month, year) => {
            const updatedMonth = month - 1;
            const initDay = '01';
            const dateObj = moment({ year, month: updatedMonth, day: initDay });
            let formattedDate = dateObj.subtract(1, "month").format("MM-DD-YYYY");

            // winlog.info({ month, year, day: initDay, formattedDate })

            let rangeCount = 7;
            const dateRanges = [];

            while (rangeCount) {
                const tempRange = new Array(2);
                const rangeEnd = formattedDate;
                const rangeStart = moment(formattedDate, "MM-DD-YYYY").subtract(1, "month").add(1, "day").format("MM-DD-YYYY");

                formattedDate = moment(rangeStart, "MM-DD-YYYY").subtract(1, "day").format("MM-DD-YYYY");

                tempRange[0] = rangeStart;
                tempRange[1] = rangeEnd
                dateRanges.push(tempRange)
                rangeCount--;
            }
            return dateRanges;
        }
        function getPaymentDate(paymentdate) {
            var dateDay = moment(new Date(paymentdate)).format('D')
            console.log({ dateDay });
            var date = moment(new Date(paymentdate), 'MM/DD/YYYY');
            function isHoliday(date) {
                const dateToCheck = moment.tz(moment(date).format('YYYY-MM-DD'), 'America/Chicago').toDate();// Convert to UTC Date object
                const isHoliday = holidays.isHoliday(dateToCheck);
                return isHoliday
            }

            var nextPaymentDate = date;
            function DateConversionLogic(date) {
                return moment(date.add(1, 'days'), 'MM-DD-YYYY');
            }
            while (isHoliday(date) || date.format('dddd') == 'Sunday' || date.format('dddd') == 'Saturday') {
                if (isHoliday(date) || date.format('dddd') == 'Sunday' || date.format('dddd') == 'Saturday') {
                    nextPaymentDate = DateConversionLogic(date)
                }
            }
            console.log('next payment date ' + isHoliday(nextPaymentDate) + ' ' + nextPaymentDate.format('dddd'))
            return nextPaymentDate.format('MM/DD/YYYY')
        }
        paymentdate = getPaymentDate(paymentdate);
        const resultDates = getDate(req.body.Month, req.body.Year)
        resultDates.unshift([moment(new Date(resultDates[0][1])).add(1, "day").format("MM-DD-YYYY"), `${String(req.body.Month).length == 1 ? '0' + req.body.Month : req.body.Month}-01-${req.body.Year}`])

        function MongoUpdate() {
            return new Promise((resolve, reject) => {
                MongoClient.connect(url, function (err, client) {
                    if (err) throw err;
                    const db = client.db("IntainMarkets");
                    console.log('check')
                    // console.log({ DealName: req.body })
                    winlog.info(req.body.DealName);
                    db.collection('TableExpression').find({ DealName: req.body.DealName, TableName: 'General' }).toArray(function (err, result) {
                        logger.debug("result::" + result.length);
                        if (result.length > 0) {
                            DelinquencyMethod = JSON.parse(result[0].TableData)['General']['General']['Delinquency Method']
                            if (DelinquencyMethod == undefined || DelinquencyMethod == '') {
                                DelinquencyMethod = 'OTS'
                            }
                            console.log({ DelinquencyMethod })
                        }
                        console.log({ DelinquencyMethod })
                    });
                    setTimeout(() => {
                        resolve({ "Success": true })
                    }, 1000);
                })
            })
        }
        winlog.info({ resultDates })
        var eventemit = new EventEmitter();
        var eventemit1 = new EventEmitter();
        var eventemit2 = new EventEmitter();
        var eventemit3 = new EventEmitter();
        var saveToBC = new EventEmitter();
        var eventemit5 = new EventEmitter();
        var createexcel = new EventEmitter();

        var DealName = req.body.DealName;
        var month = req.body.Month
        var year = req.body.Year;
        var ServicerName = req.body.ServicerName;

        var filename = "";
        var filename1 = DealName + "-" + month + "-" + year + "-" + req.body.ServicerName + ".xlsx";
        var filename2 = DealName + "-" + month + "-" + year + "-" + req.body.ServicerName + ".xls";
        var filepath1 = path.join('./uploads/' + filename1);
        var filepath2 = path.join('./uploads/' + filename2);
        winlog.info("filepath1: " + filepath1);
        winlog.info("filepath2: " + filepath2);

        if (fs.existsSync(filepath1)) {
            winlog.info("filepath in xlsx if: ");
            var filetype = ".xlsx";
            filename = filename1;
        }
        else if (fs.existsSync(filepath2)) {
            winlog.info("filepath in xls if: ");
            var filetype = ".xls";
            filename = filename2;
        }


        if (!req.body.DealName || !req.body.Month || !req.body.Year) {
            res.status(400).send({ "message": "Missing Arguments!" })
        }
        else {
            console.log("in 1 "+filetype)
            // check for the filetype
            if (filetype == ".xlsx" || filetype == ".xls") {
                console.log("in")
                // mapquery();
                MongoUpdate()
                    .then(resolvedData => {
                        get1();
                    })
                    .catch(error => {
                        console.log({ error })
                        return
                    });
            }
            else {
                var test2 = {
                    Success: false,
                    Result: "Some Error Occurred!"
                }
                res.status(404).send(test2);
            }
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

                    var response = { result: JSON.stringify(data1) };
                    //   winlog.info("data1" + data1);


                    var finalresponse = JSON.parse(response.result);
                   
        
                    winlog.info("getMappingByDealNameMonthYearAndServicerName")

                    winlog.info(finalresponse.length);
                    if (finalresponse.length > 0) {
                        var from_date = req.body.Month + "/01/" + req.body.Year;
                        var getDaysInMonth = function (month1, year1) {
                            return new Date(year1, month1, 0).getDate();
                        };
                        var to_noofdays = getDaysInMonth(parseInt(req.body.Month), parseInt(req.body.Year));
                        var to_date = req.body.Month + "/" + to_noofdays + "/" + req.body.Year;
                        // console.log("split::::::: ")
                        // console.log( response.result.split('CollectionPeriodStartDate').join(from_date))
                        response.result = response.result.split('CollectionPeriodStartDate').join(from_date)
                        response.result = response.result.split('CollectionPeriodEndDate').join(to_date)
                        response = JSON.parse(response.result);
                        response = JSON.parse(response[0][6]);
                        // response = [{ "Key 0": "Loan ID", "Value 0": "Loan No", "Expression": "No" }, { "Key 1": "Z-MLP_Status", "Value 1": "Status", "Expression": "No" }, { "Key 2": "Pool Addition Date", "Value 2": "Trust Acquisition Date", "Expression": "No" }, { "Key 3": "Property City", "Value 3": "City", "Expression": "No" }, { "Key 4": "Property State", "Value 4": "State", "Expression": "No" }, { "Key 5": "Principal Payment - PIF", "Value 5": "[SUM(Loan Amount,Beginning UPB)]", "Expression": "Yes" }, { "Key 6": "Original Principal Balance", "Value 6": "Loan Amount", "Expression": "No" }, { "Key 7": "Z-MLP_Beginning UPB", "Value 7": "Beginning UPB", "Expression": "No" }, { "Key 8": "Principal Payment - Adjustment", "Value 8": "IF([Trust Acquisition Date]<=44957,([Loan Amount]-IF(AND(['State']='DRAW',MONTH([Trust Acquisition Date])=01,YEAR([Trust Acquisition Date])>2022),[Loan Amount],0)),0)", "Expression": "Yes" }, { "Key 9": "Account Status", "Value 9": "IF(['Performing / 30, 60, 90+ Days Past due']='reo','reo',IF(OR(['Performing / 30, 60, 90+ Days Past due']='foreclosure',['Performing / 30, 60, 90+ Days Past due']='F',['Performing / 30, 60, 90+ Days Past due']='FC',['Performing / 30, 60, 90+ Days Past due']='foreclosure'),'foreclosure',IF(['Performing / 30, 60, 90+ Days Past due']='forbearance','forbearance','')))", "Expression": "Yes" }]
                        winlog.info("Length of mapping:" + JSON.stringify(response) + " " + response.length);

                        if (response.length > 0) {
                            renovation(response);
                        }
                        else {
                            res.status(200).send([]);
                        }

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

            function renovation(uiinputs) {

                var inputs = uiinputs;
                winlog.info("inside renovation::::::::::::::::::::\n")

                var path1 = filepath1;
                winlog.info(filetype + " " + filepath1);

                MongoClient.connect(url, function (err, client) {
                    const db = client.db("IntainMarkets");
                    db.collection('LoanTape').deleteMany({ DealName: req.body.DealName, Month: req.body.Month, Year: req.body.Year }, async function (err, result) {

                        if (err) return winlog.info(err)

                        if (filetype == ".xlsx" || filetype == ".xls") {
                            if (fs.existsSync(path1)) {
                                winlog.info("File exist!");

                                var key = [];
                                var key1 = [];
                                const file = xl1.readFile(path1);
                                const rows = [];
                                const rows1 = xl1.utils.sheet_to_json(
                                    file.Sheets[file.SheetNames[0]], { raw: true, defval: null })
                                rows1.forEach((res) => {
                                    res = Object.fromEntries(Object.entries(res).map(([key, value]) => [key.trim(), typeof value === 'string' ? value.trim() : value]));
                                    rows.push(res)
                                })
                                Object.keys(rows[0]).forEach(function (tempkey) {
                                    if ((tempkey.toLowerCase()).includes("empty")) {

                                    }
                                    else {
                                        key.push(tempkey.trim());
                                    }
                                });
                                var ind = 0;
                                for (var i = 0; i < inputs.length; i++) {
                                    for (var j = 0; j < key.length; j++) {
                                        if (String(inputs[i]["Expression"]).toLowerCase() != 'yes') {
                                            if (inputs[i]["Value " + (i)] == key[j]) {
                                                // if (inputs[i]["Key " + (i)] == "" || inputs[i]["Key " + (i)] == "not defined") {
                                                // key1[j] = null;
                                                // break;
                                                // }
                                                // else {
                                                // if (key1[j] != undefined) {
                                                // key1[j + 1] = inputs[i]["Key " + (i)];
                                                // } else {
                                                // key1[ind] = inputs[i]["Key " + (i)];
                                                // }
                                                // ind++
                                                if (key1.length == 0) {
                                                    key1[j] = inputs[i]["Key " + (i)];
                                                } else {
                                                    key1.push(inputs[i]["Key " + (i)]);
                                                }
                                                break;
                                                // }
                                            }
                                        } else {
                                            var keys = inputs[i]["Key " + (i)]
                                            var value = String(inputs[i]["Value " + (i)]);
                                            var temp = { [keys]: value };
                                            winlog.info("temp::" + JSON.stringify(temp));
                                            if (key1.length == 0) {
                                                key1[ind] = temp;
                                            } else {
                                                key1.push(temp);
                                            }
                                            ind++
                                            break;
                                        }
                                    }
                                }
                                // key1 = key1.filter(Boolean)
                                winlog.info("length::keys::" + JSON.stringify(key) + " " + key.length);
                                winlog.info("\nlength::keys1::" + JSON.stringify(key1) + " " + key1.length);
                                var t = 1;
                                var seqno;

                                winlog.info("no of cols: " + Object.keys(rows[0]).length + " no of rows: " + (rows.length) + " orginal:" + JSON.stringify(rows[0]));
                                var count = 0


                                function replaceKeysWithValues(obj, formula) {
                                    return new Promise((resolve, reject) => {
                                        var LastPaymentDate;
                                        let initialFormula = formula;
                                        const DateObj = inputs.find(item => Object.entries(item).some(([key, value]) => value === 'Last Payment Date'));
                                        LastPaymentDate = DateObj ? DateObj[Object.keys(DateObj)[1]] : undefined;
                                        const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/;
                                        formula = formula.replace(datePattern, (match) => {
                                            const excelDate = moment(String(match), 'MM/DD/YYYY').diff(moment('1900-01-01'), 'days') + 2;
                                            // winlog.info({ match })
                                            return excelDate.toString();
                                        });
                                        var temparr = [];
                                        Object.keys(obj).forEach((keys) => {
                                            temparr.push(keys)
                                        })
                                        // formula = formula.replace(/(\b\d+\b|(?<=\[')[^\]]+(?='\]))/g, "'$1'");
                                        const accountstatus = inputs.find(item => Object.entries(item).some(([key, value]) => value === "Account Status"));
                                        formula = formula.replace(/\[(.*?)\]/g, (match, key) => {
                                            if (accountstatus != undefined) {
                                                if (accountstatus[Object.keys(accountstatus)[1]] == initialFormula) {
                                                    return obj[key] == null ? "''" : `'${obj[key]}'`;
                                                } else {
                                                    return obj[key] == null ? '0' : `'${obj[key]}'`;
                                                }
                                            }
                                        });
                                        var output = parser.parse(formula.replace(/\[|\]/g, ""))
                                        if (accountstatus[Object.keys(accountstatus)[1]] == initialFormula && output.result == '') {
                                            if (String(LastPaymentDate).includes('[')) {
                                                LastPaymentDate = String(LastPaymentDate).slice(1, -1);
                                            }
                                            var nextPaymentDate = obj[LastPaymentDate]
                                            if (nextPaymentDate == 'n/a' || nextPaymentDate == '' || nextPaymentDate == null) {
                                                output.result = "n/a";
                                            } else {
                                                if (datePattern.test(nextPaymentDate)) {
                                                    var date = nextPaymentDate
                                                } else {
                                                    var date = moment('1900-01-01').add(nextPaymentDate - 2, 'days').format('MM/DD/YYYY');
                                                }
                                                // winlog.info({ nextPaymentDate })
                                                // winlog.info({ date })
                                                let date1 = new Date(date);
                                                if (DelinquencyMethod == 'OTS') {
                                                    var date2 = new Date(`${parseFloat(req.body.Month)}/1/${req.body.Year}`);
                                                } else {
                                                    if (String(req.body.Month) == '12') {
                                                        var date2 = new Date(`01/1/${parseFloat(req.body.Year) + 1}`);
                                                    } else {
                                                        var date2 = new Date(`${parseFloat(req.body.Month) + 1}/1/${req.body.Year}`);
                                                    }
                                                }
                                                let timeDifference = date2 - date1;
                                                let daysDifference = timeDifference / (1000 * 60 * 60 * 24);
                                                // console.lg()
                                                // var datediff =
                                                if (daysDifference <= 0) {
                                                    output.result = "Current"
                                                } else if (daysDifference >= 1 && daysDifference <= 29) {
                                                    output.result = "1-29_days_dq";
                                                } else if (daysDifference >= 30 && daysDifference <= 59) {
                                                    output.result = "30-59_days_dq";
                                                } else if (daysDifference >= 60 && daysDifference <= 89) {
                                                    output.result = "60-89_days_dq";
                                                } else if (daysDifference >= 90 && daysDifference <= 119) {
                                                    output.result = "90-119_days_dq";
                                                } else if (daysDifference >= 120 && daysDifference <= 149) {
                                                    output.result = "120-149_days_dq";
                                                } else if (daysDifference >= 150 && daysDifference <= 179) {
                                                    output.result = "150-179_days_dq";
                                                } else if (daysDifference >= 180) {
                                                    output.result = "180+_days_dq";
                                                }
                                                if (json['Loan ID'] == "7602192168") {
                                                    console.log("loan id " + ' ' + "7602192168")
                                                    console.log(date + ' ' + `${parseFloat(req.body.Month) - 1}/1/${req.body.Year}` + ' ' + daysDifference + ' ' + json['Loan ID'] + ' ' + output.result)
                                                }
                                            }
                                        }
                                        // winlog.info("output acc af:: " + JSON.stringify(output))
                                        if (output.error == "#ERROR!" || output.error == "#NAME?") {
                                            console.log(output)
                                            console.log({ formula })
                                        }
                                        winlog.info("output af:: " + JSON.stringify(output))
                                        resolve(output.result);
                                    })
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
                                    json["DealName"] = String(DealName);
                                    json["Month"] = String(month);
                                    json["Year"] = String(year);
                                    //json["MovedToBlockchain"] = String(movetoblockchain);
                                    json["SeqNo"] = String(seqno);

                                    // winlog.info("\nb4 value::" + JSON.stringify(value));
                                    // winlog.info("\nb4 inputs::" + JSON.stringify(inputs));

                                    var y = 0

                                    for (const x in inputs) {
                                        Object.keys(value).forEach(function (jsonkey) { // value is a json
                                            if (jsonkey == inputs[x][`Value ${x}`]) {
                                                // winlog.info("jsonkey::" + jsonkey + " inputs[x][`Value ${x}`]::" + inputs[x][`Value ${x}`]);
                                                // if (jsonkey.toLowerCase().includes("empty") && y == key1.length) {
                                                // delete value[jsonkey];
                                                // } else if (jsonkey.toLowerCase().includes("empty")) {
                                                // delete value[jsonkey];
                                                // }
                                                // else if (key1[y] == jsonkey || key1[y] == null) {
                                                // y++;
                                                // }
                                                // else {
                                                // value1[key1[x]] = value[jsonkey];
                                                // delete value[jsonkey];
                                                // y++;
                                                // }
                                                value1[inputs[x][`Key ${x}`]] = value[jsonkey];
                                                return
                                            }
                                            // else {
                                            // winlog.info("else::::::: "+jsonkey+" "+inputs[x][`Value ${x}`])
                                            // }
                                        })
                                    }
                                    // winlog.info("\nvalue1::" + JSON.stringify(value1));

                                    for (var p = 0; p < key1.length; p++) {
                                        if (String(typeof key1[p]) != 'object') {
                                            if (key1[p] != null && String(key1[p]) != "null") {
                                                if (String(value1[key1[p]]) == 'null' || String(value1[key1[p]]) == '') {
                                                    json[key1[p]] = '';
                                                } else {
                                                    json[key1[p]] = String(value1[key1[p]]);
                                                }
                                            }
                                        } else {
                                            var key = String(Object.keys(key1[p]))
                                            var formula = String(Object.values(key1[p]))
                                            var finalval = await replaceKeysWithValues(rows[k], formula)
                                            json[key] = finalval
                                            rows[k][key] = finalval
                                        }


                                        if (String(json['Last Payment Date']).toLowerCase() == 'n/a' || String(json['Last Payment Date']).toLowerCase() == 'undefined') {
                                            json['Number Of Days In Arrears'] = ''
                                        } else {
                                            // if ((/\d{2}\/\d{2}\/\d{4}/g).exec(json['Last Payment Date']) == null) {
                                            if ((/\b\d{1,2}\/\d{1,2}\/\d{4}\b/).test(json['Last Payment Date'])) {
                                                var date = json['Last Payment Date']
                                            } else {
                                                var date = moment('1900-01-01').add(json['Last Payment Date'] - 2, 'days').format('MM/DD/YYYY');
                                            }
                                            // winlog.info({ nextPaymentDate })
                                            // winlog.info({ date })
                                            let date1 = new Date(date);
                                            if (DelinquencyMethod == 'OTS') {
                                                var date2 = new Date(`${parseFloat(req.body.Month)}/1/${req.body.Year}`);
                                            } else {
                                                if (String(req.body.Month) == '12') {
                                                    var date2 = new Date(`01/1/${parseFloat(req.body.Year) + 1}`);
                                                } else {
                                                    var date2 = new Date(`${parseFloat(req.body.Month) + 1}/1/${req.body.Year}`);
                                                }
                                            }
                                            let timeDifference = date2 - date1;
                                            let daysDifference = timeDifference / (1000 * 60 * 60 * 24);
                                            // console.lg()
                                            // var datediff =
                                            if (daysDifference <= 0) {
                                                json['Number Of Days In Arrears'] = String(daysDifference)
                                            } else if (daysDifference >= 1 && daysDifference <= 29) {
                                                json['Number Of Days In Arrears'] = String(daysDifference);
                                            } else if (daysDifference >= 30 && daysDifference <= 59) {
                                                json['Number Of Days In Arrears'] = String(daysDifference);
                                            } else if (daysDifference >= 60 && daysDifference <= 89) {
                                                json['Number Of Days In Arrears'] = String(daysDifference);
                                            } else if (daysDifference >= 90 && daysDifference <= 119) {
                                                json['Number Of Days In Arrears'] = String(daysDifference);
                                            } else if (daysDifference >= 120 && daysDifference <= 149) {
                                                json['Number Of Days In Arrears'] = String(daysDifference);
                                            } else if (daysDifference >= 150 && daysDifference <= 179) {
                                                json['Number Of Days In Arrears'] = String(daysDifference);
                                            } else if (daysDifference >= 180) {
                                                json['Number Of Days In Arrears'] = String(daysDifference);
                                            }
                                            // }
                                        }

                                        if ((/\bdate\b/i.test(key1[p])) || String(value[key1[p]]).includes(':')) {

                                            if (String(value1[key1[p]]) == "null" || String(value1[key1[p]]) == "NULL" || String(value1[key1[p]]) == "" || value1[key1[p]] == "") {
                                                value1[key1[p]] = "";
                                                json[key1[p]] = value1[key1[p]];
                                            }
                                            else if (String(value1[key1[p]]).toLowerCase() == "n/a" || String(value1[key1[p]]).toLowerCase() == "pif" || String(value1[key1[p]]) == "NA" ||
                                                String(value1[key1[p]]) == "na" || String(value1[key1[p]]).toLowerCase() == "sold" || String(value1[key1[p]]).toLowerCase() == "paid off") {
                                            }
                                            else {
                                                if ((/\b\d{1,2}\/\d{1,2}\/\d{4}\b/).test(value1[key1[p]])) {
                                                    var date = value1[key1[p]]
                                                } else {
                                                    var date = moment('1900-01-01').add(value1[key1[p]] - 2, 'days').format('MM/DD/YYYY');
                                                }
                                                json[key1[p]] = date;
                                            }
                                        }
                                    }
                                    finalarr.push(json);
                                    bdbarr.push(json);
                                }
                                if (finalarr.length == (rows.length)) {
                                    var excelarr = JSON.parse(JSON.stringify(finalarr));
                                    var dataId = uuidv4();
                                    var currentdatearr = new Date().toLocaleDateString().split("/")
                                    if (currentdatearr[0].length == 1) {
                                        currentdatearr[0] = "0" + currentdatearr[0]
                                    }
                                    if (currentdatearr[1].length == 1) {
                                        currentdatearr[1] = "0" + currentdatearr[1]
                                    }
                                    currentdate = currentdatearr.join("/")

                                    var savetodb = [{
                                        DataId: dataId,
                                        DealName: req.body.DealName,
                                        Month: req.body.Month,
                                        Year: req.body.Year,
                                        ServicerName: req.body.ServicerName,
                                        // MovetoBlockchainStatus: "No",
                                        ModifiedDate: currentdate,
                                        LoanTapeData: JSON.stringify(finalarr)
                                    }]
                                    winlog.info("final arr length NEW: " + finalarr.length + " " + JSON.stringify(finalarr[0]))

                                    db.collection('LoanTape').insertMany(savetodb, function (err, result) {
                                        if (err) return winlog.info(err)
                                        winlog.info("Number of documents inserted: " + result.insertedCount);
                                        winlog.info('saved to database')

                                        //-------------------
                                        var docname = req.body.DealName + "-" + req.body.Month + "-" + req.body.Year + "-" + req.body.ServicerName;
                                        logger.info("docname::: " + docname);
                                        //write private and public key

                                        var key1 = new NodeRSA({ b: 1024 });//1024
                                        var publickey = docname + "-public-key.txt";

                                        var testFolder = "./uploads/key/"
                                        // var testFolder = process.cwd()+"/keys/"
                                        var public_key = fs.readFileSync(testFolder + publickey, { encoding: 'utf8', flag: 'r' });

                                        key1.importKey(public_key, "pkcs8-public");

                                        var encryptedString = key1.encrypt(finalarr, 'base64');
                                        logger.info("total length after encrypt:::::::" + " " + finalarr.length)

                                        //Creating buffer for ipfs function to add file to the system
                                        let testBuffer = new Buffer(JSON.stringify(encryptedString));

                                        // winlog.info(testBuffer + ":::");
                                        ipfs.files.add(testBuffer, async function (err, file) {
                                            winlog.info("inside ipfs if: ")
                                            if (err) {
                                                winlog.info(err);
                                            }
                                            winlog.info(file)
                                            fileHash = file[0].hash;
                                            winlog.info("filehash: " + fileHash)
                                            await checkfrombc(DealName, month, year, ServicerName, finalarr, bdbarr);
                                            createexcel(DealName, month, year, excelarr);
                                        })
                                    });
                                }
                            }
                            else {
                                winlog.info("File not found" + filepath1);
                            }
                        }
                    })
                })
            }

            function createexcel(DealName, month, year, excelarr) {
                winlog.info("excel arr len: " + JSON.stringify(excelarr[0]) + " " + excelarr.length);
                winlog.info("DealName: " + DealName + " month: " + month + " year: " + year)

                var headingColumnNames = [];
                var c_count = 0;
                const digits_only = string => [...string].every(c => '0123456789'.includes(c));
                const digits_only1 = string => [...string].every(c1 => '0123456789-'.includes(c1));
                const digits_only2 = string => [...string].every(c2 => '0123456789.'.includes(c2));
                const digits_only3 = string => [...string].every(c3 => '0123456789.-'.includes(c3));

                Object.keys(excelarr).forEach(function (key) {

                    delete excelarr[key].DealName;
                    delete excelarr[key].Month;
                    delete excelarr[key].Year;
                    delete excelarr[key].SeqNo;
                    delete excelarr[key].Channelname;
                    // delete excelarr[key]["Principal Payment - PIF"];
                    // delete excelarr[key]["Principal Payment Adjustment"];
                    // delete excelarr[key]["Account Status"];
                    Object.keys(excelarr[key]).forEach(function (key1) {

                        if (key1.toLowerCase().includes("date")) {
                            try {
                              
                                var dates1 = excelarr[key][key1].split("&");
                                // winlog.info("dates1: "+JSON.stringify(dates1))
                                if (dates1.length > 1) {
                                    var dt1 = dates1[0].split("/");
                                    var dt2 = dates1[1].split("/");

                                    excelarr[key][key1] = dt1[0] + "/" + dt1[1] + "/" + dt1[2] + "&" + dt2[0] + "/" + dt2[1] + "/" + dt2[2];
                                }
                                else {
                                    var dt = excelarr[key][key1].split("/");
                                    // winlog.info("dt len: "+dt.length+" "+key1)
                                    if (dt.length > 1) {
                                        excelarr[key][key1] = dt[0] + "/" + dt[1] + "/" + dt[2]
                                    }
                                    else {
                                        excelarr[key][key1] = excelarr[key][key1];
                                    }
                                }
                            }
                            catch (e) {
                                winlog.info("key1: " + key1)
                                winlog.info("e: " + e)
                            }
                        }
                        else if ((digits_only([excelarr[key][key1]]) || //1
                            (digits_only1([excelarr[key][key1]]) && excelarr[key][key1].charAt(0) == '-') || //-1
                            (digits_only2([excelarr[key][key1]]) && excelarr[key][key1].includes(".")) || //1.1
                            (digits_only3([excelarr[key][key1]]) && excelarr[key][key1].charAt(0) == '-' && excelarr[key][key1].includes("."))) //-1.1
                        ) {

                            excelarr[key][key1] = Number(excelarr[key][key1]);
                            // winlog.info("excelarr[key]: "+JSON.stringify(excelarr[key][key1]))
                        }
                    })
                    if (c_count == 0) {
                        Object.keys(excelarr[key]).forEach(function (keys) {
                            headingColumnNames.push(keys)
                        })
                        c_count++;
                    }
                })

                winlog.info("xl headers: " + JSON.stringify(excelarr[0]) + " " + excelarr.length + "\n headingColumnNames: " + JSON.stringify(headingColumnNames))

                // var xls = json2xls(excelarr);
                // fs.writeFileSync("./postmapUploads/"+req.body.DealName+"-"+month+"-"+req.body.Year+".xlsx", xls, 'binary')

                // Write Column Title in Excel file
                let headingColumnIndex = 1;
                headingColumnNames.forEach(heading => {
                    ws.cell(1, headingColumnIndex++)
                        .string(heading)
                });


                //Write Data in Excel file
                let rowIndex = 2;
                excelarr.forEach(record => {
                    let columnIndex = 1;
                    Object.keys(record).forEach(columnName => {

                        if (typeof (record[columnName]) == "number") {
                            // winlog.info("NUMBER____________"+typeof (record[columnName]) + " " + columnName)

                            ws.cell(rowIndex, columnIndex++)
                                .number(record[columnName])
                        }
                        else {
                            // winlog.info("STRING___________"+typeof (record[columnName]) + " " + columnName)

                            if (String(record[columnName]) != "null") {
                                ws.cell(rowIndex, columnIndex++)
                                    .string(record[columnName])
                            }
                            else {
                                // winlog.info("String(record[columnName]): "+String(record[columnName])+" "+String())
                                ws.cell(rowIndex, columnIndex++)
                                    .string("")
                            }
                        }

                    });
                    rowIndex++;
                });
                try {
                    fs.unlinkSync("./postmapUploads/STD-" + req.body.DealName + "-" + month + "-" + req.body.Year + "-" + req.body.ServicerName + ".xlsx");
                    wb.write("./postmapUploads/STD-" + req.body.DealName + "-" + month + "-" + req.body.Year + "-" + req.body.ServicerName + ".xlsx");
                    winlog.info("file deleted and created")
                }
                catch (err) {
                    winlog.info("No file to delete: " + err)
                    wb.write("./postmapUploads/STD-" + req.body.DealName + "-" + month + "-" + req.body.Year + "-" + req.body.ServicerName + ".xlsx");
                    winlog.info("file created")
                }
            }


            // function
            async function checkfrombc(DealName, month, year, ServicerName, currentarr, bdbarr) {
               


                winlog.info("inside get method");
                var getallloans = {};
                const abi = SIPFSLoanTape.abi;
                const contractAddress = SIPFSLoanTape.address;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                winlog.info(`Making a call to contract at address ${contractAddress}`);
                const get1 = async () => {
                    try {
                        winlog.info("getLoanDataTapeByDealNameMonthYearandServicerName")

                        const data1 = await incrementer.methods
                            .getLoanDataTapeByDealNameMonthYearandServicerName(req.body.DealName, req.body.Month, req.body.Year, req.body.ServicerName)
                            .call({ from: address });

                        //  winlog.info("data1" + data1)
                        if (data1.length > 0) {
                            console.log("loantape query data exist!!")
                            var uid = data1[0][0];
                            // console.log("uid: " + JSON.stringify(uid))
                            data_exist = true;
                            await blockchainarray(fileHash, bdbarr, uid);


                        }
                        else {
                            console.log("loantape query data not available!!")
                            var uid = uuidv4().toString()
                            data_exist = false;
                            await blockchainarray(fileHash, bdbarr, uid);


                        }
                        winlog.info("blockchainarray fucntion executed")

                    } catch (e) {
                        winlog.info("Error Occured" + e)

                        var r = { "message": e.message }
                        res.status(500).send(r);
                    }
                    winlog.info("checkfrombc")

                }
                get1();




                //function
                async function blockchainarray(fileHash, bdbarr, uid) {
                    winlog.info("in blockchainarray function");

                    var docname = req.body.DealName + "-" + req.body.Month + "-" + req.body.Year + "-" + req.body.ServicerName;
                    var privatekey = docname + "-private-key.txt";
                    var mappinngData = "";
                    const increment = async () => {
                        winlog.info("incrementblockchainarray");

                        try {
                            const abi = SIPFSLoanTape.abi;
                            const contractAddress = SIPFSLoanTape.address;
                            winlog.info("contractAddress SIPFSLoanTape" + contractAddress);

                            const incrementer = new web3.eth.Contract(abi, contractAddress);

                            const dataToSave = [
                                [
                                    String(uid),
                                    req.body.DealName,
                                    req.body.Month,
                                    req.body.Year,
                                    req.body.ServicerName,
                                    currentdate,
                                    mappinngData,
                                    fileHash,
                                    privatekey
                                ],
                            ];
                            console.log("Data to save:", dataToSave);
                            const encoded = await incrementer.methods.saveLoanDataTape(dataToSave).encodeABI();


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
                            //    winlog.info("createReceipt.logs.length" + createReceipt.logs.length)
                            winlog.info("saveLoanDataTape")
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
                                    eventemit1.emit('mongoandbdb', bdbarr);
                                    winlog.info("mongoandbdb function executed");
                                } else {
                                    blockchainarray(fileHash, bdbarr, uid);
                                }
                            } else {
                                res.send({
                                    isSuccess: false,
                                    message: "saveLoanDataTape Data not saved",
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
                    };
                    increment();

                }
                eventemit1.on('mongoandbdb', function (bdbarr) {
                    MongoClient.connect(url, function (err, client) {
                        winlog.info("mongoandbdb event called");

                        const db = client.db("IntainMarkets");

                        db.collection('LoanProcessing').deleteMany({ DealName: req.body.DealName, Month: req.body.Month, Year: req.body.Year, ServicerName: req.body.ServicerName }, function (err, result) {
                            if (err) throw err;
                            winlog.info("LoanProcessing deleteMany result" + JSON.stringify(result));

                            var dataId = uuidv4();
                            var savetodb = [{
                                DataId: dataId,
                                DealName: req.body.DealName,
                                Month: req.body.Month,
                                Year: req.body.Year,
                                ServicerName: req.body.ServicerName,
                                MovetoBlockchainStatus: "No",
                                ModifiedDate: currentdate,
                                SummaryData: {}
                            }]

                            db.collection('LoanProcessing').insert(savetodb, function (err, result) {
                                winlog.info("LoanProcessing insert result" + JSON.stringify(result));

                                if (err) return winlog.info(err)
                                db.collection('ConsolidatedLoanSummary').deleteMany({ DealName: req.body.DealName, Month: req.body.Month, Year: req.body.Year }, function (err, result) {
                                    if (err) throw err;
                                    winlog.info("ConsolidatedLoanSummary deleteMany result" + JSON.stringify(result));
                                    var dataId = uuidv4();
                                    var savetodb = [{
                                        DataId: dataId,
                                        DealName: req.body.DealName,
                                        Month: req.body.Month,
                                        Year: req.body.Year,
                                        MovetoBlockchainStatus: "No",
                                        ModifiedDate: currentdate,
                                        SummaryData: {}
                                    }]
                                    db.collection('ConsolidatedLoanSummary').insert(savetodb, (err, result) => {
                                        winlog.info("ConsolidatedLoanSummary insert result" + JSON.stringify(result));
                                        res.send({ "Success": true, "Result": "Data Saved!" })

                                        //             bdbapi(bdbarr);
                                        
                                    if (err) return winlog.info(err)
                                    })
                                })
                            })
                        })
                    });
                });


                //  async function bdbapi(bdbarr) {

                //         var dealid = await dealidquery()
                //         var bdbarr1 = JSON.parse(JSON.stringify(bdbarr));
                //         var x = -1;
                //         var datearray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                //         if (req.body.Month == '12') {
                //             var bdbdate = moment(new Date(String(req.body.CurrentPaymentDate))).format('YYYY-MM-DD');
                //             var yr = String(parseInt(req.body.Year) + 1).charAt(2) + String(parseInt(req.body.Year) + 1).charAt(3);
                //             var bdbmonth = datearray[0] + "-" + yr;
                //         } else {
                //             var bdbdate = moment(new Date(String(req.body.CurrentPaymentDate))).format('YYYY-MM-DD');
                //             var yr = String(req.body.Year).charAt(2) + String(req.body.Year).charAt(3);
                //             var bdbmonth = datearray[parseInt(req.body.Month)] + "-" + yr;
                //         }
                //         for (var b = 0; b < bdbarr1.length; b++) {
                //             delete bdbarr1[b].DealName;
                //             if (req.body.Month == '12') {
                //                 bdbarr1[b].Year = parseInt(req.body.Year) + 1;
                //             }
                //             Object.keys(bdbarr1[b]).forEach(function (key) {

                //                 if ((/\bdate\b/i.test(key)) || String(key).toLowerCase().includes(":")) {
                //                     // if (typeof bdbarr1[b][key] == "string") {
                //                     // bdbarr1[b][key] = Number(bdbarr1[b][key]);
                //                     // }
                //                     var dt = ''
                //                     if (String(bdbarr1[b][key]) != '') {
                //                         dt = moment(new Date(bdbarr1[b][key])).format("YYYY-MM-DD");
                //                     }
                //                     bdbarr1[b][key] = dt;
                //                 }
                //             })
                //             bdbarr1[b]["Deal ID"] = dealid;
                //             bdbarr1[b]["Payment Date"] = bdbdate;
                //             bdbarr1[b]["Month"] = bdbmonth;
                //             bdbarr1[b]["Deal Name"] = req.body.DealName;
                //             // bdbarr1[b]["DealType"] = "saludabc2"
                //             bdbarr1[b]["Asset Category"] = req.body.AssetType;
                //             x++;
                //         }
                //         if ((x + 1) == bdbarr1.length) {
                //             winlog.info("Data from bdb:::: \n" + JSON.stringify(bdbarr1[0]) + " " + bdbarr1.length + " " + (x + 1));
                //             request.post({
                //                 "headers": { "content-type": "application/json" },
                //                 "url": "http://dashboard-bdb-service.fabricclient.svc.cluster.local:8080/IA/pushdatatodb",
                //                 "body": JSON.stringify(bdbarr1)
                //             })
                //         }
                //   //  }

                // function dealidquery() {
                //     return new Promise(function (resolve, reject) {
                //         MongoClient.connect(url, function (err, client) {
                //             const db = client.db("IntainMarkets");
                //             db.collection('TableExpression').find({ DealName: req.body.DealName, TableName: "General" }).toArray(function (err, result) {
                //                 if (err) throw err;
                //                 winlog.info("TableExpression find result" + JSON.stringify(result));

                //                 var json = JSON.parse(result[0].TableData)
                //                 json = json['General']['General']
                //                 resolve(json['Deal Id'])
                //             })
                //         })
                //     })
                // }
                eventemit3.once('sendresponse', function (res) {
                    res.send({ "Success": false, "Result": "Data not saved!!" });
                });//end of event3
                // })

            }

        }
    },
}
module.exports = processTape;


// if (String(key).toLowerCase().includes("date") || String(key).toLowerCase().includes(":")) {
// var date = bdbarr1[b][key];
// var datearr = date.split("/");
// var newdate = datearr[2] + "-" + datearr[0] + "-" + datearr[1];
// bdbarr1[b][key] = newdate;
// }
