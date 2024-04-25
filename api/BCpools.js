const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const SCreatePool = require('./abi/CreatePool')
const contractAddress = SCreatePool.address; // deployed contract address( can be taken from remix or index.js)
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const winlog = require("../log/winstonlog");
const RestrictPool = require('./RestrictTestPool')

var query = {

    querygetallpools: function (req, res) {

        return new Promise((resolve, reject) => {
            //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");

            const contractPath = path.join(process.cwd() + "/api/contracts/CreatePool.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "CreatePool"
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
            const abi = SCreatePool.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getAllPools()
                        .call({ from: address });
                    //  winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    // winlog.info(response)
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    var key = ["uniqueID", "poolid", "poolname", "issuerid", "assetclass", "assignverification",
                        "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
                        "status", "loanids", "typename", "filepath", "typepurpose", "attributes", "issuername"];

                    var arr = [];
                    for (var i = 0; i < finalresponse.length; ++i) {
                        var json = {};
                        for (var j = 0; j < key.length; ++j) {
                            json[key[j]] = finalresponse[i][j];
                        }
                        arr.push(json);
                    }

                    winlog.info(arr)
                    resolve("success")
                    winlog.info("final")
                    res.send(arr)
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            };

            get1();
        });
    },

    getallpoolsbyissuerid: function (req, res) {

        return new Promise((resolve, reject) => {
            //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
            const contractPath = path.join(process.cwd() + "/api/contracts/CreatePool.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "CreatePool"
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
            const abi = SCreatePool.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                try {
                    winlog.info(req.query.issuerid)
                    const data = await incrementer.methods
                        .getPoolsByIssuer(req.query.issuerid)
                        .call({ from: address });
                    //  winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    // winlog.info(response)
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    winlog.info(finalresponse)
                    var key = ["uniqueID", "poolid", "poolname", "issuerid", "assetclass", "assignverification",
                        "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
                        "status", "loanids", "typename", "filepath", "typepurpose", "attributes", "issuername"];

                    var arr = [];
                    for (var i = 0; i < finalresponse.length; ++i) {
                        var json = {};
                        for (var j = 0; j < key.length; ++j) {

                            json[key[j]] = finalresponse[i][j];
                        }
                        arr.push(json);

                    }

                    winlog.info(arr)
                    resolve("success")
                    winlog.info("final")
                    res.send(arr)
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }

            };

            get1();
        });
    },

    getallpoolsbyunderwriterid: function (req, res) {

        return new Promise((resolve, reject) => {

            const contractPath = path.join(process.cwd() + "/api/contracts/CreatePool.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "CreatePool"
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
            const abi = SCreatePool.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getPoolsByUnderWriter(req.query.underwriterid)
                        .call({ from: address });
                    //  winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    // winlog.info(response)
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    winlog.info(finalresponse)
                    var key = ["uniqueID", "poolid", "poolname", "issuerid", "assetclass", "assignverification",
                        "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
                        "status", "loanids", "typename", "filepath", "typepurpose", "attributes", "issuername"];

                    finalresponse = RestrictPool.Getfinalpool(finalresponse, req.query.mailid, "deal")

                    var arr = [];
                    for (var i = 0; i < finalresponse.length; ++i) {
                        var json = {};
                        for (var j = 0; j < key.length; ++j) {
                            json[key[j]] = finalresponse[i][j];
                        }
                        arr.push(json);

                    }

                    winlog.info(arr)
                    resolve("success")
                    winlog.info("final")
                    res.send(arr)
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            };

            get1();
        });
    },

    updatepoolstatus: function (req, res) {

        return new Promise((resolve, reject) => {

            winlog.info("get pool details:::::::::::")

            const contractPath = path.join(process.cwd() + "/api/contracts/CreatePool.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "CreatePool"
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
            const abi = SCreatePool.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            let errcount = 0;
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getPoolByPoolId(req.body.poolid)
                        .call({ from: address });
                    //  winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    // winlog.info(response)
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    winlog.info(finalresponse)
                    var key = ["uniqueID", "poolid", "poolname", "issuerid", "assetclass", "assignverification",
                        "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
                        "status", "loanids", "typename", "filepath", "typepurpose", "attributes", "issuername"];

                    winlog.info(finalresponse[11])
                    finalresponse[11] = req.body.status
                    UpdatePool([finalresponse]);
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

        async function UpdatePool(pooldetails) {

            return new Promise((resolve, reject) => {

                winlog.info(pooldetails)
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "CreatePool.sol");
                const contractname = "CreatePool";
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
                const abi = SCreatePool.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                const encoded = incrementer.methods.updatePool(pooldetails).encodeABI();
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
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
                            res.send({ "success": true, "message": "Pool Update Success" });
                            resolve("pool update  success")
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
        }

    },

    // updateclosingdate: function (req, res) {

    //     return new Promise((resolve, reject) => {

    //         winlog.info("get pool details:::::::::::")

    //         const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
    //         winlog.info("contractpath:: " + contractPath);
    //         const contractname = "DealOnboarding"
    //         // const contractPath = path.join('/home/somiya/Documents/IntainMarkets/IM Node app/api/contracts/CreatePool.sol');
    //         //const source = fs.readFileSync(contractPath, 'utf8');

    //         // const input = {
    //         //     language: 'Solidity',
    //         //     sources: {
    //         //         [contractname + ".sol"]: {
    //         //             content: source,
    //         //         },
    //         //     },
    //         //     settings: {
    //         //         outputSelection: {
    //         //             '*': {
    //         //                 '*': ['*'],
    //         //             },
    //         //         },
    //         //     },
    //         // };

    //         //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
    //         //winlog.info(tempFile)
    //         //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
    //         //winlog.info(contractFile)

    //         //const bytecode = contractFile.evm.bytecode.object;
    //         const abi = SDealOnboarding.abi;

    //         const incrementer = new web3.eth.Contract(abi, SDealOnboarding.address);
    //         let errcount = 0;
    //         const get1 = async () => {
    //             winlog.info(`Making a call to contract at address ${SDealOnboarding.address}`);
    //             try {
    //                 const data = await incrementer.methods
    //                     .getTrancheByTrancheId(req.body.dealid)
    //                     .call({ from: address });
    //                 //  winlog.info("data:: " + JSON.stringify(data));
    //                 // winlog.info(`The current string is: ` + data);
    //                 // var response ={ "result":JSON.stringify(data)}
    //                 // winlog.info(response)
    //                 var response = { "result": JSON.stringify(data) }
    //                 var finalresponse = JSON.parse(response.result)
    //                 winlog.info(finalresponse)
    //                 var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
    //                 "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
    //                 "numberofTranches", "trancheIds", "createdDate", "status", "colsingDate", "maturityDate",
    //                 "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach", "payingagentid", "reviewstatus", "paymentmode", "commitORinvest"];
    //                 winlog.info(finalresponse[9])
    //                 finalresponse[9] = req.body.status
    //                UpdatePool([finalresponse]);
    //             } catch (e) {
    //                 errcount++;
    //                 if (errcount <= 3) {
    //                     winlog.info("error occ" + e);
    //                     get1();
    //                 } else {
    //                     var r = { "message": e.message }
    //                     res.status(500).send(r);
    //                 }
    //             }
    //         };

    //         get1();
    //     });

    //     async function UpdatePool(pooldetails) {

    //         return new Promise((resolve, reject) => {

    //             winlog.info(pooldetails)
    //             const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
    //             const contractname = "DealOnboarding";
    //             //const source = fs.readFileSync(contractPath, 'utf8');

    //             // const input = {
    //             //     language: 'Solidity',
    //             //     sources: {
    //             //         [contractname + ".sol"]: {
    //             //             content: source,
    //             //         },
    //             //     },
    //             //     settings: {
    //             //         outputSelection: {
    //             //             '*': {
    //             //                 '*': ['*'],
    //             //             },
    //             //         },
    //             //     },
    //             // };

    //             //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
    //             //winlog.info(tempFile)
    //             //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
    //             //winlog.info(contractFile)
    //             ////const bytecode = contractFile.evm.bytecode.object;
    //             const abi = SDealOnboarding.abi;
    //             const incrementer = new web3.eth.Contract(abi, SDealOnboarding.address);

    //             const encoded = incrementer.methods.updateTrancheArray(pooldetails).encodeABI();
    //             let errcount = 0;
    //             const increment = async () => {
    //                 winlog.info(
    //                     `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
    //                 );
    //                 try {
    //                     const createTransaction = await web3.eth.accounts.signTransaction(
    //                         {
    //                             from: address,
    //                             to: SDealOnboarding.address,
    //                             data: encoded,
    //                             gasLimit: 6000000,
    //                             chainId: "101122"
    //                         },
    //                         privKey
    //                     ); const createReceipt = await web3.eth.sendSignedTransaction(
    //                         createTransaction.rawTransaction
    //                     );
    //                     winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
    //                     var eventarr = web3.eth.abi.decodeParameters([{
    //                         type: 'string[]',
    //                         name: 'id'
    //                     }], createReceipt.logs[0].data)
    //                     var finaleventarr = eventarr.id
    //                     winlog.info(finaleventarr)
    //                     var emittercount = 0;
    //                     for (var i = 0; i < finaleventarr.length; i++) {
    //                         if (finaleventarr[i] != '') {
    //                             emittercount++;
    //                         }
    //                     }
    //                     if (emittercount > 0) {
    //                         winlog.info(finaleventarr)
    //                         res.send({
    //                             "success": false,
    //                             "message": "ID Doesnot exist"
    //                         })
    //                     } else {
    //                         res.send({ "success": true, "message": "Pool Update Success" });
    //                         resolve("pool update  success")
    //                     }
    //                 } catch (e) {
    //                     errcount++;
    //                     if (errcount <= 3) {
    //                         winlog.info("error occ" + e);
    //                         increment();
    //                     } else {
    //                         var r = { "message": e.message }
    //                         res.status(500).send(r);
    //                     }
    //                 }

    //             }; increment();
    //         });
    //     }

    // }
}
module.exports = query;