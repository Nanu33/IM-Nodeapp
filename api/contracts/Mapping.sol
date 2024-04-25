// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Mapping is AccessControl, Initializable {
    //inputs
    //0)id  1.dealName 2)month 3)year 4)servicername 5)modifiedDate 6)MappingData
    event uniqueId(string[] id);
    mapping(string => string[]) map; // unique id --> all datas
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    string[] uniqueIdArray;

    function saveMapping(string[][] memory values) public {
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
        emit uniqueId(id);
    }
    function updateMapping(string[][] memory values) public {
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
    function getAllMapping() public view returns (string[][] memory) {
        string[][] memory finalMappingList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            finalMappingList[p] = map[uniqueIdArray[h]];
            p++;
        }
        return finalMappingList;
    }
    function getMappingByDealNameMonthYearAndServicerName(
        string calldata dealName,
        string calldata month,
        string calldata year,
        string calldata servicerName
    ) public view returns (string[][] memory) {
        string[][] memory mappingList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 5) {
                if (
                    (keccak256(abi.encodePacked(dealName)) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(month)) ==
                        keccak256(abi.encodePacked(temp[2]))) &&
                    (keccak256(abi.encodePacked(year)) ==
                        keccak256(abi.encodePacked(temp[3]))) &&
                    (keccak256(abi.encodePacked(servicerName)) ==
                        keccak256(abi.encodePacked(temp[4])))
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
    function getMappingByServicerName(string calldata servicerName)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory mappingList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 5) {
                if (
                    (keccak256(abi.encodePacked(servicerName)) ==
                        keccak256(abi.encodePacked(temp[4])))
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
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    

}