import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

export const DonationsScreen: React.FC<any> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="gift" size={36} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>بوابة التبرعات</Text>
        <Text style={styles.headerSub}>دعمكم يساهم في تنمية المجتمع وتفريج الكربات</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <TouchableOpacity 
          style={styles.navCard}
          onPress={() => navigation.navigate('DonationsList', { type: 'ongoing', title: 'تبرعات جارية' })}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="heart-circle-outline" size={36} color={COLORS.primary} />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>تبرعات جارية</Text>
            <Text style={styles.cardDesc}>ساهم في الحالات الإنسانية المفتوحة حالياً</Text>
          </View>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navCard}
          onPress={() => navigation.navigate('DonationsList', { type: 'completed', title: 'تبرعات مكتملة' })}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="checkmark-done-circle-outline" size={36} color="#10B981" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>تبرعات مكتملة</Text>
            <Text style={styles.cardDesc}>اطلع على الحالات التي تم إنجازها بنجاح</Text>
          </View>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navCard}
          onPress={() => navigation.navigate('DonationsList', { type: 'methods', title: 'طرق التبرع' })}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="card-outline" size={36} color="#3B82F6" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>طرق التبرع</Text>
            <Text style={styles.cardDesc}>تعرف على الحسابات وطرق التبرع المتاحة</Text>
          </View>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: '#059669', paddingTop: 40, paddingBottom: 24, paddingHorizontal: 20, alignItems: 'center' },
  headerIcon: { marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  headerSub: { fontSize: 15, color: '#D1FAE5', textAlign: 'center', lineHeight: 22 },
  
  content: { padding: SPACING.lg, paddingTop: 32, gap: 16 },

  navCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16, ...SHADOWS.medium, borderWidth: 1, borderColor: COLORS.border, gap: 16 },
  iconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  cardTextContainer: { flex: 1, alignItems: 'flex-start' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4, textAlign: 'left' },
  cardDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'left', lineHeight: 20 },
});
