import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

export const HumanitarianScreen: React.FC<any> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="heart" size={36} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>الحالات الإنسانية</Text>
        <Text style={styles.headerSub}>دعمكم يساهم في تخفيف معاناتهم وتفريج كرباتهم</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.navCard}
            onPress={() => navigation.navigate('HumanitarianList', { status: 'active' })}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="heart-half-outline" size={32} color="#0284C7" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>حالات مستمرة</Text>
              <Text style={styles.cardDesc}>تصفح الحالات الإنسانية التي لا تزال قيد الجمع</Text>
            </View>
            <Ionicons name="chevron-back" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={() => navigation.navigate('HumanitarianList', { status: 'completed' })}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="checkmark-done-circle-outline" size={32} color="#059669" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>حالات مكتملة</Text>
              <Text style={styles.cardDesc}>الحالات التي تم الانتهاء من جمع التبرعات لها</Text>
            </View>
            <Ionicons name="chevron-back" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={() => navigation.navigate('ReportHumanitarianCase')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="add-circle-outline" size={32} color="#DB2777" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>الإبلاغ عن حالة</Text>
              <Text style={styles.cardDesc}>قم بإبلاغنا عن حالة طارئة تحتاج مساعدة</Text>
            </View>
            <Ionicons name="chevron-back" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
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
  header: {
    backgroundColor: '#DB2777',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.medium,
  },
  headerIcon: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 15,
    color: '#FDF2F8',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  gridContainer: {
    gap: 16,
  },
  navCard: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 16, 
    ...SHADOWS.medium, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  cardTextContainer: { 
    flex: 1, 
    alignItems: 'flex-end' 
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'right',
    lineHeight: 20,
  }
});
