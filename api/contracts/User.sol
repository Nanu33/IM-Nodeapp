
// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UserV1 is AccessControl, Initializable {
    //inputs
    // 1)UserId 2)EmailAddress 3)UserHash 4)UserSatus 5)UserAccAddress 6) userRole 7)username 8)QIBdate 9)QIBAutorizedofficer 10)Compilancedate 11)Compilancetitle 12)KycVerifiedStatus 13)KycUploadStatus 14) termsofservice 15) Investortype 16)AccreditedInvestor 17)AttestationAutorizedofficer 18)Usertype
event uniqueId(string id);
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    mapping(string => string[]) map; // uid --> all datas
    string[] userIdArray;

    function saveUser(string[] memory values) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an invoker"
        );
        string memory id;
        if(map1[values[0]] == false) {

            map[values[0]] = values; // pushing all datas for uid
            userIdArray.push(values[0]);
            map1[values[0]] = true;
        }
        else {
             id = (values[0]); 
        }
       emit uniqueId(id);
    }

    function updateUser(string[] memory values) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an invoker"
        );
        string memory id;
        if(map1[values[0]] == true) {
            map[values[0]] = values; // pushing all datas for unique id
        }
        else{
                id = (values[0]); 
            }
        emit uniqueId(id);
    }
    

    function getAllUsers() public view returns (string[][] memory) {
        string[][] memory finalUsersList = new string[][](userIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < userIdArray.length; h++) {
            finalUsersList[p] = map[userIdArray[h]];
            p++;
        }
        return finalUsersList;
    }

    function getUserById(string calldata userID)
        public
        view
        returns (string[] memory)
    {
        string[] memory data = map[userID];
        return data;
    }

    function getUserByEmailAndStatus(
        string calldata emailID,
        string calldata status
    ) public view returns (string[][] memory) {
        string[][] memory userDetails = new string[][](userIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < userIdArray.length; h++) {
            string[] memory temp = map[userIdArray[h]];
            if (temp.length >= 4) {
                if (
                    (keccak256(abi.encodePacked(emailID)) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(status)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    userDetails[p] = map[userIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalUserDetails = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalUserDetails[m] = userDetails[m];
        }
        return finalUserDetails;
    }

    function getUserByEmailAndStatusAnduserRole(
        string calldata emailID,
        string calldata status,
        string calldata userRole

    ) public view returns (string[][] memory) {
        string[][] memory userDetails = new string[][](userIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < userIdArray.length; h++) {
            string[] memory temp = map[userIdArray[h]];
            if (temp.length >= 7) {
                if (
                    (keccak256(abi.encodePacked(emailID)) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(status)) ==
                        keccak256(abi.encodePacked(temp[3]))) && 
                    (keccak256(abi.encodePacked(userRole)) ==
                        keccak256(abi.encodePacked(temp[5])))    

                ) {
                    userDetails[p] = map[userIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalUserDetails = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalUserDetails[m] = userDetails[m];
        }
        return finalUserDetails;
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}