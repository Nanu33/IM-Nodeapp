// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract LoanProcessStatusV2 is AccessControl, Initializable {
    //inputs
    //1)Id 2)DealName 3)Month 4)Year 5)ServicerId
    //6)Status 7)ModifiedDate 8)SummaryData
    event uniqueId(string[] id);
    mapping(string => string[]) map; //  Id --> all datas
    mapping(string => bool) map1; // Id --> true / false --> to test if unique id is present
    string[] uniqueIdArray;

    function saveLoanData (string[][] memory values) public {
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

    function updateLoanData(string[][] memory values) public {
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

     function getDataByDealNameMonthYearServicerId(
        string calldata dealName,
        string calldata month,
        string calldata year,
        string calldata servicerId
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
                    (keccak256(abi.encodePacked(servicerId)) ==
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
     function getStatusandModifieddateByDealNameMonthYearListAndServicerId(
    string[] memory dealNameArray,
    string[] memory monthArray,
    string[] memory yearArray,
    string memory servicerId
) public view returns (string[][] memory) {
    uint256 p = 0;
    string[][] memory MappingList = new string[][](uniqueIdArray.length);
    for (uint256 i = 0; i < dealNameArray.length; i++) {
        for (uint256 j = 0; j < uniqueIdArray.length; j++) {
            string[] memory temp = map[uniqueIdArray[j]];
            if (temp.length >= 5) {
                if (
                     
                    (keccak256(abi.encodePacked(dealNameArray[i])) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(monthArray[i])) ==
                        keccak256(abi.encodePacked(temp[2]))) &&
                    (keccak256(abi.encodePacked(yearArray[i])) ==
                        keccak256(abi.encodePacked(temp[3]))) &&
                    (keccak256(abi.encodePacked(servicerId)) ==
                        keccak256(abi.encodePacked(temp[4])))    
                        
                ) {
                    MappingList[p] = map[uniqueIdArray[j]];
                    p++;
                }
            }
        }    
    }
    string[][] memory finalMappingList = new string[][](p);
    for (uint256 m = 0; m < p; m++) {
        finalMappingList[m] = MappingList[m];
    }
    return finalMappingList;
}


     function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
}