// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PaymentSettings is AccessControl, Initializable {
    //inputs
    // 1)userid 2)PayInsViaCircle 3)userWalletAdd 4)subnetWalletAdd 5)PayoutsViaCircle 6)PayInPaymentType 7)PayOutPaymentType
    event uniqueId(string[] id);
    mapping(string => string[]) map; // user id --> all datas
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    string[] userIdArray;

    function savePaymentSettings(string[][] memory values) public {
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
                userIdArray.push(values[i][0]); 
                map1[values[i][0]]= true;
            }
            else{
                id[j] = (values[i][0]); 
                j++;
            }
        }
        emit uniqueId(id);
    }

    function updatePaymentSettings(string[][] memory values) public {
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

    function getPaymentByUserId(string calldata userId)
        public
        view
        returns (string[] memory)
    {
        return map[userId];
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
