//// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MasterFieldsV2 is AccessControl, Initializable {
    // inputs
    // 1) id 2) Data 3) AssetType 4) UpdatedTime
    event uniqueId(string[] id);

    mapping(string => string[]) map; // uid --> all datas
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    string[] uniqueIdArray;

    function saveDefinition(string[][] memory values) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an invoker"
        );
        uint256 i;
        uint256 j;
        string[] memory id = new string[](values.length);
        for (i = 0; i < values.length; i++) {
            if(map1[values[i][0]] == false) {
                map[values[i][0]] = values[i]; // pushing all datas for  Id
                uniqueIdArray.push(values[i][0]);
                map1[values[i][0]]= true;
           }
           else{
                id[j] = (values[i][0]); 
                j++;
             }
        }
        emit uniqueId(id);
    }

    function updateDefinition(string[][] memory values) public {
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
    function GetDefinitionByAssetType(string calldata assetType)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory mappingList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 3) {
                if (
                    (keccak256(abi.encodePacked(assetType)) ==
                        keccak256(abi.encodePacked(temp[2])))
                ) {
                    mappingList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalMappingList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalMappingList[m] = mappingList[m];
        }
        return finalMappingList;
    }
    function GetDefinitionByAssetTypeOffset(string calldata assetType, uint256 limit, uint256 offset)
        public
        view
        returns (string[][] memory, bool)
    {
        uint256 startIndex = offset;
        uint256 endIndex = offset + limit > uniqueIdArray.length ? uniqueIdArray.length : offset + limit;

        string[][] memory mappingList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = startIndex; h < endIndex; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 3) {
                if (
                    (keccak256(abi.encodePacked(assetType)) ==
                        keccak256(abi.encodePacked(temp[2])))
                ) {
                    mappingList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
       bool endOfData =  offset + limit > uniqueIdArray.length;
        string[][] memory finalMappingList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalMappingList[m] = mappingList[m];
        }
        return (finalMappingList,endOfData);
    }

    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
