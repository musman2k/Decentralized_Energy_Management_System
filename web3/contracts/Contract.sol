// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./registerMeter.sol";
contract DEMS is registerMeter {
    
    struct EnergyData {
        uint256 productionTimestamp;
        uint256 unitsProduced;
        uint256 consumptionTimestamp;
        uint256 unitsConsumed;
    }

    struct DataPoint {
        uint256 timestamp;
        uint256 value;
    }

    event RequestFulfilled(
        bytes32 indexed requestId,
        uint256 indexed _unitsProduced
    );

    mapping(address => EnergyData) public energyData;
    DataPoint[] public productionDataPoints;
    DataPoint[] public consumptionDataPoints;


     function fulfillEnergyProductionData(bytes32 _requestId, uint256 _unitsProduced) public {
        emit RequestFulfilled(_requestId, _unitsProduced);
        energyData[msg.sender].unitsProduced = _unitsProduced;
        energyData[msg.sender].productionTimestamp = block.timestamp;

        productionDataPoints.push(DataPoint(block.timestamp, _unitsProduced));
    }


    function fulfillEnergyConsumptionData(bytes32 _requestId, uint256 _unitsConsumed) public {
        emit RequestFulfilled(_requestId, _unitsConsumed);
        energyData[msg.sender].unitsConsumed = _unitsConsumed;
        energyData[msg.sender].consumptionTimestamp = block.timestamp;

        consumptionDataPoints.push(DataPoint(block.timestamp, _unitsConsumed));
    }

    function getUserEnergyData(address _address) public view returns(uint256, uint256, uint256, uint256) {
        return (energyData[_address].productionTimestamp, energyData[_address].unitsProduced, energyData[_address].consumptionTimestamp, energyData[_address].unitsConsumed);
    }

    function getProductionDataPoints() public view returns (DataPoint[] memory) {
        return productionDataPoints;
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    function getConsumptionDataPoints() public view returns (DataPoint[] memory) {
        return consumptionDataPoints;
    }   

}