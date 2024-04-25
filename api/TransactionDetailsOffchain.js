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
const SAccountDetailsOffChain = require('./abi/AccountDetailsOffChain')
const STransactionDetailsOffchain = require('./abi/TransactionDetailsOffchain');

const ipfs = ipfsAPI('20.237.185.191', '9095', { protocol: 'http' });
var Transactionoffchain = {
    SaveTransactionDetails: function (req, res) {
        // if (!req.body.senderid || !req.body.paymenttype || !req.body.dealid || !req.body.account || !req.body.description || !req.body.amount || !req.body.status) {
        //     res.send({ token: -1 });
        // } else {
        const contractAddress = STransactionDetailsOffchain.address;
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "TransactionDetailsOffchain.sol");
        const contractname = "TransactionDetailsOffchain";

        const abi = STransactionDetailsOffchain.abi;
        const incrementer = new web3.eth.Contract(abi, contractAddress);
        let ts = Date.now();

        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        let hour = date_ob.getHours();
        let minute = date_ob.getMinutes();
        let second = date_ob.getSeconds();

        // prints date & time in YYYY-MM-DD format
        let paymentdate = month + "-" + date + "-" + year+" "+hour+":"+minute+":"+second;
        var finalarray = []
        var transaction = req.body;
        var accountarr = []
        for (var i = 0; i < transaction.length; i++) {
            let uniqueid = uuidv4().toString()
            finalarray.push([uniqueid, transaction[i]["dealid"], transaction[i]["paymenttype"], transaction[i]["account"], transaction[i]["description"], paymentdate, transaction[i]["amount"], transaction[i]["status"], transaction[i]["senderid"], transaction[i]["trancheid"]])
            // uniqueidfinalarr.push(uniqueid)
            accountarr.push(transaction[i]["account"])
        }
        // var finalarray = [[uuidv4().toString(), req.body.dealid, req.body.paymenttype, req.body.account, req.body.description, paymentdate, req.body.amount, req.body.status, req.body.senderid]];
        winlog.info("in:::")
        winlog.info(finalarray)
        req.body.accountarr = accountarr
        req.body.dealid = transaction[0]["dealid"]
        req.body.finalmodifyarray = finalarray;
        winlog.info(req.body)
        let errcount = 0;
        const increment = async () => {
            winlog.info(
                `Calling the saveTransactionDetailsOffchain function in SaveTransactionDetailsOffchain contract at address ${contractAddress}`
            );
            try {
                web3.eth.handleRevert = true
                const encoded = incrementer.methods.saveTransactionDetailsOffchain(finalarray).encodeABI();

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
                // winlog.info(createReceipt)
                //   winlog.info(JSON.stringify(createReceipt.logs));

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
                    Transactionoffchain.ModifyAccountOffchain(req, res);
                }
                // res.send({
                //     "success": true,
                //     "message": "Transaction details save success"
                // })
            } catch (e) {
                errcount++;
                // winlog.info(e)
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
        // }
        //Transactionoffchain.ModifyAccountOffchain();
    },

    ModifyAccountOffchain: function (req, res) {

        var UpdateAccountEmitter = new EventEmitter();
        const contractAddress = SAccountDetailsOffChain.address
        const contractPath = path.join(process.cwd() + "/api/contracts/AccountDetailsOffChain.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "AccountDetailsOffChain";

        const abi = SAccountDetailsOffChain.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        var arr = {};
        let errcount = 0
        //winlog.info(req.body)
        const get1 = async () => {
            winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
            winlog.info(req.body.dealid + "::::::::::::::::::::::::: " + req.body.accountarr)
            try {
                const data = await incrementer.methods
                    .getAccountDetailsOffChainByDealIdAndAccountnameArray(req.body.accountarr, req.body.dealid)
                    .call({ from: address });

                var response = { "result": JSON.stringify(data) };
                winlog.info(JSON.stringify(response))
                var finalresponse = JSON.parse(response.result);
                var key = ["uniqueid", "dealid", "accountname", "beginningbalance", "endingbalance", "month", "year", "date", "wirestatus", "bankdetails"]

                if (finalresponse.length > 0) {
                    var finalmodifyarray = req.body.finalmodifyarray;
                    var counter = 0;
                    for (var i = 0; i < finalresponse.length; i++) {
                        for (var j = 0; j < finalmodifyarray.length; j++) {
                            winlog.info(parseFloat(finalresponse[i][4]) + " " + parseFloat(finalmodifyarray[j][6]));
                            if (finalmodifyarray[j][3] === finalresponse[i][2]) {

                                winlog.info("in " + finalresponse[j][2])
                                if (finalmodifyarray[j][7] === 'Completed') {
                                    counter++;
                                    winlog.info("completed " + finalresponse[j][0])
                                    if (finalmodifyarray[i][2] == 'Payments' || finalmodifyarray[i][2] == 'Outgoing') {
                                        finalresponse[i][4] = (parseFloat(finalresponse[i][4]) - parseFloat(finalmodifyarray[j][6])).toString();
                                        break;
                                    } else {
                                        finalresponse[i][4] = (parseFloat(finalresponse[i][4]) + parseFloat(finalmodifyarray[j][6])).toString();
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    winlog.info("modified final array" + finalresponse)
                    if (counter != 0)
                        UpdateAccountEmitter.emit('updateaccountoffchain', finalresponse)
                    else {
                        res.send({ "success": true, "message": "AccountOffchain update success " });

                    }

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
            let ts = Date.now();

            winlog.info(finaljson)
            let errcount = 0;
            const increment = async () => {
                winlog.info(
                    `Calling the update account offchain function in  contract at address ${contractAddress}`
                );
                try {
                    web3.eth.handleRevert = true
                    const encoded = incrementer.methods.updateADetails(finaljson).encodeABI();
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


    },
    UpdateTransactionDetails: function (req, res) {
        if (!req.body.uniqueid || !req.body.paymenttype || !req.body.dealid || !req.body.account || !req.body.description || !req.body.amount || !req.body.status || !req.body.date) {
            res.send({ token: -1 });
        } else {
            var UpdateEmitter = new EventEmitter();
            const contractAddress = STransactionDetailsOffchain.address;
            const contractPath = path.join(process.cwd() + "/api/contracts/TransactionDetailsOffchain.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "TransactionDetailsOffchain";

            const abi = STransactionDetailsOffchain.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            var arr = {};
            let errcount = 0;
            const get1 = async () => {
                winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getTransactionByuniqueidOffChain(req.body.uniqueid)
                        .call({ from: address });
                    //  winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    var response = { "result": JSON.stringify(data) };
                    winlog.info(response)
                    var finalresponse = JSON.parse(response.result);
                    var key = ["uniqueid", "dealid", "paymenttype", "account", "description", "date", "amount", "status", "senderid"]

                    if (finalresponse.length > 0) {
                        var arr = [];
                        finalresponse[2] = req.body.paymenttype;
                        finalresponse[3] = req.body.account
                        finalresponse[4] = req.body.description
                        finalresponse[5] = req.body.date
                        finalresponse[6] = req.body.amount
                        finalresponse[7] = req.body.status
                        UpdateEmitter.emit('updatetransactiondetails', finalresponse);
                    } else {
                        res.send({
                            "success": false,
                            "message": "ID Doesnot exit"
                        })
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


            UpdateEmitter.on('updatetransactiondetails', (finalresponse) => {
                const contractAddress = STransactionDetailsOffchain.address;
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "TransactionDetailsOffchain.sol");
                const contractname = "TransactionDetailsOffchain";

                const abi = STransactionDetailsOffchain.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);
                var finalarray = [finalresponse];
                winlog.info(finalarray)
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the updateTransactionDetails function in SaveTransactionDetailsOffchain contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateTransactionDetails(finalarray).encodeABI();
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
                        req.body.uniqueidarr = [req.body.uniqueid]
                        req.body.finalmodifyarray = finalarray;
                        winlog.info("final arr")

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
                            if (req.body.status === `Completed`) {
                                req.body.accountarr = [req.body.account]
                                req.body.dealid = req.body.dealid
                                req.body.finalmodifyarray = finalarray;
                                winlog.info(req.body)

                                Transactionoffchain.ModifyAccountOffchain(req, res);
                            } else {
                                res.send({
                                    "success": true,
                                    "message": "Transaction details update success"
                                })
                            }
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
    GetTransactionOffChainDetails: function (req, res) {
        const contractAddress = STransactionDetailsOffchain.address;
        const contractPath = path.join(process.cwd() + "/api/contracts/TransactionDetailsOffchain.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "TransactionDetailsOffchain";
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
        const abi = STransactionDetailsOffchain.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        var arr = {};
        const get1 = async () => {
            winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
            try {
                const data = await incrementer.methods
                    .getTransactionByDealIdOffChain(req.query.dealid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                var response = { "result": JSON.stringify(data) };
                winlog.info(response)
                var finalresponse = JSON.parse(response.result);
                var key = ["uniqueid", "dealid", "paymenttype", "account", "description", "date", "amount", "status", "senderid"]

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
    },


    // testtransaction: function (req, res) {
    //     // if (!req.body.senderid || !req.body.paymenttype || !req.body.dealid || !req.body.account || !req.body.description || !req.body.amount || !req.body.status) {
    //     //     res.send({ token: -1 });
    //     // } else {
    //     const contractAddress = STransactionDetailsOffchain.address;
    //     const contractPath = path.join(process.cwd(), '/api/contracts/' + "TransactionDetailsOffchain.sol");
    //     const contractname = "TransactionDetailsOffchain";

    //     const abi = STransactionDetailsOffchain.abi;
    //     const incrementer = new web3.eth.Contract(abi, contractAddress);

    //     let ts = Date.now();

    //     let date_ob = new Date(ts);
    //     let date = date_ob.getDate();
    //     let month = date_ob.getMonth() + 1;
    //     let year = date_ob.getFullYear();

    //     // prints date & time in YYYY-MM-DD format
    //     let paymentdate = month + "-" + date + "-" + year;
    //     var finalarray = []
    //     var transaction = req.body;
    //     var accountarr = []
    //     for (var i = 0; i < transaction.length; i++) {
    //         let uniqueid = uuidv4().toString()
    //         finalarray.push([uniqueid, transaction[i]["dealid"], transaction[i]["paymenttype"], transaction[i]["account"], transaction[i]["description"], paymentdate, transaction[i]["amount"], transaction[i]["status"], transaction[i]["senderid"], transaction[i]["trancheid"]])
    //         finalarray.push(['af19ffb6-0bf2-49e2-8bfb-7b03ec108423', transaction[i]["dealid"], transaction[i]["paymenttype"], transaction[i]["account"], transaction[i]["description"], paymentdate, transaction[i]["amount"], transaction[i]["status"], transaction[i]["senderid"], transaction[i]["trancheid"]])

    //         // uniqueidfinalarr.push(uniqueid)
    //         accountarr.push(transaction[i]["account"])
    //     }
    //     // var finalarray = [[uuidv4().toString(), req.body.dealid, req.body.paymenttype, req.body.account, req.body.description, paymentdate, req.body.amount, req.body.status, req.body.senderid]];
    //     winlog.info("in:::")
    //     winlog.info(finalarray)
    //     req.body.accountarr = accountarr
    //     req.body.dealid = transaction[0]["dealid"]
    //     req.body.finalmodifyarray = finalarray;
    //     winlog.info(req.body)
    //     let errcount = 0;
    //     const increment = async () => {
    //         winlog.info(
    //             `Calling the saveTransactionDetailsOffchain function in SaveTransactionDetailsOffchain contract at address ${contractAddress}`
    //         );
    //         try {
    //             web3.eth.handleRevert = true
    //             const encoded = incrementer.methods.saveTransactionDetailsOffchain(finalarray).encodeABI();

    //             const createTransaction = await web3.eth.accounts.signTransaction(
    //                 {
    //                     from: address,
    //                     to: contractAddress,
    //                     data: encoded,
    //                     gasLimit: 6000000,
    //                     chainId: "101122",
    //                     // gasprice:"35000000000001"
    //                 },
    //                 privKey
    //             ); const createReceipt = await web3.eth.sendSignedTransaction(
    //                 createTransaction.rawTransaction
    //             );
    //             winlog.info(`Tx successfull with hash: ${createReceipt}`);
    //             winlog.info(createReceipt.logs[0].data)

    //             //    winlog.info(web3.eth.abi.decodeParameters([{
    //             //     type: 'string[]',
    //             //     name: 'id'
    //             // }], createReceipt.logs[0].data));
    //             var eventarr = web3.eth.abi.decodeParameters([{
    //                 type: 'string[]',
    //                 name: 'id'
    //             }], createReceipt.logs[0].data)
    //             var finaleventarr = eventarr.id
    //             winlog.info(finaleventarr)
    //             var emittercount = 0;
    //             for (var i = 0; i < finaleventarr.length; i++) {
    //                 if (finaleventarr[i] != '') {
    //                     emittercount++;
    //                 }
    //             }
    //             if (emittercount > 0) {
    //                 winlog.info(finaleventarr)
    //                 res.send({
    //                     "success": false,
    //                     "message": "Id already exist"
    //                 })
    //             } else {
    //                 res.send({
    //                     "success": true,
    //                     "message": "Transaction details update success"
    //                 })
    //             }

    //         } catch (e) {
    //             errcount++;
    //             // winlog.info(e)
    //             if (e.reason && e.reason.includes("Caller is not an invoker")) {
    //                 winlog.info(e.reason)
    //                 res.status(500).send(e.reason);
    //             }
    //             else if (errcount <= 3) {
    //                 winlog.info("error else if occ" + e);
    //                 //   increment();
    //             } else {
    //                 winlog.info("final err")
    //                 var r = { "message": e.message }
    //                 res.status(500).send(r);
    //             }
    //         }

    //     }; increment();
    //     // }
    //     //Transactionoffchain.ModifyAccountOffchain();
    // },

    deletetransactiondetailsoffchain: function (req, res) {
        if (!req.body.uniqueid ) {
            res.send({ token: -1 });
        } else {
            var UpdateEmitter = new EventEmitter();
            const contractAddress = STransactionDetailsOffchain.address;
            const contractPath = path.join(process.cwd() + "/api/contracts/TransactionDetailsOffchain.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "TransactionDetailsOffchain";

            const abi = STransactionDetailsOffchain.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            var arr = {};
            let errcount = 0;
            const get1 = async () => {
                winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getTransactionByuniqueidOffChain(req.body.uniqueid)
                        .call({ from: address });
                    //  winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    var response = { "result": JSON.stringify(data) };
                    winlog.info(response)
                    var finalresponse = JSON.parse(response.result);
                    var key = ["uniqueid", "dealid", "paymenttype", "account", "description", "date", "amount", "status", "senderid"]

                    if (finalresponse.length > 0) {
                        var arr = [];
                        finalresponse[1] = "-";
                       
                        UpdateEmitter.emit('updatetransactiondetails', finalresponse);
                    } else {
                        res.send({
                            "success": false,
                            "message": "ID Doesnot exit"
                        })
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


            UpdateEmitter.on('updatetransactiondetails', (finalresponse) => {
                const contractAddress = STransactionDetailsOffchain.address;
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "TransactionDetailsOffchain.sol");
                const contractname = "TransactionDetailsOffchain";

                const abi = STransactionDetailsOffchain.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);
                var finalarray = [finalresponse];
                winlog.info(finalarray)
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the updateTransactionDetails function in SaveTransactionDetailsOffchain contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateTransactionDetails(finalarray).encodeABI();
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
                        req.body.uniqueidarr = [req.body.uniqueid]
                        req.body.finalmodifyarray = finalarray;
                        winlog.info("final arr")

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
                            if (req.body.status === `Completed`) {
                                req.body.accountarr = [req.body.account]
                                req.body.dealid = req.body.dealid
                                req.body.finalmodifyarray = finalarray;
                                winlog.info(req.body)

                                Transactionoffchain.ModifyAccountOffchain(req, res);
                            } else {
                                res.send({
                                    "success": true,
                                    "message": "Transaction details update success"
                                })
                            }
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
module.exports = Transactionoffchain
