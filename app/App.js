import React, { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const [log, setLog] = useState([]);

  const addEntry = () => {
    if (!food || !calories) return;
    setLog([...log, { id: Date.now().toString(), food, calories: Number(calories) }]);
    setFood('');
    setCalories('');
  };

  const totalCalories = log.reduce((sum, item) => sum + item.calories, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calorie Tracker</Text>

      <TextInput
        style={styles.input}
        placeholder="Food name"
        value={food}
        onChangeText={setFood}
      />

      <TextInput
        style={styles.input}
        placeholder="Calories"
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
      />

      <Button title="Add Entry" onPress={addEntry} />

      <Text style={styles.total}>Total: {totalCalories} kcal</Text>

      <FlatList
        data={log}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.food}: {item.calories} kcal
          </Text>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    padding: 10, marginBottom: 10,
    borderRadius: 5,
  },
  total: { marginTop: 20, fontWeight: 'bold' },
  item: { padding: 5 },
});




















