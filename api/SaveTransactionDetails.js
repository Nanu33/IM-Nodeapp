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
const SUserTransaction = require('./abi/UserTransaction')
var EventEmitter = require("events").EventEmitter;

var SaveTransaction = {

    SaveTransactionDetails: function (req, res) {
        const contractAddress = SUserTransaction.address;
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "UserTransaction.sol");
        const contractname = "UserTransaction";
        //const source = fs.readFileSync(contractPath, 'utf8');

        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};



        //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
        //winlog.info(tempFile)
        //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        //winlog.info(contractFile)
        ////const bytecode = contractFile.evm.bytecode.object;
        const abi = SUserTransaction.abi;
        const incrementer = new web3.eth.Contract(abi, contractAddress);
        let ts = Date.now();

        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();

        // prints date & time in YYYY-MM-DD format
        var currentdate = month + "-" + date + "-" + year;
        var finalarray = [[uuidv4().toString(), req.body.dealid, month.toString(), year.toString(), currentdate, req.body.senderid, req.body.receiverid, req.body.amountpaid, req.body.transactionHash, req.body.trancheid]];
        winlog.info(finalarray)
        let errcount = 0;
        const increment = async () => {
            winlog.info(
                `Calling the CreateUserTransaction function in  contract at address ${contractAddress}`
            );
            try {
                web3.eth.handleRevert = true
                const encoded = incrementer.methods.createUserTransaction(finalarray).encodeABI();
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
                res.send({ "success": true, "message": "Transaction save success" });
                }
            } catch (e) {
                errcount++;
                if (e.reason && e.reason.includes("Caller is not an invoker")) {
                    winlog.info(e.reason)
                    res.status(500).send(e.reason);
                  }
                   
               else if (errcount <= 3) {
winlog.info("error occ"+e);                                          
                    increment();
                } else {
                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            }
        }; increment();

    },
    GetAllTransactions: function (req, res) {

        const contractAddress = SUserTransaction.address

        const contractPath = path.join(process.cwd() + "/api/contracts/UserTransaction.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "UserTransaction";
        //const source = fs.readFileSync(contractPath, 'utf8');

        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};



        //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
        //winlog.info(tempFile)
        //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        //winlog.info(contractFile)
        //const bytecode = contractFile.evm.bytecode.object;
        const abi = SUserTransaction.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        const get1 = async () => {
            winlog.info(`Making a call to payment settings contract at address ${contractAddress}`);
            try {
                const data = await incrementer.methods
                    .getAllTransaction()
                    .call({ from: address });

                var response = { "result": JSON.stringify(data) };
                winlog.info(response)
                var finalresponse = JSON.parse(response.result);
                var key = ["uniqueid", "dealid", "month", "year", "amountpaiddate", "senderid", "receiverid", "amountpaid", "transactionhash", "trancheid"]
                var arr = [];
                for (var i = 0; i < finalresponse.length; ++i) {
                    var json = {};
                    for (var j = 0; j < key.length; ++j) {
                        json[key[j]] = finalresponse[i][j];
                    }
                    arr.push(json);

                }
                winlog.info(arr)
            } catch (e) {
                winlog.info("Error Occured" + e)

                var r = { "message": e.message }
                res.status(500).send(r);
            }
        }; get1();
    }
}
module.exports = SaveTransaction;