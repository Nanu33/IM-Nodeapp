const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const winlog = require("../../log/winstonlog");

// const privKey = '019886410e17e601e1993470823b4104fddd6bfa71db80f6446760e5025e5163';  //replcae
// const address = '0xEda08e33E2ED957D1C2a611435ED355D8B603B96';
//const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
var transact = {

    transfer: async function (req,res) {

        return new Promise((resolve, reject) => {
            const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
            const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
            
            const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
            
            const contractAddress = '0xA87a6D589A7B8B003D1B9A281f02CC3b9a0Db28A';// Contract Call
            
            
            
            const  abi = [
               {
                 "inputs": [
                   {
                     "internalType": "string",
                     "name": "name",
                     "type": "string"
                   },
                   {
                     "internalType": "string",
                     "name": "symbol",
                     "type": "string"
                   },
                   {
                     "internalType": "uint256",
                     "name": "initialSupply",
                     "type": "uint256"
                   }
                 ],
                 "stateMutability": "nonpayable",
                 "type": "constructor"
               },
               {
                 "anonymous": false,
                 "inputs": [
                   {
                     "indexed": true,
                     "internalType": "address",
                     "name": "owner",
                     "type": "address"
                   },
                   {
                     "indexed": true,
                     "internalType": "address",
                     "name": "spender",
                     "type": "address"
                   },
                   {
                     "indexed": false,
                     "internalType": "uint256",
                     "name": "value",
                     "type": "uint256"
                   }
                 ],
                 "name": "Approval",
                 "type": "event"
               },
               {
                 "anonymous": false,
                 "inputs": [
                   {
                     "indexed": true,
                     "internalType": "address",
                     "name": "previousOwner",
                     "type": "address"
                   },
                   {
                     "indexed": true,
                     "internalType": "address",
                     "name": "newOwner",
                     "type": "address"
                   }
                 ],
                 "name": "OwnershipTransferred",
                 "type": "event"
               },
               {
                 "anonymous": false,
                 "inputs": [
                   {
                     "indexed": true,
                     "internalType": "address",
                     "name": "from",
                     "type": "address"
                   },
                   {
                     "indexed": true,
                     "internalType": "address",
                     "name": "to",
                     "type": "address"
                   },
                   {
                     "indexed": false,
                     "internalType": "uint256",
                     "name": "value",
                     "type": "uint256"
                   }
                 ],
                 "name": "Transfer",
                 "type": "event"
               },
               {
                 "inputs": [
                   {
                     "internalType": "address",
                     "name": "owner",
                     "type": "address"
                   },
                   {
                     "internalType": "address",
                     "name": "spender",
                     "type": "address"
                   }
                 ],
                 "name": "allowance",
                 "outputs": [
                   {
                     "internalType": "uint256",
                     "name": "",
                     "type": "uint256"
                   }
                 ],
                 "stateMutability": "view",
                 "type": "function"
               },
               {
                 "inputs": [
                   {
                     "internalType": "address",
                     "name": "spender",
                     "type": "address"
                   },
                   {
                     "internalType": "uint256",
                     "name": "amount",
                     "type": "uint256"
                   }
                 ],
                 "name": "approve",
                 "outputs": [
                   {
                     "internalType": "bool",
                     "name": "",
                     "type": "bool"
                   }
                 ],
                 "stateMutability": "nonpayable",
                 "type": "function"
               },
               {
                 "inputs": [
                   {
                     "internalType": "address",
                     "name": "account",
                     "type": "address"
                   }
                 ],
                 "name": "balanceOf",
                 "outputs": [
                   {
                     "internalType": "uint256",
                     "name": "",
                     "type": "uint256"
                   }
                 ],
                 "stateMutability": "view",
                 "type": "function"
               },
               {
                 "inputs": [],
                 "name": "decimals",
                 "outputs": [
                   {
                     "internalType": "uint8",
                     "name": "",
                     "type": "uint8"
                   }
                 ],
                 "stateMutability": "view",
                 "type": "function"
               },
               {
                 "inputs": [
                   {
                     "internalType": "address",
                     "name": "spender",
                     "type": "address"
                   },
                   {
                     "internalType": "uint256",
                     "name": "subtractedValue",
                     "type": "uint256"
                   }
                 ],
                 "name": "decreaseAllowance",
                 "outputs": [
                   {
                     "internalType": "bool",
                     "name": "",
                     "type": "bool"
                   }
                 ],
                 "stateMutability": "nonpayable",
                 "type": "function"
               },
               {
                 "inputs": [
                   {
                     "internalType": "address",
                     "name": "spender",
                     "type": "address"
                   },
                   {
                     "internalType": "uint256",
                     "name": "addedValue",
                     "type": "uint256"
                   }
                 ],
                 "name": "increaseAllowance",
                 "outputs": [
                   {
                     "internalType": "bool",
                     "name": "",
                     "type": "bool"
                   }
                 ],
                 "stateMutability": "nonpayable",
                 "type": "function"
               },
               {
                 "inputs": [],
                 "name": "name",
                 "outputs": [
                   {
                     "internalType": "string",
                     "name": "",
                     "type": "string"
                   }
                 ],
                 "stateMutability": "view",
                 "type": "function"
               },
               {
                 "inputs": [],
                 "name": "owner",
                 "outputs": [
                   {
                     "internalType": "address",
                     "name": "",
                     "type": "address"
                   }
                 ],
                 "stateMutability": "view",
                 "type": "function"
               },
               {
                 "inputs": [],
                 "name": "renounceOwnership",
                 "outputs": [],
                 "stateMutability": "nonpayable",
                 "type": "function"
               },
               {
                 "inputs": [],
                 "name": "symbol",
                 "outputs": [
                   {
                     "internalType": "string",
                     "name": "",
                     "type": "string"
                   }
                 ],
                 "stateMutability": "view",
                 "type": "function"
               },
               {
                 "inputs": [],
                 "name": "totalSupply",
                 "outputs": [
                   {
                     "internalType": "uint256",
                     "name": "",
                     "type": "uint256"
                   }
                 ],
                 "stateMutability": "view",
                 "type": "function"
               },
               {
                 "inputs": [
                   {
                     "internalType": "address",
                     "name": "to",
                     "type": "address"
                   },
                   {
                     "internalType": "uint256",
                     "name": "amount",
                     "type": "uint256"
                   }
                 ],
                 "name": "transfer",
                 "outputs": [
                   {
                     "internalType": "bool",
                     "name": "",
                     "type": "bool"
                   }
                 ],
                 "stateMutability": "nonpayable",
                 "type": "function"
               },
               {
                 "inputs": [
                   {
                     "internalType": "address",
                     "name": "from",
                     "type": "address"
                   },
                   {
                     "internalType": "address",
                     "name": "to",
                     "type": "address"
                   },
                   {
                     "internalType": "uint256",
                     "name": "amount",
                     "type": "uint256"
                   }
                 ],
                 "name": "transferFrom",
                 "outputs": [
                   {
                     "internalType": "bool",
                     "name": "",
                     "type": "bool"
                   }
                 ],
                 "stateMutability": "nonpayable",
                 "type": "function"
               },
               {
                 "inputs": [
                   {
                     "internalType": "address",
                     "name": "newOwner",
                     "type": "address"
                   }
                 ],
                 "name": "transferOwnership",
                 "outputs": [],
                 "stateMutability": "nonpayable",
                 "type": "function"
               }
             ]
            const incrementer = new web3.eth.Contract(abi, contractAddress);
            
            const encoded = incrementer.methods.transfer(req.body.address,1000000).encodeABI();
            const increment = async () => {
               winlog.info(
                  `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
               );
               const createTransaction = await web3.eth.accounts.signTransaction(
                  {
                     from: address,
                     to: contractAddress,
                     data: encoded,
                     gasLimit: 60000,
                     chainId:"101122"
                  },
                  privKey
               );const createReceipt = await web3.eth.sendSignedTransaction(
                  createTransaction.rawTransaction
               );
               winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
               res.send({"success":"true"});
            };increment();
        });
    }
}
module.exports = transact;