import { ThemedView } from '@/components/ThemedView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabOverflow } from './ui/TabBarBackground';

export default function TabView({ children }: { children: React.ReactNode }) {
  const { top } = useSafeAreaInsets();
  const bottom = useBottomTabOverflow();

  return (
    <ThemedView
      style={{ flex: 1, paddingTop: top, paddingBottom: bottom }}
      collapsable={false}
    >
      {children}
    </ThemedView>
  );
}
