const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const { EventEmitter } = require('stream');
const { UUID } = require('bson');
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
//const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc")
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6'; //replcae
const { v4: uuidv4 } = require('uuid');
const winlog = require("../log/winstonlog");

var commitments = {
    Sendmessage: function (req, res) {
        if (!req.body.investoraddress || !req.body.issueraddress || !req.body.tokenaddress || !req.body.amount || !req.body.txhash || !req.body.status) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var TrancheEmitter = new EventEmitter();
            const contractAddress = '0x96D88566345e5cC96f75F2402fE3716D188f18B0';
            const contractname = "IMExample";

            //winlog.info(tempFile)
            //winlog.info(contractFile)
            ////const bytecode = contractFile.evm.bytecode.object;
            winlog.info("SD")
            winlog.info(req.body)
            const abi = [
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_lzEndpoint",
                            "type": "address"
                        },
                        {
                            "internalType": "contract IERC20",
                            "name": "_stablecoin",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": false,
                            "internalType": "uint16",
                            "name": "_srcChainId",
                            "type": "uint16"
                        },
                        {
                            "indexed": false,
                            "internalType": "bytes",
                            "name": "_srcAddress",
                            "type": "bytes"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint64",
                            "name": "_nonce",
                            "type": "uint64"
                        },
                        {
                            "indexed": false,
                            "internalType": "bytes",
                            "name": "_payload",
                            "type": "bytes"
                        }
                    ],
                    "name": "MessageFailed",
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
                            "indexed": false,
                            "internalType": "uint16",
                            "name": "_dstChainId",
                            "type": "uint16"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "_type",
                            "type": "uint256"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "_dstGasAmount",
                            "type": "uint256"
                        }
                    ],
                    "name": "SetMinDstGasLookup",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": false,
                            "internalType": "uint16",
                            "name": "_srcChainId",
                            "type": "uint16"
                        },
                        {
                            "indexed": false,
                            "internalType": "bytes",
                            "name": "_srcAddress",
                            "type": "bytes"
                        }
                    ],
                    "name": "SetTrustedRemote",
                    "type": "event"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "",
                            "type": "uint16"
                        },
                        {
                            "internalType": "bytes",
                            "name": "",
                            "type": "bytes"
                        },
                        {
                            "internalType": "uint64",
                            "name": "",
                            "type": "uint64"
                        }
                    ],
                    "name": "failedMessages",
                    "outputs": [
                        {
                            "internalType": "bytes32",
                            "name": "",
                            "type": "bytes32"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "_srcChainId",
                            "type": "uint16"
                        },
                        {
                            "internalType": "bytes",
                            "name": "_srcAddress",
                            "type": "bytes"
                        }
                    ],
                    "name": "forceResumeReceive",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "_version",
                            "type": "uint16"
                        },
                        {
                            "internalType": "uint16",
                            "name": "_chainId",
                            "type": "uint16"
                        },
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_configType",
                            "type": "uint256"
                        }
                    ],
                    "name": "getConfig",
                    "outputs": [
                        {
                            "internalType": "bytes",
                            "name": "",
                            "type": "bytes"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "_srcChainId",
                            "type": "uint16"
                        },
                        {
                            "internalType": "bytes",
                            "name": "_srcAddress",
                            "type": "bytes"
                        }
                    ],
                    "name": "isTrustedRemote",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "lzEndpoint",
                    "outputs": [
                        {
                            "internalType": "contract ILayerZeroEndpoint",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "_srcChainId",
                            "type": "uint16"
                        },
                        {
                            "internalType": "bytes",
                            "name": "_srcAddress",
                            "type": "bytes"
                        },
                        {
                            "internalType": "uint64",
                            "name": "_nonce",
                            "type": "uint64"
                        },
                        {
                            "internalType": "bytes",
                            "name": "_payload",
                            "type": "bytes"
                        }
                    ],
                    "name": "lzReceive",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "",
                            "type": "uint16"
                        },
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "name": "minDstGasLookup",
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
                            "internalType": "uint16",
                            "name": "_srcChainId",
                            "type": "uint16"
                        },
                        {
                            "internalType": "bytes",
                            "name": "_srcAddress",
                            "type": "bytes"
                        },
                        {
                            "internalType": "uint64",
                            "name": "_nonce",
                            "type": "uint64"
                        },
                        {
                            "internalType": "bytes",
                            "name": "_payload",
                            "type": "bytes"
                        }
                    ],
                    "name": "nonblockingLzReceive",
                    "outputs": [],
                    "stateMutability": "nonpayable",
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
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "_srcChainId",
                            "type": "uint16"
                        },
                        {
                            "internalType": "bytes",
                            "name": "_srcAddress",
                            "type": "bytes"
                        },
                        {
                            "internalType": "uint64",
                            "name": "_nonce",
                            "type": "uint64"
                        },
                        {
                            "internalType": "bytes",
                            "name": "_payload",
                            "type": "bytes"
                        }
                    ],
                    "name": "retryMessage",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "_dstChainId",
                            "type": "uint16"
                        },
                        {
                            "internalType": "address",
                            "name": "_investor",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_issuer",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_token",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_amount",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bytes32",
                            "name": "_txHash",
                            "type": "bytes32"
                        },
                        {
                            "internalType": "bool",
                            "name": "_status",
                            "type": "bool"
                        }
                    ],
                    "name": "sendMessage",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "_version",
                            "type": "uint16"
                        },
                        {
                            "internalType": "uint16",
                            "name": "_chainId",
                            "type": "uint16"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_configType",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bytes",
                            "name": "_config",
                            "type": "bytes"
                        }
                    ],
                    "name": "setConfig",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "_dstChainId",
                            "type": "uint16"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_type",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_dstGasAmount",
                            "type": "uint256"
                        }
                    ],
                    "name": "setMinDstGasLookup",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "_version",
                            "type": "uint16"
                        }
                    ],
                    "name": "setReceiveVersion",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "_version",
                            "type": "uint16"
                        }
                    ],
                    "name": "setSendVersion",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "_srcChainId",
                            "type": "uint16"
                        },
                        {
                            "internalType": "bytes",
                            "name": "_srcAddress",
                            "type": "bytes"
                        }
                    ],
                    "name": "setTrustedRemote",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "token",
                    "outputs": [
                        {
                            "internalType": "contract IERC20",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
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
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint16",
                            "name": "",
                            "type": "uint16"
                        }
                    ],
                    "name": "trustedRemoteLookup",
                    "outputs": [
                        {
                            "internalType": "bytes",
                            "name": "",
                            "type": "bytes"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ]
            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const encoded = incrementer.methods.sendMessage(10152, req.body.investoraddress, req.body.issueraddress,
                req.body.tokenaddress, req.body.amount, req.body.txhash, req.body.status).encodeABI();
            let errcount = 0;
            const increment = async () => {

                winlog.info(
                    `Calling the function in layerzero contract at address ${contractAddress}`
                );
                try {
                    const createTransaction = await web3.eth.accounts.signTransaction(
                        {
                            from: address,
                            to: contractAddress,
                            data: encoded,
                            gasLimit: 6000000,
                            chainId: "43113",
                            value: "1000000000000000000"
                        },
                        privKey
                    ); const createReceipt = await web3.eth.sendSignedTransaction(
                        createTransaction.rawTransaction
                    );
                    winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                    // winlog.info("Tranche commit save success")
                    winlog.info(createReceipt)
                    res.send({ "success": true, "message": "Token transfer sucess" });
                    // resolve("pool update success")
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
    }
}

module.exports = commitments;