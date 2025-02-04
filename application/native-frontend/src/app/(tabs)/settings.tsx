import { StyleSheet, Image, Modal, Button, View } from 'react-native';
import ColorPicker, {
  Preview,
  HueSlider,
  Panel1,
  OpacitySlider,
  Swatches,
} from 'reanimated-color-picker';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useState } from 'react';
import TabView from '@/components/TabView';
import { ThemedView } from '@/components/ThemedView';

const TOP_IMAGE = require('@/assets/images/shirt.png');
const BOTTOM_IMAGE = require('@/assets/images/skirt.png');

export default function SettingsScreen() {
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [showPicker, setShowPicker] = useState(false);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: selectedColor,
    shadowColor: selectedColor,
  }));

  const onSelectColor = ({ hex }: { hex: string }) => {
    setSelectedColor(hex);
  };

  return (
    <TabView>
      <ThemedView style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button
            title='🎨'
            onPress={() => setShowPicker(true)}
            color='#000000'
          />
        </View>

        <Animated.View style={[styles.imageContainer, animatedBorderStyle]}>
          <Image
            source={TOP_IMAGE}
            style={styles.topImage}
            resizeMode='contain'
          />
          <Image
            source={BOTTOM_IMAGE}
            style={styles.bottomImage}
            resizeMode='contain'
          />
        </Animated.View>

        <Modal
          visible={showPicker}
          animationType='slide'
          transparent={true}
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ColorPicker
                value={selectedColor}
                onComplete={onSelectColor}
                style={styles.colorPicker}
              >
                <Preview hideInitialColor />
                <Panel1 />
                <HueSlider />
                <OpacitySlider />
                <Swatches />
              </ColorPicker>
              <Button
                title='Close'
                onPress={() => setShowPicker(false)}
                color='#007AFF'
              />
            </View>
          </View>
        </Modal>
      </ThemedView>
    </TabView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    position: 'relative',
  },
  buttonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    height: '65%',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderRadius: 20,
    height: '90%',
    margin: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.8,
    flexDirection: 'column',
    gap: 10,
  },
  topImage: {
    width: '80%',
    height: '48%',
    marginBottom: -45,
  },
  bottomImage: {
    width: '80%',
    height: '48%',
    marginTop: -45,
  },
  colorPicker: {
    width: '100%',
  },
});
