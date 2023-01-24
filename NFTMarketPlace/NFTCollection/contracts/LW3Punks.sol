// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";



contract  LW3Punks is ERC721Enumerable ,Ownable{

    using Strings for uint256;

    string _baseTokenURI;

    uint256 public constant _price=0.01 ether;
    
// a extra variable in case someone wants to pause the contract in emergency

    bool public _paused;
        // max number of LW3Punks
       uint256 public maxTokenIds = 10;



uint256 public tokenIds;
modifier onlyWhenNotPaused {
    require(!_paused,"Contract currently paused");
    _;

}
constructor (string memory baseURI) ERC721("LW3Punks","LW3P"){
    _baseTokenURI=baseURI;
}

//we have to allow one mint per user;
function mint()  public payable onlyWhenNotPaused {
    require(tokenIds<maxTokenIds,"Bhai to limit cross kr rha h");
    require(msg.value>=_price,"poora paise de bhai aise nhi chalega");
    tokenIds+=1;
    _safeMint(msg.sender,tokenIds);

    
}

//from the openzeppelin's ERC721 contracts

function _baseURI() internal view virtual override returns(string memory){
    return _baseTokenURI;
}

function tokenURI(uint256 tokenId) public view virtual override returns (string memory){
    require(_exists(tokenId),"ERC721Metadata: URI query for nonexistent token-Random BKC");
    string memory baseURI=_baseURI();
    
// Here it checks if the length of the baseURI is greater than 0, if it is return the baseURI and attach
        // the tokenId and `.json` to it so that it knows the location of the metadata json file for a given
        // tokenId stored on IPFS
        // If baseURI is empty return an empty string
    return bytes(baseURI).length>0? string (abi.encodePacked(baseURI,tokenId.toString(), ".json")): "";

}

function setPaused(bool pauseOrPlay)public onlyOwner{
    _paused=pauseOrPlay;
}

function withdraw() public onlyOwner{
    address _owner=owner();
    uint256 amount =address(this).balance;
    (bool ok, )=_owner.call{value:amount}("");
    require(ok,"Failed to send ether");
}


receive() external payable{}

fallback() external payable{}





}