import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

export const ComplaintsViolationsHubScreen: React.FC<any> = ({ navigation }) => {
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>بوابة الشكاوى والمخالفات ⚖️</Text>
        <Text style={styles.headerSub}>المكان المخصص لتقديم البلاغات ومتابعة التعديات والمخالفات</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.primary} style={{ marginBottom: 12 }} />
          <Text style={styles.infoTitle}>صوتك مسموع ومحمي</Text>
          <Text style={styles.infoText}>
            يمكنك رفع شكاوى خدمية أو التبليغ عن مخالفات وتعديات. سيتم التعامل مع كافة بلاغاتك بسرية تامة، 
            ويمكنك اختيار إخفاء هويتك أثناء تقديم البلاغ.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.actionCard, SHADOWS.medium]} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('UnifiedReportForm')}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="add-circle" size={36} color="#FFFFFF" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>تقديم بلاغ جديد</Text>
            <Text style={styles.actionDesc}>اضغط هنا لتقديم شكوى أو التبليغ عن مخالفة جديدة</Text>
          </View>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, SHADOWS.small, { marginTop: 16 }]} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ComplaintsList')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="list" size={36} color="#FFFFFF" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>متابعة البلاغات السابقة</Text>
            <Text style={styles.actionDesc}>تتبع حالة الشكاوى والمخالفات التي قمت بتقديمها</Text>
          </View>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMuted} />
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
    padding: SPACING.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    padding: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'right',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
});
