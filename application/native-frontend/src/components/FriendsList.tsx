import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_FRIENDS = Array.from({ length: 20 }, (_, i) => ({
  id: i.toString(),
  name: `Friend ${i + 1}`,
  avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
}));

export default function FriendsList() {
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(({ item }: { item: typeof MOCK_FRIENDS[0] }) => (
    <View style={styles.friendItem}>
      <View style={styles.avatar} />
      <Text style={styles.name}>{item.name}</Text>
    </View>
  ), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={MOCK_FRIENDS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  name: {
    fontSize: 16,
  },
}); 