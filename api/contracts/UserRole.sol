// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UserRole is AccessControl, Initializable {
    //inputs
    // 1) role id 2) role name
    //sample inputs for SaveArray
    // [["r1","originator"],["r2","investor"]]
    event uniqueId(string id);
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    mapping(string => string[]) map; // uid --> all datas
    string[] roleIdArray;

    function createUserRole(string[] memory values) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an invoker"
        );
        string memory id ;
        if(map1[values[0]] == false) {
        
            map[values[0]] = values; // pushing all datas for uid
           roleIdArray.push(values[0]);
           map1[values[0]] = true;
        }
        else {
           id = values[0]; 
        }
        emit uniqueId(id);
    }

    function updateUserRole(string[] memory values) public {
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

    function getAllUserRoles() public view returns (string[][] memory) {
        string[][] memory finalUserRolesList = new string[][](roleIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < roleIdArray.length; h++) {
            finalUserRolesList[p] = map[roleIdArray[h]];
            p++;
        }
        return finalUserRolesList;
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

}
