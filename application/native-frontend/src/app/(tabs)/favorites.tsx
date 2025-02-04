import { Image, StyleSheet, ScrollView, View } from 'react-native';

import TabView from '@/components/TabView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function FavoritesScreen() {
  const carouselImages = [
    [require('@/assets/images/shirt.png'), require('@/assets/images/skirt.png')],
    [require('@/assets/images/splash.png'), require('@/assets/images/splash.png')],
    [require('@/assets/images/splash.png'), require('@/assets/images/splash.png')],
    [require('@/assets/images/splash.png'), require('@/assets/images/splash.png')],
    [require('@/assets/images/splash.png'), require('@/assets/images/splash.png')],
  ];

  return (
    <TabView>
      <ThemedView style={styles.container}>
        <ThemedText type='title' style={styles.header}>
          Favorites
        </ThemedText>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.carouselContainer}
          contentContainerStyle={{
            flexGrow: 1,
            paddingRight: 16,
            paddingBottom: 10
          }}
        >
          {carouselImages.map((images, index) => (
            <View key={index} style={styles.carouselItem}>
              <Image source={images[0]} style={styles.imageTop} />
              <Image source={images[1]} style={styles.imageBottom} />
            </View>
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
    paddingBottom: 60,
  },
  header: {
    marginTop: 12,
    marginBottom: 20,
    fontWeight: '400',
  },
  carouselContainer: {
    flex: 1,
  },
  carouselItem: {
    width: 300,
    height: '100%',
    marginRight: 30,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  imageTop: {
    width: '100%',
    height: '48%',
    borderRadius: 40,
  },
  imageBottom: {
    width: '100%',
    height: '48%',
    borderRadius: 40,
  },
});
