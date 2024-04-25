// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UserBankAccount is AccessControl, Initializable {
    event uniqueId(string[] id);
    mapping(string => string[]) map; // userid --> all datas
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    string[] userIdArray;

    function createUserBankAccount(string[][] memory values) public {
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

    function updateUserBankAccount(string[][] memory values) public {
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

    function getBankDetailsByUserId(string calldata userId)
        public
        view
        returns (string[] memory)
    {
        return map[userId];
    }

    function getById(string calldata id) public view returns (string[][] memory) {
        string[][] memory bankAccountList = new string[][](userIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < userIdArray.length; h++) {
            string[] memory temp = map[userIdArray[h]];
            if (temp.length >= 3) {
                if (
                    (keccak256(abi.encodePacked(id)) ==
                        keccak256(abi.encodePacked(temp[2])))
                ) {
                    bankAccountList[p] = map[userIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalBankAccountList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalBankAccountList[m] = bankAccountList[m];
        }
        return finalBankAccountList;
    }

    function getByVan(string calldata van)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory bankAccountList = new string[][](userIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < userIdArray.length; h++) {
            string[] memory temp = map[userIdArray[h]];
            if (temp.length >= 4) {
                if (
                    (keccak256(abi.encodePacked(van)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    bankAccountList[p] = map[userIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalBankAccountList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalBankAccountList[m] = bankAccountList[m];
        }
        return finalBankAccountList;
    }

    function getByIdAndVan(string calldata id, string memory van)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory bankAccountList = new string[][](userIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < userIdArray.length; h++) {
            string[] memory temp = map[userIdArray[h]];
            if (temp.length >= 4) {
                if (
                    (keccak256(abi.encodePacked(id)) ==
                        keccak256(abi.encodePacked(temp[2]))) &&
                    (keccak256(abi.encodePacked(van)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    bankAccountList[p] = map[userIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalBankAccountList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalBankAccountList[m] = bankAccountList[m];
        }
        return finalBankAccountList;
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
