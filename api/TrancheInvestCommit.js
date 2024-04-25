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
const winlog = require("../log/winstonlog");
const { resolve } = require('dns');
const SUser = require('./abi/User')
const SDealOnboarding = require('./abi/DealOnboarding')
const SDealTranche = require('./abi/DealTranche')
const SInvestmentAndCommit = require('./abi/InvestmentAndCommit')
const SFT = require('./abi/FT')

var commitments = {
    SaveCommit: function (req, res) {
        if (!req.body.dealid || !req.body.tranchename || !req.body.trancheid ||
            !req.body.investorid || !req.body.commitamount) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var TrancheEmitter = new EventEmitter();
            const contractAddress = SInvestmentAndCommit.address;

            const contractPath = path.join(process.cwd(), '/api/contracts/' + "InvestmentAndCommit.sol");
            const contractname = "InvestmentAndCommit";
            //const source = fs.readFileSync(contractPath, 'utf8');

            // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)
            ////const bytecode = contractFile.evm.bytecode.object;
            const abi = SInvestmentAndCommit.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);

            var CommitDetails = [[uuidv4().toString(), req.body.dealid, req.body.tranchename, req.body.trancheid, req.body.investorid, req.body.commitamount, "0"]]
            winlog.info(CommitDetails)
            let errcount = 0;
            const increment = async () => {

                winlog.info(
                    `Calling the update function in InvestmentAndCommit contract at address ${contractAddress}`
                );
                try {
                    web3.eth.handleRevert = true
                    const encoded = incrementer.methods.createInvestAndCommit(CommitDetails).encodeABI();
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
                    winlog.info("Tranche commit save success")
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
                    TrancheEmitter.emit('gettranche')
                    }
                    // res.send({ "success": true, "message": "Deal Update Status Success" });
                    // resolve("pool update  success")
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

            TrancheEmitter.on('gettranche', () => {
                winlog.info("inside get tranche::: ")
                const dealtrancheAddress = SDealTranche.address
                const contractPath = path.join(process.cwd() + "/api/contracts/DealTranche.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "DealTranche";
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
                const abi = SDealTranche.abi;

                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);
                let errcount = 0;
                const get1 = async () => {
                    winlog.info(`Making a call to deal tranche contract at address ${dealtrancheAddress}`);
                    try {
                        const data = await incrementer.methods
                            .getTrancheByTrancheId(req.body.trancheid)
                            .call({ from: address });
                        var response = { "result": JSON.stringify(data) };
                        var finalresponse = JSON.parse(response.result);
                        var key = ["uniqueid", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "closingdate", "currentcommitments", "availablecommitments"];

                        winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse))
                        winlog.info(parseFloat(finalresponse[10]) + " " + parseFloat(req.body.commitamount))

                        finalresponse[10] = String(parseFloat(finalresponse[10]) + parseFloat(req.body.commitamount))
                        finalresponse[11] = String(parseFloat(finalresponse[4]) - parseFloat(finalresponse[10]))
                        winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse))
                        TrancheEmitter.emit('savetranche', [finalresponse])
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

            TrancheEmitter.on('savetranche', (tranchedetails) => {
                const dealtrancheAddress = SDealTranche.address
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
                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);

                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the save tranche function in deal tranche contract at address ${dealtrancheAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateTrancheArray(tranchedetails).encodeABI();
                        const createTransaction = await web3.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: dealtrancheAddress,
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
                        res.send({ "success": true, "message": "Tranche Commit Success" });
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
    },

    EditCommit: function (req, res) {
        if (!req.body.trancheid || !req.body.investorid || !req.body.commitamount) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var TrancheEmitter = new EventEmitter();
            var difference = 0;
            const contractAddress = SInvestmentAndCommit.address
            const contractPath = path.join(process.cwd() + "/api/contracts/InvestmentAndCommit.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "InvestmentAndCommit";
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
            const abi = SInvestmentAndCommit.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            let errcount = 0;
            const get1 = async () => {
                winlog.info(`Making a call to InvestmentAndCommit contract at address ${contractAddress}`);
                try {
                    console.log("inside edit ")
                    const data = await incrementer.methods
                        .getTrancheDetailsByTrancheIdAndInvestorId(req.body.trancheid, req.body.investorid)
                        .call({ from: address });
                    var response = { "result": JSON.stringify(data) };
                   
                    
                    var finalresponse = JSON.parse(response.result);
                    console.log(finalresponse.length +" "+JSON.stringify(finalresponse))
                    if(finalresponse.length>1){
                    var key = ["uniqueid", "dealid", "tranchename", "trancheid", "investorid", "commitamount", "investamount"]

                    winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse))
                    difference = parseFloat(req.body.commitamount) - parseFloat(finalresponse[5])
                    finalresponse[5] = req.body.commitamount
                    winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse))
                    TrancheEmitter.emit('updatecommit', [finalresponse])
                    }else{
                        console.log("inside save ")
                        this.SaveCommit(req,res)
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


            TrancheEmitter.on('updatecommit', (commitdetails) => {
                const contractAddress = SInvestmentAndCommit.address
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "InvestmentAndCommit.sol");
                const contractname = "InvestmentAndCommit";
                //const source = fs.readFileSync(contractPath, 'utf8');

                // const input = {language: 'Solidity',
                //     sources: {[contractname + ".sol"]: {content: source,},
                //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


                //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                //winlog.info(tempFile)
                //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                //winlog.info(contractFile)
                ////const bytecode = contractFile.evm.bytecode.object;
                const abi = SInvestmentAndCommit.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                let errcount = 0;
                const increment = async () => {

                    winlog.info(
                        `Calling the update function in  InvestmentAnd Commit contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateInvestment(commitdetails).encodeABI();
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
                        winlog.info("Tranche commit save success")

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
                        TrancheEmitter.emit('gettranche')
                        }
                        // res.send({ "success": true, "message": "Deal Update Status Success" });
                        // resolve("pool update  success")
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

            TrancheEmitter.on('gettranche', () => {
                const dealtrancheAddress = SDealTranche.address
                const contractPath = path.join(process.cwd() + "/api/contracts/DealTranche.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "DealTranche";
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
                const abi = SDealTranche.abi;

                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);
                let errcount = 0;
                const get1 = async () => {
                    winlog.info(`Making a call to deal Tranche contract at address ${dealtrancheAddress}`);
                    try {
                        const data = await incrementer.methods
                            .getTrancheByTrancheId(req.body.trancheid)
                            .call({ from: address });
                        var response = { "result": JSON.stringify(data) };
                        var finalresponse = JSON.parse(response.result);
                        var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "currentcommitments", "availablecommitments"];
                        winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse))
                        winlog.info(parseFloat(finalresponse[10]) + " " + parseFloat(req.body.commitamount))

                        finalresponse[10] = String(parseFloat(finalresponse[10]) + parseFloat(difference))
                        finalresponse[11] = String(parseFloat(finalresponse[4]) - parseFloat(finalresponse[10]))

                        winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse))
                        TrancheEmitter.emit('UpdateTrancheArray', [finalresponse])
                    } catch (e) {
                        errcount++;
                        if (e.reason && e.reason.includes("Caller is not an invoker")) {
                            winlog.info(e.reason)
                            res.status(500).send(e.reason);
                        }
                        else if (errcount <= 3) {
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

            TrancheEmitter.on('UpdateTrancheArray', (tranchedetails) => {
                const dealtrancheAddress = SDealTranche.address
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
                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);

                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the save tranche function in deal tranche contract at address ${dealtrancheAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateTrancheArray(tranchedetails).encodeABI();
                        const createTransaction = await web3.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: dealtrancheAddress,
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
                        res.send({ "success": true, "message": "Commit Update  Success" });
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

    },

    Invest: function (req, res) {
        if (!req.body.trancheid || !req.body.investorid || !req.body.investamount) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var TrancheEmitter = new EventEmitter();
            var difference = 0;
            const contractAddress = SInvestmentAndCommit.address
            const contractPath = path.join(process.cwd() + "/api/contracts/InvestmentAndCommit.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "InvestmentAndCommit";
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
                    var finalresponse = JSON.parse(response.result);
                    var key = ["uniqueid", "dealid", "tranchename", "trancheid", "investorid", "commitamount", "investamount"]

                    winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse))
                    finalresponse[6] = req.body.investamount
                    winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse))
                    TrancheEmitter.emit('updateinvest', [finalresponse])
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


            TrancheEmitter.on('updateinvest', (commitdetails) => {
                const contractAddress = SInvestmentAndCommit.address
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "InvestmentAndCommit.sol");
                const contractname = "InvestmentAndCommit";
                //const source = fs.readFileSync(contractPath, 'utf8');

                // const input = {language: 'Solidity',
                //     sources: {[contractname + ".sol"]: {content: source,},
                //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


                //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                //winlog.info(tempFile)
                //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                //winlog.info(contractFile)
                ////const bytecode = contractFile.evm.bytecode.object;
                const abi = SInvestmentAndCommit.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                let errcount = 0;
                const increment = async () => {

                    winlog.info(
                        `Calling the update function in  InvestmentAnd Commit contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateInvestment(commitdetails).encodeABI();
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
                        winlog.info("Tranche invest save success")

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
                        TrancheEmitter.emit('gettranche')
                        }
                        // res.send({ "success": true, "message": "Deal Update Status Success" });
                        // resolve("pool update  success")
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

            TrancheEmitter.on('gettranche', () => {
                const dealtrancheAddress = SDealTranche.address
                const contractPath = path.join(process.cwd() + "/api/contracts/DealTranche.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "DealTranche";
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
                const abi = SDealTranche.abi;

                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);
                let errcount = 0;
                const get1 = async () => {
                    winlog.info(`Making a call to deal Tranche contract at address ${dealtrancheAddress}`);
                    try {
                        const data = await incrementer.methods
                            .getTrancheByTrancheId(req.body.trancheid)
                            .call({ from: address });
                        var response = { "result": JSON.stringify(data) };
                        var finalresponse = JSON.parse(response.result);
                        var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "currentcommitments", "availablecommitments"];
                        winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse))
                        winlog.info(parseFloat(finalresponse[6]) + " " + parseFloat(req.body.investamount))
                        if (finalresponse[6] != "NaN") {
                            finalresponse[6] = String(parseFloat(finalresponse[6]) + parseFloat(req.body.investamount))

                        } else {
                            finalresponse[6] = req.body.investamount
                        }

                        winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse))
                        TrancheEmitter.emit('UpdateDealTrancheArray', [finalresponse])
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

            TrancheEmitter.on('UpdateDealTrancheArray', (tranchedetails) => {
                const dealtrancheAddress = SDealTranche.address
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
                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);

                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the save tranche function in deal tranche contract at address ${dealtrancheAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateTrancheArray(tranchedetails).encodeABI();
                        const createTransaction = await web3.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: dealtrancheAddress,
                                data: encoded,
                                gasLimit: 6000000,
                                chainId: "101122"
                            },
                            privKey
                        ); const createReceipt = await web3.eth.sendSignedTransaction(
                            createTransaction.rawTransaction
                        );

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
                        winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                        }
                        res.send({ "success": true, "message": "Invest Success" });
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

    },

    GetTrancheCommitment: function (req, res) {
        const contractAddress = SDealTranche.address

        const contractPath = path.join(process.cwd() + "/api/contracts/DealTranche.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "DealTranche";
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
        const abi = SDealTranche.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        const get1 = async () => {
            winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
            try {
                const data = await incrementer.methods
                    .getTrancheByTrancheId(req.query.trancheid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                var response = { "result": JSON.stringify(data) };
                winlog.info(response)
                var finalresponse = JSON.parse(response.result);
                var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "currentcommitments", "availablecommitments"];
                winlog.info(finalresponse[0] + " " + finalresponse[10] + " " + finalresponse[11])
                if (finalresponse.length > 0) {
                    /*  var date1 = new Date();
                      var date2 = new Date(req.query.closingdate);
                      var currentdate = new Date(date1.getMonth() + 1 + "-" + date1.getDate() + "-" + date1.getFullYear());
                      // To calculate the time difference of two dates
                      var Difference_In_Time = date2.getTime() - currentdate.getTime();
                      // To calculate the no. of days between two dates
                      var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
      
                      winlog.info("Difference in days  :"+Difference_In_Days)
                      if(Difference_In_Days>0 && Difference_In_Days <=10){
                          finalresponse[11] = "0";
                      }*/
                    res.send({
                        "trancheid": finalresponse[0],
                        "currentcommitments": finalresponse[10],
                        "availablecommitments": finalresponse[11]
                    })
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
    },

    InvestOffChain: function (req, res) {
        if (!req.body.dealid) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var TrancheEmitter = new EventEmitter();
            const contractAddress = SInvestmentAndCommit.address// Contract Call
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "InvestmentAndCommit.sol");
            const contractname = "InvestmentAndCommit";
            //const source = fs.readFileSync(contractPath, 'utf8');
            var lazerzerojson = []
            var issueraddress = ""
            var finalinvestandcommitarr = []
            var finaltranchearr = []
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
            const abi = SInvestmentAndCommit.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const getDeal = async () => {
                winlog.info(`Making a call to MyInvestment contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getTrancheByDealId(req.body.dealid)
                        .call({ from: address });
                    winlog.info("data:: " + JSON.stringify(data));
                    if (data.length > 0) {

                        var response = { "result": JSON.stringify(data) }
                        var finalresponse = JSON.parse(response.result)
                        var key = ["uniqueid", "dealid", "tranchename", "trancheid", "investorid", "commitamount", "investamount"]

                        for (var i = 0; i < finalresponse.length; i++) {
                            winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse[i]))
                            finalresponse[i][6] = finalresponse[i][5]
                            winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse[i]))
                            finalinvestandcommitarr.push(finalresponse[i])
                        }
                        gettranche(finalinvestandcommitarr)
                        //  updateinvest(finalresponse);

                    } else {
                        res.send([])
                    }
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            }; getDeal();

            async function gettranche() {
                const dealtrancheAddress = SDealTranche.address
                const contractPath = path.join(process.cwd() + "/api/contracts/DealTranche.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "DealTranche";
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
                const abi = SDealTranche.abi;

                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);
                let errcount = 0;
                const get1 = async () => {
                    winlog.info(`\n Making a call to deal Tranche contract at address ${dealtrancheAddress}`);
                    try {
                        const data = await incrementer.methods
                            .getTrancheByDealId(req.body.dealid)
                            .call({ from: address });
                        var response = { "result": JSON.stringify(data) };
                        var finalresponse = JSON.parse(response.result);
                        var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "currentcommitments", "availablecommitments"];


                        winlog.info(finalinvestandcommitarr)
                        for (var i = 0; i < finalresponse.length; i++) {
                            for (var j = 0; j < finalinvestandcommitarr.length; j++) {
                                if (finalinvestandcommitarr[j][3] === finalresponse[i][0]) {
                                    winlog.info("user " + finalinvestandcommitarr[j][4])
                                    var getchainaddress = await getcchain(finalinvestandcommitarr[j][4]);
                                    lazerzerojson.push({ "investorid": finalinvestandcommitarr[j][4], "Cchain": getchainaddress, "amount": finalinvestandcommitarr[i][5], "deployedaddress": finalresponse[i][8] })
                                    winlog.info("c-chain address  :********************************:::::" + getchainaddress);

                                    winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse[i]))
                                    winlog.info(parseFloat(finalresponse[i][6]))
                                    if (finalresponse[i][6] != "NaN") {
                                        finalresponse[i][6] = String(parseFloat(finalresponse[i][6]) + parseFloat(finalinvestandcommitarr[i][5]))

                                    } else {
                                        finalresponse[i][6] = (finalinvestandcommitarr[i][5]).toString();
                                    }
                                    winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse[i]))
                                    finaltranchearr.push(finalresponse[i])
                                }
                            }

                        }
                        winlog.info(finaltranchearr)
                        winlog.info(lazerzerojson)
                        var issuerid = await getdealbydealid()
                        winlog.info("issuer id " + issuerid)
                        var issercchainaddress = await getcchain(issuerid)
                        issueraddress = issercchainaddress;
                        winlog.info("issuer c-chain address " + issercchainaddress)
                        lazerzerotransfer()
                        // UpdateDealTrancheArray(finalarr)
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

            async function getcchain(userid) {
                return new Promise((resolve, reject) => {
                    winlog.info(userid)
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
                        winlog.info(`Making a call to User contract at address ${contractAddress}`);
                        try {
                            const data = await incrementer.methods
                                .getUserById(userid)
                                .call({ from: address });

                            var response = { "result": JSON.stringify(data) };
                            winlog.info(response)
                            var finalresponse = JSON.parse(response.result);
                            if (finalresponse.length > 0) {
                                resolve(finalresponse[4])
                            } else {
                                json.IssuerCchainAddress = "";
                                winlog.info("no such user found")
                                resolve("")
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

            async function getdealbydealid() {
                return new Promise((resolve, reject) => {


                    const contractAddress = SDealOnboarding.address; // deployed contract address( can be taken from remix or index.js)
                    const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
                    winlog.info("contractpath:: " + contractPath);
                    const contractname = "DealOnboarding";
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
                                "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach", "payingagentid", "reviewstatus", "paymentmode","commitORinvest"];

                            winlog.info(finalresponse);
                            IssuerID = finalresponse[6];

                            resolve(IssuerID);
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

            async function UpdateDealTrancheArray() {
                const dealtrancheAddress = SDealTranche.address
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
                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);

                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the save tranche function in deal tranche contract at address ${dealtrancheAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateTrancheArray(finaltranchearr).encodeABI();
                        const createTransaction = await web3.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: dealtrancheAddress,
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
                        res.send({ "success": true, "message": "Invest Success" });
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
            async function updateinvest() {
                return new Promise((resolve, reject) => {

                    winlog.info("FCf" + finalinvestandcommitarr)
                    const contractAddress = SInvestmentAndCommit.address
                    const contractPath = path.join(process.cwd(), '/api/contracts/' + "InvestmentAndCommit.sol");
                    const contractname = "InvestmentAndCommit";
                    //const source = fs.readFileSync(contractPath, 'utf8');
                    winlog.info("1 ::::::")

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
                    winlog.info("2 ::::::")

                    //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                    //winlog.info(tempFile)
                    //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                    //winlog.info(contractFile)
                    ////const bytecode = contractFile.evm.bytecode.object;
                    const abi = SInvestmentAndCommit.abi;
                    const incrementer = new web3.eth.Contract(abi, contractAddress);
                    winlog.info("3 ::::::" + finalinvestandcommitarr)

                    let errcount = 0;
                    winlog.info("4 ::::::")

                    const increment = async () => {

                        winlog.info(
                            `Calling the update function in  InvestmentAnd Commit contract at address ${contractAddress}`
                        );
                        try {
                            web3.eth.handleRevert = true
                            const encoded = incrementer.methods.updateInvestment(finalinvestandcommitarr).encodeABI();
                            const createTransaction = await web3.eth.accounts.signTransaction(
                                {
                                    from: address,
                                    to: contractAddress,
                                    data: encoded,
                                    gasLimit: 6500000,
                                    chainId: "101122"
                                },
                                privKey
                            ); const createReceipt = await web3.eth.sendSignedTransaction(
                                createTransaction.rawTransaction
                            );
                            winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                            winlog.info("Tranche invest save success")

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
                            TrancheEmitter.emit('gettranche')
                            // res.send({ "success": true, "message": "Deal Update Status Success" });
                            resolve("invest update completed")
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

            async function lazerzerotransfer() {
                for (var i = 0; i < lazerzerojson.length; i++) {
                    winlog.info(":::::::::::::::::: " + i)
                    var lazerzeromsg = await lazerzero(lazerzerojson[i]);
                    winlog.info(lazerzeromsg);
                }
                var updateInvest = await updateinvest();
                winlog.info(updateInvest);
                var updatetranche = await UpdateDealTrancheArray();

            }
            async function lazerzero(lazerzeroarr) {
                return new Promise((resolve, reject) => {
                    //  const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc")
                    const contractAddress = lazerzeroarr.deployedaddress;
                    const contractname = "IMExample";

                    const abi = SFT.abi
                    const incrementer = new web3.eth.Contract(abi, contractAddress);
                    winlog.info(lazerzeroarr.Cchain + " " + issueraddress + " " +
                        lazerzeroarr.deployedaddress + " " + (parseFloat(lazerzeroarr.amount) * Math.pow(10, 18)).toString())
                    const encoded = incrementer.methods.transferFrom(issueraddress, lazerzeroarr.Cchain,
                        (parseFloat(lazerzeroarr.amount) * Math.pow(10, 6)).toString()).encodeABI();
                    let errcount = 0;
                    const increment = async () => {

                        winlog.info(
                            `Calling the function in layerzero contract at address ${contractAddress}`
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
                            // winlog.info("Tranche commit save success")
                            winlog.info(createReceipt)
                            //  res.send({ "success": true, "message": "Invest and FT transfer sucess" });
                            resolve("lazer zero transfer success")
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


                })
            }


        }

    },


}
module.exports = commitments