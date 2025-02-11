import { Pressable, Image, View } from 'react-native';
import { router } from 'expo-router';

export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <Pressable
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        onPress={() => {
          console.log('pressed');
          router.push('/(tabs)');
        }}
      >
        <Image
          source={require('../assets/images/splash.png')}
          style={{ width: 500, height: 500 }}
          resizeMode='contain'
        />
      </Pressable>
    </View>
  );
}
