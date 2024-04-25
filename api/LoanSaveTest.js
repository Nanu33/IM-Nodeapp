const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const contractAddress = "0x606936054EFA1D8f6D09D48c60ebb83fA2259622";// Contract Call
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replace
const { v4: uuidv4 } = require('uuid');
// var log4js = require("log4js");
// var logger = log4js.getLogger();
// logger.level = "debug";
var toLowerCase = require('to-lower-case');
var EventEmitter = require("events").EventEmitter;
const xl1 = require("xlsx");
var count = 0;
const NodeRSA = require('node-rsa');
const ipfsAPI = require('ipfs-api');

var HashMap = require('hashmap');
var MongoClient = require('mongodb').MongoClient
// var url = "mongodb://127.0.0.1:27017/IM";
var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";
const { AggregationCursor } = require('mongodb');
const ipfs = ipfsAPI('20.237.185.191', '9095', { protocol: 'http' });
var request = require('request');
const winlog = require("../log/winstonlog");
const SDate = require('./abi/Date')
const SLoanSave = require('./abi/LoanSave')
const SMapping = require('./abi/Mapping')
const SServicerData = require('./abi/ServicerData')

var query = {
    createDeal: function (req, res) {

        var aggregation = new EventEmitter();

        var loanarray = []
        var finalarr = [];
        var fileHash = ""
        var collateral = [];
        var principal = []
        var interest = []
        var collections = []
        var bdbarr = [];

        const contractAddress = SMapping.address
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
            const data1 = await incrementer.methods
                .getMappingByDealIdMonthAndYear(req.body.dealid, req.body.month, req.body.year)
                .call({ from: address });
            winlog.info("data:: " + JSON.stringify(JSON.parse(data1[0][4])));

            renovation(JSON.parse(data1[0][4]));
        };
        get1();


        function renovation(ui_inputs) {

            var inputs = ui_inputs;

            var month = String(req.body.month).padStart(2, '0')

            // if (parseInt(req.body.month) < 10) {
            //     var month = "0" + req.body.month;
            // }
            // else {
            //     var month = req.body.month;
            // }
            var filename = req.body.dealid + "-" + month + "-" + req.body.year + ".xlsx"
            var path1 = "./servicerUploads/" + filename;
            winlog.info("path1: " + path1)
            const file = xl1.readFile(path1);
            let data = [];
            var key = [];
            const rows = xl1.utils.sheet_to_json(
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

            for (var i = 0; i < inputs.length; i++) {

                for (var j = 0; j < key.length; j++) {

                    if (inputs[i]["Key " + (i)] == key[j]) {
                        if (inputs[i]["Value " + (i)] == "" || inputs[i]["Value " + (i)] == "not defined") {
                            key[j] = null;
                            break;
                        }
                        else {
                            key[j] = inputs[i]["Value " + (i)];
                            break;
                        }

                    }
                }
            }


            for (var k = 0; k < rows.length; k++) {
                var value = rows[k];
                var value2 = rows[k];
                var json = {};
                var x = 0;
                Object.keys(value).forEach(function (jsonkey) {   // value is a json

                    if (jsonkey.toLowerCase().includes("empty") && x == key.length) {
                        delete value[jsonkey];
                    }
                    else if (key[x] == jsonkey || key[x] == null) {
                        x++;
                    }
                    else {
                        value[key[x]] = value[jsonkey];
                        delete value[jsonkey];
                        x++;
                    }
                })

                //cols loop
                for (var p = 0; p < key.length; p++) {

                    if (key[p] != null || String(key[p]) != "null") {

                        //account status 
                        if (value[key[p]] == "0-30" || value[key[p]] == "0-29" || value[key[p]] == "IN_REPAY" || value[key[p]] == "PAID_OPEN" ||
                            value[key[p]] == "PAID_CLOSED" || value[key[p]] == "DELQ_10_29" || value[key[p]] == "DELQ_1_9" ||
                            value[key[p]] == "Paid Off" || value[key[p]] == "PaidOff" || value[key[p]] == "0" || String(value[key[p]]).toLowerCase() == "current" ||
                            String(value[key[p]]).toLowerCase() == "transferred" || String(value[key[p]]).toLowerCase() == "sold" ||
                            String(value[key[p]]).toLowerCase() == "active" || String(value[key[p]]).toLowerCase() == "late" ||
                            String(value[key[p]]).toLowerCase() == "performing" || value[key[p]] == "A" || value[key[p]] == "S" || value[key[p]] == "P" ||
                            String(value[key[p]]).toLowerCase() == "c" || value[key[p]] == "-30" || value[key[p]] == "0" || value[key[p]] == "-60" || value[key[p]] == "-90" ||
                            value[key[p]] == "-120") {

                            json["Account Status"] = "current";
                        }
                        else if (value[key[p]] == "30-60" || value[key[p]] == "30+" || value[key[p]] == "30" ||
                            value[key[p]] == "30-59" || value[key[p]] == "DELQ_30_60" || value[key[p]] == "DQ30" || value[key[p]] == "30 Days Past Due") {

                            json["Account Status"] = "30-59_days_dq";

                        }
                        else if (value[key[p]] == "60-90" || value[key[p]] == "60+" || value[key[p]] == "60" || value[key[p]] == "60-89" || value[key[p]] == "DQ60") {
                            json["Account Status"] = "60-89_days_dq";
                        }
                        else if (value[key[p]] == "90-120" || value[key[p]] == "90-119" || value[key[p]] == "90" || value[key[p]] == "DQ90") {
                            json["Account Status"] = "90-119_days_dq";
                        }
                        else if (value[key[p]] == "120-150" || value[key[p]] == "120-149" || value[key[p]] == "120" || value[key[p]] == "120+" || value[key[p]] == "DQ120") {
                            json["Account Status"] = "120-149_days_dq";
                        }
                        else if (value[key[p]] == "150-180" || value[key[p]] == "150-179" || value[key[p]] == "150" || value[key[p]] == "DQ150") {
                            json["Account Status"] = "150-179_days_dq";
                        }
                        else if (value[key[p]] == "DELQ_61_UP") {
                            json["Account Status"] = "60+_days_dq";
                        }
                        else if (value[key[p]] == "90+" || value[key[p]] == "90+ Days Past Due") {
                            json["Account Status"] = "90+_days_dq";
                        }
                        else if (value[key[p]] == "180+" || value[key[p]] == "180" || value[key[p]] == "210" || value[key[p]] == "240" ||
                            value[key[p]] == "270" || value[key[p]] == "300" || value[key[p]] == "330" || value[key[p]] == "360" || value[key[p]] == "390" ||
                            value[key[p]] == "420" || value[key[p]] == "450" || value[key[p]] == "480" || value[key[p]] == "510" || value[key[p]] == "540" ||
                            value[key[p]] == "570" || value[key[p]] == "600") {

                            json["Account Status"] = "180+_days_dq";
                        }
                        else if (String(value[key[p]]).toLowerCase() == "reo") {
                            json["Account Status"] = "reo";
                        }
                        else if (String(value[key[p]]).toLowerCase() == "forclosure" || value[key[p]] == "FC" || String(value[key[p]]).toLowerCase() == "foreclosure") {
                            json["Account Status"] = "foreclosure";
                        }
                        else if (String(value[key[p]]).toLowerCase() == "forbearance" || String(value[key[p]]).toLowerCase() == "forebearance") {
                            json["Account Status"] = "forebearance";
                        }
                        else if (value[key[p]] == "" || String(value[key[p]]) == "null") {
                            json["Account Status"] = "current";
                        }
                        else {
                            json["Account Status"] = "N/A";
                        }


                        //Lien
                        if (key[p] == 'Lien') {
                            value['Lien'] = String(parseFloat(value['Lien']) + 1)
                        }

                        //Include in Beginning Count
                        if (parseFloat(value['Prior Principal Balances']) > 0) {
                            json['Include in Beginning Count'] = "TRUE"
                        }
                        else {
                            json['Include in Beginning Count'] = "FALSE"
                        }

                        //Include in Ending Count
                        if (parseFloat(value['Current Principal Balance']) > 0) {
                            json['Include in Ending Count'] = "TRUE"
                        }
                        else {
                            json['Include in Ending Count'] = "FALSE"
                        }

                        json[key[p]] = String(value[key[p]]);
                    }
                }
                finalarr.push(json);
            }
            winlog.info("total length:::::::" + JSON.stringify(finalarr) + "      " + finalarr.length + "    " + rows.length)


            var key1 = new NodeRSA({ b: 1024 });//1024
            var publickey = req.body.dealid + "-public-key.txt";
            var privatekey = req.body.dealid + "-private-key.txt";

            // var testFolder = "/home/monisha/Downloads/rsakeystore/";
            var testFolder = "./uploads/"
            // var testFolder = process.cwd()+"/keys/"
            var public_key = fs.readFileSync(testFolder + publickey, { encoding: 'utf8', flag: 'r' });

            key1.importKey(public_key, "pkcs8-public");

            var encryptedString = key1.encrypt(finalarr, 'base64');
            winlog.info("\n total length after encyr:::::::" + JSON.stringify(finalarr) + "      " + finalarr.length)

            // winlog.info("encryptedString: "+encryptedString)
            //Creating buffer for ipfs function to add file to the system
            let testBuffer = new Buffer(JSON.stringify(encryptedString));

            winlog.info(testBuffer + ":::");
            ipfs.files.add(testBuffer, async function (err, file) {
                winlog.info("inside ipfs if: ")
                if (err) {
                    winlog.info(err);
                }
                winlog.info(file)
                fileHash = file[0].hash;
                // winlog.info("filehash: " + fileHash)
                var saveresult = await queryloan(fileHash);
                winlog.info("result: " + saveresult)
                if (saveresult.success) {
                    winlog.info("inside agg--")
                    setTimeout(() => {
                        aggregationfn()
                    }, 1000);
                }
                // res.send(saveresult)
            })



            function queryloan(fileHash) {

                return new Promise((resolve, reject) => {
                    const contractAddress = SLoanSave.address
                    const contractPath = path.join(process.cwd(), '/api/contracts/' + "LoanSave.sol");
                    const contractname = "LoanSave";
                    //const source = fs.readFileSync(contractPath, 'utf8');
                    var privatekey = req.body.dealid + "-private-key.txt";

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
                    ////const bytecode = contractFile.evm.bytecode.object;
                    const abi = SLoanSave.abi;
                    const incrementer = new web3.eth.Contract(abi, contractAddress);

                    const getDeal = async () => {
                        winlog.info(`Making a call to contract at address ${contractAddress}`);
                        const data = await incrementer.methods
                            .getDataByDealMonthYear(req.body.dealid, req.body.month, req.body.year)
                            .call({ from: address });

                        winlog.info("data:: " + JSON.stringify(data) + "    " + data.length);

                        if (data.length > 0) {
                            var functiontodo = "updateLoanTape"
                            var uid = data[0][0]
                            var res = await saveloan(fileHash, functiontodo, uid)
                            if (res.success) {
                                resolve({ "success": "true", "message": "loan update success" })
                            }
                        }
                        else {
                            var functiontodo = "createLoanTape"
                            var uid = uuidv4().toString()
                            var res = await saveloan(fileHash, functiontodo, uid)
                            if (res.success) {
                                resolve({ "success": "true", "message": "loan save success" })
                            }
                        }
                    }; getDeal();
                })
            }


            function saveloan(fileHash, functiontodo, uid) {

                return new Promise((resolve, reject) => {
                    var poolDetails = {};
                    //---------------------------------DealOnbordding solidity file configuration ------------------------------------------------------------------------
                    const contractAddress = SLoanSave.address
                    const contractPath = path.join(process.cwd(), '/api/contracts/' + "LoanSave.sol");
                    const contractname = "LoanSave";
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
                    const abi = SLoanSave.abi;
                    const incrementer = new web3.eth.Contract(abi, contractAddress);

                    var dealDetails = [[uid, req.body.dealid, req.body.month, req.body.year, fileHash, privatekey]];
                    winlog.info("deal details::::::::" + dealDetails)
                   let errcount =0
                    const increment = async () => {
                        winlog.info(
                            `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
                        );
                        try {
                            web3.eth.handleRevert = true
                            const encoded = incrementer.methods[functiontodo](dealDetails).encodeABI();
                            const createTransaction = await web3.eth.accounts.signTransaction(
                                {
                                    from: address,
                                    to: contractAddress,
                                    data: encoded,
                                    gasLimit: 8000000,
                                   // gasPrice: 35000000001,
                                    chainId: "101122"
                                },
                                privKey
                            ); const createReceipt = await web3.eth.sendSignedTransaction(
                                createTransaction.rawTransaction
                            );
                            winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                            setTimeout(() => {
                                winlog.info("i::::::::::::::::::: and save success");

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
                                    winlog.info("error in createloantape")
                                    if(functiontodo === "createLoanTape"){
                                    res.send({
                                        "success": false,
                                        "message": "Data already exist"
                                    })}else{
                                        winlog.info("error in createloantape")
                                        res.send({
                                            "success": false,
                                            "message": "Data doesnot exist"
                                        })
                                    }
                                } else {
                                resolve({ "success": "true", "message": "loan save success" })
                                }
                            }, 1000)
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
                    }; increment();
                })
            }


            function aggregationfn() {

                const contractAddress = SLoanSave.address
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "LoanSave.sol");
                const contractname = "LoanSave";
                //const source = fs.readFileSync(contractPath, 'utf8');
                var privatekey = req.body.dealid + "-private-key.txt";

                // const input = {language: 'Solidity',
                //     sources: {[contractname + ".sol"]: {content: source,},
                //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


                //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                //winlog.info(tempFile)
                //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                //winlog.info(contractFile)
                ////const bytecode = contractFile.evm.bytecode.object;
                const abi = SLoanSave.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                const getDeal = async () => {
                    winlog.info(`Making a call to contract at address ${contractAddress}`);
                    const data = await incrementer.methods
                        .getDataByDealMonthYear(req.body.dealid, req.body.month, req.body.year)
                        .call({ from: address });

                    winlog.info("data:: " + JSON.stringify(data));

                    ipfs.files.get(data[0][4], function (err, files) {
                        files.forEach((file) => {
                            ipfsData = JSON.parse(file.content.toString('utf8'));
                            // winlog.info("ipfsData: "+ipfsData)

                            // var testFolder = "/home/monisha/Downloads/rsakeystore/"
                            var testFolder = "./uploads/"
                            var private_key = fs.readFileSync(testFolder + privatekey, { encoding: 'utf8', flag: 'r' });
                            // var private_key = fs.readFileSync(testFolder + data[0][5], { encoding: 'utf8', flag: 'r' });

                            let key_private = new NodeRSA(private_key)
                            var decrypt = key_private.decrypt(ipfsData, 'utf8')
                            var json = JSON.parse(decrypt)
                            winlog.info("decrpted json: " + JSON.stringify(json) + "   " + json.length)

                            bdbarr = JSON.parse(JSON.stringify(json));
                            var datearray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            var bdbmon = String(req.body.month).padStart(2, '0')

                            // if (parseInt(req.body.month) < 10) {
                            //     var bdbmon = "0" + req.body.month;
                            // }
                            // else {
                            //     var bdbmon = req.body.month;
                            // }
                            var bdbdate = req.body.year + "-" + bdbmon + "-01";
                            var yr = req.body.year.charAt(2) + req.body.year.charAt(3);
                            var bdbmonth = datearray[parseInt(req.body.month) - 1] + "-" + yr;

                            for (var b = 0; b < bdbarr.length; b++) {
                                bdbarr[b]["Loan Date"] = bdbdate;
                                bdbarr[b]["Month"] = bdbmon;
                                bdbarr[b]["Year"] = req.body.year;
                                bdbarr[b]["DealID"] = req.body.dealid;
                                bdbarr[b]["Asset Category"] = "Residential Real Estate"
                            }

                            setTimeout(() => {
                                // winlog.info("bdbarr json: " + JSON.stringify(bdbarr) + "   " + bdbarr.length)
                                aggregation.emit("servicersumary", json);
                            }, 1000);

                        })
                    })

                };
                getDeal();


                aggregation.on("servicersumary", function (loandata) {

                    winlog.info("loantape rec len: " + loandata.length)

                    var key = [];
                    var value1 = [];
                    var value2 = [];

                    let mapprin1 = new HashMap();
                    let mapbal = new HashMap();
                    let mapcount = new HashMap();
                    let mapint = new HashMap();
                    let mapprin2 = new HashMap();

                    mapprin1.set("Beginning Collateral Balance", "");
                    mapprin1.set("Funded Amounts", -1);
                    mapprin1.set("New Purchases", -1);
                    mapprin1.set("Other(+)", -1);
                    mapprin1.set("Other(+)(non-cash)", 0);
                    mapprin1.set("Curtailments", 1);
                    mapprin1.set("Liquidation", 1);
                    mapprin1.set("Paid In Full", 1);
                    mapprin1.set("Principal Payments", 1);
                    mapprin1.set("Realized Losses", 0);
                    mapprin1.set("Repurchase", 1);
                    mapprin1.set("Sale", 1);
                    mapprin1.set("Other(-)", 1);
                    mapprin1.set("Other(-)(non-cash)", 0);


                    mapbal.set("Beginning Collateral Balance", 1);
                    mapbal.set("Funded Amounts", 1);
                    mapbal.set("New Purchases", 1);
                    mapbal.set("Other(+)", 1);
                    mapbal.set("Other(+)(non-cash)", 1);
                    mapbal.set("Curtailments", -1);
                    mapbal.set("Liquidation", -1);
                    mapbal.set("Paid In Full", -1);
                    mapbal.set("Principal Payments", -1);
                    mapbal.set("Realized Losses", -1);
                    mapbal.set("Repurchase", -1);
                    mapbal.set("Sale", -1);
                    mapbal.set("Other(-)", -1);
                    mapbal.set("Other(-)(non-cash)", -1);

                    mapcount.set("Beginning Collateral Balance", 1);
                    mapcount.set("Funded Amounts", 0);
                    mapcount.set("New Purchases", 1);
                    mapcount.set("Other(+)", 0);
                    mapcount.set("Other(+)(non-cash)", 0);
                    mapcount.set("Curtailments", 0);
                    mapcount.set("Liquidation", -1);
                    mapcount.set("Paid In Full", -1);
                    mapcount.set("Principal Payments", 0);
                    mapcount.set("Realized Losses", 0);
                    mapcount.set("Repurchase", -1);
                    mapcount.set("Sale", -1);
                    mapcount.set("Other(-)", 0);
                    mapcount.set("Other(-)(non-cash)", 0);

                    mapint.set("Beginning Interest Balance", 1);
                    mapint.set("Interest", 1);
                    mapint.set("Fees", 1);
                    mapint.set("Payoff Interest", 1);
                    mapint.set("Payoff Fees", 1);
                    mapint.set("Other(+)", 1);
                    mapint.set("Servicing Fees", -1);
                    mapint.set("Payoff Servicing Fee", -1);
                    mapint.set("Other(-)", -1);

                    mapprin2.set("Beginning Principal Balance", 1);
                    mapprin2.set("Curtailments", 1);
                    mapprin2.set("Liquidation", 1);
                    mapprin2.set("Paid In Full", 1);
                    mapprin2.set("Principal Payments", 1);
                    mapprin2.set("Repurchase", 1);
                    mapprin2.set("Sale", 1);
                    mapprin2.set("Other(+)", 1);
                    mapprin2.set("Funded Amounts", -1);
                    mapprin2.set("New Purchases", -1);
                    mapprin2.set("Other(-)", -1);

                    let count_col_bal = new HashMap();
                    let balance_col_bal = new HashMap();

                    let count_int_bal = new HashMap();
                    let balance_int_bal = new HashMap();

                    let count_prin_bal = new HashMap();
                    let balance_prin_bal = new HashMap();

                    var count1 = 0;
                    var count2 = 0;
                    var count3 = 0;
                    var count4 = 0;
                    var count5 = 0;
                    var count6 = 0;
                    var count7 = 0;
                    var count8 = 0;
                    var count9 = 0;
                    var count10 = 0;
                    var count11 = 0;
                    var count12 = 0;
                    var count13 = 0;
                    var count14 = 0;
                    var count15 = 0;

                    var col_bal1 = 0.00;
                    var col_bal2 = 0.00;
                    var col_bal3 = 0.00;
                    var col_bal4 = 0.00;
                    var col_bal5 = 0.00;
                    var col_bal6 = 0.00;
                    var col_bal7 = 0.00;
                    var col_bal8 = 0.00;
                    var col_bal9 = 0.00;
                    var col_bal10 = 0.00;
                    var col_bal11 = 0.00;
                    var col_bal12 = 0.00;
                    var col_bal13 = 0.00;
                    var col_bal14 = 0.00;
                    var col_bal15 = 0.00;

                    var int_bal1 = 0.00;
                    var int_bal2 = 0.00;
                    var int_bal3 = 0.00;
                    var int_bal4 = 0.00;
                    var int_bal5 = 0.00;
                    var int_bal6 = 0.00;
                    var int_bal7 = 0.00;
                    var int_bal8 = 0.00;
                    var int_bal9 = 0.00;
                    var int_bal10 = 0.00;

                    var prin_bal1 = 0.00;
                    var prin_bal2 = 0.00;
                    var prin_bal3 = 0.00;
                    var prin_bal4 = 0.00;
                    var prin_bal5 = 0.00;
                    var prin_bal6 = 0.00;
                    var prin_bal7 = 0.00;
                    var prin_bal8 = 0.00;
                    var prin_bal9 = 0.00;
                    var prin_bal10 = 0.00;
                    var prin_bal11 = 0.00;
                    var prin_bal12 = 0.00;
                    var prin_bal13 = 0.00;

                    var from_date = "1/" + req.body.month + "/" + req.body.year;
                    var getDaysInMonth = function (month1, year1) {
                        return new Date(year1, month1, 0).getDate();
                    };
                    var to_noofdays = getDaysInMonth(parseInt(req.body.month), parseInt(req.body.year));
                    var to_date = to_noofdays + "/" + req.body.month + "/" + req.body.year;

                    winlog.info("from_date: " + from_date + "  to_date:  " + to_date);


                    for (var i = 0; i < loandata.length; i++) {

                        if (String(loandata[i]['Pool Addition Date']) != "undefined") {
                            var dt1 = String(loandata[i]['Pool Addition Date']).split("-");   //y/m/d
                        }
                        else {
                            loandata[i]['Pool Addition Date'] = "1899-12-30"
                            var dt1 = String(loandata[i]['Pool Addition Date']).split("-");   //y/m/d
                        }
                        // winlog.info("dt1: " + loandata[i]['Pool Addition Date'])
                        var trade_dt = dt1[1] + "/" + dt1[2] + "/" + dt1[0];
                        var dt2 = from_date.split("/");     //d/m/y

                        dt2[1] = String(dt2[1]).padStart(2, '0')
                        var from_dt = dt2[1] + "/" + dt2[0] + "/" + dt2[2];
                        // if (parseInt(dt2[1]) < 10) {
                        //     var from_dt = "0" + dt2[1] + "/" + dt2[0] + "/" + dt2[2];
                        // }
                        // else {
                        //     var from_dt = dt2[1] + "/" + dt2[0] + "/" + dt2[2];
                        // }
                        var obj1 = new Date(trade_dt);
                        var obj2 = new Date(from_dt);

                        //compare date should be in dd/m/y format
                        if (obj1.getTime() < obj2.getTime()) {
                            // if (parseFloat(loandata[i]['Prior Principal Balances']) > 0) {
                            if (String(loandata[i]['Include in Beginning Count']) == "TRUE") {
                                ++count1;
                            }
                            // }
                            col_bal1 = col_bal1 + parseFloat(loandata[i]['Prior Principal Balances']);
                        }

                        if (parseFloat(loandata[i]['Principal Payment Adjustment (remit+bal)']) > 0) {
                            ++count4;
                        }
                        if (String(loandata[i]['Principal Payment Adjustment (remit+bal)']) != "undefined" && String(loandata[i]['Principal Payment Adjustment (remit+bal)']) != "NaN" && String(loandata[i]['Principal Payment Adjustment (remit+bal)']) != "null" && String(loandata[i]['Principal Payment Adjustment (remit+bal)']) != "") {
                            col_bal4 = col_bal4 + parseFloat(loandata[i]['Principal Payment Adjustment (remit+bal)']);
                        }

                        if (parseFloat(loandata[i]['Principal Payment Adjustment (bal)']) > 0) {
                            ++count5;
                        }
                        if (String(loandata[i]['Principal Payment Adjustment (bal)']) != "undefined" && String(loandata[i]['Principal Payment Adjustment (bal)']) != "NaN" && String(loandata[i]['Principal Payment Adjustment (bal)']) != "null" && String(loandata[i]['Principal Payment Adjustment (bal)']) != "") {
                            col_bal5 = parseFloat(col_bal5) + parseFloat(loandata[i]['Principal Payment Adjustment (bal)']);
                        }

                        if (parseFloat(loandata[i]['Curtailments']) > 0) {
                            ++count6;
                        }
                        if (String(loandata[i]['Curtailments']) == "undefined" || String(loandata[i]['Curtailments']) == "NaN" || String(loandata[i]['Curtailments']) == "null" && String(loandata[i]['Curtailments']) == "") {
                        }
                        else {
                            col_bal6 = col_bal6 + parseFloat(loandata[i]['Curtailments']);
                        }

                        if (parseFloat(loandata[i]['PIF']) > 0) {
                            ++count8;
                        }
                        if (String(loandata[i]['PIF']) != "undefined" && String(loandata[i]['PIF']) != "NaN" && String(loandata[i]['PIF']) != "null" && String(loandata[i]['PIF']) != "") {
                            col_bal8 = col_bal8 + parseFloat(loandata[i]['PIF']);
                        }

                        if (parseFloat(loandata[i]['Scheduled Principal']) > 0) {
                            ++count9;
                        }
                        if (String(loandata[i]['Scheduled Principal']) != "undefined" && String(loandata[i]['Scheduled Principal']) != "NaN" && String(loandata[i]['Scheduled Principal']) != "null" && String(loandata[i]['Scheduled Principal']) != "") {
                            col_bal9 = col_bal9 + parseFloat(loandata[i]['Scheduled Principal']);
                        }

                        if (parseFloat(loandata[i]['Principal Payment - Repurchase']) > 0) {
                            ++count11;
                        }

                        if (parseFloat(loandata[i]['Principal Payment - Sold']) > 0) {
                            ++count12;
                        }

                        if (String(loandata[i]['Gross Interest']) == "undefined" || String(loandata[i]['Gross Interest']) == "NaN" || String(loandata[i]['Gross Interest']) == "null" || String(loandata[i]['Gross Interest']) == "") {
                        }
                        else {
                            int_bal2 = int_bal2 + parseFloat(loandata[i]['Gross Interest']);
                        }

                        if (String(loandata[i]['Interest Payment Adjustment (remit)']) != "" && String(loandata[i]['Interest Payment Adjustment (remit)']) != "null" &&
                            String(loandata[i]['Interest Payment Adjustment (remit)']) != "undefined" && String(loandata[i]['Interest Payment Adjustment (remit)']) != "NaN") {
                            int_bal6 = int_bal6 + parseFloat(loandata[i]['Interest Payment Adjustment (remit)']);
                        }

                        if (String(loandata[i]['Servicer Fee']) != "undefined" && String(loandata[i]['Servicer Fee']) != "NaN" && String(loandata[i]['Servicer Fee']) != "null" && String(loandata[i]['Servicer Fee']) != "") {
                            int_bal7 = int_bal7 + parseFloat(loandata[i]['Servicer Fee']);
                        }
                    }

                    winlog.info("col_bal4:  " + col_bal4)
                    var col_bal4a = Math.max(0, col_bal4);

                    if (parseFloat(col_bal4a) <= 0) {
                        count4 = 0;
                    }

                    var col_bal5a = Math.max(0, col_bal5);
                    var count5a = count5;

                    if (parseFloat(col_bal5a) <= 0) {
                        count5 = 0;
                    }

                    //Other(-)
                    col_bal13 = Math.max(0, -col_bal4);
                    if (parseFloat(col_bal13) <= 0) {
                        count13 = 0;
                    } else {
                        count13 = count4;
                    }

                    //Other(-)(non-cash)
                    col_bal14 = Math.max(0, -col_bal5);
                    if (parseFloat(col_bal14) <= 0) {
                        count14 = 0;
                    } else {
                        count14 = count5;
                    }


                    count_col_bal.set("Beginning Collateral Balance", count1);
                    count_col_bal.set("Funded Amounts", count2);
                    count_col_bal.set("New Purchases", count3);
                    count_col_bal.set("Other(+)", count4);
                    count_col_bal.set("Other(+)(non-cash)", count5);
                    count_col_bal.set("Curtailments", count6);
                    count_col_bal.set("Liquidation", count7);
                    count_col_bal.set("Paid In Full", count8);
                    count_col_bal.set("Principal Payments", count9);
                    count_col_bal.set("Realized Losses", count10);
                    count_col_bal.set("Repurchase", count11);
                    count_col_bal.set("Sale", count12);
                    count_col_bal.set("Other(-)", count13);
                    count_col_bal.set("Other(-)(non-cash)", count14);

                    balance_col_bal.set("Beginning Collateral Balance", col_bal1);
                    balance_col_bal.set("Funded Amounts", col_bal2);
                    balance_col_bal.set("New Purchases", col_bal3);
                    balance_col_bal.set("Other(+)", col_bal4a);
                    balance_col_bal.set("Other(+)(non-cash)", col_bal5a);
                    balance_col_bal.set("Curtailments", col_bal6);
                    balance_col_bal.set("Liquidation", col_bal7);
                    balance_col_bal.set("Paid In Full", col_bal8);
                    balance_col_bal.set("Principal Payments", col_bal9);
                    balance_col_bal.set("Realized Losses", col_bal10);
                    balance_col_bal.set("Repurchase", col_bal11);
                    balance_col_bal.set("Sale", col_bal12);
                    balance_col_bal.set("Other(-)", col_bal13);
                    balance_col_bal.set("Other(-)(non-cash)", col_bal14);


                    mapcount.forEach(function (value, key) {
                        count15 = parseFloat(count15) + parseFloat(parseFloat(value) * parseFloat(count_col_bal.get(key)));
                    });

                    mapbal.forEach(function (value, key) {
                        col_bal15 = parseFloat(col_bal15) + parseFloat(parseFloat(value) * parseFloat(balance_col_bal.get(key)));
                    });

                    count_col_bal.set("Ending Collateral Balance", count15);
                    balance_col_bal.set("Ending Collateral Balance", col_bal15);

                    int_bal2 = parseFloat(int_bal2).toFixed(2);
                    int_bal6a = Math.max(0, int_bal6);
                    int_bal9 = Math.max(0, -int_bal6);

                    balance_int_bal.set("Beginning Interest Balance", int_bal1);
                    balance_int_bal.set("Interest", int_bal2);
                    balance_int_bal.set("Fees", int_bal3);
                    balance_int_bal.set("Payoff Interest", int_bal4);
                    balance_int_bal.set("Payoff Fees", int_bal5);
                    balance_int_bal.set("Other(+)", int_bal6a);
                    balance_int_bal.set("Servicing Fees", int_bal7);
                    balance_int_bal.set("Payoff Servicing Fee", int_bal8);
                    balance_int_bal.set("Other(-)", int_bal9);

                    mapint.forEach(function (value, key) {
                        int_bal10 = parseFloat(int_bal10) + parseFloat(parseFloat(value) * parseFloat(balance_int_bal.get(key)));
                    });

                    balance_int_bal.set("Ending Interest Balance", int_bal10);

                    count_int_bal.set("Beginning Interest Balance", "");
                    count_int_bal.set("Interest", "");
                    count_int_bal.set("Fees", "");
                    count_int_bal.set("Payoff Interest", "");
                    count_int_bal.set("Payoff Fees", "");
                    count_int_bal.set("Other(+)", "");
                    count_int_bal.set("Servicing Fees", "");
                    count_int_bal.set("Payoff Servicing Fee", "");
                    count_int_bal.set("Other(-)", "");
                    count_int_bal.set("Ending Interest Balance", "");

                    balance_prin_bal.set("Beginning Principal Balance", prin_bal1);

                    prin_bal2 = col_bal6
                    prin_bal3 = col_bal7
                    prin_bal4 = col_bal8
                    prin_bal5 = col_bal9
                    prin_bal7 = col_bal11
                    prin_bal8 = col_bal12
                    prin_bal9 = col_bal13
                    prin_bal10 = col_bal14
                    // prin_bal11 = "0.00"
                    // prin_bal12 = "0.00"

                    if (parseInt(mapprin1.get("Curtailments")) == 1) {
                        balance_prin_bal.set("Curtailments", prin_bal2);
                    } else {
                        balance_prin_bal.set("Curtailments", prin_bal2);
                    }

                    if (parseInt(mapprin1.get("Liquidation")) == 1) {
                        balance_prin_bal.set("Liquidation", prin_bal3);
                    } else {
                        balance_prin_bal.set("Liquidation", prin_bal3);
                    }

                    if (parseInt(mapprin1.get("Paid In Full")) == 1) {
                        balance_prin_bal.set("Paid In Full", prin_bal4);
                    } else {
                        balance_prin_bal.set("Paid In Full", prin_bal4);
                    }

                    if (parseInt(mapprin1.get("Principal Payments")) == 1) {
                        balance_prin_bal.set("Principal Payments", prin_bal5);
                    } else {
                        balance_prin_bal.set("Principal Payments", prin_bal5);
                    }

                    if (parseInt(mapprin1.get("Repurchase")) == 1) {
                        balance_prin_bal.set("Repurchase", prin_bal7);
                    } else {
                        balance_prin_bal.set("Repurchase", prin_bal7);
                    }

                    if (parseInt(mapprin1.get("Sale")) == 1) {
                        balance_prin_bal.set("Sale", prin_bal8);
                    } else {
                        balance_prin_bal.set("Sale", prin_bal8);
                    }

                    if (parseInt(mapprin1.get("Other(-)")) == 1) {
                        balance_prin_bal.set("Other(+)", prin_bal9);
                    } else {
                        balance_prin_bal.set("Other(+)", prin_bal9);
                    }

                    if (parseInt(mapprin1.get("Other(-)(non-cash)")) == 1) {
                        balance_prin_bal.set("Funded Amounts", prin_bal10);
                    } else {
                        balance_prin_bal.set("Funded Amounts", prin_bal10);
                    }

                    balance_prin_bal.set("New Purchases", prin_bal11);
                    balance_prin_bal.set("Other(-)", prin_bal12);

                    mapprin2.forEach(function (value, key) {
                        prin_bal13 = parseFloat(prin_bal13) + parseFloat(parseFloat(value) * parseFloat(balance_prin_bal.get(key)));
                    });

                    count_prin_bal.set("Beginning Principal Balance", "");
                    count_prin_bal.set("Curtailments", "");
                    count_prin_bal.set("Liquidation", "");
                    count_prin_bal.set("Paid In Full", "");
                    count_prin_bal.set("Principal Payments", "");
                    count_prin_bal.set("Repurchase", "");
                    count_prin_bal.set("Sale", "");
                    count_prin_bal.set("Other(+)", "");
                    count_prin_bal.set("Funded Amounts", "");
                    count_prin_bal.set("New Purchases", "");
                    count_prin_bal.set("Other(-)", "");
                    count_prin_bal.set("Ending Principal Balance", "");

                    count_prin_bal.set("Interest Paid", int_bal10);
                    count_prin_bal.set("Principal Paid", prin_bal13);
                    var total = parseFloat(int_bal10) + parseFloat(prin_bal13);
                    count_prin_bal.set("Total", total);

                    var arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                    var str = "Pool Activity (1st " + arr[parseInt(req.body.month) - 1] + " " + req.body.year + " to " +
                        to_noofdays + " " + arr[parseInt(req.body.month) - 1] + " " + req.body.year + ")"



                    //colateral
                    var json = {
                        [str]: "Beginning Collateral Balance",
                        "Count": count1,
                        "Balance": parseFloat(col_bal1).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Funded Amounts",
                        "Count": count2,
                        "Balance": parseFloat(col_bal2).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "New Purchases",
                        "Count": count3,
                        "Balance": parseFloat(col_bal3).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Other(+)",
                        "Count": count4,
                        "Balance": parseFloat(col_bal4a).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Other(+)(non-cash)",
                        "Count": count5,
                        "Balance": parseFloat(col_bal5a).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Curtailments",
                        "Count": count6,
                        "Balance": parseFloat(col_bal6).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Liquidation",
                        "Count": count7,
                        "Balance": parseFloat(col_bal7).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Paid In Full",
                        "Count": count8,
                        "Balance": parseFloat(col_bal8).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Principal Payments",
                        "Count": count9,
                        "Balance": parseFloat(col_bal9).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Realized Losses",
                        "Count": count10,
                        "Balance": parseFloat(col_bal10).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [[str]]: "Repurchase",
                        "Count": count11,
                        "Balance": parseFloat(col_bal11).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Sale",
                        "Count": count12,
                        "Balance": parseFloat(col_bal12).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Other(-)",
                        "Count": count13,
                        "Balance": parseFloat(col_bal13).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Other(-)(non-cash)",
                        "Count": count14,
                        "Balance": parseFloat(col_bal14).toFixed(2)
                    }
                    collateral.push(json)
                    var json = {
                        [str]: "Ending Collateral Balance",
                        "Count": count15,
                        "Balance": parseFloat(col_bal15).toFixed(2)
                    }
                    collateral.push(json)


                    //Interest
                    var json = {
                        "Interest Collections": "Beginning Interest Balance",
                        "Balance": parseFloat(int_bal1).toFixed(2)
                    }
                    interest.push(json)

                    var json = {
                        "Interest Collections": "Interest",
                        "Balance": parseFloat(int_bal2).toFixed(2)
                    }
                    interest.push(json)
                    var json = {
                        "Interest Collections": "Fees",
                        "Balance": parseFloat(int_bal3).toFixed(2)
                    }
                    interest.push(json)

                    var json = {
                        "Interest Collections": "Payoff Interest",
                        "Balance": parseFloat(int_bal4).toFixed(2)
                    }
                    interest.push(json)

                    var json = {
                        "Interest Collections": "Payoff Fees",
                        "Balance": parseFloat(int_bal5).toFixed(2)
                    }
                    interest.push(json)

                    var json = {
                        "Interest Collections": "Other(+)",
                        "Balance": parseFloat(int_bal6).toFixed(2)
                    }
                    interest.push(json)

                    var json = {
                        "Interest Collections": "Servicing Fees",
                        "Balance": parseFloat(int_bal7).toFixed(2)
                    }
                    interest.push(json)

                    var json = {
                        "Interest Collections": "Payoff Servicing Fee",
                        "Balance": parseFloat(int_bal8).toFixed(2)
                    }
                    interest.push(json)
                    var json = {
                        "Interest Collections": "Other(-)",
                        "Balance": parseFloat(int_bal9).toFixed(2)
                    }
                    interest.push(json)
                    var json = {
                        "Interest Collections": "Ending Interest Balance",
                        "Balance": parseFloat(int_bal10).toFixed(2)
                    }
                    interest.push(json)


                    //principal
                    var json = {
                        "Principal Collections": "Beginning Principal Balance",
                        "Balance": parseFloat(prin_bal1).toFixed(2)
                    }
                    principal.push(json)
                    var json = {
                        "Principal Collections": "Curtailments",
                        "Balance": parseFloat(prin_bal2).toFixed(2)
                    }
                    principal.push(json)
                    var json = {
                        "Principal Collections": "Liquidation",
                        "Balance": parseFloat(prin_bal3).toFixed(2)
                    }
                    principal.push(json)
                    var json = {
                        "Principal Collections": "Paid In Full",
                        "Balance": parseFloat(prin_bal4).toFixed(2)
                    }
                    principal.push(json)
                    var json = {
                        "Principal Collections": "Principal Payments",
                        "Balance": parseFloat(prin_bal5).toFixed(2)
                    }
                    principal.push(json)
                    var json = {
                        "Principal Collections": "Repurchase",
                        "Balance": parseFloat(prin_bal7).toFixed(2)
                    }
                    principal.push(json)
                    var json = {
                        "Principal Collections": "Sale",
                        "Balance": parseFloat(prin_bal8).toFixed(2)
                    }
                    principal.push(json)
                    var json = {
                        "Principal Collections": "Other(+)",
                        "Balance": parseFloat(prin_bal9).toFixed(2)
                    }
                    principal.push(json)
                    var json = {
                        "Principal Collections": "Funded Amounts",
                        "Balance": parseFloat(prin_bal10).toFixed(2)
                    }
                    principal.push(json)
                    var json = {
                        "Principal Collections": "New Purchases",
                        "Balance": parseFloat(prin_bal11).toFixed(2)
                    }
                    principal.push(json)
                    var json = {
                        "Principal Collections": "Other(-)",
                        "Balance": parseFloat(prin_bal12).toFixed(2)
                    }
                    principal.push(json)
                    var json = {
                        "Principal Collections": "Ending Principal Balance",
                        "Balance": parseFloat(prin_bal13).toFixed(2)
                    }
                    principal.push(json)


                    //collections
                    var json = {
                        "Collections": "Interest Paid",
                        "Note(s)": "-",
                        "Balance": parseFloat(int_bal10).toFixed(2)
                    }
                    collections.push(json)
                    var json = {
                        "Collections": "Principal Paid",
                        "Note(s)": "-",
                        "Balance": parseFloat(prin_bal13).toFixed(2)
                    }
                    collections.push(json)
                    var json = {
                        "Collections": "Total",
                        "Note(s)": "Amount to transfer",
                        "Balance": parseFloat(total).toFixed(2)
                    }
                    collections.push(json)


                    setTimeout(function () {
                        aggregation.emit("mongosave");
                    }, 1000)
                })

                aggregation.on("mongosave", function () {

                    var summaryagg = {};
                    summaryagg = {
                        "collateral": collateral,
                        "interest": interest,
                        "principal": principal,
                        "collections": collections
                    }

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
                        winlog.info("Database----" + db);
                        var response = {
                            success: false,
                            result: "Data Already Exist"
                        }
                        db.collection('servicerdata').remove({ dealId: req.body.dealid, month: req.body.month, year: req.body.year }, function (err, result) {
                            if (err) {
                                var responseMessage = {
                                    "isSuccess": false,
                                    "statuscode": 500,
                                    "message": "Internal Server Error: Database connection failed."
                                };
                                winlog.error(JSON.stringify(responseMessage));
                                winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                                return res.status(500).send(responseMessage);
                            }                            winlog.info("resultttt" + JSON.stringify(result));
                            // winlog.info(result.result.n + " document(s) deleted");
                            winlog.info("length " + result.length)

                            winlog.info("collateral:  " + JSON.stringify(collateral) + "  " + collateral.length);
                            winlog.info("principal:  " + JSON.stringify(principal) + "  " + principal.length);
                            winlog.info("interest:  " + JSON.stringify(interest) + "  " + interest.length);
                            winlog.info("collections:  " + JSON.stringify(collections) + "  " + collections.length);

                            //saving it into mongodb starts
                            var dataId = uuidv4();
                            var updationdate = new Date();

                            var day2 = updationdate.getDate();
                            var month2 = updationdate.getMonth() + 1;
                            var year2 = updationdate.getFullYear();
                            var finalupdate = day2 + "-" + month2 + "-" + year2;


                            if (err) throw err

                            var savetodb = [{
                                dataId: dataId,
                                data: summaryagg,
                                updationDate: finalupdate,
                                month: req.body.month,
                                year: req.body.year,
                                dealId: req.body.dealid

                            }]


                            winlog.info('CONNECTED');
                            winlog.info("savetodb+++++++++" + JSON.stringify(savetodb));

                            winlog.info("Adding the new Data into DB......");
                            db.collection('servicerdata').insertMany(savetodb, (err, result) => {
                                // winlog.info(result);
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
                                bdbapi(bdbarr, summaryagg)
                                // winlog.info("Number of documents inserted: " + result.insertedCount);
                                // winlog.info('saved to database')

                            })

                            // bdb function
                            function bdbapi(arrayrr, summaryagg) {
                                winlog.info("inside latest bdb :::");
                                winlog.info("inside bdb arr :\n\n" + arrayrr.length + "    Data from bdb:::: \n" + JSON.stringify(arrayrr));
                                request.post({
                                    "headers": { "content-type": "application/json" },
                                    "url": "https://bdb.imtest.intainmarkets.us/api/v1/imarkets/pushdatatodb",
                                    "body": JSON.stringify(arrayrr)
                                })
                                client.close();
                                res.send({ "success": true, "data": summaryagg, "result": "Data Saved!" });
                            }//end of bdb fn

                            //}
                        });

                    })
                })

            }//end of aggregation
        }//end of renovation

    }, // end of create deal

    viewservicerdatadb: function (req, res) {

        var dealId = req.query.dealid;
        var month = req.query.month;
        var year = req.query.year;

        //check for the args
        if (!req.query.dealid || !req.query.month || !req.query.year || !req.query.confirmation) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            //query from mongo for the dealid,month,year
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
                winlog.info('CONNECTED');
                var movedToBlockchain = 0;
                var message = "Data already moved to blockchain"

                db.collection('servicerdata').find({ dealId: dealId, month: month, year: year }).toArray(function (err, result) {
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
                    winlog.info(result);
                    if (result.length > 0) {
                        client.close();
                        res.send({ "success": true, "data": result[0].data, "month": req.query.month, "year": req.query.year, "confirmation": req.query.confirmation })
                    }
                    else {
                        client.close();
                        winlog.info("No data found!")
                        res.sendStatus(204);
                    }
                })

            })
        }

    },

    saveservicerdata: function (req, res) {
        if (!req.body.dealid || !req.body.month || !req.body.year || !req.body.confirmation || !req.body.input) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            var event1 = new EventEmitter();
            if (String(req.body.confirmation).toLowerCase() == "yes") {
                res.send({ "success": false, "message": "already servicer data saved for this month/year" })
            }
            else {
                const contractAddress = SServicerData.address
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "ServicerData.sol");
                const contractname = "ServicerData";
                //const source = fs.readFileSync(contractPath, 'utf8');

                // const input = {language: 'Solidity',
                //     sources: {[contractname + ".sol"]: {content: source,},
                //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


                //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                const abi = SServicerData.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                winlog.info("\n savedata: " + JSON.stringify([uuidv4().toString(), req.body.dealid, req.body.month, req.body.year, JSON.stringify(req.body.input)]))
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the update function in ServicerData contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.saveServicerData([[uuidv4().toString(), req.body.dealid, req.body.month, req.body.year, JSON.stringify(req.body.input)]]).encodeABI();
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
                            res.send({
                                "success": false,
                                "message": "Data already exist"
                            })
                        } else {
                        setTimeout(() => {
                            event1.emit("getdateinfo")
                        }, 1000);
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
                }; increment();


                event1.on("getdateinfo", function () {

                    const contractAddress = SDate.address
                    const contractPath = path.join(process.cwd() + "/api/contracts/Date.sol");
                    winlog.info("contractpath:: " + contractPath);
                    const contractname = "Date"
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

                    //const bytecode = contractFile.evm.bytecode.object;
                    const abi = SDate.abi;

                    const incrementer = new web3.eth.Contract(abi, contractAddress);
                    let errcount = 0;
                    const get1 = async () => {
                        winlog.info(`Making a call to contract at address ${contractAddress}`);
                        try {
                            const data = await incrementer.methods
                                .getByDealId(req.body.dealid)
                                .call({ from: address });
                            winlog.info("data:: " + JSON.stringify(data));

                            if (data.length > 2) {
                                var response = { "result": JSON.stringify(data) }
                                var finalresponse = JSON.parse(response.result)
                                event1.emit("updatedateconfirmation", finalresponse)

                            }
                            else {
                                res.sendStatus(204);
                            }
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
                })

                event1.on("updatedateconfirmation", function (finalresponse) {

                    winlog.info("finalresponse: " + JSON.stringify(finalresponse))
                    const contractAddress = SDate.address
                    const contractPath = path.join(process.cwd(), '/api/contracts/' + "Date.sol");
                    const contractname = "Date";
                    //const source = fs.readFileSync(contractPath, 'utf8');
                    var c = -1

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
                    const abi = SDate.abi;
                    const incrementer = new web3.eth.Contract(abi, contractAddress);

                    var datedetails = [req.body.dealid, finalresponse[1], finalresponse[2], finalresponse[3], finalresponse[4], finalresponse[5], "Yes", finalresponse[7]]
                    winlog.info("datedetails upd: " + JSON.stringify(datedetails))
                    let errcount = 0;
                    const increment = async () => {
                        winlog.info(
                            `Calling the update function in deal onboarding contract at address ${contractAddress}`
                        );
                        try {
                            web3.eth.handleRevert = true
                            const encoded = incrementer.methods.updateDate(req.body.dealid, datedetails).encodeABI();
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
                                res.send({
                                    "success": false,
                                    "message": "ID Doesnot exist"
                                })
                            } else {
                            res.send({ "success": true, "message": "servicer data save success" })
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
                    }; increment();

                })

            }
        }
    }
}

module.exports = query;