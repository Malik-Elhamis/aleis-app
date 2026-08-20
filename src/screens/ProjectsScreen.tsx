import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export const ProjectsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const MENU_ITEMS = [
    { 
      id: 'completed', 
      title: 'مشاريع منفذة', 
      subtitle: 'تصفح الإنجازات التي تمت على أرض الواقع',
      icon: 'checkmark-done-circle', 
      gradient: ['#10B981', '#059669'],
      onPress: () => navigation.navigate('ProjectsList', { status: 'completed', title: 'مشاريع منفذة' })
    },
    { 
      id: 'in_progress', 
      title: 'قيد التنفيذ', 
      subtitle: 'تابع سير الأعمال في المشاريع الحالية',
      icon: 'construct', 
      gradient: ['#3B82F6', '#2563EB'],
      onPress: () => navigation.navigate('ProjectsList', { status: 'in_progress', title: 'مشاريع قيد التنفيذ' })
    },
    { 
      id: 'planned', 
      title: 'مشاريع مخطط لها', 
      subtitle: 'اكتشف الرؤية والمشاريع المستقبلية',
      icon: 'calendar', 
      gradient: ['#F59E0B', '#D97706'],
      onPress: () => navigation.navigate('ProjectsList', { status: 'planned', title: 'مشاريع مخطط لها' })
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Ionicons name="business" size={42} color={COLORS.primary} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>المشاريع والإنجازات</Text>
        <Text style={styles.headerSub}>نافذتك للاطلاع على التطور العمراني والخدمي للبلدية</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.onPress}
            activeOpacity={0.8}
            style={styles.cardWrapper}
          >
            <LinearGradient
              colors={item.gradient as [string, string]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.card, SHADOWS.medium]}
            >
              <View style={styles.cardContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon as any} size={36} color={item.gradient[1]} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // light modern background
  },
  topHeader: {
    backgroundColor: '#FFF',
    paddingHorizontal: SPACING.md,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    ...SHADOWS.small,
    marginBottom: 20,
  },
  headerIcon: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 24,
    minHeight: 120,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'right',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'right',
    lineHeight: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
});
