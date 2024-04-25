// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract testV2 is AccessControl, Initializable {
    //inputs
    //0)uniqueid 1)dealid 2)month 3)year 4)investorid 5)trancheid
    //6)tranchename 7) dealname 8)begbal 9)intpaid 10)prinpaid
    //11)totalpaid 12)endbal 13)orgprinbal 14)cum_intpaid 15)cum_prinpaid 16)cumtotal 17)USDCtransferstatus
    event uniqueId(string[] id);
    mapping(string => string[]) map; // uid --> all datas
    mapping(string => bool) map1; // uid --> true / false --> to test if unique id is present
    string[] uniqueIdArray;

    function createMyInvestment(string[][] memory values) public {
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
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for uid
            uniqueIdArray.push(values[i][0]);
        }
    }

    function updateMyInvestment(string[][] memory values) public {
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

    function getTrancheByDealIdMonthYearAndInvestorId(
        string calldata dealId,
        string calldata month,
        string calldata year,
        string calldata investorId
    ) public view returns (string[][] memory) {
        string[][] memory investmentList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 5) {
                if (
                    (keccak256(abi.encodePacked(investorId)) ==
                        keccak256(abi.encodePacked(temp[4]))) &&
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(month)) ==
                        keccak256(abi.encodePacked(temp[2]))) &&
                    (keccak256(abi.encodePacked(year)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    investmentList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalInvestmentList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalInvestmentList[m] = investmentList[m];
        }
        return finalInvestmentList;
    }

    function getTrancheArrayByDealIdMonthYearAndInvestorId(
        string[] calldata dealArray,
        string[] calldata monthArray,
        string[] calldata yearArray,
        string calldata investorId
    ) public view returns (string[][] memory) {
        string[][] memory investmentList = new string[][](dealArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            for (uint256 i = 0; i < dealArray.length; i++) {
                if (temp.length >= 5) {
                    if (
                        (keccak256(abi.encodePacked(investorId)) ==
                            keccak256(abi.encodePacked(temp[4]))) &&
                        (keccak256(abi.encodePacked(dealArray[i])) ==
                            keccak256(abi.encodePacked(temp[1]))) &&
                        (keccak256(abi.encodePacked(monthArray[i])) ==
                            keccak256(abi.encodePacked(temp[2]))) &&
                        (keccak256(abi.encodePacked(yearArray[i])) ==
                            keccak256(abi.encodePacked(temp[3])))
                    ) {
                        investmentList[p] = map[uniqueIdArray[h]];
                        p++;
                    }
                }
            }
        }
        string[][] memory finalInvestmentList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalInvestmentList[m] = investmentList[m];
        }
        return finalInvestmentList;
    }

    function getByDealIdMonthYearInvestorIdAndTrancheId(
        string calldata dealId,
        string calldata month,
        string calldata year,
        string calldata investorId,
        string calldata trancheId
    ) public view returns (string[][] memory) {
        string[][] memory investmentList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 6) {
                if (
                    (keccak256(abi.encodePacked(investorId)) ==
                        keccak256(abi.encodePacked(temp[4]))) &&
                    (keccak256(abi.encodePacked(trancheId)) ==
                        keccak256(abi.encodePacked(temp[5]))) &&
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(month)) ==
                        keccak256(abi.encodePacked(temp[2]))) &&
                    (keccak256(abi.encodePacked(year)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    investmentList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalInvestmentList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalInvestmentList[m] = investmentList[m];
        }
        return finalInvestmentList;
    }

    function getTrancheByDealIdMonthAndYear(
        string calldata dealId,
        string calldata month,
        string calldata year
    ) public view returns (string[][] memory) {
        string[][] memory investmentList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 4) {
                if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(month)) ==
                        keccak256(abi.encodePacked(temp[2]))) &&
                    (keccak256(abi.encodePacked(year)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    investmentList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalInvestmentList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalInvestmentList[m] = investmentList[m];
        }
        return finalInvestmentList;
    }

    function getAllInvestments() public view returns (string[][] memory) {
        string[][] memory finalInvestmentList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            finalInvestmentList[p] = map[uniqueIdArray[h]];
            p++;
        }
        return finalInvestmentList;
    }
    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
