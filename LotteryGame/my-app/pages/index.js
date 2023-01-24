import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Web3Modal from "web3modal";
import React, { useEffect, useRef, useState } from "react";
import { ethers, providers,utils,BigNumber } from "ethers";
import { ABI, LOTTERY_CONTRACT_ADDRESS } from "@/constant";
import { subgraphQuery } from "@/utils";
import { FETCH_CREATED_GAME } from "@/queries";

export default function Home() {
  //usestates
  const [walletConnected, setWalletConnected] = useState(false);

  const [loading, setLoading] = useState(false);
  // boolean to keep track of whether the current connected account is owner or not
  const [isOwner, setIsOwner] = useState(false);
  // entryFee is the ether required to enter a game
  const [entryFee, setEntryFee] = useState(0);
  // maxPlayers is the max number of players that can play the game
  const [maxPlayers, setMaxPlayers] = useState(0);
  // Checks if a game started or not
  const [gameStarted, setGameStarted] = useState(false);
  // Players that joined the game
  const [players, setPlayers] = useState([]);
  // Winner of the game
  const [winner, setWinner] = useState();
  // Keep a track of all the logs for a given game
  const [logs, setLogs] = useState([]);
  // Create a reference to the Web3 Modal
  const web3ModalRef = useRef();
// This is used to force react to re render the page when we want to
  // in our case we will use force update to show new logs
  const forceUpdate = React.useReducer(() => ({}), {})[1];


  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  };

  const startGame = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const lottery = new ethers.Contract(
        LOTTERY_CONTRACT_ADDRESS,
        ABI,
        signer
      );
      setLoading(true);

      const transactionResponse = await lottery.startGame(maxPlayers, entryFee);
      await transactionResponse.wait();
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const joinGame = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const lottery = new ethers.Contract(
        LOTTERY_CONTRACT_ADDRESS,
        ABI,
        signer
      );
      setLoading(true);
      const transactionResponse = await lottery.joinGame({
        value: entryFee,
      });

      await transactionResponse.wait();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }
  const checkIfGameStarted=async()=>{
    try {

      const provider=await getProviderOrSigner();
      const lottery = new ethers.Contract(
        LOTTERY_CONTRACT_ADDRESS,
        ABI,
        provider
      );
      const _gameStarted=await lottery.gameStarted();
      const _gameArray= await subgraphQuery(FETCH_CREATED_GAME());
      const _game=_gameArray.games[0];
      let _logs=[];
      if(_gameStarted){
        _logs=[`Game has started with ID: ${_game.id}`];
        if(_game.players&& _game.players.length>0){
          _logs.push(
            `${_game.players.length} / ${_game.maxPlayers} already joined 👀 `
          );
          _game.players.forEach((player) => {
            _logs.push(`${player} joined 🏃‍♂️`);
          });
          setEntryFee(BigNumber.from(_game.entryFee));
          setMaxPlayers(_game.maxPlayers);
        }else if (!gameStarted && _game.winner) {
          _logs = [
            `Last game has ended with ID: ${_game.id}`,
            `Winner is: ${_game.winner} 🎉 `,
            `Waiting for host to start new game....`,
          ];
  
          setWinner(_game.winner);
        }
        setLogs(_logs);
        setPlayers(_game.players);
        setGameStarted(_gameStarted);
        forceUpdate();

      }      
    } catch (error) {
      console.log(error);
    }
  }


  const getOwner=async()=>{
    try {
      const provider=await getProviderOrSigner();
      const lottery=new ethers.Contract(LOTTERY_CONTRACT_ADDRESS,ABI,provider);
      const _owner=await lottery.owner();
      const signer=await getProviderOrSigner(true);
      const address=await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current=new Web3Modal({
        network: "mumbai",
        providerOptions:{},
        disableInjectedProvider:false,
      });
      connectWallet();
      getOwner();
      checkIfGameStarted();
      
    }

  },[walletConnected]);

  /**
   * renderButton
   */
  const renderButton=()=>{
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
  }
   // If we are currently waiting for something, return a loading button
   if (loading) {
    return <button className={styles.button}>Loading...</button>;
  }
  // Render when the game has started
  if (gameStarted) {
    if (players.length === maxPlayers) {
      return (
        <button className={styles.button} disabled>
          Choosing winner...
        </button>
      );
    }
    return (
      <div>
        <button className={styles.button} onClick={joinGame}>
          Join Game 🚀
        </button>
      </div>
    );
  }
  // Start the game
  if (isOwner && !gameStarted) {
    return (
      <div>
        <input
          type="number"
          className={styles.input}
          onChange={(e) => {
            // The user will enter the value in ether, we will need to convert
            // it to WEI using parseEther
            setEntryFee(
              e.target.value >= 0
                ? utils.parseEther(e.target.value.toString())
                : zero
            );
          }}
          placeholder="Entry Fee (ETH)"
        />
        <input
          type="number"
          className={styles.input}
          onChange={(e) => {
            // The user will enter the value for maximum players that can join the game
            setMaxPlayers(e.target.value ?? 0);
          }}
          placeholder="Max players"
        />
        <button className={styles.button} onClick={startGame}>
          Start Game 🚀
        </button>
      </div>
    );
  }


}

  return( <div>
  <Head>
    <title>LW3Punks</title>
    <meta name="description" content="LW3Punks-Dapp" />
    <link rel="icon" href="/favicon.ico" />
  </Head>
  <div className={styles.main}>
    <div>
      <h1 className={styles.title}>Welcome to Lottery Game!</h1>
      <div className={styles.description}>
        Its a lottery game where a winner is chosen at random and wins the
        entire lottery pool
      </div>
      {renderButton()}
      {logs &&
        logs.map((log, index) => (
          <div className={styles.log} key={index}>
            {log}
          </div>
        ))}
    </div>
    <div>
      <img className={styles.image} src="./randomWinner.png" />
    </div>
  </div>

  <footer className={styles.footer}>Made with &#10084; by Tripathi</footer>
</div>)
}
