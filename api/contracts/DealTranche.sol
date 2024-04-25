// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract DealTranche is AccessControl, Initializable {
    event uniqueId(string[] id);
    //"trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "closingdate", "currentcommitments", "availablecommitments", "approvestatus"
    mapping(string => string[]) map; // tranche id --> all datas
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    string[] trancheIdArray;

    function createTranche(string[][] memory values) public {
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
                trancheIdArray.push(values[i][0]); 
                map1[values[i][0]]= true;
             }
             else{
                id[j] = (values[i][0]); 
                j++;
             }
        }
        emit uniqueId(id);
    }

    function updateTrancheArray(string[][] memory values) public {
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
        emit uniqueId(id);
    }

    function getTrancheByTrancheId(string calldata trancheId)
        public
        view
        returns (string[] memory)
    {
        string[] memory data = map[trancheId];
        return data;
    }

    function getTranchesByArrayOfTrancheIds(string[] calldata trancheIds)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory trancheList = new string[][](trancheIds.length);
        uint256 p = 0;
        for (uint256 h = 0; h < trancheIds.length; h++) {
            trancheList[p] = map[trancheIds[h]];
            p++;
        }
        return trancheList;
    }
    

    function getTrancheByDealId(string calldata dealId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory trancheList = new string[][](trancheIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < trancheIdArray.length; h++) {
            string[] memory temp = map[trancheIdArray[h]];
            if (temp.length >= 2) {
                if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    trancheList[p] = map[trancheIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalTrancheList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalTrancheList[m] = trancheList[m];
        }
        return finalTrancheList;
    }
    function getTrancheByDealIdArray(string[] calldata dealId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory trancheList = new string[][](trancheIdArray.length);
        uint256 p = 0;
        for (uint256 i = 0; i < dealId.length; i++) {
             for (uint256 h = 0; h < trancheIdArray.length; h++) {
            string[] memory temp = map[trancheIdArray[h]];
            if (temp.length >= 2) {
                if (
                    (keccak256(abi.encodePacked(dealId[i])) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    trancheList[p] = map[trancheIdArray[h]];
                    p++;
                    }
             }
          }
        }
        string[][] memory finalTrancheList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalTrancheList[m] = trancheList[m];
        }
        return finalTrancheList;
    }
    
    
    
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}