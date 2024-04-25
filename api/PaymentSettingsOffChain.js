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
const SUserBankAccountOffChain = require('./abi/UserBankAccountOffChain')

const ipfs = ipfsAPI('20.237.185.191', '9095', { protocol: 'http' });
var PaymentSettingoffchain = {
    AddDetails: function (req, res) {

        if (!req.body.userid || !req.body.PaymentType || !req.body.AccountDetails ||!req.body.subnetcchain) {
            res.send({ token: -1 });
        } else {
            var UserEmitter = new EventEmitter();
            const contractAddress = SUserBankAccountOffChain.address;
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "UserBankAccountOffChain.sol");
            const contractname = "UserBankAccountOffChain";
            //const source = fs.readFileSync(contractPath, 'utf8');

                        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)
            ////const bytecode = contractFile.evm.bytecode.object;
            const abi = SUserBankAccountOffChain.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);
            var finalarray = [[req.body.userid, req.body.PaymentType, JSON.stringify(req.body.AccountDetails),req.body.subnetcchain]];
            winlog.info(finalarray)
            let errcount = 0;
            const increment = async () => {
                winlog.info(
                    `Calling the CreateUserBankAccount function in payment settings contract at address ${contractAddress}`
                );
                try {
                    web3.eth.handleRevert = true
                    const encoded = incrementer.methods.createUserBankAccountOffChain(finalarray).encodeABI();
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
                        winlog.info("data alredy exist inside update")
                        UserEmitter.emit('updatepaymentdetails');

                        // res.send({
                        //     "success": false,
                        //     "message": "Data already exist"
                        // })
                    } else {
                    UserEmitter.emit('getuserdetails');
                    }
                    // res.send({
                    //     "success": true,
                    //     "message": "Bank details save success"
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

            UserEmitter.on('updatepaymentdetails',()=>{
                const contractAddress = SUserBankAccountOffChain.address;
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "UserBankAccountOffChain.sol");
                const contractname = "UserBankAccountOffChain";
                const abi = SUserBankAccountOffChain.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);
                var finalarray = [[req.body.userid, req.body.PaymentType, JSON.stringify(req.body.AccountDetails),req.body.subnetcchain]];
                winlog.info(finalarray)
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the CreateUserBankAccount function in payment settings contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateUserBankAccountOffChain(finalarray).encodeABI();
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
                                "message": "Data Doesnot exist"
                            })
                        } else {
                        UserEmitter.emit('getuserdetails');
                        }
                        // res.send({
                        //     "success": true,
                        //     "message": "Bank details save success"
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
                            arr1[4] = req.body.subnetcchain
                            ipfs.files.get(arr1[2], function (err, files) {
                                files.forEach((file) => {
                                    winlog.info(file.path)
                                    winlog.info(file.content.toString('utf8'))
                                    var ipfsData = JSON.parse(file.content.toString('utf8'));
                                    winlog.info(ipfsData);
                                    ipfsData.UserAccAddress = req.body.subnetcchain
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
               // const contractFile = tempFile.contracts["User.sol"]["User"];
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
                      res.send({
                        "success": true,
                        "message": "Bank details save success"
                    })
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
        }
    },

    // UpdateDetails: function (req, res) {

    //     var updateEmitter = new EventEmitter();

    //     const contractAddress = SUserBankAccountOffChain.address;

    //     const contractPath = path.join(process.cwd() + "/api/contracts/UserBankAccountOffChain.sol");
    //     winlog.info("contractpath:: " + contractPath);
    //     const contractname = "UserBankAccountOffChain";
    //     // const contractPath = path.join('/home/somiya/Documents/IntainMarkets/IM Node app/api/contracts/CreatePool.sol');
    //     //const source = fs.readFileSync(contractPath, 'utf8');

    //     const input = {
    //         language: 'Solidity',
    //         sources: {
    //             [contractname + ".sol"]: {
    //                 content: source,
    //             },
    //         },
    //         settings: {
    //             outputSelection: {
    //                 '*': {
    //                     '*': ['*'],
    //                 },
    //             },
    //         },
    //     };

    //     //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
    //     //winlog.info(tempFile)
    //     //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
    //     //winlog.info(contractFile)
    //     //const bytecode = contractFile.evm.bytecode.object;
    //     const abi = contractFile.abi;

    //     const incrementer = new web3.eth.Contract(abi, contractAddress);
    //     var arr = {};
    //     let errcount = 0
    //     const get1 = async () => {
    //         winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
    //         try {
    //             const data = await incrementer.methods
    //                 .getBankDetailsByUserIdOffChain(req.query.userid)
    //                 .call({ from: address });
    //             //  winlog.info("data:: " + JSON.stringify(data));
    //             // winlog.info(`The current string is: ` + data);
    //             // var response ={ "result":JSON.stringify(data)}
    //             var response = { "result": JSON.stringify(data) };
    //             winlog.info(response)
    //             var finalresponse = JSON.parse(response.result);
    //             var key = ["userid", "paymenttype", "accountdetails"];

    //             if (finalresponse.length > 0) {
    //                updateEmitter.emit('updatebankdetails',finalresponse)
    //             } else {
    //                 res.send({});
    //             }
    //         } catch (e) {
    //             errcount++;
    //             if (errcount <= 3) {
    //                 winlog.info("error occ" + e);
    //                 get1();
    //             } else {
    //                 var r = { "message": e.message }
    //                 res.status(500).send(r);
    //             }
    //         }

    //     };
    //     get1();


    //     updateEmitter.on('updatebankdetails', (finalresponse) => {

    //         const contractAddress = SUserBankAccountOffChain.address;
    //         const contractPath = path.join(process.cwd(), '/api/contracts/' + "UserBankAccountOffChain.sol");
    //         const contractname = "UserBankAccountOffChain";
    //         //const source = fs.readFileSync(contractPath, 'utf8');

    //         const input = {
    //             language: 'Solidity',
    //             sources: {
    //                 [contractname + ".sol"]: {
    //                     content: source,
    //                 },
    //             },
    //             settings: {
    //                 outputSelection: {
    //                     '*': {
    //                         '*': ['*'],
    //                     },
    //                 },
    //             },
    //         };

    //         //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
    //         //winlog.info(tempFile)
    //         //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
    //         //winlog.info(contractFile)
    //         ////const bytecode = contractFile.evm.bytecode.object;
    //         const abi = contractFile.abi;
    //         const incrementer = new web3.eth.Contract(abi, contractAddress);
    //         var finalarray = [[req.body.userid, req.body.PaymentType, JSON.stringify(req.body.AccountDetails)]];
    //         winlog.info(finalarray)
    //         const encoded = incrementer.methods.createUserBankAccountOffChain(finalarray).encodeABI();
    //         let errcount = 0;
    //         const increment = async () => {
    //             winlog.info(
    //                 `Calling the CreateUserBankAccount function in payment settings contract at address ${contractAddress}`
    //             );
    //             try {
    //                 const createTransaction = await web3.eth.accounts.signTransaction(
    //                     {
    //                         from: address,
    //                         to: contractAddress,
    //                         data: encoded,
    //                         gasLimit: 6000000,
    //                         chainId: "101122"
    //                     },
    //                     privKey
    //                 ); const createReceipt = await web3.eth.sendSignedTransaction(
    //                     createTransaction.rawTransaction
    //                 );
    //                 winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
    //                 res.send({
    //                     "success": true,
    //                     "message": "Bank details save success"
    //                 })
    //             } catch (e) {
    //                 errcount++;
    //                 if (errcount <= 3) {
    //                     winlog.info("error occ" + e);
    //                     increment();
    //                 } else {
    //                     var r = { "message": e.message }
    //                     res.status(500).send(r);
    //                 }
    //             }

    //         }; increment();

    //     })
    // },
    GetOffChainDetails: function (req, res) {
        if (!req.query.userid) {
            res.send({ token: -1 });
        } else {
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
                    .getBankDetailsByUserIdOffChain(req.query.userid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                var response = { "result": JSON.stringify(data) };
                winlog.info(response)
                var finalresponse = JSON.parse(response.result);
                var key = ["userid", "paymenttype", "accountdetails","UserAccAddress"];

                if (finalresponse.length > 0) {
                    var json = {}
                    for (var i = 0; i < finalresponse.length; ++i) {
                        json[key[i]] = finalresponse[i];
                    }
                    res.send(json);
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
    }
    }
}
module.exports = PaymentSettingoffchain