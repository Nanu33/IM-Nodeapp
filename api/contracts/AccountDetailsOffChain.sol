// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract AccountDetailsOffChain is AccessControl, Initializable {
   //inputs
   // uniqueid,dealid,accountname,beginningbalance,endingbalance,month,year,date,wirestatus,bankdetails
    event uniqueid(string[] id);
    mapping(string => string[]) map; // unique id --> all datas
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    string[] uniqueIdArray;


    function SaveAccountDetailsOffchain (string[][] memory values) public {
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
        emit uniqueid(id);
    }     
  
    function updateADetails(string[][] memory values) public {
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
        emit uniqueid(id);
    }	
    function getAccountsByuniqueidArrayOffChain(string[] calldata uniqueId)public view returns (string[][] memory) {
        string[][] memory account = new string[][](uniqueId.length);
        uint256 p=0;
        for (uint256 h = 0; h < uniqueId.length; h++) { 
            account[p] = map[uniqueId[h]];
            p++;
        }
        return account;
    }
    function getAccountsByuniqueidOffChain(string calldata uniqueId)public view returns (string[] memory) {
        return map[uniqueId];
    }

    function getAccountsByuniqueidArrayMonthYearOffChain(string[] calldata uniqueId,string calldata month,string calldata year)public view returns (string[][] memory) {
        string[][] memory account = new string[][](uniqueId.length);
        uint256 p=0;
        for (uint256 h = 0; h < uniqueId.length; h++) {
            string[] memory temp = map[uniqueId[h]];
            if (  
                (keccak256(abi.encodePacked(month)) ==
                        keccak256(abi.encodePacked(temp[5]))) && 
                        (keccak256(abi.encodePacked(year)) ==
                            keccak256(abi.encodePacked(temp[6])))
            )
            {
            account[p] = map[uniqueId[h]];
            p++;
           } 
        }
         string[][] memory finalaccount = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalaccount[m] = account[m];
        }
        
        return finalaccount;
}

    function getAccountsByDealIdOffChain(string calldata dealId) public view returns (string[][] memory) {
        string[][] memory account = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
             if (temp.length >= 9) {
                  if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    account[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalaccount = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalaccount[m] = account[m];
        }
        return finalaccount;
    }

    function getAccountsByDealIdMonthYearOffChain(
        string calldata dealId,
        string calldata month,
        string calldata year)
        public view returns (string[][] memory) {
        string[][] memory account = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 9) {
                   if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(month)) ==
                        keccak256(abi.encodePacked(temp[5]))) &&
                    (keccak256(abi.encodePacked(year)) ==
                        keccak256(abi.encodePacked(temp[6])))
                ) {

                   account[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalaccount = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalaccount[m] = account[m];
        }
        return finalaccount;
    }
 
    function getAccountsByDealIdAccountNameOffChain(string calldata dealid,string calldata accountname) public view returns (string[][] memory) {
        string[][] memory account = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
             if (temp.length >= 8) {

                 if (
                    (keccak256(abi.encodePacked(accountname)) ==
                        keccak256(abi.encodePacked(temp[2]))) &&
                    (keccak256(abi.encodePacked(dealid)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                 
                    account[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalaccount = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalaccount[m] = account[m];
        }
        return finalaccount;
    }
    
    function getAccountDetailsOffChainByDealIdAndAccountnameArray(
        string[] calldata accountname,
        string calldata dealid
    ) public view returns (string[][] memory) {
        string[][] memory finalaccount = new string[][](accountname.length);
        for (uint256 i = 0; i < accountname.length; i++) {
            for (uint256 j = 0; j < uniqueIdArray.length; j++) {
                string[] memory temp = map[uniqueIdArray[j]];
                if (temp.length >= 8) {
                    if (
                        (keccak256(abi.encodePacked(accountname[i])) ==
                            keccak256(abi.encodePacked(temp[2]))) &&
                        (keccak256(abi.encodePacked(dealid)) ==
                            keccak256(abi.encodePacked(temp[1])))
                    ) {
                        finalaccount[i] = map[uniqueIdArray[j]];
                    }
                }
            }
        }
        return finalaccount;
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
 }