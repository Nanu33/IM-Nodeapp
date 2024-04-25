const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const days360 = require('days360');
const { v4: uuidv4 } = require('uuid');
const { resolve } = require('dns');
const { resetPassword } = require('./userSignUp');
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replace
// var url = "mongodb://127.0.0.1:27017/";
var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";
var request = require('request');
const winlog = require("../log/winstonlog");
const SUser = require('./abi/User')
const SMyInvestment = require('./abi/MyInvestment')
const SServicerData = require('./abi/ServicerData')
const SAccountDetailsOffChain = require('./abi/AccountDetailsOffChain')
const SUserBankAccountOffChain = require('./abi/UserBankAccountOffChain')
const STransactionDetailsOffchain = require('./abi/TransactionDetailsOffchain');
const { parse } = require('path');

var EventEmitter = require("events").EventEmitter;

var AccountOffChain = {

    AddAccountOffChain: function (req, res) {

        if (!req.body.dealid || !req.body.accountname || !req.body.AccountDetails) {
            res.send({ token: -1 });
        } else {
            var AddAccountEmitter = new EventEmitter();
            const contractAddress = SAccountDetailsOffChain.address;
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
            let errcount = 0;
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
                        AddAccountEmitter.emit('addaccountoffchain', finalresponse[0][5], finalresponse[0][6], finalresponse[0][7])
                        //AddAccountEmitter.emit('addaccountoffchain', "01", "2023", "01-26-2023")
                    } else {
                        AddAccountEmitter.emit('addaccountoffchain', "-", "-", "-")

                        //  AddAccountEmitter.emit('addaccountoffchain', "01","2023","01-26-2023")


                    }
                } catch (e) {
                    errcount++;
                    if (errcount <= 3) {
                        winlog.info("error occ 2" + e);
                        get1();
                    } else {
                        var r = { "message": e.message }
                        res.status(500).send(r);
                    }
                }
            };
            get1();
            AddAccountEmitter.on('addaccountoffchain', (month, year, date) => {
                const contractAddress = SAccountDetailsOffChain.address;
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "AccountDetailsOffChain.sol");
                const contractname = "AccountDetailsOffChain";

                const abi = SAccountDetailsOffChain.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);
                var wirestatus = "no"
                if (req.body.AccountDetails.beneficiaryName.toString().length > 1) {
                    wirestatus = "yes"
                }
                var json = [[uuidv4().toString(), req.body.dealid, req.body.accountname, "0", "0", month, year, date, wirestatus, JSON.stringify(req.body.AccountDetails)]]
                var finalarray = json;
                winlog.info(finalarray)
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the CreateUserTransaction function in  contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.SaveAccountDetailsOffchain(finalarray).encodeABI();
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
                        winlog.info(`add account successfull with hash: ${createReceipt.transactionHash}`);
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
                                "message": "Id already exist"
                            })
                        } else {
                            res.send({ "success": true, "message": "Add AccountOffChain success" });
                        }
                    } catch (e) {
                        errcount++;
                        if (e.reason && e.reason.includes("Caller is not an invoker")) {
                            winlog.info(e.reason)
                            res.status(500).send(e.reason);
                        }
                        else if (errcount <= 3) {
                            winlog.info("error occ 2" + e);
                            increment();
                        } else {
                            var r = { "message": e.message }
                            res.status(500).send(r);
                        }
                    }
                }; increment();
            })
        }
    },
    GetAccountOffChainDetails: function (req, res) {
        if (!req.query.dealid) {
            res.send({ token: -1 });
        } else {
            const contractAddress = SAccountDetailsOffChain.address;
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
                        .getAccountsByDealIdOffChain(req.query.dealid)
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
                            var json = {};
                            for (var j = 0; j < key.length; ++j) {
                                if (j == 3 || j == 4) {
                                    json[key[j]] = parseFloat(finalresponse[i][j]).toFixed(2)
                                } else {
                                    json[key[j]] = finalresponse[i][j];
                                }
                            }
                            arr.push(json);
                        }

                        res.send(arr);
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
    },

    UpdateAccountOffChain: function (req, res) {
        if (!req.body.uniqueid) {
            res.send({ token: -1 });
        } else {
            var UpdateAccountEmitter = new EventEmitter();
            const contractAddress = SAccountDetailsOffChain.address;
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
            let errcount = 0
            const get1 = async () => {
                winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getAccountsByuniqueidOffChain(req.body.uniqueid)
                        .call({ from: address });
                    //  winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    var response = { "result": JSON.stringify(data) };
                    winlog.info(JSON.stringify(response))
                    var finalresponse = JSON.parse(response.result);
                    var key = ["uniqueid", "dealid", "accountname", "beginningbalance", "endingbalance", "month", "year", "date", "wirestatus", "bankdetails"]

                    if (finalresponse.length > 0) {
                        if (req.body.AccountDetails.beneficiaryName.toString().length > 1) {
                            finalresponse[8] = "yes"
                        }
                        finalresponse[9] = JSON.stringify(req.body.AccountDetails)
                        finalresponse[2] = req.body.accountname
                        UpdateAccountEmitter.emit('updateaccountoffchain', finalresponse)

                    } else {
                        res.send({
                            "success": false,
                            "message": "ID Doesnot exit"
                        })
                    }
                } catch (e) {
                    errcount++;
                    if (errcount <= 3) {
                        winlog.info("error occ 2" + e);
                        get1();
                    } else {
                        var r = { "message": e.message }
                        res.status(500).send(r);
                    }
                }
            };
            get1();

            UpdateAccountEmitter.on('updateaccountoffchain', (finaljson) => {
                const contractAddress = SAccountDetailsOffChain.address;
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
                let ts = Date.now();

                winlog.info(finaljson)
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the CreateUserTransaction function in  contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateADetails([finaljson]).encodeABI();
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
                            res.send({ "success": true, "message": "AccountOffchain update success" });
                        }
                    } catch (e) {
                        errcount++;
                        if (e.reason && e.reason.includes("Caller is not an invoker")) {
                            winlog.info(e.reason)
                            res.status(500).send(e.reason);
                        }
                        else if (errcount <= 3) {
                            winlog.info("error occ 2" + e);
                            increment();
                        } else {
                            var r = { "message": e.message }
                            res.status(500).send(r);
                        }
                    }
                }; increment();
            })
        }
    },

    GetInvestorOffChainWireDetails: function (req, res) {
        if (!req.query.dealid) {
            res.send({ token: -1 });
        } else {
            const contractAddress = SAccountDetailsOffChain.address;
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
                        .getAccountsByDealIdAccountNameOffChain(req.query.dealid, "Closing")
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
                            var json = {};
                            for (var j = 0; j < key.length; ++j) {
                                json[key[j]] = finalresponse[i][j];
                            }
                            arr.push(json);
                        }
                        res.send(arr);
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
    },
    GetServicerOffChainWireDetails: function (req, res) {
        if (!req.query.dealid) {
            res.send({ token: -1 });
        } else {
            const servicerdataEmitter = new EventEmitter();
            const contractAddress = SAccountDetailsOffChain.address;
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
                        .getAccountDetailsOffChainByDealIdAndAccountnameArray(["Interest Remittance", "Principal Remittance"], req.query.dealid)
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
                            var json = {};
                            for (var j = 0; j < key.length; ++j) {
                                json[key[j]] = finalresponse[i][j];
                            }
                            arr.push(json);
                        }
                        winlog.info(arr)
                        servicerdataEmitter.emit('getservicerdata', arr)
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

            servicerdataEmitter.on('getservicerdata', function (finalarr) {

                const contractAddress = SServicerData.address
                const contractPath = path.join(process.cwd() + "/api/contracts/ServicerData.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "ServicerData"
                //const source = fs.readFileSync(contractPath, 'utf8');

                // const input = {language: 'Solidity',
                //     sources: {[contractname + ".sol"]: {content: source,},
                //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


                //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                //winlog.info(tempFile)
                //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

                //const bytecode = contractFile.evm.bytecode.object;
                const abi = SServicerData.abi;

                const incrementer = new web3.eth.Contract(abi, contractAddress);
                let errcount = 0;
                const get1 = async () => {
                    winlog.info(`Making a call to contract at address ${contractAddress}`);
                    try {
                        const data = await incrementer.methods
                            .getServicerDataByDealIdMonthAndYear(req.query.dealid, req.query.month, req.query.year)
                            .call({ from: address });

                        if (data.length > 0) {
                            var response = { "result": JSON.stringify(data) }
                            var finalresponse = JSON.parse(response.result)
                            winlog.info("\n Servicer data:: " + JSON.stringify(JSON.parse(finalresponse[0][4])));
                            // winlog.info("collections data:: " + JSON.stringify(JSON.parse(finalresponse[0][4]).collections));
                            servicerdata = JSON.parse(finalresponse[0][4])

                            var col = servicerdata.collections;
                            winlog.info(col[0].Balance)
                            finalarr[0]["amount"] = col[0].Balance
                            finalarr[1]["amount"] = col[1].Balance
                            // poolcollections = {
                            //     "InterestCollected": col[0].Balance,
                            //     "PrincipalCollected": col[1].Balance,
                            //     "TotalCollections": col[2].Balance
                            // }

                            Servicerfinal = [{
                                "To": "Interest Remittance",
                                "Amount": col[0].Balance,
                                "bankdetails": finalarr[1]["bankdetails"]
                            }, {
                                "To": "Principal Remittance",
                                "Amount": col[1].Balance,
                                "bankdetails": finalarr[0]["bankdetails"]
                            }
                            ]

                            res.send(Servicerfinal)
                        }
                        else {
                            res.send([])
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
                }; get1();
            });
        }
    },

    GetPayingAgentOffChainWireDetails:  function (req, res) {
        return new Promise((resolve, reject) => {

        var UserNameEmitter = new EventEmitter();
        const contractAddress = SMyInvestment.address;// Contract Call
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "MyInvestment.sol");
        const contractname = "MyInvestment";
        //const source = fs.readFileSync(contractPath, 'utf8');
        var useridarr = []
        var finaljson = []

        var month = "";
        var year = "";
        // const input = {language: 'Solidity',
        //     sources: {[contractname + ".sol"]: {content: source,},
        //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};



        //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
        //winlog.info(tempFile)
        //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        //winlog.info(contractFile)
        ////const bytecode = contractFile.evm.bytecode.object;
        const abi = SMyInvestment.abi;
        const incrementer = new web3.eth.Contract(abi, contractAddress);

        const getDeal = async () => {
            winlog.info(`Making a call to MyInvestment contract at address ${contractAddress}`);
            try {
                const data = await incrementer.methods
                    .getTrancheByDealIdMonthAndYear(req.query.dealid, req.query.month, req.query.year)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    for (var i = 0; i < finalresponse.length; i++) {
                        var json = {
                            'trancheid': finalresponse[i][5],
                            'tranchename': finalresponse[i][6],
                            'investorid': finalresponse[i][4],
                            'totalpaid': parseFloat(finalresponse[i][11]).toFixed(2),
                        }
                        finaljson.push(json);
                        if (!useridarr.includes[finalresponse[i][4]]) {
                            useridarr.push(finalresponse[i][4])
                        }
                    }
                    winlog.info(finaljson)
                    UserNameEmitter.emit('getusernames')
                    //  res.send(finaljson)
                } else {
                    res.send([])
                }
            } catch (e) {
                winlog.info("Error Occured" + e)

                var r = { "message": e.message }
                res.status(500).send(r);
            }
        }; getDeal();

        UserNameEmitter.on('getusernames', () => {
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
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getAllUsers()
                        .call({ from: address });
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    winlog.info(finalresponse);
                    winlog.info(finaljson)
                    for (var i = 0; i < finaljson.length; i++) {
                        for (var j = 0; j < finalresponse.length; j++) {
                            winlog.info(finaljson[i]['investorid'] + " " + finalresponse[j][0])
                            if (finaljson[i]['investorid'] == finalresponse[j][0]) {
                                finaljson[i]['investorname'] = finalresponse[j][6]
                                break;
                            }
                        }
                    }
                    winlog.info(finaljson)
                    UserNameEmitter.emit('getbankdetailsoffchain');
                    //  res.send(finaljson)
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            }; get1();

        })

        UserNameEmitter.on('getbankdetailsoffchain', () => {

            winlog.info("in::::::::::")
            const contractAddress = SUserBankAccountOffChain.address;

            const contractPath = path.join(process.cwd() + "/api/contracts/UserBankAccountOffChain.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "UserBankAccountOffChain";
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
            const abi = SUserBankAccountOffChain.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            var arr = {};
            const get1 = async () => {
                winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getBankDetailsByUserIdOffChainArr(useridarr)
                        .call({ from: address });
                    //  winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    var response = { "result": JSON.stringify(data) };
                    winlog.info(data)
                    var finalresponse = JSON.parse(response.result);
                    var key = ["userid", "paymenttype", "accountdetails"];

                    if (finalresponse.length > 0) {
                        var arr = [];
                        for (var i = 0; i < finaljson.length; ++i) {
                            var json = {};
                            for (var j = 0; j < finalresponse.length; j++) {
                                winlog.info(finaljson[i]['investorid'] + " " + finalresponse[j][0])
                                if (finaljson[i]['investorid'] == finalresponse[j][0]) {
                                    finaljson[i]['bankdetails'] = finalresponse[j][2]
                                    break;
                                }
                            }
                        }
                        resolve(finaljson)
                       // res.send(finaljson);
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

        })
    })
    },
    DeleteAccountOffChain: function (req, res) {
        if (!req.body.uniqueid) {
            res.send({ token: -1 });
        } else {
            var UpdateAccountEmitter = new EventEmitter();
            const contractAddress = SAccountDetailsOffChain.address;
            const contractPath = path.join(process.cwd() + "/api/contracts/AccountDetailsOffChain.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "AccountDetailsOffChain";

            const abi = SAccountDetailsOffChain.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            var arr = {};
            let errcount = 0
            const get1 = async () => {
                winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getAccountsByuniqueidOffChain(req.body.uniqueid)
                        .call({ from: address });
                    //  winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    var response = { "result": JSON.stringify(data) };
                    winlog.info(JSON.stringify(response))
                    var finalresponse = JSON.parse(response.result);
                    var key = ["uniqueid", "dealid", "accountname", "beginningbalance", "endingbalance", "month", "year", "date", "wirestatus", "bankdetails"]

                    if (finalresponse.length > 0) {

                        finalresponse[1] = "-"
                        UpdateAccountEmitter.emit('updateaccountoffchain', finalresponse)

                    } else {
                        res.send({
                            "success": false,
                            "message": "ID Doesnot exit"
                        })
                    }
                } catch (e) {
                    errcount++;
                    if (errcount <= 3) {
                        winlog.info("error occ 2" + e);
                        get1();
                    } else {
                        var r = { "message": e.message }
                        res.status(500).send(r);
                    }
                }
            };
            get1();

            UpdateAccountEmitter.on('updateaccountoffchain', (finaljson) => {
                const contractAddress = SAccountDetailsOffChain.address;
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
                let ts = Date.now();

                winlog.info(finaljson)
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the CreateUserTransaction function in  contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateADetails([finaljson]).encodeABI();
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
                            res.send({ "success": true, "message": "AccountOffchain update success" });
                        }
                    } catch (e) {
                        errcount++;
                        if (e.reason && e.reason.includes("Caller is not an invoker")) {
                            winlog.info(e.reason)
                            res.status(500).send(e.reason);
                        }
                        else if (errcount <= 3) {
                            winlog.info("error occ 2" + e);
                            increment();
                        } else {
                            var r = { "message": e.message }
                            res.status(500).send(r);
                        }
                    }
                }; increment();
            })
        }
    },
    IncludePendingTransaction: function (req, res) {
        var TransactionEmitter = new EventEmitter();
        const contractAddress = STransactionDetailsOffchain.address;
        const contractPath = path.join(process.cwd() + "/api/contracts/TransactionDetailsOffchain.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "TransactionDetailsOffchain";

        const abi = STransactionDetailsOffchain.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        const get1 = async () => {
            winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
            try {
                const data = await incrementer.methods
                    .getTransactionByDealIdOffChain(req.query.dealid)
                    .call({ from: address });

                var response = { "result": JSON.stringify(data) };
                winlog.info(JSON.stringify(response))
                var finalresponse = JSON.parse(response.result);
                var key = ["uniqueid", "dealid", "paymenttype", "account", "description", "date", "amount", "status", "senderid"]

                var arr = {};
                if (finalresponse.length > 0) {

                    for (var i = 0; i < finalresponse.length; ++i) {
                        if(finalresponse[i][7]=="Pending"){
                        if (arr.hasOwnProperty(finalresponse[i][3])) {
                            if (finalresponse[i][2] == 'Payments' || finalresponse[i][2] == 'Outgoing') {
                                arr[finalresponse[i][3]] = parseFloat(arr[finalresponse[i][3]]) - parseFloat(finalresponse[i][6])

                            } else {
                                arr[finalresponse[i][3]] = parseFloat(arr[finalresponse[i][3]]) + parseFloat(finalresponse[i][6])
                            }
                        } else {
                            if (finalresponse[i][2] == 'Payments' || finalresponse[i][2] == 'Outgoing') {
                            arr[finalresponse[i][3]] = parseFloat(-finalresponse[i][6])
                            }else{
                                arr[finalresponse[i][3]] = parseFloat(finalresponse[i][6])

                            }
                        }
                    }
                    }
                    winlog.info(arr)
                    TransactionEmitter.emit('getendingbalance', arr)
                } else {
                    winlog.info(arr)
                    TransactionEmitter.emit('getendingbalance', arr)
                }
            } catch (e) {
                winlog.info("Error Occured" + e)

                var r = { "message": e.message }
                res.status(500).send(r);
            }
        };
        get1();
        TransactionEmitter.on('getendingbalance', (includearr) => {
            const contractAddress = SAccountDetailsOffChain.address;
            const contractPath = path.join(process.cwd() + "/api/contracts/AccountDetailsOffChain.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "AccountDetailsOffChain";
            const abi = SAccountDetailsOffChain.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            var arr = {};
            const get1 = async () => {
                winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getAccountsByDealIdOffChain(req.query.dealid)
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
                            var json = {};
                            for (var j = 0; j < key.length; ++j) {
                                if (j == 3 || j == 4) {
                                    if(j==4 && includearr.hasOwnProperty(finalresponse[i][2])){
                                        winlog.info("inside if : ::"+finalresponse[i][2])
                                        json[key[j]] = (parseFloat(includearr[finalresponse[i][2]])+parseFloat(finalresponse[i][j])).toFixed(2)
                                    }else{
                                    json[key[j]] = parseFloat(finalresponse[i][j]).toFixed(2)
                                    }
                                } else {
                                    json[key[j]] = finalresponse[i][j];
                                }
                            }
                            arr.push(json);
                        }

                        res.send(arr);
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
        })
    }
}

module.exports = AccountOffChain;