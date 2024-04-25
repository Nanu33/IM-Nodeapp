// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UserTransaction is AccessControl, Initializable {
    //inputs
    // 1)uniqueid 2)dealid 3)month 4)year 5)amountpaiddate 6)senderid 7)receiverid
    //8)amountpaid 9)transactionhash 10)trancheid
    event uniqueId(string[] id);
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    mapping(string => string[]) map; // uid --> all datas
    string[] uniqueIdArray;

    function createUserTransaction(string[][] memory values) public {
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

    function getTransactionByMonthAndYear(
        string calldata month,
        string calldata year
    ) public view returns (string[][] memory) {
        string[][] memory userTransactionList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 4) {
                if (
                    (keccak256(abi.encodePacked(month)) ==
                        keccak256(abi.encodePacked(temp[2]))) &&
                    (keccak256(abi.encodePacked(year)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    userTransactionList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalUserTransactionList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalUserTransactionList[m] = userTransactionList[m];
        }
        return finalUserTransactionList;
    }

    function getTransactionBySenderId(string calldata senderId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory userTransactionList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 6) {
                if (
                    (keccak256(abi.encodePacked(senderId)) ==
                        keccak256(abi.encodePacked(temp[5])))
                ) {
                    userTransactionList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalUserTransactionList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalUserTransactionList[m] = userTransactionList[m];
        }
        return finalUserTransactionList;
    }

    function getTransactionByReceiverId(string calldata receiverId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory userTransactionList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 7) {
                if (
                    (keccak256(abi.encodePacked(receiverId)) ==
                        keccak256(abi.encodePacked(temp[6])))
                ) {
                    userTransactionList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalUserTransactionList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalUserTransactionList[m] = userTransactionList[m];
        }
        return finalUserTransactionList;
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
