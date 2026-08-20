import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const WaterHubScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>قسم المياه 💧</Text>
        <Text style={styles.headerSub}>دليلك الشامل لخدمات وأعطال المياه في البلدة</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity 
          style={[styles.bigButton, { backgroundColor: '#E0F2FE', shadowColor: '#0284C7' }]}
          onPress={() => navigation.navigate('WaterSchedule')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { shadowColor: '#0284C7' }]}>
            <Ionicons name="calendar-outline" size={48} color="#0284C7" />
          </View>
          <Text style={[styles.btnTitle, { color: '#0369A1' }]}>جدول التوزيع</Text>
          <Text style={[styles.btnSub, { color: '#0284C7' }]}>تابع أوقات وأيام ضخ المياه للأحياء</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.bigButton, { backgroundColor: '#FFE4E6', shadowColor: '#E11D48' }]}
          onPress={() => navigation.navigate('WaterFaults')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { shadowColor: '#E11D48' }]}>
            <Ionicons name="warning-outline" size={48} color="#E11D48" />
          </View>
          <Text style={[styles.btnTitle, { color: '#BE123C' }]}>إعلانات الأعطال</Text>
          <Text style={[styles.btnSub, { color: '#E11D48' }]}>آخر تحديثات أعطال الشبكة وطوارئ المياه</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.xl,
    paddingBottom: SPACING.xxl * 2, // extra padding so it's perfectly centered above the bottom bar
  },
  bigButton: {
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    elevation: 8,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  btnTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  btnSub: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
  }
});
