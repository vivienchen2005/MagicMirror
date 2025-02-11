import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  console.log('RENDERING TABS');

  const isDark = segments[segments.length - 1] === 'settings' || segments[segments.length - 1] === 'camera';

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: isDark
            ? '#ffffff'
            : Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: isDark ? '#888888' : undefined,
          tabBarShowLabel: false,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: isDark ? () => <View style={{ backgroundColor: '#000000' }} /> : TabBarBackground,
          tabBarStyle: [
            Platform.select({
              ios: {
                position: 'absolute',
              },
              default: {},
            }),
            isDark
              ? {
                  backgroundColor: '#000000',
                  borderTopColor: '#333333',
                  borderTopWidth: 0,
                }
              : {},
          ],
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name='home'
          options={{
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name='house.fill' color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='settings'
          options={{
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name='gearshape.fill' color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='favorites'
          options={{
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name='star.fill' color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Absolute positioned overlay in unsafe area */}
      {isDark && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: '#000',
        }} />
      )}
    </View>
  );
}
