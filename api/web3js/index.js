const fs = require('fs');
const solc = require('solc');
const Web3 = require("web3");
const { get } = require('http');
var winlog = require("../../log/winstonlog");

// const path = require('../contracts')('./HelloWorld.sol');

var deployingcontract = {

    deploycontract: function (req, res, next) {

        return new Promise((resolve, reject) => {
            const contractPath = process.cwd() + "/api/contracts/" + req.body.contractname + ".sol";
            winlog.info("contractPath:: " + contractPath);
            // winlog.info("contractname:: " + contractname);
            // contractname = contractname + ".sol";
            //const source = fs.readFileSync(contractPath, 'utf8');

            // const input = {
            //     language: 'Solidity',
            //     sources: {
            //         [req.body.contractname + ".sol"]: {
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
          //  const contractFile = tempFile.contracts[req.body.contractname + ".sol"][req.body.contractname];
            //winlog.info(contractFile)

            //const bytecode = contractFile.evm.bytecode.object;
            const abi = contractFile.abi;

            const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
            const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';

            // const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");

            const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
            let errcount = 0;
            const deploy = async () => {

                winlog.info('Attempting to deploy from account:', address);
                // const accounts = await web3.eth.getAccounts();
                // winlog.info(accounts)
                //0x5323d470086D811fF6d6153bf9f35AF354C92Fde
                try {
                    const incrementer = new web3.eth.Contract(abi, address);

                    const incrementerTx = incrementer.deploy({
                        data: bytecode,
                        // arguments: ["hi hw r u"],
                    })
                    const createTransaction = await web3.eth.accounts.signTransaction({
                        from: address,
                        data: incrementerTx.encodeABI(),
                        gas: 3000000,
                        chainId: "101122"
                    },
                        privKey
                    )
                    const createReceipt = new web3.eth.sendSignedTransaction(createTransaction.rawTransaction).then((res) => {
                        winlog.info('Contract deployed at address', res.contractAddress);
                        setTimeout(function () {
                            winlog.info('Contract deployed at address', res.contractAddress);
                            resolve({ "success": true, "contractaddress": res.contractAddress })
                            // resolve({"isSuccess": true, "createReceipt": res.contractAddress});
                        }, 500);

                    });
                    // resolve({"createReceipt": createReceipt});
                } catch (e) {
                    errcount++;
                    if (errcount <= 3) {
winlog.info("error occ"+e);                                          
                        deploy();
                    } else {
                        var r = { "message": e.message }
                        res.status(500).send(r);
                    }
                }
            };

            deploy()
        });
    }
}
module.exports = deployingcontract;
//web3.eth.getBalance(address).then(winlog.info)
