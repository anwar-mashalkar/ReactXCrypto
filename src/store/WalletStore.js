import { makeObservable,observable, action, computed } from 'mobx';
import axios from 'axios';
import { MobXProvider } from 'mobx-react';


class WalletStore {
  wallet = null;
  transactionHistory= {};
  currentNetwork = 'bitcoin';

  bitcoinPrice = 0;
  usdtPrice = 0;

  constructor() {
    makeObservable(this, {
      wallet: observable,
      transactionHistory: observable,
      currentNetwork: observable,
      bitcoinPrice: observable,
      usdtPrice: observable,

      importBitcoinWallet: action,
      importPolygonWallet: action,
      switchNetwork: action,
      fetchPrices: action,
      sendTransaction: action,
      verifyReceiverAddressFormat: action,
      getTransactionLink: action,
      fetchTransactionHistory: action,
      totalTransactionAmount: computed,
    });
    this.transactionHistory = {};
   
  }


  importBitcoinWallet(privateKey) {
    
    const isValidPrivateKey = this.validateBitcoinPrivateKey(privateKey); 

    if (isValidPrivateKey) {
      this.wallet = {
        network: 'bitcoin',
        privateKey,
      };
      console.log('Bitcoin wallet imported successfully');
    } else {
      console.error('Invalid Bitcoin private key');
    }
  }

  validateBitcoinPrivateKey(privateKey) {
    
    return privateKey.length === 64;
  }

  importPolygonWallet(privateKey) {
  
    const isValidPrivateKey = this.validatePolygonPrivateKey(privateKey); 

    if (isValidPrivateKey) {
      this.wallet = {
        network: 'polygon',
        privateKey,
      };
      console.log('Polygon wallet imported successfully');
    } else {
      console.error('Invalid Polygon private key');
    }
  }

  validatePolygonPrivateKey(privateKey) {
   
    return privateKey.length === 64;
  }

  switchNetwork(currentNetwork) {
  if (this.currentNetwork === 'bitcoin') {
    this.currentNetwork = 'polygon';
    this.fetchPrices();
    console.log('Switched network to polygon');
  } else if (this.currentNetwork === 'polygon') {
    this.currentNetwork = 'bitcoin';
    this.fetchPrices();
    console.log('Switched network to bitcoin');
  } else {
    console.error('Invalid network:', this.currentNetwork);
  }
}





  fetchPrices(currentNetwork) {
  const bitcoinEndpoint = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
  const usdtEndpoint = 'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd';

  console.log(`Fetching prices for ${currentNetwork}...`);


  const bitcoinPromise = axios.get(bitcoinEndpoint);
  const usdtPromise = axios.get(usdtEndpoint);

  Promise.all([bitcoinPromise, usdtPromise])
    .then(([bitcoinResponse, usdtResponse]) => {
      console.log('Price data received.');

      
      this.bitcoinPrice = bitcoinResponse.data.bitcoin.usd;
      this.usdtPrice = usdtResponse.data.tether.usd;

      console.log(`Bitcoin Price: ${this.bitcoinPrice}`);
      console.log(`USDT Price: ${this.usdtPrice}`);
    })
    .catch((error) => {
      console.error('Failed to fetch live prices:', error);
    });
}


sendTransaction(receiverAddress, amount) {
  const transaction = {
    receiverAddress: receiverAddress,
    amount: amount
  };

  console.log(transaction);

  axios
    .post(`${YOUR_ETHEREUM_PROVIDER_URL}`, {
      method: 'eth_sendTransaction',
      params: [
        {
          from: 'YOUR_SENDER_ADDRESS',
          to: receiverAddress,
          value: amount,
        },
      ],
      id: 1,
      jsonrpc: '2.0',
    })
    .then((response) => {
      console.log('Transaction sent:', response.data.result);
      const transactionHash = response.data.result;
      transaction.status = 'pending';
      transaction.id = transactionHash;
      this.transactionHistory.push(transaction);
    })
    .catch((error) => {
      console.error('Error sending transaction:', error);
    });
}


  verifyReceiverAddressFormat(address) {
  let isValidFormat = false;

  if (this.currentNetwork === 'bitcoin') {
    isValidFormat = isValidAddress(address);
  } else if (this.currentNetwork === 'polygon') {
   
  } else {
    console.error('Invalid network:', this.currentNetwork);
  }

  return isValidFormat;
}


  getTransactionLink(transactionId)  {
 
  return `https://blockexplorer.com/tx/${transactionId}`;
}

  fetchTransactionHistory() {
    const history = [];
    this.transactionHistory = history;
  }

  get totalTransactionAmount() {
    
    return this.transactionHistory.reduce((total, transaction) => total + transaction.amount, 0);
  }
  
getTransactionHistory() {
  return this.transactionHistory;
}

}

const walletStore = new WalletStore();
export default walletStore;
