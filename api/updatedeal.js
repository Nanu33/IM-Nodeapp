
const reader = require('xlsx')
const xlsxFile = require('read-excel-file/node');
const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const { EventEmitter } = require('stream');
const { UUID } = require('bson');
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const { v4: uuidv4 } = require('uuid');
const DateAndTime = require('date-and-time');
const { resolve } = require('dns');
var request = require('request');
const winlog = require("../log/winstonlog");
const SUser = require('./abi/User')
const SDealOnboarding = require('./abi/DealOnboarding')
const SDealTranche = require('./abi/DealTranche')
const SPaymentRules = require('./abi/PaymentRules')
const SAccountDetailsOffChain = require('./abi/AccountDetailsOffChain')
const SPoolDocument = require('./abi/PoolDocument')

const SFT = require('./abi/FT')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";

var Deal = {

    updateDeal: function (req, res) {
        var dealEvent = new EventEmitter();
        var file1 = path.resolve(__dirname + '/../uploads/' + req.file.filename);
        winlog.info("inside update deal::::::::::::" + req.body.dealid);
        var dealSummary = '';
        var assetclass = '';
        var closingdate = '';
        var status = '';
        var originalprinbal = '';
        var firstpaymentdate = '';
        var pmonth = '';
        var pyear = ''
        var paymentfrequency = '';
        var maturitydate = '';
        var trancheid = '';
        var finaldealarray;
        var tranchearr = [];
        var paymentarr = [];
        var IssuerID = ''
        var dealName = ''
        var bdbjson = {};
        xlsxFile(file1).then((rows) => {
            for (i = 0; i < rows.length; i++) {
                if (rows[i][0] == 'Deal Sumary') {
                    winlog.info("insdie deal sumary::::::::::::" + rows[i + 1][0]);
                    dealSummary = rows[i + 1][0];

                } else if (rows[i][0] == 'Basic Details') {
                    winlog.info("inside basic details::::::::::");
                    dealName = rows[i + 1][2]
                    assetclass = rows[i + 2][2];
                    status = rows[i + 5][2];
                    originalprinbal = String(rows[i + 6][2]);
                    paymentfrequency = String(rows[i + 8][2]);

                    //  closingdate = rows[i + 3][2];
                    //   maturitydate = rows[i + 4][2];
                    // firstpaymentdate = rows[i + 7][2];
                    winlog.info(`closing date ::: ${rows[i + 3][2]} maturity date :::: ${rows[i + 4][2]} firstpaymentdate:: ${rows[i + 7][2]}`);

                    var utc_days = Math.floor(rows[i + 3][2] - 25569);
                    var utc_value = utc_days * 86400;
                    var date_info = new Date(utc_value * 1000);
                    const value = DateAndTime.format(date_info, 'MM-DD-YYYY')
                    var cdate = DateAndTime.format(date_info, 'YYYY-MM-DD')
                    winlog.info("formatted closing date :: date_info  :: " + value);

                    var utc_days = Math.floor(rows[i + 4][2] - 25569);
                    var utc_value = utc_days * 86400;
                    var date_info = new Date(utc_value * 1000);
                    const value1 = DateAndTime.format(date_info, 'MM-DD-YYYY')
                    var mdate = DateAndTime.format(date_info, 'YYYY-MM-DD')
                    winlog.info("formatted maturity date :: date_info  :: " + value1);

                    var utc_days = Math.floor(rows[i + 7][2] - 25569);
                    var utc_value = utc_days * 86400;
                    var date_info = new Date(utc_value * 1000);
                    var value2 = DateAndTime.format(date_info, 'MM-DD-YYYY')
                    var fdate = DateAndTime.format(date_info, 'YYYY-MM-DD')
                    winlog.info("formatted first payment date :: date_info  :: " + value2);

                    closingdate = value;
                    maturitydate = value1;
                    firstpaymentdate = value2;
                    bdbjson['Deal Name'] = rows[i + 1][2]
                    bdbjson['DealID'] = req.body.dealid
                    bdbjson['Asset Category'] = rows[i + 2][2];
                    bdbjson['Closing Date'] = cdate
                    bdbjson['Maturity Date'] = mdate;
                    bdbjson['1st Payment Date'] = fdate;
                    bdbjson['Status'] = status;
                    bdbjson['Original Principal Balance'] = originalprinbal;
                    bdbjson['Payment Frequency'] = paymentfrequency;

                    winlog.info("assetclass:: " + assetclass + " closingdate:: " + closingdate + " maturity date:: " + maturitydate + " status:: " + status + " originalprinbal:: " + originalprinbal
                        + " firstpaymentdate:: " + firstpaymentdate + " paymentfrequency:: " + paymentfrequency + " deal name " + dealName);
                    winlog.info("BDB json ::::::" + JSON.stringify(bdbjson));

                    i = i + 8;


                } else if (rows[i][0] == 'Payment Rules') {
                    winlog.info("inside payment rules::::::::::::::: " + i);

                    while (rows[i + 1][0] != "Tranches") {
                        var uniqueID = uuidv4();
                        var pdate = value2.split("-")
                        if (pdate.length > 1) {
                            pmonth = pdate[0];
                            pyear = pdate[2];
                        }
                        paymentarr.push([uniqueID, req.body.dealid, req.body.underwriterid, rows[i + 1][0], "0", String(pmonth), String(pyear)]);
                        i++;
                    }
                    winlog.info(paymentarr);

                } else if (rows[i][0] == 'Tranches') {
                    // winlog.info(rows[i])
                    winlog.info('inside TRANCHE :::::::::::');
                    i = i + 2;
                    while (i < rows.length) {
                        const ShortUniqueId = require('short-unique-id');
                        const uid = new ShortUniqueId({ length: 4 });
                        var uniqueID = uid();

                        winlog.info("unique id: " + uniqueID)
                        if (trancheid != '') {
                            trancheid = trancheid + "#" + uniqueID;
                            winlog.info(trancheid)
                        }
                        else
                            trancheid = uniqueID;
                        // try{
                        if (rows[i][4])
                            winlog.info("invested amount:::::" + rows[i][4])
                        else {
                            winlog.info("invested amount::::: 0")

                            rows[i][4] = 0;
                        }
                        // }catch{
                        //     winlog.info("error")
                        //     rows[i][4] =0
                        // }
                        tranchearr.push([uniqueID, req.body.dealid, rows[i][0], String(rows[i][1]), String(rows[i][2]), String(rows[i][3]), String(rows[i][4]), "active", "", closingdate, "0", String(rows[i][2]), "pending"]);
                        // winlog.info(tranchearr)
                        i++;

                    }
                    winlog.info(tranchearr)
                    //savedealdeatils();
                    savepooldoc();
                }
            }
        });

        async function savedealdeatils() {
            var getdeal = await getdealbyid();
            winlog.info(getdeal)
            var updatedeal = await updatedeal1();
            winlog.info(updatedeal)
            var paymentrules = await savepaymentrules();
            winlog.info(paymentrules)
            var FT = await CreateFT();

        }
        function getdealbyid() {

            return new Promise((resolve, reject) => {
                //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
                const contractAddress = SDealOnboarding.address // deployed contract address( can be taken from remix or index.js)
                const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "DealOnboarding";

                const abi = SDealOnboarding.abi;

                const incrementer = new web3.eth.Contract(abi, contractAddress);
                let errcount = 0;
                const get1 = async () => {
                    winlog.info(`Making a call to deal onboarding contract at address ${contractAddress}`);
                    try {
                        const data = await incrementer.methods
                            .getDealByDealId(req.body.dealid)
                            .call({ from: address });
                        //  winlog.info("data:: " + JSON.stringify(data));
                        // winlog.info(`The current string is: ` + data);
                        // var response ={ "result":JSON.stringify(data)}
                        // winlog.info(response)
                        var response = { "result": JSON.stringify(data) };
                        var finalresponse = JSON.parse(response.result);
                        var key = ["uniqueID", "dealid", "dealname", "assetclass", "vaid",
                            "servicerid", "issuerid", "underwriterid", "originalbalance", "noofloans", "loanids",
                            "nooftranche", "trancheid", "createdate", "status", "closingdate", "maturityDate",
                            "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach", "payingagentid", "reviewstatus", "paymentmode", "commitORinvest"];

                        winlog.info(finalresponse);
                        IssuerID = finalresponse[6];
                        winlog.info("issuer id:::::::::: " + IssuerID)
                        finalresponse[2] = dealName
                        finalresponse[3] = assetclass;
                        finalresponse[8] = originalprinbal;
                        finalresponse[11] = String(trancheid.split("#").length);
                        finalresponse[12] = trancheid;
                        finalresponse[14] = status;
                        finalresponse[15] = closingdate;
                        finalresponse[16] = maturitydate;
                        finalresponse[17] = firstpaymentdate;
                        finalresponse[18] = paymentfrequency;
                        finalresponse[19] = dealSummary;

                        finaldealarray = finalresponse;
                        resolve("get deal success");
                        winlog.info("length:::::::::" + finalresponse[11]);
                        winlog.info("finaldeal array::::: " + JSON.stringify(finaldealarray));
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
            });
        }

        function updatedeal1() {
            return new Promise((resolve, reject) => {
                const contractAddress = SDealOnboarding.address; // deployed contract address( can be taken from remix or index.js)    
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
                const contractname = "DealOnboarding";
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
                ////const bytecode = contractFile.evm.bytecode.object;
                const abi = SDealOnboarding.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);
                //inputs
                // 1)uniqueID 2)dealId 3)dealName 4)assetclass 5)vaId 6)servicerId 7)issuerId
                // 8)underwriterId 9)originalbalance 10)numberofloans 11)loanIds 12)numberofTranches
                // 13)trancheIds 14)createdDate 15)status 16)colsingDate 17) maturityDate 18)firstPaymentDate 19) paymentFrequency

                winlog.info([finaldealarray])
                const encoded = incrementer.methods.updateDeal([finaldealarray]).encodeABI();
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the function in DealOnboarding contract at address ${contractAddress}`
                    );
                    try {
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
                            resolve("deal update success");
                        }
                    } catch (e) {
                        errcount++;
                        if (errcount <= 3) {
                            winlog.info("error occ" + e);
                            increment();
                        } else {
                            var r = { "message": e.message }
                            res.status(500).send(r);
                        }
                    }
                }; increment();
            });

        } // end 

        function createdealtranche() {
            return new Promise((resolve, reject) => {
                const contractAddress = SDealTranche.address// deployed contract address( can be taken from remix or index.js)    
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealTranche.sol");
                const contractname = "DealTranche";
                //const source = fs.readFileSync(contractPath, 'utf8');

                // const input = {language: 'Solidity',
                //     sources: {[contractname + ".sol"]: {content: source,},
                //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


                //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                //winlog.info(tempFile)
                //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                //winlog.info(contractFile)
                ////const bytecode = contractFile.evm.bytecode.object;
                const abi = SDealTranche.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);
                //inputs
                // 1)uniqueID 2)dealId 3)dealName 4)assetclass 5)vaId 6)servicerId 7)issuerId
                // 8)underwriterId 9)originalbalance 10)numberofloans 11)loanIds 12)numberofTranches
                // 13)trancheIds 14)createdDate 15)status 16)colsingDate 17) maturityDate 18)firstPaymentDate 19) paymentFrequency

                winlog.info(tranchearr)
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the i function in DealTranche contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.createTranche(tranchearr).encodeABI();
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
                        winlog.info("tranche save success and deal upload success::::::")
                        // res.send({ "success": true, "message": "Deal  upload success" });

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
                            resolve("tranche save success");
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
            });

        } // end 

        // winlog.info(" \n dealData:  " + JSON.stringify(dealData) + " \n trancheData: " + JSON.stringify(trancheData) +
        // " \n servicerData:    " + JSON.stringify(servicerdata) + " \n importantdetails:  " + JSON.stringify(importantdetails))

        function bdbapi() {
            winlog.info("portfolio chart view bdbarr: " + JSON.stringify(bdbjson))

            request.post({
                "headers": { "content-type": "application/json" },
                "url": "https://bdb.imtest.intainmarkets.us/api/v1/imarkets/pushdatatopreclosing",
                "body": JSON.stringify([bdbjson])
            })
        }

        function savepaymentrules() {
            return new Promise((resolve, reject) => {
                const contractAddress = SPaymentRules.address; // deployed contract address( can be taken from remix or index.js)    
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "PaymentRules.sol");
                const contractname = "PaymentRules";
                //const source = fs.readFileSync(contractPath, 'utf8');

                // const input = {language: 'Solidity',
                //     sources: {[contractname + ".sol"]: {content: source,},
                //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


                //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                //winlog.info(tempFile)
                //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                //winlog.info(contractFile)
                ////const bytecode = contractFile.evm.bytecode.object;
                const abi = SPaymentRules.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);
                //inputs
                // 1)uniqueID 2)dealId 3)dealName 4)assetclass 5)vaId 6)servicerId 7)issuerId
                // 8)underwriterId 9)originalbalance 10)numberofloans 11)loanIds 12)numberofTranches
                // 13)trancheIds 14)createdDate 15)status 16)colsingDate 17) maturityDate 18)firstPaymentDate 19) paymentFrequency

                winlog.info(paymentarr)
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the increment  function in PaymentRules contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.createPaymentRule(paymentarr).encodeABI();
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
                            resolve("payment save success");
                            bdbapi();
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
            });

        }// end 

        async function CreateFT() {
            winlog.info("Creating FT's :::::::::::::::::")
            var accountaddress = await getissueraccountaddress();
            for (var i = 0; i < tranchearr.length; i++) {
                winlog.info("tranche id:::::::: " + tranchearr[i])
                var deployFTaddress = await deployFTcontract(tranchearr[i]);
                tranchearr[i][8] = deployFTaddress;

                var c1 = Math.pow(10, 6)
                var finaltotalsupply = c1 * (tranchearr[i][4]);
                winlog.info("total supply ::::::::::" + finaltotalsupply)
                var transfertoken = await TransferTokens(deployFTaddress, accountaddress, finaltotalsupply);
                winlog.info("transfer token " + transfertoken)
                var transferowner = await TransferOwnerShip(deployFTaddress, accountaddress);
                winlog.info(transferowner);
            }
            if (i == tranchearr.length) {
                var savetranche = await createdealtranche();
                var Accounts = await GetAccountOffChainDetails();
            } else {
                res.send({ "success": false, "message": "Deal not uploaded successfully" });
            }
        }


        async function deployFTcontract(finaltranche) {

            return new Promise((resolve, reject) => {
                const bytecode = SFT.bytecode
                const abi = SFT.abi
                var c1 = Math.pow(10, 6)
                var finaltotalsupply = c1 * (finaltranche[4]);
                // const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
                let errcount = 0;
                const deploy = async () => {
                    winlog.info('Attempting to deploy from account:', address + " total supply::: " + (finaltranche[4]) + " name " + finaltranche[2]);
                    try {
                        const incrementer = new web3.eth.Contract(abi, address);

                        const incrementerTx = incrementer.deploy({
                            data: bytecode,
                            arguments: [finaltranche[0], finaltranche[0], BigInt(finaltotalsupply)],
                        })
                        const createTransaction = await web3.eth.accounts.signTransaction({
                            from: address,
                            data: incrementerTx.encodeABI(),
                            gas: 8000000,
                            chainId: "101122"
                        },
                            privKey
                        )
                        const createReceipt = new web3.eth.sendSignedTransaction(createTransaction.rawTransaction).then((res) => {
                            winlog.info('FT Contract deployed at address', res.contractAddress);

                            resolve(res.contractAddress);

                        });
                    } catch (e) {
                        errcount++;
                        if (errcount <= 3) {
                            winlog.info("error occ" + e);
                            deploy();
                        } else {
                            var r = { "message": e.message }
                            res.status(500).send(r);
                        }
                    }
                };

                deploy()

            });
        }

        async function getissueraccountaddress() {
            return new Promise((resolve, reject) => {
                //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
                const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "User"
                var contractAddress = SUser.address
                // const contractPath = path.join('/home/somiya/Documents/IntainMarkets/IM Node app/api/contracts/CreatePool.sol');
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
                const abi = SUser.abi;

                const incrementer = new web3.eth.Contract(abi, contractAddress);
                let errcount = 0;
                const get1 = async () => {
                    winlog.info(`Making a call to User contract at address ${contractAddress}`);
                    try {
                        const data = await incrementer.methods
                            .getUserById(IssuerID)
                            .call({ from: address });
                        //  winlog.info("data:: " + JSON.stringify(data));
                        // winlog.info(`The current string is: ` + data);
                        // var response ={ "result":JSON.stringify(data)}
                        // winlog.info(response)
                        var response = { "result": JSON.stringify(data) }
                        var finalresponse = JSON.parse(response.result)
                        winlog.info(finalresponse)
                        winlog.info("account address::::: " + finalresponse[4])
                        resolve(finalresponse[4])
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
            });
        }
        async function TransferTokens(deployedaddress, accountaddress, finaltotalsupply) {
            return new Promise((resolve, reject) => {
                const contractAddress = deployedaddress;// Contract Call
                winlog.info("\nownership details::: deployed address " + deployedaddress + " issuer id: " + accountaddress)
                const abi = SFT.abi
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                const encoded = incrementer.methods.transfer(accountaddress, BigInt(finaltotalsupply)).encodeABI();
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the function in FT contract at address ${contractAddress}`
                    );
                    try {
                        const createTransaction = await web3.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: contractAddress,
                                data: encoded,
                                gasLimit: 312896,
                                chainId: "101122"
                            },
                            privKey
                        ); const createReceipt = await web3.eth.sendSignedTransaction(
                            createTransaction.rawTransaction
                        );
                        winlog.info(`transfer owership successfull with hash: ${createReceipt.transactionHash} for the contractaddress ${contractAddress}\n`);
                        resolve("transfer token success")
                    } catch (e) {
                        errcount++;
                        if (errcount <= 3) {
                            winlog.info("error occ" + e);
                            increment();
                        } else {
                            var r = { "message": e.message }
                            res.status(500).send(r);
                        }
                    }
                }; increment();
            });

        }


        async function TransferOwnerShip(deployedaddress, accountaddress) {
            return new Promise((resolve, reject) => {
                const contractAddress = deployedaddress;// Contract Call
                winlog.info("\nownership details::: deployed address " + deployedaddress + " issuer id: " + accountaddress)
                const abi = SFT.abi
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                const encoded = incrementer.methods.transferOwnership(accountaddress).encodeABI();
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the function in FT contract at address ${contractAddress}`
                    );
                    try {
                        const createTransaction = await web3.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: contractAddress,
                                data: encoded,
                                gasLimit: 312896,
                                chainId: "101122"
                            },
                            privKey
                        ); const createReceipt = await web3.eth.sendSignedTransaction(
                            createTransaction.rawTransaction
                        );
                        winlog.info(`transfer owership successfull with hash: ${createReceipt.transactionHash} for the contractaddress ${contractAddress}\n`);
                        resolve("transfer owneship success")
                    } catch (e) {
                        errcount++;
                        if (errcount <= 3) {
                            winlog.info("error occ" + e);
                            increment();
                        } else {
                            var r = { "message": e.message }
                            res.status(500).send(r);
                        }
                    }
                }; increment();
            });

        }

        async function GetAccountOffChainDetails() {
            if (!req.body.dealid) {
                res.send({ token: -1 });
            } else {
                const contractAddress = SAccountDetailsOffChain.address
                const contractPath = path.join(process.cwd() + "/api/contracts/AccountDetailsOffChain.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "AccountDetailsOffChain";
                // const contractPath = path.join('/home/somiya/Documents/IntainMarkets/IM Node app/api/contracts/CreatePool.sol');
                //const source = fs.readFileSync(contractPath, 'utf8');

                // const input = {language: 'Solidity',
                //     sources: {[contractname + ".sol"]: {content: source,},
                //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


                //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                //winlog.info(tempFile)
                //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                //winlog.info(contractFile)
                //const bytecode = contractFile.evm.bytecode.object;
                const abi = SAccountDetailsOffChain.abi;

                const incrementer = new web3.eth.Contract(abi, contractAddress);
                var arr = {};
                const get1 = async () => {
                    winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
                    try {
                        const data = await incrementer.methods
                            .getAccountsByDealIdOffChain(req.body.dealid)
                            .call({ from: address });
                        //  winlog.info("data:: " + JSON.stringify(data));
                        // winlog.info(`The current string is: ` + data);
                        // var response ={ "result":JSON.stringify(data)}
                        var response = { "result": JSON.stringify(data) };
                        winlog.info(JSON.stringify(response))
                        var finalresponse = JSON.parse(response.result);
                        var key = ["uniqueid", "dealid", "accountname", "beginningbalance", "endingbalance", "month", "year", "date", "wirestatus", "bankdetails"]

                        if (finalresponse.length > 0) {
                            var arr = [];
                            for (var i = 0; i < finalresponse.length; ++i) {
                                finalresponse[i][5] = pmonth
                                finalresponse[i][6] = pyear
                                finalresponse[i][7] = firstpaymentdate
                            }
                            winlog.info(finalresponse)
                            UpdateccountDetailsOffchain(finalresponse);
                            // res.send(arr);
                        } else {
                            res.send([]);
                        }
                    } catch (e) {
                        winlog.info("Error Occured" + e)

                        var r = { "message": e.message }
                        res.status(500).send(r);
                    }
                };
                get1();
            }
        }
        async function UpdateccountDetailsOffchain(finalarray) {
            const contractAddress = SAccountDetailsOffChain.address
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "AccountDetailsOffChain.sol");
            const contractname = "AccountDetailsOffChain";
            //const source = fs.readFileSync(contractPath, 'utf8');

            // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)
            ////const bytecode = contractFile.evm.bytecode.object;
            const abi = SAccountDetailsOffChain.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);

            // prints date & time in YYYY-MM-DD format
            //  var currentdate = month + "-" + date + "-" + year;

            let errcount = 0;
            const increment = async () => {
                winlog.info(
                    `Calling the CreateUserTransaction function in  contract at address ${contractAddress}`
                );
                try {
                    web3.eth.handleRevert = true
                    const encoded = incrementer.methods.updateADetails(finalarray).encodeABI();
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
                    winlog.info(`save transaction successfull with hash: ${createReceipt.transactionHash}`);
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
                       // savepooldoc();
                        res.send({ "success": true, "message": "Deal  upload success" });
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

        }

        async function savepooldoc() {

            winlog.info("inside fetch pool details");
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
                db.collection('pool_document').find({ poolid: req.body.dealid }).toArray(function (err, result) {
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
                        winlog.info("pool data:::" + JSON.stringify(result))
                        winlog.info("hi");
                        winlog.info(result);
                        //getlmsdata(result,loanmap)
                        var finalpooldoc = []
                        for (var i = 0; i < result.length; i++) {
                            finalpooldoc.push([result[i].documentid, req.body.dealid, result[i].documentname, result[i].description, result[i].ipfshash, result[i].issuerId])

                        }
                        winlog.info("hi");
                        winlog.info(finalpooldoc);
                        winlog.info("hi");
                        savepooldoc(finalpooldoc)
                        winlog.info("done");
                    }else{
                        console.log("No pool doc")
                        savedealdeatils()
                    }
                    client.close();

                });
            })
            async function savepooldoc(pooldocuments) {

                return new Promise((resolve, reject) => {
                    const contractAddress = SPoolDocument.address;// Contract Call

                    // const contractPath = path.join(process.cwd(), '/api/contracts/' + "CreatePool.sol");
                    // const contractname = "CreatePool";
                    //const source = fs.readFileSync(contractPath, 'utf8');


                    const abi = SPoolDocument.abi;
                    const incrementer = new web3.eth.Contract(abi, contractAddress);


                    let errcount = 0;
                    const increment = async () => {
                        winlog.info(
                            `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
                        );
                        try {


                            web3.eth.handleRevert = true
                            winlog.info(pooldocuments);
                            const encoded = incrementer.methods.addDocuments(pooldocuments).encodeABI();

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
                                    winlog.info("lenght error2");
                                }
                            }
                            if (emittercount > 0) {
                                winlog.info(finaleventarr)
                                res.send({
                                    "success": false,
                                    "message": "Data already exist"
                                })
                            } else {
                                savedealdeatils();
                                //res.send({ "success": true, "message": "Deal  upload success" });
                                resolve("pool save success")
                                //   IPFS.addfile(req, res);
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
                });
            }

        }

    }
}
module.exports = Deal;