import React, { useEffect, useState } from 'react';
import { observer, inject } from 'mobx-react';
import { View, Text, Button, TextInput, StyleSheet, ScrollView, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Project_id = 'SYED';
const ethereum_URLS = `https://mainnet.infura.io/v3/${Project_id}`;

const HomeScreen = inject('walletStore')(
  observer(({ walletStore }) => {
    const [receiverAddress, setReceiverAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [showTransactionHistory, setShowTransactionHistory] = useState(false);

    const {
      currentNetwork,
      bitcoinPrice,
      usdtPrice,
      fetchPrices,
      sendTransaction,
      getTransactionLink,
    } = walletStore;

    useEffect(() => {
      fetchPrices(); 
      retrieveTransactionHistory();
    }, []);

    useEffect(() => {
      
      console.log('Transaction history updated:', transactionHistory);
      storeTransactionHistory();
    }, [transactionHistory]);

    const openTransactionLink = (transactionId) => {
      const transaction = transactionHistory.find((transaction) => transaction.id === transactionId);
      if (transaction && transaction.id) {
        const transactionLink = getTransactionLink(transaction.id);
        Linking.openURL(transactionLink);
      } else {
        console.log('Invalid Transaction');
      }
    };

    const eraseTransactionHistory = async () => {
      try {
        await AsyncStorage.removeItem('transactionHistory');
        setTransactionHistory([]); 
        console.log('Transaction history erased successfully.');
      } catch (error) {
        console.log('Error erasing transaction history:', error);
      }
    };

    const handleSendTransaction = async () => {
      const transaction = {
        receiverAddress,
        amount,
        status: 'pending',
        id: Math.random().toString(), 
      };

      setTransactionHistory((prevTransactionHistory) => [...prevTransactionHistory, transaction]);

   
      setReceiverAddress('');
      setAmount('');

      try {
        const response = await sendTransaction(transaction);
        const { transactionHash } = response.data;
        const transactionStatus = await getTransactionStatus(transactionHash);
        transaction.status = transactionStatus;
        setTransactionHistory((prevTransactionHistory) => [...prevTransactionHistory]); 
      } catch (error) {
        console.log('Error sending transaction:', error);
      }
    };

    const handleRetrieveTransactions = () => {
      setShowTransactionHistory((prevState) => {
        if (!prevState) {
          retrieveTransactionHistory();
        }
        return !prevState;
      });
    };

    const storeTransactionHistory = async () => {
      try {
        await AsyncStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
      } catch (error) {
        console.log('Error storing transaction history:', error);
      }
    };

    const retrieveTransactionHistory = async () => {
      try {
        const storedTransactionHistory = await AsyncStorage.getItem('transactionHistory');
        if (storedTransactionHistory) {
          setTransactionHistory(JSON.parse(storedTransactionHistory));
        } else {
          setTransactionHistory([]); 
        }
      } catch (error) {
        console.log('Error retrieving transaction history:', error);
      }
    };

    const getTransactionStatus = async (transactionHash) => {
      try {
        const response = await axios.get(
          `https://api.etherscan.io/api?module=transaction&action=getstatus&txhash=${transactionHash}&apikey=CU7FTZCVP2N936F2XAYP32BZ7EFAU86DNY`
        );
        const { status } = response.data.result;
        if (status === '1') {
          return 'completed';
        } else if (status === '0') {
          return 'failed';
        } else {
          return 'unknown';
        }
      } catch (error) {
        console.log('Error fetching transaction status:', error);
        return 'unknown';
      }
    };

    return (
      
      <View style={styles.container}>
        <Text style={styles.appName}>React Native X Crypto</Text>
        <Text style={styles.heading}>Current Network: {currentNetwork}</Text>
        {currentNetwork === 'bitcoin' && <Text style={styles.priceText}>Bitcoin Price: {bitcoinPrice}</Text>}
        {currentNetwork === 'polygon' && <Text style={styles.priceText}>USDT Price: {usdtPrice}</Text>}
        <Button title="Switch Network" onPress={() => walletStore.switchNetwork()} />

        <View style={styles.transactionContainer}>
          <Text style={styles.subHeading}>Send Transaction</Text>
          <TextInput
            style={styles.input}
            placeholder="Receiver Address"
            value={receiverAddress}
            onChangeText={setReceiverAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
          />
          <Button
            style={styles.button}
            title="Send Transaction"
            onPress={handleSendTransaction}
          />

          {transactionHistory.length > 0 && (
            <View style={styles.recentTransactionContainer}>
              <Text style={styles.subHeading}>Recent Transaction:</Text>
              <Text>Receiver Address: {transactionHistory[transactionHistory.length - 1].receiverAddress}</Text>
              <Text>Amount: {transactionHistory[transactionHistory.length - 1].amount}</Text>
              <Button
                title="View Transaction link"
                onPress={() => openTransactionLink(transactionHistory[transactionHistory.length - 1].id)}
              />
            </View>
          )}

          <View style={styles.transactionButtonContainer}>
            {showTransactionHistory ? (
              <Button
                title="Hide Transaction History"
                onPress={handleRetrieveTransactions}
              />
            ) : (
              <Button
                title="Show Transaction History"
                onPress={handleRetrieveTransactions}
              />
            )}
            <Button title="Clear Transaction History" onPress={eraseTransactionHistory} />
          </View>

          {showTransactionHistory && (
            <ScrollView>
              <View style={styles.transactionHistoryContainer}>
                <Text style={styles.subHeading}>Transaction History:</Text>
                {transactionHistory.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionItemContainer}>
                    <Text>Receiver Address: {transaction.receiverAddress}</Text>
                    <Text>Amount: {transaction.amount}</Text>
                    <Text>Status: {transaction.status}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    );
  })
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'yellow',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceText: {
    fontSize: 16,
    marginBottom: 10,
  },
  transactionContainer: {
    width: '100%',
    marginTop: 20,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'pink',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    marginBottom: 10,
  },
  transactionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  transactionHistoryContainer: {
    marginTop: 20,
  },
  transactionItemContainer: {
    borderColor: 'pink',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  recentTransactionContainer: {
    borderColor: 'pink',
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default HomeScreen;