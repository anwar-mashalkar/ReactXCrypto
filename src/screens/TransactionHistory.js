import React from 'react';
import { View, Text } from 'react-native';

const TransactionHistoryScreen = ({ transactionHistory }) => {
  return (
    <View>
      <Text>Transaction History:</Text>
      {transactionHistory.map((transaction) => (
        <View key={transaction.id}>
          <Text>Receiver Address: {transaction.receiverAddress}</Text>
          <Text>Amount: {transaction.amount}</Text>
        </View>
      ))}
    </View>
  );
};

export default TransactionHistoryScreen;
