import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppNotification } from '../types';
import { subscribeAppNotifications } from '../services/firestoreService';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { LinearGradient } from 'expo-linear-gradient';

export const PublicNotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeAppNotifications((fetched) => {
      setNotifications(fetched);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const getIconData = (type: AppNotification['type']) => {
    switch (type) {
      case 'urgent':
        return { icon: 'warning', color: '#E11D48', bg: '#FFE4E6' };
      case 'warning':
        return { icon: 'alert-circle', color: '#F59E0B', bg: '#FEF3C7' };
      default:
        return { icon: 'information-circle', color: '#0EA5E9', bg: '#E0F2FE' };
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const { icon, color, bg } = getIconData(item.type);

    return (
      <View style={[styles.card, SHADOWS.small, { borderRightColor: color }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: bg }]}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
        <Text style={styles.cardMessage}>{item.message}</Text>
        {item.createdAt && (
          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.cardDate}>
              {new Date(item.createdAt).toLocaleString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F7A5A', '#15966E']}
        style={styles.header}
      >
        <Ionicons name="notifications" size={40} color="#FFF" />
        <Text style={styles.headerTitle}>الإشعارات والإعلانات</Text>
        <Text style={styles.headerSubtitle}>أهم الأخبار والبلاغات العاجلة</Text>
      </LinearGradient>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>لا توجد إشعارات حالياً</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.xl + 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.medium,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: 100, // For bottom tab spacing
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRightWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'left',
  },
  cardMessage: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: SPACING.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
});
