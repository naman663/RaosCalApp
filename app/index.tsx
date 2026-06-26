// HELLLLLOOOOOO

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView, Modal,
  Pressable, ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button, MD3LightTheme as DefaultTheme, Provider as PaperProvider, TextInput } from "react-native-paper";
import { SafeAreaProvider } from 'react-native-safe-area-context';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6F61',      // warm orange-red
    secondary: '#333333',    // dark gray
    surface: '#f5f5f5',
    background: '#ffffff',
    error: '#B00020',
    onPrimary: '#ffffff',
  },
};

type LogEntry = {
  id: string;
  food: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
  meal: "Breakfast" | "Lunch" | "Dinner";
  lastUsed: string;
};

type SavedMeal = {
  id: string;
  name: string;
  items: LogEntry[];
};

type FoodSearchResult = {
  fdcId: number;
  description: string;
  calories: number;
};

export default function Page() {
  const [foodQuery, setFoodQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [goal, setGoal] = useState("2000");
  const [meal, setMeal] = useState<"Breakfast" | "Lunch" | "Dinner">("Breakfast");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [facing, setFacing] = useState<'front' | 'back'>("back");
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [comingFromMeal, setComingFromMeal] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [logChoiceModalVisible, setLogChoiceModalVisible] = useState(false);
  type NutritionKey = "calories" | "carbs" | "protein" | "fat" | "sugar";

  const [manualNutrition, setManualNutrition] = useState({
    calories: '',
    carbs: '',
    protein: '',
    fat: '',
    sugar: '',
  })
  const handleLogExistingMeal = async (meal: SavedMeal) => {
    try {
      const dateKey = new Date().toISOString().split("T")[0];
      const logKey = `calorieLog-${dateKey}`;

      const storedLog = await AsyncStorage.getItem(logKey);
      const logs = storedLog ? JSON.parse(storedLog) : [];

      const updatedLog = [...logs, ...meal.items];

      await AsyncStorage.setItem(logKey, JSON.stringify(updatedLog));

      setLog((prev) => [...prev, ...meal.items]);
      
      setLogExistingMealModalVisible(false);
      Alert.alert("Success", `"${meal.name}" has been added to today's log.`);
    } catch (error) {
      console.error("Error logging meal:", error);
      Alert.alert("Error", "Could not log the meal.");
    }
  };
  const nutritionKeys: NutritionKey[] = ["calories", "carbs", "protein", "fat", "sugar"];
  const [createNewFoodsModalVisible, setCreateNewFoodsModalVisible] = useState(false);
  const [logExistingFoodOrMealVisible, setLogExistingFoodOrMealVisible] = useState(false);
  const [logExistingFoodsModalVisible, setLogExistingFoodsModalVisible] = useState(false);
  const [logExistingMealModalVisible, setLogExistingMealModalVisible] = useState(false);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [savedFoods, setSavedFoods] = useState<LogEntry[]>([]);
  const [mealName, setMealName] = useState('');
  const [mealItems, setMealItems] = useState<LogEntry[]>([]);
  const [createNewMealModalVisible, setCreateNewMealModalVisible] = useState(false);
  const [logRestaurantFoodModalVisible, setlogRestaurantFoodModalVisible] = useState(false);
  const [restaurantQuery, setRestaurantQuery] = useState('');

  const totalMacros = mealItems.reduce((totals, item) => ({
    calories: totals.calories + item.calories,
    protein: totals.protein + item.protein,
    carbs: totals.carbs + item.carbs,
    fat: totals.fat + item.fat,
    sugar: totals.sugar + item.sugar,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });


  // When modal opens, load the foods
  useEffect(() => {
    if (logExistingFoodsModalVisible) {
      const fetchFoods = async() => {
        // load data, parse, save it
        const data = await AsyncStorage.getItem("savedFoods");
        const foods = data ? JSON.parse(data) : [];
        setSavedFoods(foods);
      };
      fetchFoods();
    }
  }, [logExistingFoodsModalVisible]);

  const USDA_API_KEY = "aNnFD7zbnXgM7flXxFx9JMqYgCbtDRDP7dKnmbUP";

  // const groupedByMeal = {
  //   Breakfast: log.filter(item => item.meal === "Breakfast"),
  //   Lunch: log.filter(item => item.meal === "Lunch"),
  //   Dinner: log.filter(item => item.meal === "Dinner"),
  // };

  const toggleCameraFacing = () => {
    setFacing(prev => (prev === "back" ? "front" : "back"));
  };

  const handleLogExistingFood = async (item: LogEntry) => {
    const dateKey = new Date().toISOString().split("T")[0];
    const logKey = `calorieLog-${dateKey}`;

    const newEntry: LogEntry = {
      ...item,
      id: Date.now().toString(), // new unique ID for this log
      lastUsed: new Date().toISOString(),
    };

    // Fetch existing log for today
    const existingLog = await AsyncStorage.getItem(logKey);
    const logs = existingLog ? JSON.parse(existingLog) : [];

    logs.push(newEntry);
    await AsyncStorage.setItem(logKey, JSON.stringify(logs));
    setLog(logs); // update state

    // Optionally update 'lastUsed' in permanent storage
    const savedData = await AsyncStorage.getItem("savedFoods");
    const savedFoods = savedData ? JSON.parse(savedData) : [];

    const updatedFoods = savedFoods.map((food: LogEntry) =>
      food.id === item.id ? { ...food, lastUsed: newEntry.lastUsed } : food
    );
    await AsyncStorage.setItem("savedFoods", JSON.stringify(updatedFoods));

    if (comingFromMeal) {
    setMealItems((prev) => [...prev, item]);
    setCreateNewMealModalVisible(true);
    }

    setLogExistingFoodsModalVisible(false);
    Alert.alert("Success", `${item.food} logged for today.`);
  };


  // const handleLogExistingFood = async (item: LogEntry) => {
  //   // date that food was logged
  //   const dateKey = new Date().toISOString().split("T")[0];
  //   const logKey = 'calorieLog-${dateKey}';
  //   // update foods components
  //   const newEntry: LogEntry = {
  //   ...item,
  //   id: Date.now().toString(), // new unique ID for this log
  //   lastUsed: new Date().toISOString(),
  //   };
    


  // }

  const handleManualLog = async () => {
    if (!foodName || !manualNutrition.calories) {
      Alert.alert('Missing Info', 'Please enter at least food name and calories.');
      return;
    }

    const nutrients = {
      calories: parseFloat(manualNutrition.calories) || 0,
      carbs: parseFloat(manualNutrition.carbs) || 0,
      protein: parseFloat(manualNutrition.protein) || 0,
      fat: parseFloat(manualNutrition.fat) || 0,
      sugar: parseFloat(manualNutrition.sugar) || 0,
    };

    const entry = {
      id: Date.now().toString(),
      food: foodName,
      ...nutrients,
      meal,
      lastUsed: new Date().toISOString(),
    };

    const dateKey = new Date().toISOString().split('T')[0];
    const logKey = `calorieLog-${dateKey}`;
    const existing = await AsyncStorage.getItem(logKey);
    const logs = existing ? JSON.parse(existing) : [];

    logs.push(entry);
    await AsyncStorage.setItem(logKey, JSON.stringify(logs));
    setLog(logs);

    // Save to permanent savedFoods DB
    const saved = await AsyncStorage.getItem("savedFoods");
    const savedFoods = saved ? JSON.parse(saved) : [];

    // Check if food already exists
    const index = savedFoods.findIndex((f : any)  => f.food === foodName);
    if (index !== -1) {
      // Update lastUsed
      savedFoods[index].lastUsed = new Date().toISOString();
    } else {
      // Add new
      savedFoods.push(entry);
    }

    await AsyncStorage.setItem("savedFoods", JSON.stringify(savedFoods));

    if (comingFromMeal) {
    setMealItems((prev) => [...prev, entry]);
    setCreateNewMealModalVisible(true)
    }
    
    // Reset UI
    setFoodName('');
    setManualNutrition({ calories: '', carbs: '', protein: '', fat: '', sugar: '' });
    setManualModalVisible(false);
    Alert.alert('Success', `${entry.food} logged successfully!`);
  };

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);


  const dailyGoals = {
    calories: 2000,
    carbs: 300,
    protein: 50,
    fat: 70,
    sugar: 30,
  };

  const dateKey = currentDate.toISOString().split("T")[0];
  const logKey = `calorieLog-${dateKey}`;
  const goalKey = `calorieGoal-${dateKey}`;

  const options: Intl.DateTimeFormatOptions = {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  };
  const realDateStr = currentDate.toLocaleDateString(undefined, options);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);

  let formattedDate: string;
  if (current.getTime() === today.getTime()) {
    formattedDate = `Today (${realDateStr})`;
  } else if (current.getTime() === yesterday.getTime()) {
    formattedDate = `Yesterday (${realDateStr})`;
  } else if (current.getTime() === tomorrow.getTime()) {
    formattedDate = `Tomorrow (${realDateStr})`;
  } else {
    formattedDate = realDateStr;
  }

  useEffect(() => {
    const loadData = async () => {
      const savedLog = await AsyncStorage.getItem(logKey);
      setLog(savedLog ? JSON.parse(savedLog) : []);
      const savedGoal = await AsyncStorage.getItem(goalKey);
      setGoal(savedGoal ? savedGoal : "2000");
    };
    loadData();
  }, [currentDate]);

  useEffect(() => {
    AsyncStorage.setItem(logKey, JSON.stringify(log));
  }, [log, logKey]);

  useEffect(() => {
    AsyncStorage.setItem(goalKey, goal);
  }, [goal, goalKey]);

  const searchFoods = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
  
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
  
      if (data.foods) {
        const resultsWithCalories = await Promise.all(
          data.foods.slice(0, 10).map(async (item: any) => {
            // Fetch full details per item
            const detailResponse = await fetch(
              `https://api.nal.usda.gov/fdc/v1/food/${item.fdcId}?api_key=${USDA_API_KEY}`
            );
            const detailData = await detailResponse.json();
  
            const calories =
              detailData.labelNutrients?.calories?.value ??
              detailData.foodNutrients?.find((n: any) => n.nutrient?.id === 1008)?.amount ??
              0;
  
            return {
              fdcId: item.fdcId,
              description: item.description,
              calories: Math.round(calories),
            };
          })
        );
  
        setSearchResults(resultsWithCalories);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching food data:", error);
      setSearchResults([]);
      return null;
    }
  };
  
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
  setScanned(false);

  try {
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(data)}`
    );
    const result = await res.json();

    if (result.foods && result.foods.length > 0) {
      const food = result.foods[0];

      // ✅ 1. Log the food via your existing handler
      await handleFoodSelect(food.fdcId.toString(), food.description);

      // ✅ 2. Save scanned food to permanent database
      const existing = await AsyncStorage.getItem("savedFoods");
      const savedFoods = existing ? JSON.parse(existing) : [];

      const index = savedFoods.findIndex((f: any) => f.id === food.fdcId.toString());

      if (index !== -1) {
        savedFoods[index].lastUsed = new Date().toISOString(); // update lastUsed if already exists
      } else {
        savedFoods.push({
          id: food.fdcId.toString(),
          food: food.description,
          calories: 0, // optional: you could fetch full nutrition details in another call
          carbs: 0,
          protein: 0,
          fat: 0,
          sugar: 0,
          meal: meal, // current meal type from your state
          lastUsed: new Date().toISOString(),
        });
      }

      await AsyncStorage.setItem("savedFoods", JSON.stringify(savedFoods));

    } else {
      setModalContent("⚠️ Can't find food in database");
      setModalVisible(true);
    }
  } catch (error) {
    console.error("❌ Barcode fetch error:", error);
    setModalContent("❌ Error scanning barcode");
    setModalVisible(true);
  }

  setTimeout(() => setScanned(false), 3000);
};

  
  const getFoodDetails = async (fdcId: number) => {
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${USDA_API_KEY}`
      );
      const data = await response.json();
  
      //console.log("🧪 Raw USDA Food Data:", JSON.stringify(data, null, 2)); // <--- Log this
  
      return data;
    } catch (error) {
      //console.error("❌ Error fetching food details:", error);
      return null;
    }
  };
  

  const extractNutrients = (foodData: any) => {
    const label = foodData.labelNutrients || {};
    return {
      calories: Math.round(label.calories?.value || 0),
      carbs: Math.round(label.carbohydrates?.value || 0),
      protein: Math.round(label.protein?.value || 0),
      fat: Math.round(label.fat?.value || 0),
      sugar: Math.round(label.sugars?.value || 0),
    };
  };

  const handleFoodSelect = async (fdcId: string, description: string, multiplier = 1) => {
  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${USDA_API_KEY}`
    );
    const foodData = await response.json();

    const label = foodData.labelNutrients || {};

    // Helper to fallback on nutrient ID lookup
    const getById = (id: number) => {
      return (
        foodData.foodNutrients?.find(
          (n: { nutrientId: number; value: number }) => n.nutrientId === id
        )?.value || 0
      );
    };

    const nutrients = {
      calories: Math.round(((label.calories?.value ?? getById(1008)) || 0) * multiplier),
      carbs: Math.round(((label.carbohydrates?.value ?? getById(1005)) || 0) * multiplier),
      protein: Math.round(((label.protein?.value ?? getById(1003)) || 0) * multiplier),
      fat: Math.round(((label.fat?.value ?? getById(1004)) || 0) * multiplier),
      sugar: Math.round(((label.sugars?.value ?? getById(2000)) || 0) * multiplier),
    };

    // Alert user if nothing usable
    if (Object.values(nutrients).every((v) => v === 0)) {
      Alert.alert("Missing Nutrient Data", "This food has no usable nutrition info. Will implement manual tracking soon.");
      setSelectedFood({ fdcId: parseInt(fdcId), description, calories: 0 });
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      food: description,
      ...nutrients,
      meal,
      lastUsed: new Date().toISOString(), // ✅ added lastUsed
    };

    const dateKey = currentDate.toISOString().split("T")[0];
    const logKey = `calorieLog-${dateKey}`;
    const newLog = [...log, newEntry];

    setLog(newLog); 
    await AsyncStorage.setItem(logKey, JSON.stringify(newLog));

    // ✅ Save or update in permanent savedFoods DB
    const existing = await AsyncStorage.getItem("savedFoods");
    const savedFoods = existing ? JSON.parse(existing) : [];

    const index = savedFoods.findIndex((f: any) => f.food === description);
    if (index !== -1) {
      savedFoods[index].lastUsed = new Date().toISOString(); // update lastUsed
    } else {
      savedFoods.push(newEntry); // save new food
    }

    await AsyncStorage.setItem("savedFoods", JSON.stringify(savedFoods));

    // ✅ Show success feedback
    setModalContent(`${description.toUpperCase()} - ${nutrients.calories} kcal`);
    setModalVisible(true);
    setSearchQuery("");
    setSearchResults([]);

  } catch (error) {
    console.error("❌ Error fetching food data:", error);
    Alert.alert("Error", "Could not fetch food details. Please try again.");
  }
};



  
  
  

  const totals = log.reduce(
    (acc, item) => {
      acc.calories += Math.round(item.calories);
      acc.carbs += Math.round(item.carbs);
      acc.protein += Math.round(item.protein);
      acc.fat += Math.round(item.fat);
      acc.sugar += Math.round(item.sugar);
      return acc;
    },
    { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0 }
  );

  const getColor = (value: number, goal: number) =>
    value > goal ? "red" : "green";

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const clearAllHistory = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const calorieLogKeys = allKeys.filter((key) => key.startsWith("calorieLog-"));
      await AsyncStorage.multiRemove(calorieLogKeys);
      setLog([]);
      Alert.alert("All history (including calories, carbs, protein, fat, and sugar) cleared successfully!");
    } catch (e) {
      Alert.alert("Error clearing history");
    }
  };

  return (
    <GestureHandlerRootView style = {{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>

        <View style={styles.container}>
          <Text style={styles.title}>Rao's Calorie Tracking App</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity onPress={() => changeDate(-1)}>
              <Ionicons name="chevron-back-circle" size={30} color="#1E90FF" />
            </TouchableOpacity>
            <Text style={styles.date}>{formattedDate}</Text>
            <TouchableOpacity onPress={() => changeDate(1)}>
              <Ionicons name="chevron-forward-circle" size={30} color="#1E90FF" />
            </TouchableOpacity>
          </View>

          <TextInput
            mode="outlined"
            label="Daily Goal (kcal)"
            value={goal}
            onChangeText={setGoal}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Search for New Food"
            placeholder="e.g. Apple"
            value={foodQuery}
            onChangeText={(text) => {
              setFoodQuery(text);
              searchFoods(text);
            }}
            style={styles.input}
          />

      <Button
        icon={!cameraActive ? "barcode-scan" : undefined} 
        onPress={async () => {
          if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
              setPermissionDenied(true);
              Alert.alert("Camera permission is required to scan barcodes.");
              return;
            }
          }

          setPermissionDenied(false);
          setCameraActive(true);
        }}
      >
        Scan Food
      </Button>
      <View style={{ padding: 20 }}>
      <Button
      icon="food"
      onPress={() => setLogChoiceModalVisible(true)}
      >
        Log Food Manually
      </Button>
      <Modal
      visible={logChoiceModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setLogChoiceModalVisible(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center"}}>
            <View style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: "85%",
              alignItems: "center",
              position: "relative", // 🔑 allows absolute children inside
            }}> 
              {/* ❌ Exit Icon */}
              <Pressable
                onPress={() => setLogChoiceModalVisible(false)}
                style={{ position: "absolute", top: 10, right: 10 }}
              >
                <Ionicons name="close" size={26} color="#333" />
              </Pressable>
            </View>
            <View style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: "85%",
              alignItems: "center",
            }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}> Choose Logging Option </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && { backgroundColor: "#1976D2" }
                ]}
                onPress={() => {
                  setLogChoiceModalVisible(false);
                  setCreateNewFoodsModalVisible(true);
                }}
              >
                <Text style={styles.modalButtonText}>➕ Log New Food or Meal</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  { backgroundColor: "#ddd" },
                  pressed && { backgroundColor: "#bbb" }
                ]}
                onPress={() => {
                  setLogChoiceModalVisible(false);
                  setLogExistingFoodOrMealVisible(true);
                }}
              >
                <Text style={[styles.modalButtonText, { color: "#333" }]}>📁 Log Existing Food or Meal</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  { backgroundColor: "#ddd" },
                  pressed && { backgroundColor: "#bbb" }
                ]}
                onPress={() => {
                  setLogChoiceModalVisible(false);
                  setlogRestaurantFoodModalVisible(true);
                }}
              >
                <Text style={[styles.modalButtonText, { color: "#333" }]}>🍔 Log Restaurant Food </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
      visible={logExistingFoodOrMealVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setLogExistingFoodOrMealVisible(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center"}}>
            <View style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: "85%",
              alignItems: "center",
              position: "relative", // 🔑 allows absolute children inside
            }}> 
              {/* ❌ Exit Icon */}
              <Pressable
                onPress={() => setLogExistingFoodOrMealVisible(false)}
                style={{ position: "absolute", top: 10, right: 10 }}
              >
                <Ionicons name="close" size={26} color="#333" />
              </Pressable>
            </View>
            <View style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: "85%",
              alignItems: "center",
            }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}> Log Existing Food or Meal </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && { backgroundColor: "#1976D2" }
                ]}
                onPress={() => {
                  setLogExistingFoodOrMealVisible(false);
                  setLogExistingFoodsModalVisible(true);
                  setComingFromMeal(false)
                }}
              >
                <Text style={styles.modalButtonText}>➕ Log Existing Food </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  { backgroundColor: "#ddd" },
                  pressed && { backgroundColor: "#bbb" }
                ]}
                onPress={async () => {
                  setLogExistingFoodOrMealVisible(false); // hide existing modal
                  try {
                    const stored = await AsyncStorage.getItem("savedMeals");
                    const parsed = stored ? JSON.parse(stored) : [];
                    setSavedMeals(parsed);
                    setLogExistingMealModalVisible(true);
                  } catch (error) {
                    console.error("Error loading meals:", error);
                    Alert.alert("Error", "Failed to load saved meals.");
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { color: "#333" }]}>➕ Log Existing Meal</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={logExistingMealModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLogExistingMealModalVisible(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
            <View style={styles.modalCard}>
              {/* Exit Icon */}
              <Pressable
                onPress={() => setLogExistingMealModalVisible(false)}
                style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}
              >
                <Ionicons name="close" size={28} color="#333" />
              </Pressable>

              <Text style={styles.modalTitle}>Log Existing Meal</Text>

              {savedMeals.length === 0 ? (
                <Text style={{ marginTop: 20 }}>No saved meals found.</Text>
              ) : (
                <FlatList
                  data={savedMeals}
                  keyExtractor={(item) => item.id}
                  style={{ maxHeight: 300, width: "100%" }}
                  contentContainerStyle={{ paddingVertical: 10 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleLogExistingMeal(item)}
                      style={{
                        backgroundColor: "#eee",
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 10,
                        width: "100%",
                      }}
                    >
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.name}</Text>
                      <Text style={{ color: "#666" }}>{item.items.length} foods</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
      visible={createNewFoodsModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setCreateNewFoodsModalVisible(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center"}}>
            <View style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: "85%",
              alignItems: "center",
              position: "relative", // 🔑 allows absolute children inside
            }}> 
              {/* ❌ Exit Icon */}
              <Pressable
                onPress={() => setCreateNewFoodsModalVisible(false)}
                style={{ position: "absolute", top: 10, right: 10 }}
              >
                <Ionicons name="close" size={26} color="#333" />
              </Pressable>
            </View>
            <View style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: "85%",
              alignItems: "center",
            }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}> Create Food or Meal </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && { backgroundColor: "#1976D2" }
                ]}
                onPress={() => {
                  setCreateNewFoodsModalVisible(false);
                  setManualModalVisible(true);
                }}
              >
                <Text style={styles.modalButtonText}>➕ Create Food/Ingredient </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  { backgroundColor: "#ddd" },
                  pressed && { backgroundColor: "#bbb" }
                ]}
                onPress={() => {
                  setCreateNewMealModalVisible(true);
                  setCreateNewFoodsModalVisible(false);
                  //setExistingModalVisible(true); 
                }}
              >
                <Text style={[styles.modalButtonText, { color: "#333" }]}>➕ Create Meal</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
      visible={createNewMealModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setCreateNewMealModalVisible(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center"}}>
            <View style={styles.modalCard}>
              {/* Exit "X" Icon */}
              <Pressable
                onPress={() => setCreateNewMealModalVisible(false)}
                style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}
              >
                <Ionicons name="close" size={28} color="#333" />
              </Pressable>
              <Text style={styles.modalTitle}>Create New Meal</Text>

              <TextInput
                placeholder="Meal name"
                style={styles.input}
                value={mealName}
                onChangeText={setMealName}
              />

              <TouchableOpacity
                style={styles.logButton}
                onPress={() => {
                  setCreateNewMealModalVisible(false);
                  setManualModalVisible(true);
                  setComingFromMeal(true);
                }}
              >
                <Text style={styles.logButtonText}>➕ Add New Food</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logButton}
                onPress={() => {
                  setCreateNewMealModalVisible(false);
                  setLogExistingFoodsModalVisible(true);
                  setComingFromMeal(true)
                }}
              >
                <Text style={styles.logButtonText}>📁 Add Existing Food</Text>
              </TouchableOpacity>

              <FlatList
                data={mealItems}
                keyExtractor={(_, index) => index.toString()}
                style={{ maxHeight: 200 }}
                renderItem={({ item }) => (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontWeight: '600' }}>{item.food}</Text>
                    <Text style={{ color: '#666' }}>
                      {item.calories} kcal | {item.protein}g P | {item.carbs}g C | {item.fat}g F
                    </Text>
                  </View>
                )}
              />

              <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  Total: {totalMacros.calories} kcal | {totalMacros.protein}g P | {totalMacros.carbs}g C | {totalMacros.fat}g F
                </Text>
              </View>

              <TouchableOpacity
                style={styles.logButton}
                onPress={async () => {
                  if (!mealName || mealItems.length === 0) {
                    Alert.alert("Incomplete", "Please name the meal and add at least one food item.");
                    return;
                  }

                  const newMeal = {
                    id: Date.now().toString(),
                    name: mealName,
                    items: mealItems,
                  };

                  try {
                    const stored = await AsyncStorage.getItem("savedMeals");
                    const parsed = stored ? JSON.parse(stored) : [];
                    parsed.push(newMeal);
                    await AsyncStorage.setItem("savedMeals", JSON.stringify(parsed));

                    setMealName("");
                    setMealItems([]);
                    setCreateNewMealModalVisible(false);
                  } catch (error) {
                    console.error("Error saving meal:", error);
                    Alert.alert("Error", "Something went wrong saving the meal.");
                  }
                }}
              >
                <Text style={styles.logButtonText}>✅ Save Meal</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={logExistingFoodsModalVisible}
        onRequestClose={() => setLogExistingFoodsModalVisible(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          {/* Semi-transparent background */}
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)', // semi-transparent
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {/* Modal box */}
            <View style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 12,
              width: "90%",
              alignItems: "center",
              position: "relative",
              maxHeight: '75%'
            }}>
              {/* Exit "X" Icon */}
              <Pressable
                onPress={() => setLogExistingFoodsModalVisible(false)}
                style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}
              >
                <Ionicons name="close" size={28} color="#333" />
              </Pressable>

              <Text style={styles.modalTitle}>Log Existing Food</Text>

              {savedFoods.length === 0 ? (
                <Text>No saved foods found.</Text>
              ) : (
                <FlatList<LogEntry>
                  data={savedFoods}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleLogExistingFood(item)}
                      style={{ padding: 10 }}
                    >
                      <Text>{item.food} - {item.calories} kcal</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={logRestaurantFoodModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setlogRestaurantFoodModalVisible(false)}  
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1}}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={styles.modalCard}>
              {/* Exit button */}
              <Pressable
                onPress={() => setlogRestaurantFoodModalVisible(false)}
                style={{ position: "absolute", top: 10, right: 10, zIndex: 1}}
              >
                <Ionicons name="close" size={28} color="#333" />
              </Pressable>

              <Text style={styles.modalTitle}>
                Log Restaurant Food
              </Text>

              <TextInput
                placeholder="Example: Taco Bell - Cheesy Bean & Rice Burrito"
                style={styles.input}
                value={restaurantQuery}
                onChangeText={setRestaurantQuery}
              />

              <TouchableOpacity
                style={styles.logButton}
                onPress={() => {
                  // restaurant search logic
                }}
              >
                <Text style={styles.logButtonText}>
                  🔍 Search Restaurant
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={manualModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setManualModalVisible(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
              <View style={{ width: "90%", backgroundColor: "#fff", padding: 20, borderRadius: 10 }}>
                <Text style={styles.modalTitle}>Manual Food Entry</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Food Name"
                  value={foodName}
                  onChangeText={setFoodName}
                />

                {['calories', 'carbs', 'protein', 'fat', 'sugar'].map((key) => (
                  <TextInput
                    key={key}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={manualNutrition[key as keyof typeof manualNutrition]}
                    onChangeText={(value) =>
                      setManualNutrition((prev) => ({ ...prev, [key]: value }))
                    }
                  />
                ))}

                <Pressable 
                android_ripple={{ color: '#ccc' }}
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && { backgroundColor: '#1976D2' }
                ]}
                onPress={handleManualLog}
                >
                  <Text style={styles.modalButtonText}>Add</Text>
                </Pressable>

                <Pressable
                  android_ripple={{ color: '#aaa' }}
                  style={({ pressed }) => [
                    styles.modalButton,
                    { backgroundColor: '#ddd' },
                    pressed && { backgroundColor: '#bbb' } // darker shade on press
                  ]}
                  onPress={() => setManualModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#333' }]}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      </View>

      {cameraActive && permission?.granted && (
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 99 }}>
          <CameraView
        style={{ flex: 1 }}
        facing={facing}
        onBarcodeScanned={(result) => {
        if (!scanned) {
          setScanned(true);
          handleBarCodeScanned(result); // this logs the food
          setTimeout(() => setScanned(false), 3000); // cooldown
          // Turn camera off after scan 
          if (cameraActive) {
            setCameraActive(false);
            setScanned(false);
            return;
          }
        }
      }}
      barcodeScannerSettings={{
        barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'],
      }}
          />
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 250,
                height: 250,
                borderWidth: 2,
                borderColor: "#fff",
                borderRadius: 8,
                backgroundColor: "transparent",
              }}
            />
          </View>

          <View style={{ position: "absolute", bottom: 40, width: "100%", alignItems: "center" }}>
            <Button mode="outlined" 
            buttonColor="red"
            textColor="white"
            style={{ marginBottom: 10, width: 200}}
            onPress={toggleCameraFacing}>
              Flip Camera
            </Button>
            <Button mode="outlined" 
            buttonColor="red"
            textColor="white"
            style={{ width: 200}}
            onPress={() => {
              setCameraActive(false);
              setScanned(false);
            }}>
              Close Scanner
            </Button>
          </View>
        </View>
      )}
        {searchResults.length > 0 && (
          <View>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.fdcId.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFood(item);
                    setQuantity("1"); // default to 1
                    setQuantityModalVisible(true);
                  }}
                >
                  <Text style={styles.searchResult}>{item.description} - {item.calories}</Text>
                </TouchableOpacity>
              )}
              style={styles.searchResultsList}
            />
          </View>
        )}

          <View style={styles.mealSelector}>
            {["Breakfast", "Lunch", "Dinner"].map((type) => (
              <Button
                key={type}
                mode={meal === type ? "contained" : "outlined"}
                onPress={() => setMeal(type as "Breakfast" | "Lunch" | "Dinner")}
                style={styles.mealButton}
              >
                {type}
              </Button>
            ))}
          </View>
          <Button
            icon = "pencil"
            mode="outlined"
            onPress={() => setManageModalVisible(true)}
            style={{backgroundColor: "#003f5c", marginTop: 10}}
            labelStyle = {{color: "#fff"}}
            >
              Manage Logged Foods
          </Button>
          <Button
            icon = "delete"
            mode="contained"
            onPress={() => setLog([])}
            style={styles.clearButton}
            buttonColor="red"
          >
            Clear All
          </Button>

          <Button
            icon = "delete"
            mode="contained"
            onPress={clearAllHistory}
            style={[styles.clearButton, { backgroundColor: "#FF4500" }]}
          >
            Clear App History
          </Button>

          <Text style={[styles.total, { color: getColor(totals.calories, Number(goal)) }]}>
            Total: {totals.calories} / {goal} kcal
          </Text>
          <Text style={[styles.total, { color: getColor(totals.carbs, dailyGoals.carbs) }]}>
            Carbs: {totals.carbs} / {dailyGoals.carbs} g
          </Text>
          <Text style={[styles.total, { color: getColor(totals.protein, dailyGoals.protein) }]}>
            Protein: {totals.protein} / {dailyGoals.protein} g
          </Text>
          <Text style={[styles.total, { color: getColor(totals.fat, dailyGoals.fat) }]}>
            Fat: {totals.fat} / {dailyGoals.fat} g
          </Text>
          <Text style={[styles.total, { color: getColor(totals.sugar, dailyGoals.sugar) }]}>
            Sugar: {totals.sugar} / {dailyGoals.sugar} g
          </Text>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Food Logged!</Text>
                {log.length === 0 ? (
                  <Text style={styles.modalText}>No entries yet.</Text>
                ) : (
                  log.map((item) => (
                    <Text key={item.id} style={styles.modalText}>
                      {item.food} - {item.calories} kcal
                    </Text>
                  ))
                )}
                <Pressable
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={quantityModalVisible}
            onRequestClose={() => setQuantityModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>How many?</Text>
                <Text style={styles.modalText}>{selectedFood?.description}</Text>
                <TextInput
                  mode="outlined"
                  label="Quantity"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  style={{ marginBottom: 10, width: 100 }}
                />
                <Pressable
                  style={styles.modalButton}
                  onPress={async () => {
                    const multiplier = parseFloat(quantity) || 1;
                    if (!selectedFood) return;
                    await handleFoodSelect(
                      selectedFood.fdcId.toString(),
                      selectedFood.description,
                      multiplier
                    );
                    setQuantityModalVisible(false);
                    setSelectedFood(null);
                  }}
                >
                  <Text style={styles.modalButtonText}>Add</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                  onPress={() => setQuantityModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: "#333" }]}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={manageModalVisible}
            onRequestClose={() => setManageModalVisible(false)}
          >
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.modalContainer}>
                  <View
                    style={[
                      styles.modalContent,
                      {
                        maxHeight: 500,
                        width: "90%",
                        position: "relative", // needed for the icon
                        paddingTop: 40,        // space for icon
                      },
                    ]}
                  >
                    {/* ❌ Exit Icon */}
                    <Pressable
                      onPress={() => setManageModalVisible(false)}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 10,
                        padding: 10,
                      }}
                    >
                      <Ionicons name="close" size={28} color="#333" />
                    </Pressable>

                    <Text style={styles.modalTitle}>Manage Logged Foods</Text>

                    {log.length === 0 ? (
                      <Text style={styles.modalText}>No entries logged today.</Text>
                    ) : (
                      ["Breakfast", "Lunch", "Dinner"].map((mealType) => {
                        const grouped = log.filter((item) => item.meal === mealType);
                        return (
                          <View key={mealType} style={{ marginTop: 15, width: "100%" }}>
                            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>
                              {mealType}
                            </Text>

                            {grouped.length === 0 ? (
                              <Text style={{ color: "#888", marginBottom: 10 }}>
                                No {mealType.toLowerCase()} items.
                              </Text>
                            ) : (
                              grouped.map((item) => (
                                <View
                                  key={item.id}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 5,
                                  }}
                                >
                                  <Text style={{ flex: 1 }}>
                                    {item.food} - {item.calories} kcal
                                  </Text>
                                  <Button
                                    compact
                                    onPress={() => {
                                      const updatedLog = log.filter((entry) => entry.id !== item.id);
                                      setLog(updatedLog);
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </View>
                              ))
                            )}
                          </View>
                        );
                      })
                    )}
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </Modal>
        </View>
    </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  logButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  logButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBackdrop: {
  flexGrow: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
  paddingVertical: 40,
},
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#f2f2f2" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 5, textAlign: "center" },
  dateContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  date: { fontSize: 16, color: "#666", marginHorizontal: 10 },
  input: { marginBottom: 10, width: '100%'},
  searchResultsList: { maxHeight: 150 },
  searchResult: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc" },
  mealSelector: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  mealButton: { flex: 1, marginHorizontal: 5 },
  clearButton: { marginTop: 10, backgroundColor: "red" },
  total: { marginTop: 10, fontWeight: "bold", fontSize: 16, textAlign: "center" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 10,
  alignItems: "center",
  width: "90%",
},
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 5 },
  modalButton: { backgroundColor: "#2196F3", borderRadius: 5, paddingVertical: 8, paddingHorizontal: 20, marginTop: 10 },
  modalButtonText: { color: "#fff", fontWeight: "bold" },

  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)', // semi-transparent black
  justifyContent: 'center',
  alignItems: 'center',
},

  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '85%',
  },

}); 
