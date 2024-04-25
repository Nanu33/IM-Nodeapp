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
var CryptoJS = require("crypto-js");

const SDealTranche = require('./abi/DealTranche')
const SFT = require('./abi/FT')

var updatetranches = {

    updatetranchestatus: function (req, res) {
        if (!req.body.trancheid || !req.body.approvestatus) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var TrancheEmitter = new EventEmitter();
            var difference = 0;
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
            let errcount = 0;
            const get1 = async () => {
                winlog.info(`Making a call to InvestmentAndCommit contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getTrancheByTrancheId(req.body.trancheid)
                        .call({ from: address });
                    var response = { "result": JSON.stringify(data) };
                    var finalresponse = JSON.parse(response.result);
                    var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "closingdate", "currentcommitments", "availablecommitments", "approvestatus"];
                    winlog.info("before tranche save:::::::::::: " + JSON.stringify(finalresponse))
                    finalresponse[12] = req.body.approvestatus
                    winlog.info("after tranche save:::::::::::: " + JSON.stringify(finalresponse))
                    TrancheEmitter.emit('updatetranche', [finalresponse])
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


            TrancheEmitter.on('updatetranche', (tranchedetails) => {
                const contractAddress = SDealTranche.address
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

                let errcount = 0;
                const increment = async () => {

                    winlog.info(
                        `Calling the update function in  master tranche contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateTrancheArray(tranchedetails).encodeABI();
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
                        winlog.info("Tranche update status success")

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
                            res.send({ "success": true, "message": "tranche Update Status Success" });
                        }
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

        }
    },

    approveTranche: function (req, res) {
        if (!req.body.trancheid) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var TrancheEmitter = new EventEmitter();
            const contractAddress = SDealTranche.address

            const contractPath = path.join(process.cwd() + "/api/contracts/DealTranche.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "DealTranche";

            const abi = SDealTranche.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getTrancheByTrancheId(req.body.trancheid)
                        .call({ from: address });
                    var response = { "result": JSON.stringify(data) };
                    winlog.info(response)
                    var finalresponse = JSON.parse(response.result);
                    var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "currentcommitments", "availablecommitments"];
                    winlog.info(finalresponse)
                    //winlog.info(finalresponse[0] + " " + finalresponse[10] + " " + finalresponse[11])
                    if (finalresponse.length > 0) {
                        TrancheEmitter.emit('approvetranche', finalresponse)
                    } else {
                        res.send({ "success": false, "message": "ID doesnot exist" });

                    }
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            };
            get1();

            TrancheEmitter.on('approvetranche', (trancheresponse) => {
                //  const contractAddress = "0x9Ca6a061CB79E369da88446073F4d81171e42E89"
                const contractAddress = trancheresponse[8];// Contract Call
                winlog.info("\nownership details::: deployed address " + contractAddress + " issuer id: " + address)
                const abi = SFT.abi
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                var c1 = Math.pow(10, 6)
                var finaltotalsupply = c1 * (trancheresponse[4]);
                let errcount = 0;
                let counter =0
                try {
                    if (!req.file) {
                        winlog.info("inside privatekey")
                        var bytes = CryptoJS.AES.decrypt(req.body.privatekey, 'ALtReKQqUH1VTh43vNomog==');
                        var decryptedPrivkey = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                        var accountDetails = web3.eth.accounts.privateKeyToAccount(decryptedPrivkey);
                        winlog.info(accountDetails.address)
                        if(accountDetails.address.toLowerCase()!=req.body.issueraddress.toLowerCase()){
                            counter++;
                            res.status(201).send({
                                "success": false,
                                "message": "Please enter PrivateKey of "+req.body.issueraddress
                            })
                        }
                    } else {
                        winlog.info("inside file")
                        var filepath = fs.readFileSync(path.join(process.cwd() + "/tempfolder/" + req.file.filename), 'utf8');
                        //winlog.info(filepath)
                        var decryptedPrivkey1 = web3.eth.accounts.decrypt(filepath, req.body.password);
                        // winlog.info(decryptedPrivkey1)
                        decryptedPrivkey = decryptedPrivkey1.privateKey
                        //winlog.info(decryptedPrivkey)
                        var issueraccount = decryptedPrivkey1.address
                        winlog.info(issueraccount+" "+req.body.issueraddress.toLowerCase())
                        if(issueraccount.toLowerCase()!=req.body.issueraddress.toLowerCase()){
                            counter++;
                            res.status(201).send({
                                "success": false,
                                "message": "Please enter PrivateKey of "+req.body.issueraddress
                            })
                        }
                        fs.unlinkSync(path.join(process.cwd() +"/tempfolder/"+ req.file.filename))
                    }
                } catch (e) {
                    counter++;
                    res.status(201).send({
                        "success": false,
                        "message": e.message
                    })
                   
                }
                if(counter==0){
                const increment = async () => {
                    winlog.info(
                        `Calling the function in FT contract at address ${contractAddress}`
                    );
                    try {
                        const encoded = incrementer.methods.approve(address, finaltotalsupply).encodeABI();
                        const createTransaction = await web3.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: contractAddress,
                                data: encoded,
                                gasLimit: 312896,
                                chainId: "101122"
                            },
                            decryptedPrivkey
                        ); const createReceipt = await web3.eth.sendSignedTransaction(
                            createTransaction.rawTransaction
                        );

                        winlog.info(`transfer owership successfull with hash: ${createReceipt.transactionHash} for the contractaddress ${contractAddress}\n`);
                        TrancheEmitter.emit('changetranchestatus', trancheresponse)
                        // resolve("transfer owneship success")
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
            }
            });
        

            TrancheEmitter.on('changetranchestatus', (trancheresponse) => {
                trancheresponse[12] = "Approved"
                winlog.info(trancheresponse)
                const contractAddress = SDealTranche.address
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealTranche.sol");
                const contractname = "DealTranche";
                const abi = SDealTranche.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                let errcount = 0;
                const increment = async () => {

                    winlog.info(
                        `Calling the update function in  master tranche contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateTrancheArray([trancheresponse]).encodeABI();
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
                        winlog.info("Tranche update status success")

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
                            res.send({ "success": true, "message": "tranche approval Success" });
                        }
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

        }


    }
}
module.exports = updatetranches