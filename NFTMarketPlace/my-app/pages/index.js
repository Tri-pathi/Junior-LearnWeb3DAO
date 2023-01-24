import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import {ethers,providers,utils} from "ethers";
import { NFT_CONTRACT_ADDRESS, abi } from '../constant';
import Web3Modal from "web3modal";
import React, { useEffect, useRef, useState } from 'react';



export default function Home() {


  const [loading,setLoading]=useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

 // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
 const web3ModalRef = useRef();

  //public mint => anyone can mint by paying nftFee that is fixed in contract
  const publicMint=async()=>{
    try {
      const signer=await getProviderOrSigner(true);
      const nftContract=new ethers.Contract(NFT_CONTRACT_ADDRESS,abi,signer);
       
      const transactionResponse=await nftContract.mint({value:utils.parseEther("0.01")});
       setLoading(true);
       await transactionResponse.wait();
       setLoading(false);
       window.alert("You successfully minted a LW3Punk!");

    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet=async()=>{
   try {
    await getProviderOrSigner();
    setWalletConnected(true);
   } catch (error) {
    console.log(error);

   }
  }

  // to check how many token have been minted;
  const getTokenIdsMinted=async()=>{
    try {
      const provider=await getProviderOrSigner();
      const nftContract=new ethers.Contract(NFT_CONTRACT_ADDRESS,abi,provider);
      const tokenIds=await nftContract.tokenIds();
      console.log(`Total ${tokenIds} nft have been minted so far...`)
      setTokenIdsMinted(tokenIds.toString());

    } catch (error) {
      console.log(error);
    }
  }
//depending upon methods we will use Signer and Provider

const getProviderOrSigner=async(needSigner)=>{
  const provider=await web3ModalRef.current.connect();
  const web3Provider=new providers.Web3Provider(provider);

  const{chainId}=await web3Provider.getNetwork();
  if (chainId !== 80001) {
    window.alert("Not Connected to Mumbai");
    throw new Error("Change network to Mumbai");
  }
  if(needSigner){
    const signer=web3Provider.getSigner();
    return signer;
  }
  return web3Provider;

}

  useEffect(()=>{
        // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
  if(!walletConnected){
    web3ModalRef.current=new Web3Modal({
      network : "mumbai",
   providerOptions:{},
   disableInjectedProvider:false,
  });

  connectWallet();
  getTokenIdsMinted();
        // setting an interval to get the number of token Ids minted every 5 seconds

  setInterval(async() => {
    await getTokenIdsMinted();
  }, 5*1000);
  }

  },[walletConnected]);


  //render state: Returns the button based on the state of the dapp

const renderButton=()=>{
  //if wallet is not connected then give them options to connect the wallet first
  if(!walletConnected){
    return(
      <button onClick={connectWallet} className={styles.button}>
        Connect your Walllet
      </button>
    );
  }
//if loading => it's mean transition is going on so just wait 
  if(loading){
    return(
      <button className={styles.button}>Loading....</button>
    )

  }

  return(
    <button className={styles.button} onClick={publicMint}>
    Public Mint 🚀
    </button>
  )
}



  
  return (
    <div>
      <Head>
        <title>LW3PunkS of Tripathi</title>
        <meta name="description" content="LW3Punks Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
        <h1 className={styles.title}>Welcome to LW3Punks!</h1>
          <div className={styles.description}>
            Its an NFT collection for LearnWeb3 students.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/10 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./1.png" />

        </div>
      </div>
      <footer className={styles.footer}>Made with &#10084; by Tripathi</footer>
    </div>
      
  )
}
