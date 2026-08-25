import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { subscribeDashboardStats } from '../../services/firestoreService';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsub = subscribeDashboardStats((newStats) => {
      setStats(newStats);
    });
    return () => unsub();
  }, []);

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
      id: 'electricity_schedules',
      title: 'جداول الكهرباء',
      subtitle: 'إدارة أوقات وأيام القطع والتوصيل لكل حي',
      icon: 'flash-outline',
      color: '#F59E0B',
      onPress: () => navigation.navigate('AdminElectricitySchedules')
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
      id: 'tractor_schedule',
      title: 'إدارة حركة الجرار',
      subtitle: 'تعديل جدول مسار جرار النظافة والملاحظات',
      icon: 'tractor',
      color: '#F97316',
      onPress: () => navigation.navigate('AdminTractorSchedule')
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
    },
    {
      id: 'events',
      title: 'إدارة الفعاليات',
      subtitle: 'إضافة اجتماعات وندوات وفعاليات',
      icon: 'calendar-outline',
      color: '#8B5CF6', // Purple
      onPress: () => navigation.navigate('AdminEvents')
    },
    {
      id: 'notifications',
      title: 'إدارة الإشعارات العامة',
      subtitle: 'إرسال تنبيهات هامة وعاجلة للمستخدمين',
      icon: 'notifications-outline',
      color: '#E11D48', // Rose
      onPress: () => navigation.navigate('AdminNotifications')
    },
    {
      id: 'splash',
      title: 'إدارة شاشة البداية',
      subtitle: 'تغيير الصورة الترحيبية عند فتح التطبيق',
      icon: 'image-outline',
      color: '#0D9488', // Teal
      onPress: () => navigation.navigate('AdminSplash')
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
        
        {/* App Installs Stat Card */}
        <View style={[styles.installsCard, SHADOWS.large]}>
          <View style={styles.installsIconContainer}>
            <Ionicons name="cloud-download" size={36} color="#FFF" />
          </View>
          <View style={styles.installsTextContainer}>
            <Text style={styles.installsLabel}>إجمالي مستخدمي التطبيق</Text>
            <Text style={styles.installsValue}>
              {stats.app_installs !== undefined ? stats.app_installs : '...'} <Text style={styles.installsUnit}>مستخدم</Text>
            </Text>
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
                {stats[item.id] > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {stats[item.id] > 99 ? '+99' : stats[item.id]}
                    </Text>
                  </View>
                )}
                {item.icon === 'tractor' ? (
                  <FontAwesome5 name="tractor" size={28} color={item.color} />
                ) : (
                  <Ionicons name={item.icon as any} size={32} color={item.color} />
                )}
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
  installsCard: {
    backgroundColor: '#0F7A5A', // Beautiful teal/green gradient vibe
    borderRadius: 20,
    padding: SPACING.lg,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  installsIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  installsTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  installsLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    marginBottom: 4,
  },
  installsValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
  },
  installsUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
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
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#EF4444', // Red color for badge
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 10,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  }
});
