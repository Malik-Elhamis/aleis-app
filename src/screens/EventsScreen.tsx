import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { EventItem } from '../types';
import { subscribeEvents } from '../services/firestoreService';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { LinearGradient } from 'expo-linear-gradient';

export const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const unsub = subscribeEvents((fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const renderEventItem = ({ item }: { item: EventItem }) => {
    return (
      <TouchableOpacity 
        style={[styles.card, SHADOWS.medium]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('EventDetails', { event: item })}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="calendar-outline" size={24} color="#8B5CF6" />
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
        <Text style={styles.cardDetails} numberOfLines={3}>{item.details}</Text>
        
        <View style={styles.cardFooter}>
          {item.createdAt && (
            <View style={styles.dateBadge}>
              <Ionicons name="time-outline" size={14} color="#6D28D9" style={{ marginLeft: 4 }} />
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString('ar-EG')}
              </Text>
            </View>
          )}
          <Text style={styles.readMore}>اقرأ المزيد...</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="megaphone" size={32} color="#6D28D9" />
        </View>
        <Text style={styles.headerTitle}>الفعاليات والندوات</Text>
        <Text style={styles.headerSubtitle}>تابع آخر الأخبار والاجتماعات للبلدية</Text>
      </LinearGradient>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-clear-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>لا توجد فعاليات حالياً</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.listContent}
          renderItem={renderEventItem}
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
    paddingTop: SPACING.xl + 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.large,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
    paddingTop: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRightWidth: 5,
    borderRightColor: '#8B5CF6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginRight: 10,
    flex: 1,
    textAlign: 'left',
  },
  cardDetails: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardDate: {
    fontSize: 12,
    color: '#6D28D9',
    fontWeight: '600',
  },
  readMore: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: 18,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
});
