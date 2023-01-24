// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract Lottery is VRFConsumerBase, Ownable{

     //chainlink variables
     //amount of link to send with the request
     uint256 public fee;
     //ID of public key against which randomness is generated
     bytes32 public keyHash;
     //address of player
     address [] public players;
     uint8 maxPlayers;
     bool public gameStarted;
     uint256 entryFee;
     //current gameId
     uint256 public gameId;


/**
 * events
 */
event GameStarted(uint256 gameId,uint8 maxPlayers,uint256 entryFee);
event PlayerJoined(uint256 gameId,address player);
event GameEnded(uint256 gameId,address winner, bytes32 requestId);

   /**
   * constructor inherits a VRFConsumerBase and initiates the values for keyHash, fee and gameStarted
   * @param vrfCoordinator address of VRFCoordinator contract
   * @param linkToken address of LINK token contract
   * @param vrfFee the amount of LINK to send with the request
   * @param vrfKeyHash ID of public key against which randomness is generated
   */
    constructor( address vrfCoordinator,address linkToken,
    bytes32 vrfKeyHash,uint256 vrfFee ) VRFConsumerBase(vrfCoordinator,linkToken){
        keyHash=vrfKeyHash;
        fee=vrfFee;
        gameStarted=false;

    }

    //startsGame
    function startGame(uint8 _maxPlayers,uint256 _entryFee) public onlyOwner {
       require(gameStarted==false,"Go check Lottery is running");

       //empty the players array
       delete players;
       maxPlayers=_maxPlayers;
       gameStarted=true;
       entryFee=_entryFee;
       gameId+=1;

       emit GameStarted(gameId,maxPlayers,entryFee);

        
    }

   //joinGame by paying entry fees

   function joinGame() public payable{
    require((gameStarted) &&(msg.value==entryFee) &&(players.length<maxPlayers),"Please check if gameStarted ,you provioded amount eqaul to entry fee and lottery hasn't reached to max number of players");

    players.push(msg.sender);
    emit PlayerJoined(gameId,msg.sender);
    if(players.length==maxPlayers){
        getRandomWinner();
    }
   }
   /**
    * lets understanf process of getting random number 
    * so first our contact will call requestRandomness from the VRFConsumerBase
    * and then VRFConsumerBase  further call the VRFCoordinator contract which is responsible for getting 
    * the randomnesss back from the external world
    * AFter the VRFCoordinator has the Randomness it calls the fullFillRandomness function
    * with in the VRFConsumerBase which further select winner or random number
    */
      //FullfillRandomWords

function fulfillRandomness(bytes32 requestId,uint256 randomness)internal virtual override{
      uint256 winnerIndex=randomness%players.length;
      address winner=players[winnerIndex];
      (bool sent,)=winner.call{value:address(this).balance}("");
      require(sent,"Transaction of Ether failed");
      gameStarted=false;
      emit GameEnded(gameId,winner,requestId);
}

//getRandomWinner=start the process to find random number

function getRandomWinner() private returns(bytes32 requestId) {
     
     // LINK is an internal interface for Link token found within the VRFConsumerBase
        // Here we use the balanceOF method from that interface to make sure that our
        // contract has enough link so that we can request the VRFCoordinator for randomness
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        // Make a request to the VRF coordinator.
        // requestRandomness is a function within the VRFConsumerBase
        // it starts the process of randomness generation
        return requestRandomness(keyHash, fee);
}

   // Function to receive Ether. msg.data must be empty
receive ()external payable{}
    // Fallback function is called when msg.data is not empty

fallback() external payable{}





    
    
}