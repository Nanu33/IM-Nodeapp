const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
var toLowerCase = require('to-lower-case');
const xl = require("xlsx");
const { v4: uuidv4 } = require('uuid');
const { updateDeal } = require('./updatedeal');
const { updatedata } = require('./loans');
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replace
var MongoClient = require('mongodb').MongoClient
//var url = "mongodb://127.0.0.1:27017/";
var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";
const winlog = require("../log/winstonlog");
const SMapping = require('./abi/Mapping')

const contractAddress = SMapping.address // deployed contract address( can be taken from remix or index.js)

var EventEmitter = require("events").EventEmitter;


var displaycolumns = {


    displaycolumns1: function (req, res, next) {

        winlog.info(req.query.dealid);

        if (!req.query.dealid || !req.query.month || !req.query.year || !req.query.assetclass) {

            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            var temp_arr = [
                {
                    "id": "c73f0170-1bfe-4133-9f67-f057c334841b",
                    "key": "Carrington Ln #",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "f0943320-af17-4777-8a64-f21e349019a4",
                    "key": "Prior Serv Loan #",
                    "value": "Unique Identifier",
                    "descp": "The unique identifier assigned by the reporting entity in accordance with Article 11(1) of Delegated Regulation (EU) …/… [include number of the disclosure RTS]."
                },
                {
                    "id": "a6385036-69d5-41c4-86c5-b5b5903052ac",
                    "key": "Inv #",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "edcc7ed9-81f8-4db2-9d85-3e8699a5329b",
                    "key": "Inv Block #",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "f81c54b3-39ae-421a-9371-28b27ee3f6f4",
                    "key": "Status",
                    "value": "Account Status",
                    "descp": "\"Current status of the underlying exposure that has been securitised:\n\nPerforming (PERF)\nRestructured - No Arrears (RNAR)\nRestructured - Arrears (RARR)\nDefaulted according to Article 178 of Regulation (EU) No 575/2013 (DFLT)\nNot defaulted according to Article 178 of Regulation (EU) No 575/2013 but classified as defaulted due to another definition of default being met (NDFT)\nDefaulted both according to Article 178 of Regulation (EU) No 575/2013 and according to another definition of default being met (DTCR)\nDefaulted only under another definition of default being met (DADB)\nArrears (ARRE)\nRepurchased by Seller – Breach of Representations and Warranties (REBR)\nRepurchased by Seller – Defaulted (REDF)\nRepurchased by Seller – Restructured (RERE)\nRepurchased by Seller – Special Servicing (RESS)\nRepurchased by Seller – Other Reason (REOT)\nRedeemed (RDMD)\nOther (OTHR)\n\nRestructuring refers to any changes made to the contractual terms of the underlying exposure agreement due to forbearance, including payment holidays, arrears capitalisation, change of interest rate basis or margins, fees, penalties, maturity, and/or other generally-accepted measures of restructuring due to forbearance.\n\""
                },
                {
                    "id": "9672258e-a0fa-42fe-a4ce-c282d2fc0e17",
                    "key": "Next_Due_Date",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "2f536835-b2f0-47b0-986a-51884372eea6",
                    "key": "Beginning_Balance",
                    "value": "Prior Principal Balances",
                    "descp": "Total balances ranking prior to this underlying exposure (including those held with other lenders). If there are no prior balances, enter 0.Include the currency in which the amount is denominated, using {CURRENCYCODE_3} format."
                },
                {
                    "id": "e1d83906-dadf-4b78-a688-797da55b06e0",
                    "key": "Scheduled_Principal_Payment",
                    "value": "Scheduled Principal",
                    "descp": "Payment corresponding to scheduled principal; impact collateral balance & principal remitted"
                },
                {
                    "id": "98ccf7a3-c221-45d4-b06f-9bac74de6636",
                    "key": "Ending_Balance",
                    "value": "Current Principal Balance",
                    "descp": "Amount of underlying exposure outstanding as of the data cut-off date. This includes any amounts that are secured by the mortgage and will be classed as principal in the securitisation. For example, if fees have been added to the underlying exposure balance and are part of the principal in the securitisation these are to be added. It excludes any interest arrears or penalty amounts.Current balance includes the principal arrears. However, savings amount is to be deducted if a subparticipation exists. (i.e. underlying exposure balance = underlying exposure +/- subparticipation; +/- 0 if no subparticipation). Include the currency in which the amount is denominated, using {CURRENCYCODE_3} format."
                },
                {
                    "id": "528ebdf1-a36f-42d4-ae94-3e9e39cb184c",
                    "key": "Current_Regular_Pmt_Amt",
                    "value": "Scheduled Payment",
                    "descp": "Scheduled principal and interest payment"
                },
                {
                    "id": "d8bbd60c-7ab7-4188-bbba-ebf3369bb577",
                    "key": "Interest_Rate",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "266152f0-2a0c-428c-844e-457ab47fc147",
                    "key": "Gross_Interest_Payment",
                    "value": "Gross Interest",
                    "descp": "Gross interest collected"
                },
                {
                    "id": "ade1bbdc-0638-49cb-840d-a5a3c66ee5d4",
                    "key": "Service Fee",
                    "value": "Servicer Fee",
                    "descp": "Servicer fee"
                },
                {
                    "id": "b5c9d280-15cf-42d0-aa52-4464d236e957",
                    "key": "Curr. Service Fee %",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "4aea9df5-71f8-49c7-a444-c1b111b77047",
                    "key": "Principal_Payment (Actual Prin/Cash received)",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "b60c6ad6-d075-4578-a2f0-485961486675",
                    "key": "PIF Amount",
                    "value": "PIF",
                    "descp": "Payment correspond to a payoff; impacts collateral balance & principal remitted"
                },
                {
                    "id": "3f06a537-9265-4d36-98b2-52bfb03f93d3",
                    "key": "PIF(Liq) Date",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "322d19d6-78d4-4ca8-9763-69d7f1725cc6",
                    "key": "Deferred (Prin) W/off",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "b249aab1-635f-4708-99da-ec1639016cef",
                    "key": "Prin Write Off/LOSS / adj",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "dd5a8334-3b3c-435f-b251-7074ed7e0fd5",
                    "key": "Non Cash Adjustment (Prn)",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "6a1454ce-7fe5-4445-8a8e-ca075a303fe1",
                    "key": "Curtailments",
                    "value": "Curtailments",
                    "descp": "Payment in excess of scheduled principal; impacts collateral balance & principal remitted"
                },
                {
                    "id": "870007f6-3837-4393-b7b3-65536eb6e6eb",
                    "key": "Corporate Recovery",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "2533fe9a-1a30-4e73-ba86-38868baea2cb",
                    "key": "Corporate Advance",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "94bec637-c15f-4f0c-b48b-f2201ed2851f",
                    "key": "Escrow Recovery",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "907a41a3-8bce-4e54-ae96-41be58d40f94",
                    "key": "Escrow Disbursement",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "c4b4c5f8-5ccd-43bb-9d1e-aa07ed7a038f",
                    "key": "Realized Loss Non-Recoverable Corp/Esc Adv",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "8584207a-4a02-4608-8672-1a74d13e8579",
                    "key": "Loan status",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "39cd397e-d4d3-4c4f-a5d5-9cc5ed2a4554",
                    "key": "Lien Position Nbr",
                    "value": "Lien",
                    "descp": "\"Highest lien position held by the originator in relation to the collateral.\n\nIf the collateral being reported is not property collateral, enter ND5.\""
                },
                {
                    "id": "d3070b2c-16bb-405e-969a-9f138e2cfffe",
                    "key": "Comments",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "8a283a5d-385e-4500-87e0-ffad46e5a5b3",
                    "key": "Beginning Def Prin.",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "55882aca-cb55-4c34-83c3-fc5ca85e7e8a",
                    "key": "Ending Def Prin.",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "28c630b8-d41f-495e-aa06-287836b3fe5c",
                    "key": "Total Defer (incl Prin)",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "591bbf62-71f6-4a41-a618-61cf05bcc039",
                    "key": "HAMP Funds",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "ce708d61-aa45-4729-ad7b-aeeb64bb4290",
                    "key": "FMV Class B",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "6d1f13bf-9600-425a-9a4d-56a1117b2395",
                    "key": "Total UPB",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "3ed04b97-7c4a-4a8f-a27d-4889ccbfdce2",
                    "key": "FICOScore",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "1bc774f9-425a-47d0-8763-3ad6e547a9ad",
                    "key": "CurrentFICO",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "59640895-082c-4dc7-be6b-40fab21b2bec",
                    "key": "PropertyAddrLine1",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "8c0592cb-553b-4cf8-ab01-11a25d6f6259",
                    "key": "PropertyCity",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "aa35339e-b04f-46bf-a56c-24c604f559c5",
                    "key": "PropertyState",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "42b39c83-9618-441a-8071-549bbdd0bb40",
                    "key": "BPOPropertyEstimateAsIsAmount",
                    "value": "",
                    "descp": ""
                },
                {
                    "id": "871d3669-6b06-4d73-ad8f-87511ea3ac25",
                    "key": "LTVRatioOrig",
                    "value": "",
                    "descp": ""
                }
            ]

            var fieldarr = [
                "PIF",
                "Curtailments",
                "Principal Adjustment (remit)",
                "Scheduled Principal",
                "Gross Interest",
                "Servicer Fee",
                "Scheduled Payment",
                "Unique Identifier",
                "Current Principal Balance",
                "Prior Principal Balances",
                "Account Status",
                "Lien",
                "Include in Beginning Count",
                "Include in Ending Count"
            ]

            res.send({ "key": temp_arr, "stdfields": fieldarr });
        }
    },

    //query by month and dealid for the stat us=0/1 from bc
    displaycolumns: function (req, res, next) {

        winlog.info(req.query.dealid);

        if (!req.query.dealid || !req.query.month || !req.query.year || !req.query.assetclass) {

            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            var dealid = req.query.dealid;
            var event1 = new EventEmitter();
            var fieldarr = [];
            var keyresp_arr = [];
            var valueresp_arr = [];
            var check = 0;
            var month = req.query.month;
            var year = req.query.year;
            var temp_arr = [];
            var value1 = [];
            var newkey_arr = [];

            var filename = req.query.dealid + "-" + month + "-" + year + ".xlsx"
            var uploadname = "./servicerUploads/" + filename;
            winlog.info("uploadnameee" + uploadname);
            const path = uploadname;

            var key = [];
            var key_check = 0;

            // if (req.query.filetype == ".xlsx" || req.query.filetype == ".xls") {
            var dealid = req.query.dealid;

            if (fs.existsSync(path)) {
                winlog.info("File exist!");

                const file = xl.readFile(path);
                let data = [];
                const rows = xl.utils.sheet_to_json(
                    file.Sheets[file.SheetNames[0]], { raw: true, defval: null })
                rows.forEach((res) => {
                    data.push(res)
                })

                Object.keys(rows[0]).forEach(function (tempkey) {
                    if ((tempkey.toLowerCase()).includes("empty")) {

                    }
                    else {
                        key.push(tempkey.trim());
                    }
                });

                setTimeout(() => {
                    winlog.info("key: " + JSON.stringify(key))
                    event1.emit("queryfromdb", key);
                }, 1000)

            }
            else {
                winlog.info("file doesn't exist in the path!");
                var json = { "success": false, "keys": [] };
                res.send(json);
            }
            // } else {
            //     winlog.info("file format not handled!");
            //     var json = { "success": false, "keys": [] };
            //     res.send(json);
            // }
        }


        event1.on("queryfromdb", function (key) {

            var activearr = [];

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
                }                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');
                var movedToBlockchain = 0;
                var message = "Data already moved to blockchain"

                db.collection('IntainMasterFields').find({ assetclass: req.query.assetclass }).toArray(function (err, result) {
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
                    winlog.info("Lengthof result: " + result.length);
                    if (result.length > 0) {
                        for (var a = 0; a < result.length; a++) {
                            delete result[a]['_id'];
                            var json = {
                                "fieldname": result[a].fieldname,
                                "description": result[a].description
                            }
                            activearr.push(json);        //whole std fields,descp
                            fieldarr.push(result[a].fieldname);        // only std field
                        }
                        winlog.info("activearr len: " + activearr.length);
                        event1.emit("mappingquery", key, activearr, fieldarr);
                    }
                    else {
                        winlog.info("No data found!")
                       
                        res.sendStatus(204);
                    }
                })
                client.close();
            })
        })


        event1.on("mappingquery", function (key, activearr, fieldarr) {

            if (parseInt(req.query.month) == 1) {
                var month = String(12);
                var year = String(parseInt(year) - 1);
            }
            else {
                var month = String(parseInt(req.query.month) - 1);
                var year = req.query.year;
            }

            winlog.info(key.length + "    " + activearr.length + "     " + fieldarr.length)

            const contractPath = path.join(process.cwd() + "/api/contracts/Mapping.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "Mapping"
            //const source = fs.readFileSync(contractPath, 'utf8');

            // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)

            //const bytecode = contractFile.evm.bytecode.object;
            const abi = SMapping.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getMappingByDealIdMonthAndYear(req.query.dealid, month, year)
                        .call({ from: address });
                    winlog.info("data:: " + JSON.stringify(data) + "      " + data.length);

                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++) {

                            keyresp_arr.push(data[i]["Key " + i])
                            valueresp_arr.push(data[i]["Value " + i])
                        }
                        event1.emit("checkfornewcols", key, activearr, fieldarr, data);
                    }
                    else {
                        event1.emit("automapping", key, activearr, fieldarr);
                    }
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            };

            get1();

        })

        event1.on("checkfornewcols", function (key, activearr, fieldarr, response) {

            winlog.info("inside checkfornewcols emit!!!!")

            winlog.info("\n PREVIOUS keyresp_arr: " + JSON.stringify(keyresp_arr) + "           " + keyresp_arr.length + "  \n");
            winlog.info("\n PREVIOUS valueresp_arr: " + JSON.stringify(valueresp_arr) + "           " + valueresp_arr.length + "  \n");
            winlog.info("\n CURRENT key: " + JSON.stringify(key) + "           " + key.length + "  \n");
            winlog.info("\n CURRENT fieldarr: " + JSON.stringify(fieldarr) + "           " + fieldarr.length + "    " + activearr.length + "  \n");


            if (keyresp_arr.length > key.length) {
                var difference = key.filter(x => keyresp_arr.indexOf(x) === -1);
                winlog.info("if difference: " + difference);
                event1.emit("computeOnAutomapping", difference, activearr, fieldarr, response);
            }
            else if (keyresp_arr.length == key.length) {
                var difference = key.filter(x => keyresp_arr.indexOf(x) === -1);
                winlog.info("else if difference: " + difference);

                if (difference.length == 0) {

                    for (var i = 0; i < response.length; i++) {

                        var json = {
                            "id": uuidv4().toString(),
                            "key": response[i]["Key " + i],
                            "value": response[i]["Value " + i],
                            "descp": ""
                        }
                        temp_arr.push(json);
                    }
                    if (response.length == temp_arr.length) {
                        winlog.info("sindie else of no chnage!!!!!!!!!!  " + temp_arr.length)
                        res.send({ "key": temp_arr, "stdfields": fieldarr });
                    }
                }
                else {
                    event1.emit("computeOnAutomapping", difference, activearr, fieldarr, response);
                }
            }
            else {

                winlog.info("inside extra cols check else emit!!!!")

                var difference = key.filter(x => keyresp_arr.indexOf(x) === -1);
                winlog.info("else difference: " + difference);
                event1.emit("computeOnAutomapping", difference, activearr, fieldarr, response);
            }
        })


        event1.on("computeOnAutomapping", function (difference, activearr, fieldarr, response) {

            var p = 0;
            var t = 0;

            winlog.info("key len b4:  " + key.length)
            winlog.info("difference len b4:  " + difference.length)

            for (var b = 0; b < key.length; b++) {
                t = 0;
                for (var c = 0; c < difference.length; c++) {
                    if (String(key[b]) == String(difference[c])) {
                        t++;
                        break;
                    }
                }
                if (t == 0) {
                    newkey_arr.push(key[b])
                }
            }
            winlog.info("newkey_arr len b4:  " + newkey_arr.length)

            for (var i = 0; i < newkey_arr.length; i++) {
                p = 0;
                for (var j = 0; j < response.length; j++) {

                    if (String(newkey_arr[i]).toLowerCase() == String(response[j]["Key " + j]).toLowerCase()) {

                        var json = {
                            "id": uuidv4().toString(),
                            "key": newkey_arr[i],
                            "value": response[j]["Value " + j],
                            "descp": ""
                        }
                        temp_arr.push(json);

                        for (var k = 0; k < activearr.length; k++) {
                            if (String(activearr[k].fieldname).toLowerCase() == String(response[j]["Value " + j]).toLowerCase()) {
                                activearr[k].fieldname = "$";
                                p++;
                                break;
                            }
                        }
                        if (p != 0) {
                            break;
                        }
                    }
                }
            }
            if ((newkey_arr.length == temp_arr.length) && difference.length == 0) {
                winlog.info("sindie new key and key len matched1!!!!!!!!!!  " + temp_arr.length)
                res.send({ "key": temp_arr, "stdfields": fieldarr });
            }
            else {
                event1.emit("automapping", difference, activearr, fieldarr);
            }
        })

        event1.on("automapping", function (key, activearr, value1) {

            winlog.info("inside ::automapping::  ");
            var raw_index_arr = [];
            var std_arr = [];
            var count_arr = [];
            var descp_arr = [];
            var count = 0;
            var b = [];

            for (var k = 0; k < key.length; k++) {

                if (String(key[k]).includes(" ")) {
                    raw_index_arr = String(key[k]).split(" ");
                }
                else {
                    raw_index_arr = String(key[k]).split("_");
                }

                // winlog.info("after includes");
                for (var l = 0; l < activearr.length; l++) {    //std fields

                    if (activearr[l].fieldname != "$") {

                        var arr = activearr[l].fieldname;
                        if (String(arr).includes(" ")) {
                            var std_index_arr = String(arr).split(" ");
                        }
                        else {
                            var std_index_arr = String(arr).split("_");
                        }

                        count = 0;
                        for (var m = 0; m < raw_index_arr.length; m++) {

                            // var similarity = stringSimilarity.findBestMatch(key[k], fieldarr);
                            // winlog.info("similarity of "+key[k]+"        "+JSON.stringify(similarity.bestMatch));

                            for (n = 0; n < std_index_arr.length; n++) {
                                if (String(raw_index_arr[m]).toLowerCase() == String(std_index_arr[n]).toLowerCase()) {
                                    count++;
                                    break;
                                }
                            }
                        }

                        if (count != 0) {
                            count_arr.push(count);
                            std_arr.push(arr);
                            descp_arr.push(activearr[l].description);
                            b.push(l);
                        }
                    }
                }

                if (count_arr.length != 0) {
                    // winlog.info("inside IFFFFFFFFFFFFFFFFFF of countarr!")

                    max_count = Math.max(...count_arr);
                    indexOfMax = count_arr.indexOf(Math.max(...count_arr));
                    // winlog.info("count_arr:  "+JSON.stringify(count_arr)+"   max_count:  "+max_count+" indexOfMax: "+indexOfMax)
                    var json = {
                        "id": uuidv4().toString(),
                        "key": key[k],
                        "value": std_arr[indexOfMax],
                        "descp": descp_arr[indexOfMax]
                    }
                    temp_arr.push(json);
                    count_arr = [];
                    std_arr = [];
                    descp_arr = [];
                    activearr[b[indexOfMax]].fieldname = "$";
                    b = [];
                }
                else {
                    // winlog.info("inside else of countarr!")

                    var json = {
                        "id": uuidv4().toString(),
                        "key": key[k],
                        "value": "",
                        "descp": ""
                    }
                    temp_arr.push(json);
                    count_arr = [];
                    std_arr = [];
                    descp_arr = [];
                    b = [];
                }
            }

            // winlog.info("temparr:   "+JSON.stringify(temp_arr));
            res.send({ "key": temp_arr, "stdfields": fieldarr });
        })

    },


    savemapping: function (req, res, next) {


        if (!req.body.dealid || !req.body.month || !req.body.year || !req.body.data || !req.body.confirmation) {

            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            var arr = [];
            var j = 0;
            var data = req.body.data;
            var dealid = req.body.dealid;
            var month = req.body.month;
            var year = req.body.year;

            return new Promise((resolve, reject) => {

                if (String(req.body.confirmation).toLowerCase() == "yes") {
                    res.send({ "success": false, "message": "servicer aggregation already saved for this month/year" })
                }
                else {
                    const contractPath = path.join(process.cwd() + "/api/contracts/Mapping.sol");
                    winlog.info("contractpath:: " + contractPath);
                    const contractname = "Mapping"
                    //const source = fs.readFileSync(contractPath, 'utf8');

                    // const input = {
                    //     language: 'Solidity',
                    //     sources: {
                    //         [contractname + ".sol"]: {
                    //             content: source,
                    //         },
                    //     },
                    //     settings: {
                    //         outputSelection: {
                    //             '*': {
                    //                 '*': ['*'],
                    //             },
                    //         },
                    //     },
                    // };

                    //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                    //winlog.info(tempFile)
                    //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                    //winlog.info(contractFile)

                    //const bytecode = contractFile.evm.bytecode.object;
                    const abi = SMapping.abi;

                    const incrementer = new web3.eth.Contract(abi, contractAddress);
                    let errcount = 0;
                    const get1 = async () => {
                        winlog.info(`Making a call to contract at address ${contractAddress}`);
                        try {
                            const data1 = await incrementer.methods
                                .getMappingByDealIdMonthAndYear(req.body.dealid, req.body.month, req.body.year)
                                .call({ from: address });
                            winlog.info("data:: " + JSON.stringify(data1) + "    " + data1.length);

                            if (data1.length > 0) {
                                var fnname = "updateMapping"
                                var uid = data1[0][0]
                            }
                            else {
                                var fnname = "saveMapping"
                                var uid = uuidv4().toString()
                            }
                            savedata(data, fnname, uid)
                        } catch (e) {
                            errcount++;
                            if (errcount <= 3) {
                                winlog.info("error occ" + e);
                                get1();
                            } else {
                                var r = { "message": e.message }
                                res.status(500).send(r);
                            }
                        }
                    };

                    get1();


                    function savedata(data, fnname, uid) {

                        winlog.info("fnname: " + fnname + "   data: " + JSON.stringify(data))
                        const contractPath = path.join(process.cwd(), '/api/contracts/' + "Mapping.sol");
                        const contractname = "Mapping";
                        //const source = fs.readFileSync(contractPath, 'utf8');

                        // const input = {
                        //     language: 'Solidity',
                        //     sources: {
                        //         [contractname + ".sol"]: {
                        //             content: source,
                        //         },
                        //     },
                        //     settings: {
                        //         outputSelection: {
                        //             '*': {
                        //                 '*': ['*'],
                        //             },
                        //         },
                        //     },
                        // };

                        //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                        //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                        const abi = SMapping.abi;
                        const incrementer = new web3.eth.Contract(abi, contractAddress);

                        let errcount = 0;
                        const increment = async () => {
                            winlog.info(
                                `Calling the update function in deal onboarding contract at address ${contractAddress}`
                            );
                            try {
                                web3.eth.handleRevert = true
                                const encoded = incrementer.methods[fnname]([[uid, dealid, month, year, JSON.stringify(data)]]).encodeABI();
                                const createTransaction = await web3.eth.accounts.signTransaction(
                                    {
                                        from: address,
                                        to: contractAddress,
                                        data: encoded,
                                        gasLimit: 6000000,
                                        chainId: "101122"
                                    },
                                    privKey
                                ); const createReceipt = await web3.eth.sendSignedTransaction(
                                    createTransaction.rawTransaction
                                );
                                winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);

                                var eventarr = web3.eth.abi.decodeParameters([{
                                    type: 'string[]',
                                    name: 'id'
                                }], createReceipt.logs[0].data)
                                var finaleventarr = eventarr.id
                                winlog.info(finaleventarr)
                                var emittercount = 0;
                                for (var i = 0; i < finaleventarr.length; i++) {
                                    if (finaleventarr[i] != '') {
                                        emittercount++;
                                    }
                                }
                                if (emittercount > 0) {
                                    winlog.info(finaleventarr)
                                    winlog.info("error in save mapping")
                                    if(fnname === "saveMapping"){
                                    res.send({
                                        "success": false,
                                        "message": "Data already exist"
                                    })}else{
                                        winlog.info("error in svae mapping")
                                        res.send({
                                            "success": false,
                                            "message": "Data doesnot exist"
                                        })
                                    }
                                } else {
                                resolve({ "success": true, "message": "mapping save success" })
                                }
                            } catch (e) {
                                errcount++;
                                if (e.reason && e.reason.includes("Caller is not an invoker")) {
                                    winlog.info(e.reason)
                                    res.status(500).send(e.reason);
                                }
                                else if (errcount <= 3) {
                                    winlog.info("error occ" + e);
                                    increment();
                                } else {
                                    var r = { "message": e.message }
                                    res.status(500).send(r);
                                }
                            }

                        };
                        increment();
                    }
                }

            })
        }
    },

    getmapping: function (req, res, next) {

        if (!req.query.dealid || !req.query.month || !req.query.year) {

            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            var dealid = req.body.dealid;
            var month = req.query.month;
            var year = req.query.year;

            const contractPath = path.join(process.cwd() + "/api/contracts/Mapping.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "Mapping"
            //const source = fs.readFileSync(contractPath, 'utf8');

            // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)

            //const bytecode = contractFile.evm.bytecode.object;
            const abi = SMapping.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            let errcount = 0;
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                try {
                    const data1 = await incrementer.methods
                        .getMappingByDealIdMonthAndYear(req.query.dealid, req.query.month, req.query.year)
                        .call({ from: address });
                    winlog.info("data:: " + JSON.stringify(data1));

                    res.send({ "success": true, "data": data1 })
                } catch (e) {
                    errcount++;
                    if (errcount <= 3) {
                        winlog.info("error occ" + e);
                        get1();
                    } else {
                        var r = { "message": e.message }
                        res.status(500).send(r);
                    }
                }
            };

            get1();

        }
    }
}
module.exports = displaycolumns;