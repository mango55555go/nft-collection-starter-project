import myEpicNft from './utils/MyEpicNFT.json';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

const CONTRACT_ADDRESS = "0x472B8F3BAd5269f44EbC357765Ce575151B70094";
const TWITTER_HANDLE = 'mango55555go';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [combinedWord, setCombinedWord] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      setupEventListener();
    } else {
      console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);

      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        connectedContract.on("NewEpicNFTMinted", (from, tokenId, combinedWord) => {
          console.log(from, tokenId.toNumber());
          alert(`あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
          setCombinedWord(combinedWord)
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMintNft = async () => {
    setLoading(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.")
        await nftTxn.wait();
  
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">Connect to Wallet</button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My Sneaker Collection</p>
          <p className="sub-text">あなただけの特別な NFT を Mint しよう💫💫💫💫💫</p>
          {currentAccount === "" && renderNotConnectedContainer()}
          {currentAccount !== "" && loading && <p className="loading">Minting your sneaker...</p>}
          {currentAccount !== "" && !loading && <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">Mint Sneaker</button>}
          {combinedWord !== "" && <h1 className="sub-text">Congratulations! You minted: 👟{combinedWord}💫</h1>}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >
            {`built on @${TWITTER_HANDLE}`}
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;