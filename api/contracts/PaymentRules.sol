// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PaymentRules is AccessControl, Initializable {
    //inputs
    // 1)uniqueID 2)dealId 3)underwriterId 4)paymentRule 5)amount paid 6)month 7)year
    event uniqueId(string[] id);
    mapping(string => string) map1; //deal id --> u id
    mapping(string => string[]) map; // uid --> all datas
    mapping(string => bool) map2; // uid --> true / false --> to test if unique id is present
    string[] uniqueIdArray;

    function createPaymentRule(string[][] memory values) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an invoker"
        );
        uint256 i;
        uint256 j;
        string[] memory id = new string[](values.length);
      
        for (i = 0; i < values.length; i++) {
            if(map2[values[i][0]] == false) {
                map1[values[i][1]] = values[i][0]; // dealid  --> uid
                map[values[i][0]] = values[i]; // pushing all datas for unique id
                uniqueIdArray.push(values[i][0]); 
                map2[values[i][0]]= true;
            }
            else{
                id[j] = (values[i][0]); 
                j++;
            }
        }
        emit uniqueId(id);
    }

    function updatePaymentRule(string[][] memory values) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an invoker"
        );
        uint256 i;
        uint256 j;
        string[] memory id = new string[](values.length);
      
        for (i = 0; i < values.length; i++) {
            if(map2[values[i][0]] == true) {
                map[values[i][0]] = values[i]; // pushing all datas for unique id
                map1[values[i][1]] = values[i][0]; // dealid  --> uid
            }
            else{
                id[j] = (values[i][0]); 
                j++;
            }
        }
        emit uniqueId(id);
    }

    function getPaymentRulesByDealIdMonthAndYear(
        string calldata dealId,
        string calldata month,
        string calldata year
    ) public view returns (string[][] memory) {
        string[][] memory paymentRulesList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 7) {
                if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(month)) ==
                        keccak256(abi.encodePacked(temp[5]))) &&
                    (keccak256(abi.encodePacked(year)) ==
                        keccak256(abi.encodePacked(temp[6])))
                ) {
                    paymentRulesList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalPaymentRulesList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalPaymentRulesList[m] = paymentRulesList[m];
        }
        return finalPaymentRulesList;
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
