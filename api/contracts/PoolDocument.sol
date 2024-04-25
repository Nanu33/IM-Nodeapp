// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PoolDocument is AccessControl, Initializable {
    //inputs
    // 1)documentid 2)poolid 3)name 4)description 
    // 5)hash 6)issuerid
    event uniqueId(string[] id);
    mapping(string => string) map1; //pool id --> doc id
    mapping(string => string[]) map; // doc id --> all datas
    mapping(string => bool) map2; // uid --> true / false --> to test if unique id is present
    string[] docIdArray;

    function addDocuments(string[][] memory values) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an invoker"
        );
        uint256 i;
        uint256 j;
        string[] memory id = new string[](values.length);
      
        for (i = 0; i < values.length; i++) {
            if(map2[values[i][0]] == false) {
                map1[values[i][1]] = values[i][0];
                map[values[i][0]] = values[i]; // pushing all datas for unique id
                docIdArray.push(values[i][0]); 
                map2[values[i][0]]= true;
            }
            else{
                id[j] = (values[i][0]); 
                j++;
            }
        }
         emit uniqueId(id);
    }

    function updateDocument(string[][] memory values) public {
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
                map1[values[i][1]] = values[i][0]; // poolId  --> uid
            }
            else{
                id[j] = (values[i][0]); 
                j++;
            }
        }
        emit uniqueId(id);
    }

    function getDocumentByDocumentId(string calldata docId)
        public
        view
        returns (string[] memory)
    {
        string[] memory data = map[docId];
        return data;
    }

    function getAllDocumentsBypoolId(string calldata poolId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory docList = new string[][](docIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < docIdArray.length; h++) {
            string[] memory temp = map[docIdArray[h]];
            if (temp.length >= 2) {
                if (
                    (keccak256(abi.encodePacked(poolId)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    docList[p] = map[docIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalDocumentList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalDocumentList[m] = docList[m];
        }
        return finalDocumentList;
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}

