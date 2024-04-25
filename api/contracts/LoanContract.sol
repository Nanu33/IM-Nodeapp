// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract LoanContract is AccessControl, Initializable {
    //inputs
    //1)Deployed address 2)LoanID 3) PoolID 4)remaing loan details

    //mapping(string=>string)map1;  //loan id --> u id
    event uniqueId(string[] id);
    mapping(string => string[]) map; // uid --> all datas
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    string[] uniqueIdArray;

    function createLoansArray(string[][] memory values) public {
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

    function updateLoansArray(string[][] memory values) public {
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

    function getLoansByPoolId(string calldata poolId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory loanContractList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 3) {
                if (
                    (keccak256(abi.encodePacked(poolId)) ==
                        keccak256(abi.encodePacked(temp[2])))
                ) {
                    loanContractList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalLoanContractList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalLoanContractList[m] = loanContractList[m];
        }
        return finalLoanContractList;
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
