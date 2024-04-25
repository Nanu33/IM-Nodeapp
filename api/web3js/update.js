const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const winlog = require("../../log/winstonlog");
const SCreatePool = require('./abi/CreatePool')
// const privKey = '019886410e17e601e1993470823b4104fddd6bfa71db80f6446760e5025e5163';  //replcae
// const address = '0xEda08e33E2ED957D1C2a611435ED355D8B603B96';
//const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
var transact = {

    transaction: function (contractaddress, inputdata, contractname) {

        return new Promise((resolve, reject) => {
            const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
            const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';

            const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");

            const contractAddress = contractaddress;// Contract Call
            winlog.info("contractAddress:: " + contractaddress);
            winlog.info("inputdata:: " + inputdata);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + contractname + ".sol");
            //const source = fs.readFileSync(contractPath, 'utf8');

                        // const input = {language: 'Solidity',
            //     sources: {[contractname + ".sol"]: {content: source,},
            //     },settings: {outputSelection: {'*': {'*': ['*'],}, },},};


            //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //winlog.info(tempFile)
            //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //winlog.info(contractFile)

            //const bytecode = contractFile.evm.bytecode.object;
            const abi = SCreatePool.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const encoded = incrementer.methods.updatePool(inputdata).encodeABI();
            const increment = async () => {
                winlog.info(
                    `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
                );
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
                resolve({ "success": true, "result": "Data Saved!" })
                }
            }; increment();
        });
    }
}
module.exports = transact;