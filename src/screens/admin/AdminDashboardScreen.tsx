import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('AdminLogin');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const DASHBOARD_ITEMS = [
    {
      id: 'news',
      title: 'إدارة الأخبار',
      subtitle: 'نشر الأخبار وإضافة التفاصيل والصور',
      icon: 'newspaper-outline',
      color: '#0891B2',
      onPress: () => navigation.navigate('AdminNews')
    },
    {
      id: 'home_slider',
      title: 'إدارة صور الرئيسية',
      subtitle: 'إضافة وتعديل الصور المتحركة خلف اللوغو',
      icon: 'images-outline',
      color: '#6366F1', // Indigo
      onPress: () => navigation.navigate('AdminHomeSlider')
    },
    {
      id: 'app_logo',
      title: 'إدارة شعار التطبيق',
      subtitle: 'تغيير اللوغو الرئيسي في الصفحة الرئيسية',
      icon: 'aperture-outline',
      color: '#D4AF37', // Gold
      onPress: () => navigation.navigate('AdminLogo')
    },
    {
      id: '15',
      title: 'إدارة قسم من نحن',
      icon: 'information-circle',
      color: '#4B5563',
      onPress: () => navigation.navigate('AdminAboutUs')
    },
    {
      id: '16',
      title: 'إدارة العيس',
      icon: 'location',
      color: '#0D9488',
      onPress: () => navigation.navigate('AdminAleis')
    },
    {
      id: '17',
      title: 'إدارة الطوارئ',
      icon: 'call',
      color: '#DC2626',
      onPress: () => navigation.navigate('AdminEmergency')
    },
    {
      id: 'service_providers',
      title: 'إدارة الخدمات والمهن',
      subtitle: 'إضافة وتعديل بيانات الحرفيين وأصحاب المهن',
      icon: 'briefcase-outline',
      color: '#EA580C', // Orange
      onPress: () => navigation.navigate('AdminServiceProviders')
    },
    {
      id: 'water_schedules',
      title: 'جداول المياه',
      subtitle: 'إدارة أوقات وأيام الضخ لكل حي',
      icon: 'water-outline',
      color: '#0284C7',
      onPress: () => navigation.navigate('AdminWaterSchedules')
    },
    {
      id: 'water_faults',
      title: 'أعطال المياه',
      subtitle: 'إضافة ومتابعة بلاغات الطوارئ والأعطال',
      icon: 'warning-outline',
      color: '#DC2626',
      onPress: () => navigation.navigate('AdminWaterFaults')
    },
    {
      id: 'projects',
      title: 'المشاريع والإنجازات',
      subtitle: 'إضافة وتحديث سير عمل المشاريع',
      icon: 'construct-outline',
      color: '#16A34A',
      onPress: () => navigation.navigate('AdminProjects')
    },
    {
      id: 'suggestions',
      title: 'اقتراحات المشاريع',
      subtitle: 'مراجعة مقترحات المواطنين واتخاذ قرار',
      icon: 'bulb-outline',
      color: '#9333EA',
      onPress: () => navigation.navigate('AdminSuggestions')
    },
    {
      id: 'unified_reports',
      title: 'إدارة الشكاوى والمخالفات',
      subtitle: 'متابعة ومعالجة كافة البلاغات الواردة',
      icon: 'documents-outline',
      color: '#D97706',
      onPress: () => navigation.navigate('AdminUnifiedReports')
    },
    {
      id: 'municipality_papers',
      title: 'أوراق البلدية',
      subtitle: 'إدارة المستندات والوثائق الرسمية',
      icon: 'document-text-outline',
      color: '#6366F1',
      onPress: () => navigation.navigate('AdminMunicipalityPapers')
    },
    {
      id: 'municipality_questions',
      title: 'أسئلة البلدية',
      subtitle: 'الرد على استفسارات المواطنين',
      icon: 'chatbubbles-outline',
      color: '#0D9488',
      onPress: () => navigation.navigate('AdminMunicipalityQuestions')
    },
    {
      id: 'humanitarian',
      title: 'الحالات الإنسانية',
      subtitle: 'إدارة وجمع التبرعات للحالات الطارئة',
      icon: 'heart-outline',
      color: '#DB2777',
      onPress: () => navigation.navigate('AdminHumanitarian')
    },
    {
      id: 'donations',
      title: 'بوابة التبرعات',
      subtitle: 'إدارة طرق التبرع والتبرعات الجارية',
      icon: 'gift-outline',
      color: '#059669', // Emerald
      onPress: () => navigation.navigate('AdminDonations')
    },
    {
      id: 'humanitarian_reports',
      title: 'بلاغات الحالات الإنسانية',
      subtitle: 'مراجعة بلاغات المواطنين حول الحالات',
      icon: 'information-circle-outline',
      color: '#EAB308', // Yellow
      onPress: () => navigation.navigate('AdminHumanitarianReports')
    },
    {
      id: 'cleanliness',
      title: 'إدارة النظافة والبيئة',
      subtitle: 'متابعة طلبات الحاويات وبلاغات النظافة',
      icon: 'leaf-outline',
      color: '#10B981',
      onPress: () => navigation.navigate('AdminCleanliness')
    },
    {
      id: 'electricity_faults',
      title: 'أعطال الكهرباء والإنارة',
      subtitle: 'إدارة بلاغات الانقطاع وأعطال الإنارة',
      icon: 'flash-outline',
      color: '#F59E0B',
      onPress: () => navigation.navigate('AdminElectricityFaults')
    },
    {
      id: 'electricity_alerts',
      title: 'تنبيهات الكهرباء',
      subtitle: 'إدارة التنبيهات والاشعارات العاجلة للكهرباء',
      icon: 'alert-circle-outline',
      color: '#0EA5E9',
      onPress: () => navigation.navigate('AdminElectricityAlerts')
    },
    {
      id: 'obituaries',
      title: 'إعلانات الوفيات',
      subtitle: 'نشر وتحديث إعلانات الوفيات والتعازي',
      icon: 'moon-outline',
      color: '#4B5563',
      onPress: () => navigation.navigate('AdminObituaries')
    },
    {
      id: 'council',
      title: 'أعضاء مجلس البلدية',
      subtitle: 'تحديث بيانات أعضاء المجلس البلدي',
      icon: 'people-outline',
      color: '#047857',
      onPress: () => navigation.navigate('AdminCouncil')
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>لوحة التحكم 🎛️</Text>
        </View>
        <Text style={styles.headerSub}>مرحباً بك في مركز إدارة التطبيق</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, SHADOWS.small]}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>شكاوى غير محلولة</Text>
          </View>
          <View style={[styles.statBox, SHADOWS.small]}>
            <Text style={styles.statNum}>5</Text>
            <Text style={styles.statLabel}>اقتراحات جديدة</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>أقسام الإدارة</Text>

        <View style={styles.gridContainer}>
          {DASHBOARD_ITEMS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.dashboardCard, SHADOWS.medium]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, { backgroundColor: item.color + '1A' }]}>
                <Ionicons name={item.icon as any} size={32} color={item.color} />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-back" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
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
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    paddingTop: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    borderTopWidth: 4,
    borderTopColor: COLORS.primary,
  },
  statNum: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'right',
    marginBottom: 12,
  },
  gridContainer: {
    gap: SPACING.md,
  },
  dashboardCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  cardTextContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  }
});
