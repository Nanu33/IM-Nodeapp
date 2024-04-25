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
const user = require('./useraccounts');
const ipfsAPI = require('ipfs-api');

const winlog = require("../log/winstonlog");
const SUser = require('./abi/User')
const SDealTranche = require('./abi/DealTranche')
const SInvestmentAndCommit = require('./abi/InvestmentAndCommit')
const SPaymentSettings = require('./abi/PaymentSettings')
const SUserBankAccount = require('./abi/UserBankAccount')

const ipfs = ipfsAPI('20.237.185.191', '9095', { protocol: 'http' });
var PaymentSetting = {
    AddDetails: function (req, res) {
        winlog.info("in")
        var bankEmitter = new EventEmitter();
        var UserEmitter = new EventEmitter();
        var VanEmitter = new EventEmitter();
        var uniqueid = uuidv4().toString();
        var ID = "";
        var VAN = "";
        var circleid = "";
        var circleresponse = "";
        var postData = req.body.AccountDetails;
        req.body.AccountDetails.idempotencyKey = uniqueid;
        winlog.info(postData)
        var url = "https://api-sandbox.circle.com/v1/banks/wires"
        request.post({
            uri: url,
            headers: {
                'content-type': 'application/json',
                'authorization': "Bearer QVBJX0tFWTo5M2ZhNjRlMTQ3NWM3ZWQyODgwMGM1MDI0YWQwMzgwNTowM2I1ODA3MzA3Y2I4OTlmNmY0NDBkZjQ3ZjQxZTAwNg=="

            },
            body: JSON.stringify(postData)
        },
            function (error, response, body) {

                if (!error && response.statusCode == 200) {
                    winlog.info("bank details saved in circle successfully")
                    response = JSON.parse(body);
                    ID = response.data.id
                    winlog.info("ID::::::::::::::" + ID)
                    winlog.info(response)
                    circleresponse = JSON.stringify(response)

                    VanEmitter.emit('getVan');
                    // bankEmitter.emit('savepaymentsettings')
                } else {
                    winlog.info(response)
                    res.send({
                        "success": false,
                        "message": "Failed to Save Payment Settings"
                    })
                }
            })


        VanEmitter.on('getVan', function () {

            request.get({
                uri: 'https://api-sandbox.circle.com/v1/banks/wires/' + ID + '/instructions',
                headers: {
                    'content-type': 'application/json',
                    'authorization': "Bearer QVBJX0tFWTo5M2ZhNjRlMTQ3NWM3ZWQyODgwMGM1MDI0YWQwMzgwNTowM2I1ODA3MzA3Y2I4OTlmNmY0NDBkZjQ3ZjQxZTAwNg=="
                }
                // body:require('querystring').stringify(getData)
            },
                function (error, response, body) {

                    if (!error && response.statusCode == 200) {
                        response = JSON.parse(body);
                        VAN = response.data.beneficiaryBank.accountNumber;
                        winlog.info("VAN : " + VAN);
                        bankEmitter.emit('savepaymentsettings')

                    } else {
                        winlog.info(response.statusCode + response.body);
                        res.send({
                            "success": false,
                            "message": "Failed to Save Payment Settings"
                        })

                    }
                });

        });
        bankEmitter.on('savepaymentsettings', () => {
            const contractAddress = SPaymentSettings.address
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "PaymentSettings.sol");
            const contractname = "PaymentSettings";
            //const source = fs.readFileSync(contractPath, 'utf8');

                        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)
            ////const bytecode = contractFile.evm.bytecode.object;
            const abi = SPaymentSettings.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);
            var finalarray = [[req.body.userid, req.body.PayInsViaCircle, req.body.userWalletAdd, req.body.subnetWalletAdd, req.body.PayoutsViaCircle, req.body.PayInPaymentType, req.body.PayOutPaymentType]];
            winlog.info(finalarray)
            let errcount = 0;
            const increment = async () => {
                winlog.info(
                    `Calling the save payment setting function in  contract at address ${contractAddress}`
                );
                try {
                    web3.eth.handleRevert = true
                    const encoded = incrementer.methods.savePaymentSettings(finalarray).encodeABI();
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
                    bankEmitter.emit('savebankaccount')
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

        bankEmitter.on('savebankaccount', () => {

            const contractAddress = SUserBankAccount.address
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "UserBankAccount.sol");
            const contractname = "UserBankAccount";
            //const source = fs.readFileSync(contractPath, 'utf8');

                        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)
            ////const bytecode = contractFile.evm.bytecode.object;
            const abi = SUserBankAccount.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);
            var finalarray = [[req.body.userid, JSON.stringify(req.body.AccountDetails), ID, VAN]];
            winlog.info(finalarray)
            let errcount = 0;
            const increment = async () => {
                winlog.info(
                    `Calling the CreateUserBankAccount function in payment settings contract at address ${contractAddress}`
                );
                try {
                    web3.eth.handleRevert = true
                    const encoded = incrementer.methods.createUserBankAccount(finalarray).encodeABI();
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
                    UserEmitter.emit('getuserdetails')
                    }
                    // res.send({
                    //     "success": true,
                    //     "message": "Payment Setting Save Success"
                    // })
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

        UserEmitter.on('getuserdetails', () => {

            var UserID = req.body.userid;
            const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)
            const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "User";
          
            const abi = SUser.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            let errcount = 0;
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getUserById(UserID)
                        .call({ from: address });
                    winlog.info(`The current string is: ${data}`);
                    winlog.info("data:: " + JSON.stringify(data));

                    var arr1 = JSON.parse(JSON.stringify(data));
                    winlog.info(arr1)
                    var resData = [];
                    //for (var i = 0; i < arr1.length; i++) {
                    // var resp = arr1[i].split("#");
                    winlog.info(arr1.length);
                    if (arr1.length > 0) {

                        var c = {
                            "UserId": arr1[0],
                            "EmailAddress": arr1[1],
                            "UserHash": arr1[2],
                            "UserSatus": arr1[3],
                            "UserAccAddress": arr1[4],
                            "UserRole": arr1[5],
                            "UserName": arr1[6]

                        };

                        winlog.info("user details before account save:: " + JSON.stringify(c));
                        arr1[4] = req.body.userWalletAdd
                        ipfs.files.get(arr1[2], function (err, files) {
                            files.forEach((file) => {
                                winlog.info(file.path)
                                winlog.info(file.content.toString('utf8'))
                                var ipfsData = JSON.parse(file.content.toString('utf8'));
                                winlog.info(ipfsData);
                                ipfsData.UserAccAddress = req.body.userWalletAdd
                                winlog.info("Final json with address to IPFS" + JSON.stringify(ipfsData))
                                UserEmitter.emit('updateUserIPFS', ipfsData, arr1)
                            })
                        })

                    } // end of if 
                    else {
                        var r = { "message": "user id not found" }
                        res.status(204).send(r);
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

        UserEmitter.on('updateUserIPFS', (ipfsData, BCdata) => {
            let testFile = JSON.stringify(ipfsData)
            //Creating buffer for ipfs function to add file to the system
            let testBuffer = new Buffer(testFile);

            winlog.info(testBuffer + ":::");
            ipfs.files.add(testBuffer, function (err, file) {
                if (err) {
                    winlog.info(err);
                }
                winlog.info(file)
                BCdata[2] = file[0].hash
                UserEmitter.emit('updateUserBC', BCdata);
            })
        })


        UserEmitter.on('updateUserBC', (Bcdata) => {
            const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");
            //const source = fs.readFileSync(contractPath, 'utf8');
            // const input = {
            //     language: 'Solidity',
            //     sources: {
            //         'User.sol': {
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
            const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)
            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //  const contractFile = tempFile.contracts["User.sol"]["User"];
            //winlog.info(contractFile)
            const abi = SUser.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            //passing array of string value
            const encoded = incrementer.methods.updateUser(Bcdata).encodeABI(); // update is a function which accepts string array
            let errcount = 0;
            const increment = async () => {
                winlog.info(
                    `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
                );
                try {
                    web3.eth.handleRevert = true
                    const createTransaction = await web3.eth.accounts.signTransaction(
                        {
                            from: address,
                            to: contractAddress,
                            data: encoded,
                            gasLimit: 1883750,
                            chainId: "101122"
                        },
                        privKey
                    ); const createReceipt = await web3.eth.sendSignedTransaction(
                        createTransaction.rawTransaction
                    );
                    winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                    // winlog.info(createReceipt);
                    var r = { "success": true, "message": "User Update and Payment Setting Save Success" }
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
                    res.send(r);
                    }
                } catch (e) {
                    errcount++;
                    if (e.reason && e.reason.includes("Caller is not an invoker")) {
                        winlog.info(e.reason)
                        res.status(500).send(e.reason);
                    }
                    else if (errcount <= 3) {
                        winlog.info("error occ" + e); increment();
                    } else {
                        var r = { "message": e.message }
                        res.status(500).send(r);
                    }
                }
            }; increment();

        })
    },
    GetWireTransferDetails: function (req, res) {
        var WireEmitter = new EventEmitter();
        const contractAddress = SInvestmentAndCommit.address;

        const contractPath = path.join(process.cwd() + "/api/contracts/InvestmentAndCommit.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "InvestmentAndCommit";
        //const source = fs.readFileSync(contractPath, 'utf8');

        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};



        //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
        //winlog.info(tempFile)
        //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        //winlog.info(contractFile)
        //const bytecode = contractFile.evm.bytecode.object;
        const abi = SInvestmentAndCommit.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        const get1 = async () => {
            winlog.info(`Making a call to InvestmentAndCommit contract at address ${contractAddress}`);
            try {
                const data = await incrementer.methods
                    .getTrancheDetailsByTrancheIdAndInvestorId(req.query.trancheid, req.query.investorid)
                    .call({ from: address });

                var response = { "result": JSON.stringify(data) };
                winlog.info(response)
                var finalresponse = JSON.parse(response.result);
                var key = ["uniqueid", "dealid", "tranchename", "trancheid", "investorid", "commitamount", "investamount"]
                if (finalresponse.length > 0) {
                    WireEmitter.emit('gettrackingref', finalresponse[3], finalresponse[5])
                    // res.send({
                    //     "trancheid": finalresponse[0],
                    //     "currentcommitments": finalresponse[5]

                    // })
                } else {
                    res.send({});
                }
            } catch (e) {
                winlog.info("Error Occured" + e)

                var r = { "message": e.message }
                res.status(500).send(r);
            }
        };
        get1();
        WireEmitter.on('gettrackingref', (trancheid, commitamount) => {

            const contractAddress = SUserBankAccount.address

            const contractPath = path.join(process.cwd() + "/api/contracts/UserBankAccount.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "UserBankAccount";
            //const source = fs.readFileSync(contractPath, 'utf8');

                        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)
            //const bytecode = contractFile.evm.bytecode.object;
            const abi = SUserBankAccount.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to UserBankAccount at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getBankDetailsByUserId(req.query.investorid)
                        .call({ from: address });

                    var response = { "result": JSON.stringify(data) };
                    winlog.info(response)
                    var finalresponse = JSON.parse(response.result);
                    var key = ["userid", "AccountDetails", "CircleTrackingId", "VAN"]
                    if (finalresponse.length > 0) {
                        var json = {
                            "trancheid": trancheid,
                            "TrackingRef": finalresponse[2],
                            "Commitments": commitamount,
                            "VAN": finalresponse[3]
                        }
                        WireEmitter.emit('getinvestorchainadress', json);
                        // res.send({
                        //     "trancheid": trancheid,
                        //     "Commitments": commitamount,
                        //     "TrackingRef": finalresponse[2]
                        // })
                    } else {
                        var json = {
                            "trancheid": trancheid,
                            "TrackingRef": "",
                            "Commitments": commitamount,
                            "VAN": ""
                        }
                        WireEmitter.emit('getinvestorchainadress', json);

                    }
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            };
            get1();

        })

        WireEmitter.on('getinvestorchainadress', (json) => {
            const contractAddress = SPaymentSettings.address

            const contractPath = path.join(process.cwd() + "/api/contracts/PaymentSettings.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "PaymentSettings";
            //const source = fs.readFileSync(contractPath, 'utf8');

                        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)
            //const bytecode = contractFile.evm.bytecode.object;
            const abi = SPaymentSettings.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to InvestmentAndCommit contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getPaymentByUserId(req.query.investorid)
                        .call({ from: address });

                    var response = { "result": JSON.stringify(data) };
                    winlog.info(response)
                    var finalresponse = JSON.parse(response.result);
                    var key = ["userid", "PayInsViaCircle", "userWalletAdd", "subnetWalletAdd", "PayoutsViaCircle", "PayInPaymentType", "PayOutPaymentType"]
                    if (finalresponse.length > 0) {
                        json.InvestorCchainAddress = finalresponse[2]
                        json.SubnetCchainAddress = finalresponse[3]
                        WireEmitter.emit('getissuerCchainaddress', (json))
                        // res.send(json)
                    } else {
                        json.InvestorCchainAddress = ""
                        json.SubnetCchainAddress = ""
                        WireEmitter.emit('getissuerCchainaddress', (json))

                        // res.send(json);
                    }
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            };
            get1();
        })

        WireEmitter.on('getissuerCchainaddress', (json) => {
            const contractAddress = SUser.address;

            const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "User";
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
                winlog.info(`Making a call to InvestmentAndCommit contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getUserById(req.query.issuerid)
                        .call({ from: address });

                    var response = { "result": JSON.stringify(data) };
                    winlog.info(response)
                    var finalresponse = JSON.parse(response.result);
                    if (finalresponse.length > 0) {
                        json.IssuerCchainAddress = finalresponse[4]
                        WireEmitter.emit('gettranchetokenaddress', json)
                    } else {
                        json.IssuerCchainAddress = "";
                        WireEmitter.emit('gettranchetokenaddress', json)
                    }
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            };

            get1();
        })

        WireEmitter.on('gettranchetokenaddress', (json) => {

            const contractAddress = SDealTranche.address

            const contractPath = path.join(process.cwd() + "/api/contracts/DealTranche.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "DealTranche";
            //const source = fs.readFileSync(contractPath, 'utf8');

                        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)
            //const bytecode = contractFile.evm.bytecode.object;
            const abi = SDealTranche.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to Deal Tranche at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getTrancheByTrancheId(req.query.trancheid)
                        .call({ from: address });

                    var response = { "result": JSON.stringify(data) };
                    winlog.info(response)
                    var finalresponse = JSON.parse(response.result);
                    var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "closingdate", "currentcommitments", "availablecommitments"];
                    winlog.info(finalresponse[8])
                    if (finalresponse.length > 0) {

                        json.tokendeployedaddress = finalresponse[8]
                        res.send(json)

                    } else {
                        json.tokendeployedaddress = ""
                        res.send(json)

                    }
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            };
            get1();

        })
    },

    transferUSDC: function (req, res) {
        winlog.info("in")
        var uniqueid = uuidv4().toString();

        var USDCMintEmitter = new EventEmitter();
        const contractAddress = SInvestmentAndCommit.address;

        const contractPath = path.join(process.cwd() + "/api/contracts/InvestmentAndCommit.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "InvestmentAndCommit";
        //const source = fs.readFileSync(contractPath, 'utf8');

        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};



        //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
        //winlog.info(tempFile)
        //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        //winlog.info(contractFile)
        //const bytecode = contractFile.evm.bytecode.object;
        const abi = SInvestmentAndCommit.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        let errcount = 0;
        const get1 = async () => {
            winlog.info(`Making a call to InvestmentAndCommit contract at address ${contractAddress}`);
            try {
                const data = await incrementer.methods
                    .getTrancheDetailsByTrancheIdAndInvestorId(req.body.trancheid, req.body.investorid)
                    .call({ from: address });

                var response = { "result": JSON.stringify(data) };
                winlog.info(response)
                var finalresponse = JSON.parse(response.result);
                var key = ["uniqueid", "dealid", "tranchename", "trancheid", "investorid", "commitamount", "investamount"]
                if (finalresponse.length > 0) {
                    USDCMintEmitter.emit('getinvestorchainadress', finalresponse[5])
                    // res.send({
                    //     "trancheid": finalresponse[0],
                    //     "currentcommitments": finalresponse[5]

                    // })
                } else {
                    res.send({});
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

        USDCMintEmitter.on('getinvestorchainadress', (commitamount) => {
            const contractAddress = SPaymentSettings.address
            const contractPath = path.join(process.cwd() + "/api/contracts/PaymentSettings.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "PaymentSettings";
            //const source = fs.readFileSync(contractPath, 'utf8');

                        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)
            //const bytecode = contractFile.evm.bytecode.object;
            const abi = SPaymentSettings.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            let errcount = 0;
            const get1 = async () => {
                winlog.info(`Making a call to InvestmentAndCommit contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getPaymentByUserId(req.body.investorid)
                        .call({ from: address });

                    var response = { "result": JSON.stringify(data) };
                    winlog.info(response)
                    var finalresponse = JSON.parse(response.result);
                    var key = ["userid", "PayInsViaCircle", "userWalletAdd", "subnetWalletAdd", "PayoutsViaCircle", "PayInPaymentType", "PayOutPaymentType"]
                    if (finalresponse.length > 0) {
                        USDCMintEmitter.emit('MintUSDC', commitamount, finalresponse[2])
                        // res.send({
                        //     "trancheid": finalresponse[0],
                        //     "currentcommitments": finalresponse[5]

                        // })
                    } else {
                        res.send({});
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



        USDCMintEmitter.on('MintUSDC', (commitamount, userwalletaddress) => {
            var uniqueid = uuidv4().toString();
            var postData = {
                source: { type: 'wallet', id: '1008946325' },
                destination: {
                    type: 'blockchain',
                    address: userwalletaddress,
                    chain: 'AVAX'
                },
                amount: { amount: commitamount, currency: 'USD' },
                idempotencyKey: uniqueid
            }

            winlog.info(postData)
            var url = "https://api-sandbox.circle.com/v1/transfers"
            request.post({
                uri: url,
                headers: {
                    'content-type': 'application/json',
                    'authorization': "Bearer QVBJX0tFWTo5M2ZhNjRlMTQ3NWM3ZWQyODgwMGM1MDI0YWQwMzgwNTowM2I1ODA3MzA3Y2I4OTlmNmY0NDBkZjQ3ZjQxZTAwNg=="

                },
                body: JSON.stringify(postData)
            },
                function (error, response, body) {

                    if (!error && response.statusCode == 200) {
                        winlog.info("USDC minted in investor account successfully")
                        response = JSON.parse(body);
                        winlog.info(response);
                        res.send({
                            "success": true,
                            "message": "USDC minted success"
                        })
                    } else {
                        res.send(JSON.parse(body))
                    }
                })
        })
    },
    transferUSDCCircle: function (message, req, res) {
        // winlog.info("in")
        // var uniqueid = uuidv4().toString();

        winlog.info("message.payment.amount.amount: " + message.payment.amount.amount)
        winlog.info("message.payment.fees.id: " + message.payment.fees.amount)
        winlog.info("sub amt: " + String((parseFloat(message.payment.amount.amount) - parseFloat(message.payment.fees.amount)).toFixed(2)))

        var USDCMintEmitter = new EventEmitter();
        const contractAddress = SUserBankAccount.address

        const contractPath = path.join(process.cwd() + "/api/contracts/UserBankAccount.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "UserBankAccount";
        //const source = fs.readFileSync(contractPath, 'utf8');

        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};



        //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
        //winlog.info(tempFile)
        //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        //winlog.info(contractFile)
        //const bytecode = contractFile.evm.bytecode.object;
        const abi = SUserBankAccount.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        const get1 = async () => {
            winlog.info(`Making a call to UserBankAccount contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getById(String(message.payment.source.id))
                // .getById("d4208f81-aded-49f5-b656-a87fcc0cef99")
                .call({ from: address });

            var response = { "result": JSON.stringify(data) };
            winlog.info(response)
            var finalresponse = JSON.parse(response.result);
            var key = ["uniqueid", "dealid", "tranchename", "trancheid", "investorid", "commitamount", "investamount"]
            if (finalresponse.length > 0) {

                USDCMintEmitter.emit('getinvestorchainadress', finalresponse[0][0], message.payment.amount.amount)
                // res.send({
                //     "trancheid": finalresponse[0],
                //     "currentcommitments": finalresponse[5]

                // })
            } else {
                // res.send({});
                return ({})
            }

        };
        get1();



        USDCMintEmitter.on('getinvestorchainadress', (investorid, commitamount) => {
            const contractAddress = SPaymentSettings.address

            const contractPath = path.join(process.cwd() + "/api/contracts/PaymentSettings.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "PaymentSettings";
            //const source = fs.readFileSync(contractPath, 'utf8');

                        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)
            //const bytecode = contractFile.evm.bytecode.object;
            const abi = SPaymentSettings.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to InvestmentAndCommit contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getPaymentByUserId(investorid)
                    .call({ from: address });

                var response = { "result": JSON.stringify(data) };
                winlog.info(response)
                var finalresponse = JSON.parse(response.result);
                var key = ["userid", "PayInsViaCircle", "userWalletAdd", "subnetWalletAdd", "PayoutsViaCircle", "PayInPaymentType", "PayOutPaymentType"]
                if (finalresponse.length > 0) {
                    USDCMintEmitter.emit('MintUSDC', commitamount, finalresponse[2])


                    // res.send({
                    //     "trancheid": finalresponse[0],
                    //     "currentcommitments": finalresponse[5]

                    // })

                    winlog.info("minted----")
                } else {
                    // res.send({});
                    return ({})
                }

            };
            get1();
        })


        USDCMintEmitter.on('MintUSDC', (commitamount, userwalletaddress) => {
            winlog.info("userwalletaddress: " + JSON.stringify(userwalletaddress))
            var uniqueid = uuidv4().toString();
            var postData = {
                source: { type: 'wallet', id: '1008946325' },
                destination: {
                    type: 'blockchain',
                    // address: "0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D",
                    address: userwalletaddress,
                    chain: 'AVAX'
                },
                amount: { amount: commitamount, currency: 'USD' },
                idempotencyKey: uniqueid
            }

            winlog.info(postData)
            var url = "https://api-sandbox.circle.com/v1/transfers"
            request.post({
                uri: url,
                headers: {
                    'content-type': 'application/json',
                    'authorization': "Bearer QVBJX0tFWTo5M2ZhNjRlMTQ3NWM3ZWQyODgwMGM1MDI0YWQwMzgwNTowM2I1ODA3MzA3Y2I4OTlmNmY0NDBkZjQ3ZjQxZTAwNg=="

                },
                body: JSON.stringify(postData)
            },
                function (error, response, body) {

                    winlog.info("body: " + body)
                    winlog.info("error: " + error)
                    winlog.info("\n response: " + JSON.stringify(response))

                    return (JSON.parse(body))

                    // if (!error && response.statusCode == 200) {
                    //     winlog.info("USDC minted in investor account successfully")
                    //     response = JSON.parse(body);
                    //     winlog.info(response);
                    //         res.send({
                    //         "success": true,
                    //         "message": "USDC minted success"
                    //     })
                    // } else {
                    //     res.send(JSON.parse(body))
                    //     // res.send({})
                    // }
                })
        })
    }

}
module.exports = PaymentSetting