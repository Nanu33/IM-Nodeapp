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
const SDealOnboarding = require('./abi/DealOnboarding')
var EventEmitter = require("events").EventEmitter;
const contractAddress = SDealOnboarding.address; // deployed contract address( can be taken from remix or index.js)
const SPaymentSettings = require('./abi/PaymentSettings')
const SUserBankAccount = require('./abi/UserBankAccount')
var GetTransaction = {

    GetServicerTransactionDetails: function (req, res) {
        var getuseraccdetails = new EventEmitter();
        var payingagentaddress = ""
        var serviceraddress = ""
        if (!req.query.dealid) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            winlog.info("get deal details:::::::::::")

            const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "DealOnboarding"
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
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                try{
                const data = await incrementer.methods
                    .getDealByDealId(req.query.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info(finalresponse)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "colsingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach", "payingagentid", "approvestatus","paymentmode","commitORinvest"];
                winlog.info(`servicer id ${finalresponse[5]} payingagentid ${finalresponse[21]}`)
                getuseraccdetails.emit('getservicerCchain', finalresponse[5], finalresponse[21])
            } catch (e) {
                winlog.info("Error Occured" + e)
               
                var r = { "message": e.message }
                res.status(500).send(r);
            }
            }; get1();
        }

        getuseraccdetails.on('getservicerCchain', (servicerid, payingagentid) => {
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
                try{
                const data = await incrementer.methods
                    .getUserById(servicerid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info(finalresponse)
                winlog.info("servicer account address::::: " + finalresponse[4])
                serviceraddress = finalresponse[4]
                getuseraccdetails.emit('getPayingagentCchain', servicerid, payingagentid)
            } catch (e) {
                winlog.info("Error Occured" + e)
               
                var r = { "message": e.message }
                res.status(500).send(r);
            } 
            }; get1();

        })
        getuseraccdetails.on('getPayingagentCchain', (servicerid, payingagentid) => {
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
                try{
                const data = await incrementer.methods
                    .getUserById(payingagentid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info(finalresponse)
                winlog.info("payingagent account address::::: " + finalresponse[4])
                payingagentaddress = finalresponse[4]
                getuseraccdetails.emit('getVAN', servicerid)
            } catch (e) {
                winlog.info("Error Occured" + e)
               
                var r = { "message": e.message }
                res.status(500).send(r);
            }
            }; get1();

        })

        getuseraccdetails.on('getVAN', (servicerid) => {

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
                try{
                const data = await incrementer.methods
                    .getBankDetailsByUserId(servicerid)
                    .call({ from: address });

                var response = { "result": JSON.stringify(data) };
                winlog.info(response)
                var finalresponse = JSON.parse(response.result);
                var key = ["userid", "AccountDetails", "CircleTrackingId", "VAN"]
                if (finalresponse.length > 0) {
                    var json = {
                        "PayingagentCchain": payingagentaddress,
                        "ServicerCchain": serviceraddress,
                        "VAN": finalresponse[3]
                    }
                    res.send(json)

                    // res.send({
                    //     "trancheid": trancheid,
                    //     "Commitments": commitamount,
                    //     "TrackingRef": finalresponse[2]
                    // })
                } else {
                    var json = {
                        "PayingagentCchain": payingagentaddress,
                        "ServicerCchain": serviceraddress,
                        "VAN": ""
                    }
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

    USDCMint: function (req, res) {
        var USDCMintEmitter = new EventEmitter();

        const contractAddress = SPaymentSettings.address;

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
            winlog.info(`Making a call to payment settings contract at address ${contractAddress}`);
            try{
            const data = await incrementer.methods
                .getPaymentByUserId(req.body.servicerid)
                .call({ from: address });

            var response = { "result": JSON.stringify(data) };
            winlog.info(response)
            var finalresponse = JSON.parse(response.result);
            var key = ["userid", "PayInsViaCircle", "userWalletAdd", "subnetWalletAdd", "PayoutsViaCircle", "PayInPaymentType", "PayOutPaymentType"]
            if (finalresponse.length > 0) {
                USDCMintEmitter.emit('MintUSDC', finalresponse[2])

            } else {
                res.send({});
            }
        } catch (e) {
            errcount++;
            if (errcount <= 3) {
winlog.info("error occ"+e);                                          
                get1();
            } else {
                var r = { "message": e.message }
                res.status(500).send(r);
            }
        }
        };get1();

        USDCMintEmitter.on('MintUSDC', ( userwalletaddress) => {
            var uniqueid = uuidv4().toString();
            var postData = {
                source: { type: 'wallet', id: '1001039047' },
                destination: {
                    type: 'blockchain',
                    address: userwalletaddress,
                    chain: 'AVAX'
                },
                amount: { amount: req.body.amount, currency: 'USD' },
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

    GetPayingagentTransactionDetails: function (req, res) {
        var getuseraccdetails = new EventEmitter();
        var payingagentaddress = ""
        var investoraddress = ""
        if (!req.query.payingagentid || !req.query.investorid) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            winlog.info("get Investor c-chain address::::: ")
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
                try{
                const data = await incrementer.methods
                    .getUserById(req.query.investorid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info(finalresponse)
                winlog.info("investor account address::::: " + finalresponse[4])
                investoraddress = finalresponse[4]
                getuseraccdetails.emit('getPayingagentCchain')
            } catch (e) {
                winlog.info("Error Occured" + e)
               
                var r = { "message": e.message }
                res.status(500).send(r);
            }
            }; get1();

        }
        getuseraccdetails.on('getPayingagentCchain', () => {
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
                try{
                const data = await incrementer.methods
                    .getUserById(req.query.payingagentid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info(finalresponse)
                winlog.info("payingagent account address::::: " + finalresponse[4])
                payingagentaddress = finalresponse[4]

                var json = {
                    "PayingagentCchain": payingagentaddress,
                    "InvestorCchain": investoraddress,
                }
                res.send(json)
            } catch (e) {
                winlog.info("Error Occured" + e)
               
                var r = { "message": e.message }
                res.status(500).send(r);
            }
            }; get1();

        })


    }
}
module.exports = GetTransaction;