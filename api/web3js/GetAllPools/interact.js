const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const winlog = require("../../../log/winstonlog")
const SCreatePool = require('./abi/CreatePool')
var query = {

    querygetallpools: function (contractaddress, contractname) {

        return new Promise((resolve, reject) => {
        const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
        //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
        const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");

        const contractAddress = contractaddress; // deployed contract address( can be taken from remix or index.js)
        const contractPath = path.join(process.cwd() + "/api/contracts/CreatePool.sol");
        winlog.info("contractpath:: " + contractPath);
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
        const abi = SCreatePool.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        const get1 = async () => {
            winlog.info(`Making a call to contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getAllPools()
                .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
            // winlog.info(`The current string is: ` + data);
            resolve({ "success": true, "result": JSON.stringify(data) })
        };

        get1();
    });
    }
}
module.exports = query;