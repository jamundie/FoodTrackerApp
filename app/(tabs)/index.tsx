import { View, Text, Image, StyleSheet, Dimensions, Button } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {

  const screenHeight = Dimensions.get('window').height;
  const imageHeight = screenHeight * 0.6; // 60% of the screen height
  const containerHeight = screenHeight * 0.6; // 60% of the screen height

  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer, { height: containerHeight }]}>
        <Image
          source={require('@/assets/images/food-calendar.png')}
          style={styles.image}
          resizeMode="contain" // Ensures the image maintains its aspect ratio
        />
      </View>
      <View  style={styles.lowerContainer}>
        <Text style={styles.textHeader}>Food Track</Text>
        <Text style={styles.textSubtitle}>Track your food intake easily</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%', // Container takes up 100% of the height
    width: '100%', // Container takes up 100% of the width
    alignItems: 'center', // Center the image horizontally
    justifyContent: 'center', // Center the image vertically
    backgroundColor: 'white',
  },
  imageContainer: {
    width: '100%', // Container takes up 100% of the width
    alignItems: 'center', // Center the image horizontally
    justifyContent: 'center', // Center the image vertically
    backgroundColor: 'white',
  },
  lowerContainer: {
    width: '100%', // Container takes up 100% of the width
    alignItems: 'center', // Center the image horizontally
    justifyContent: 'center', // Center the image vertically
    backgroundColor: 'white',
  },
  image: {
    width: '100%', // Image takes up 100% of the container's width
    height: '100%', // Image height adjusted to maintain aspect ratio automatically
  },
  textHeader: {
    fontSize: 32,
    marginVertical: 10,
    emphasis: 'bold',
  },
  textSubtitle: {
    fontSize: 24,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
