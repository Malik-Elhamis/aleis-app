import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { LinearGradient } from 'expo-linear-gradient';

export const EventDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { event } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Banner with Gradient Background */}
        <LinearGradient
          colors={['#8B5CF6', '#6D28D9']} // Vibrant Purple Gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerIconContainer}>
            <Ionicons name="calendar" size={50} color="#FFF" />
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Title and Date */}
          <View style={[styles.card, SHADOWS.medium]}>
            <Text style={styles.title}>{event.title}</Text>
            
            {event.createdAt && (
              <View style={styles.dateContainer}>
                <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                <Text style={styles.dateText}>
                  {new Date(event.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            )}
            
            <View style={styles.divider} />
            
            <Text style={styles.detailsHeader}>تفاصيل الفعالية:</Text>
            <Text style={styles.detailsText}>{event.details}</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  banner: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -40, // Pulls the content card over the banner
    ...SHADOWS.large,
  },
  bannerIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4C1D95', // Deep purple
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 34,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: '#F3E8FF', // Light purple bg
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#6D28D9',
    marginLeft: 6,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    marginVertical: SPACING.md,
  },
  detailsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'left',
  },
  detailsText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 28,
    textAlign: 'left',
  },
});
