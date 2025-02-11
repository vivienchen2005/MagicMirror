import { StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TabView from '@/components/TabView';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => router.navigate('/(tabs)/camera')}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="add" size={28} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const firstCarouselImages = [
    require('@/assets/images/shirt.png'),
    require('@/assets/images/splash.png'),
    require('@/assets/images/splash.png'),
    require('@/assets/images/splash.png'),
    require('@/assets/images/splash.png'),
  ];

  const secondCarouselImages = [
    require('@/assets/images/skirt.png'),
    require('@/assets/images/splash.png'),
    require('@/assets/images/splash.png'),
    require('@/assets/images/splash.png'),
    require('@/assets/images/splash.png'),
  ];

  return (
    <TabView>
      <ThemedView style={styles.container}>
        <ThemedText type='title' style={styles.header}>
          Welcome, {'\n'}Guest!
        </ThemedText>

        <ThemedText type='subtitle' style={styles.carouselTitle}>
          Featured Content
        </ThemedText>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.carouselContainer}
        >
          {firstCarouselImages.map((image, index) => (
            <Image key={index} source={image} style={styles.carouselImage} />
          ))}
        </ScrollView>

        {/* Second Carousel Section */}
        <ThemedText type='subtitle' style={styles.carouselTitle}>
          Recommended for You
        </ThemedText>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.carouselContainer}
        >
          {secondCarouselImages.map((image, index) => (
            <Image key={index} source={image} style={styles.carouselImage} />
          ))}
        </ScrollView>
      </ThemedView>
    </TabView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 12,
    marginBottom: 48,
    fontWeight: '400',
  },
  carouselTitle: {
    marginBottom: 20,
    fontWeight: '400',
  },
  carouselContainer: {
    // marginBottom: 12,
  },
  carouselImage: {
    width: 180,
    height: 180,
    borderRadius: 40,
    marginRight: 20,
  },
});
