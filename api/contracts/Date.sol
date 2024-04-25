// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Date is AccessControl, Initializable {
    //inputs
    //  1.dealid 2)prevpaymentdate 3)currentpaymentdate 4)nextpaymentdate 5)month 6)year 7)confirmation(yes/no)
    //8)assetclass
    event uniqueId(string[] id);
    mapping(string => string[]) map; // deal id --> all datas
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    string[] dealIdArray;

    function saveDate(string[][] memory values) public {
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
                dealIdArray.push(values[i][0]); 
                map1[values[i][0]]= true;
             }
             else{
                id[j] = (values[i][0]); 
                j++;
             }
        }
        emit uniqueId(id);
    }

    function updateDate(string memory dealId, string[] memory values) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an invoker"
        );
        string[] memory id = new string[](values.length);
        if(map1[dealId] == true) {
           map[dealId] = values; // pushing all datas for tranche id
        }
        else{
                id[0] = dealId; 
            }
        
        emit uniqueId(id);
    }    

    function getByDealId(string calldata dealId)
        public
        view
        returns (string[] memory)
    {
        string[] memory data = map[dealId];
        return data;
    }

    function getByArrayOfDealIds(string[] calldata dealIds)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory finalDatesList = new string[][](dealIds.length);
        uint256 p = 0;
        for (uint256 h = 0; h < dealIds.length; h++) {
            finalDatesList[p] = map[dealIds[h]];
            p++;
        }
        return finalDatesList;
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
