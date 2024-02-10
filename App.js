import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ImageList from './Screens/ImageList';
import ImageCapture from './ImageCapture';

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <View style={styles.container}>
     <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Camera"
          component={ImageCapture}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Image"
          component={ImageList}
          options={{ headerShown: false }}
        />
        
      
  
      </Stack.Navigator>
    </NavigationContainer>
     
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
    width:Dimensions.get("screen").width,
    height:Dimensions.get("screen").height
  },
});
