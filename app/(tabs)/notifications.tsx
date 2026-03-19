import { StyleSheet, Pressable } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useBadges } from '@/contexts/BadgeContext';

export default function NotificationsScreen() {
  const { badges, incrementBadge, clearBadge } = useBadges();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text style={styles.subtitle}>
        {badges.notifications} unread {badges.notifications === 1 ? 'notification' : 'notifications'}
      </Text>
      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={() => incrementBadge('notifications')}>
          <Text style={styles.buttonText}>New Notification</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => clearBadge('notifications')}>
          <Text style={styles.buttonText}>Mark All Read</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: '#2f95dc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
