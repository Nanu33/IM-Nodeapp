// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract InvestmentAndCommitV2 is AccessControl, Initializable {
    //inputs
    //0)uniqueid 1)dealid 2)tranchename 3)trancheid 4)investorid 5)commitAmount 6)investAmount
    event uniqueId(string[] id);
    mapping(string => string[]) map; // uid --> all datas
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    string[] uniqueIdArray;

    function createInvestAndCommit(string[][] memory values) public {
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

    function updateInvestment(string[][] memory values) public {
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

    function getTrancheDetailsByInvestorIdAndDealId(
        string calldata investorId,
        string calldata dealId
    ) public view returns (string[][] memory) {
        string[][] memory trancheList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 5) {
                if (
                    (keccak256(abi.encodePacked(investorId)) ==
                        keccak256(abi.encodePacked(temp[4]))) &&
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    trancheList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalTrancheList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalTrancheList[m] = trancheList[m];
        }
        return finalTrancheList;
    }

    function getTrancheDetailsByTrancheIdAndInvestorId(
        string calldata trancheId,
        string calldata investorId
    ) public view returns (string[] memory) {
        string[] memory trancheList = new string[](1);
        //uint256 p=0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 5) {
                if (
                    (keccak256(abi.encodePacked(trancheId)) ==
                        keccak256(abi.encodePacked(temp[3]))) &&
                    (keccak256(abi.encodePacked(investorId)) ==
                        keccak256(abi.encodePacked(temp[4])))
                ) {
                    trancheList = temp;
                }
            }
        }
        return trancheList;
    }

    function getTrancheDetailsByInvestorId(string calldata investorId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory trancheList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 5) {
                if (
                    (keccak256(abi.encodePacked(investorId)) ==
                        keccak256(abi.encodePacked(temp[4])))
                ) {
                    trancheList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalTrancheList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalTrancheList[m] = trancheList[m];
        }
        return finalTrancheList;
    }

    function getTrancheByDealId(string calldata dealId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory trancheList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 2) {
                if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    trancheList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalTrancheList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalTrancheList[m] = trancheList[m];
        }
        return finalTrancheList;
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function getTranchesByArrayOfTrancheIds(string[] memory trancheId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory trancheList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 i = 0; i < trancheId.length; i++) {
             for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 2) {
                if (
                    (keccak256(abi.encodePacked(trancheId[i])) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    trancheList[p] = map[uniqueIdArray[h]];
                    p++;
                    }
             }
          }
        }
        string[][] memory finalTrancheList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalTrancheList[m] = trancheList[m];
        }
        return finalTrancheList;
    }
}
