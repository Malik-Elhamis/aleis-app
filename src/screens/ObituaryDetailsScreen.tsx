import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  I18nManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { Obituary } from '../types';

export const ObituaryDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { obituary } = route.params as { obituary: Obituary };

  const isFemale = obituary.gender === 'female';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"} size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل إعلان الوفاة</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {obituary.image ? (
            <Image source={{ uri: obituary.image }} style={styles.personImage} />
          ) : (
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={80} color={COLORS.surface} />
            </View>
          )}
        </View>

        <View style={styles.nameSection}>
          <Text style={styles.nameLabel}>{isFemale ? 'انتقلت إلى رحمة الله تعالى' : 'انتقل إلى رحمة الله تعالى'}</Text>
          <Text style={styles.deceasedName}>{obituary.name}</Text>
        </View>

        <View style={[styles.detailsBox, SHADOWS.small]}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
            <Text style={styles.detailText}><Text style={styles.boldLabel}>تاريخ الوفاة:</Text> {obituary.date}</Text>
          </View>
          
          {obituary.details ? (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={22} color={COLORS.primary} />
              <Text style={styles.detailText}><Text style={styles.boldLabel}>الصلاة والدفن:</Text> {obituary.details}</Text>
            </View>
          ) : null}
          
          {obituary.condolencesDetails ? (
            <View style={styles.detailRow}>
              <Ionicons name="home-outline" size={22} color={COLORS.primary} />
              <Text style={styles.detailText}><Text style={styles.boldLabel}>مكان العزاء:</Text> {obituary.condolencesDetails}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footerSection}>
          <Ionicons name="moon-outline" size={32} color={COLORS.primary} style={styles.footerIcon} />
          <Text style={styles.footerTitle}>إنا لله وإنا إليه راجعون</Text>
          <Text style={styles.footerText}>
            {isFemale 
              ? 'نسأل الله العلي القدير أن يتغمد الفقيدة بواسع رحمته، وأن يسكنها فسيح جناته، وأن يلهم أهلها وذويها الصبر والسلوان.'
              : 'نسأل الله العلي القدير أن يتغمد الفقيد بواسع رحمته، وأن يسكنه فسيح جناته، وأن يلهم أهله وذويه الصبر والسلوان.'
            }
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  backBtn: { padding: 4 },
  
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },

  imageContainer: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
  personImage: { width: 220, height: 220, borderRadius: 16, borderWidth: 4, borderColor: COLORS.primaryLight },
  iconCircle: { width: 220, height: 220, borderRadius: 16, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' },
  
  nameSection: { alignItems: 'center', marginBottom: 32 },
  nameLabel: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '600' },
  deceasedName: { fontSize: 26, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'center' },

  detailsBox: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, gap: 16, marginBottom: 40 },
  detailRow: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', alignItems: 'flex-start', gap: 12 },
  detailText: { fontSize: 16, color: COLORS.textPrimary, textAlign: 'right', flex: 1, lineHeight: 24 },
  boldLabel: { fontWeight: '800', color: COLORS.primary },

  footerSection: { 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    padding: 24, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 'auto'
  },
  footerIcon: { marginBottom: 12 },
  footerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  footerText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 26, fontWeight: '600' }
});
