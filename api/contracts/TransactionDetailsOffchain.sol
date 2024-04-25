// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract TransactionDetailsOffchain is AccessControl, Initializable {
    //inputs
  //1)"uniqueid" 2)"dealid", 3)"paymenttype", 4)"account",5) "description", 6)"date", 7)"amount",8) "status",9) "senderid"] 10)trancheid
    event uniqueid(string[] id);
    mapping(string => string[]) map; // unique id --> all datas
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    string[] uniqueIdArray;

    function saveTransactionDetailsOffchain (string[][] memory values) public {
    	require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an invoker"
        );
        uint256 i;
        uint256 j;
        string[] memory id = new string[](values.length);
        for (i = 0; i < values.length; i++) {
            if(map1[values[i][0]] == false) {
                map[values[i][0]] = values[i]; // pushing all datas for unique id
                uniqueIdArray.push(values[i][0]);
                map1[values[i][0]]= true;
           }
           else{
                id[j] = (values[i][0]); 
                j++;
             }
        }
        emit uniqueid(id);
    }     
     function updateTransactionDetails(string[][] memory values) public {
     	require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an invoker"
        );
        uint256 i;
        uint256 j;
        string[] memory id = new string[](values.length);
        
        for (i = 0; i < values.length; i++) {
        	 if(map1[values[i][0]] == true) {
                map[values[i][0]] = values[i]; // pushing all datas for unique id
            }
            else{
                id[j] = (values[i][0]); 
                j++;
            }
        }
        emit uniqueid(id);
    }	

    function getTransactionBySenderIdOffChain(string calldata senderId) public view returns (string[][] memory) {
        string[][] memory transaction = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
             if (temp.length >= 8) {
                  if (
                    (keccak256(abi.encodePacked(senderId)) ==
                        keccak256(abi.encodePacked(temp[8])))
                ) {
                    transaction[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finaltransaction = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finaltransaction[m] = transaction[m];
        }
        return finaltransaction;
    }
    function getTransactionByReceiverIdOffChain(string calldata receiverId) public view returns (string[][] memory) {
        string[][] memory transaction = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
             if (temp.length >= 9) {
                  if (
                    (keccak256(abi.encodePacked(receiverId)) ==
                        keccak256(abi.encodePacked(temp[9])))
                ) {
                    transaction[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finaltransaction = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finaltransaction[m] = transaction[m];
        }
        return finaltransaction;
    }
    function getTransactionByDealIdOffChain(string calldata dealId) public view returns (string[][] memory) {
        string[][] memory transaction = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
             if (temp.length >= 8) {
                  if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    transaction[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finaltransaction = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finaltransaction[m] = transaction[m];
        }
        return finaltransaction;
    }
    function getTransactionByuniqueidOffChain(string calldata uniqueId)public view returns (string[] memory)
    {
        return map[uniqueId];
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
}