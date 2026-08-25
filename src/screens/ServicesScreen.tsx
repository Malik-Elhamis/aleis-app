import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GRID_SPACING = SPACING.md;
const ITEM_WIDTH = (width - (GRID_SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

const FULL_WIDTH = width - (GRID_SPACING * 2);

const SERVICE_ITEMS = [
  { id: '5', title: 'أوراق البلدية', subtitle: 'استخراج الوثائق والمعاملات الرسمية وتحميلها', icon: 'document-text', color: '#4F46E5', bgColor: '#EEF2FF' }, // Hero
  { id: '1', title: 'التعليم', dbCategory: 'التعليم', subtitle: 'مدارس ومعاهد', icon: 'school', color: '#10B981', bgColor: '#F0FDF4' },
  { id: '2', title: 'الصحة', dbCategory: 'الصحة', subtitle: 'صيدليات وعيادات', icon: 'medkit', color: '#E11D48', bgColor: '#FFF1F2' },
  { id: '3', title: 'المهن والحرف', dbCategory: 'الحرف', subtitle: 'صيانة وبناء', icon: 'hammer', color: '#D97706', bgColor: '#FFFBEB' },
  { id: '4', title: 'صهاريج مياه', dbCategory: 'صهاريج المياه', subtitle: 'مياه شرب نقية', icon: 'water', color: '#0EA5E9', bgColor: '#F0F9FF' },
  { id: '7', title: 'سيارات نقل', dbCategory: 'سيارات نقل', subtitle: 'نقل عفش وبضائع', icon: 'car', color: '#8B5CF6', bgColor: '#F5F3FF' },
  { id: '8', title: 'خدمات أخرى', dbCategory: 'أخرى', subtitle: 'خدمات متنوعة', icon: 'ellipsis-horizontal-circle', color: '#475569', bgColor: '#F8FAFC' },
];

export const ServicesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="apps" size={48} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>بوابة الخدمات</Text>
        <Text style={styles.headerSub}>دليلك الشامل لجميع الخدمات المتوفرة</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {SERVICE_ITEMS.map((item, index) => {
            const isHero = index === 0;
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  isHero ? styles.heroItem : styles.gridItem, 
                  { width: isHero ? FULL_WIDTH : ITEM_WIDTH, backgroundColor: item.bgColor }, 
                  isHero ? SHADOWS.medium : SHADOWS.small
                ]}
                onPress={() => {
                  if (item.id === '5') {
                    navigation.navigate('MunicipalityPapers');
                  } else {
                    navigation.navigate('ServiceProvidersList', { categoryId: item.id, categoryTitle: item.title, dbCategory: item.dbCategory });
                  }
                }}
                activeOpacity={0.8}
              >
                {isHero ? (
                  // Hero Layout
                  <View style={styles.heroContent}>
                    <View style={styles.heroTextContent}>
                      <Text style={[styles.heroTitle, { color: item.color }]}>{item.title}</Text>
                      <Text style={[styles.heroSubtitle, { color: item.color }]}>{item.subtitle}</Text>
                    </View>
                    <View style={[styles.heroIconCircle, { shadowColor: item.color }]}>
                      <Ionicons name={item.icon as any} size={42} color={item.color} />
                    </View>
                  </View>
                ) : (
                  // Grid Layout
                  <>
                    <Ionicons name={item.icon as any} size={36} color={item.color} />
                    <Text style={[styles.itemTitle, { color: item.color }]}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: item.color }]} numberOfLines={1}>{item.subtitle}</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 100 },
  header: { backgroundColor: '#B45309', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }, 
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  headerSub: { fontSize: 15, color: '#FEF3C7', opacity: 0.9 },
  
  gridContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', padding: GRID_SPACING, gap: GRID_SPACING, justifyContent: 'flex-start', marginTop: 10 },
  
  heroItem: { borderRadius: 24, padding: 24, justifyContent: 'center' },
  heroContent: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  heroTextContent: { flex: 1, marginLeft: 16 },
  heroTitle: { fontSize: 22, fontWeight: '900', marginBottom: 6, textAlign: 'right' },
  heroSubtitle: { fontSize: 13, textAlign: 'right', opacity: 0.85, lineHeight: 20 },
  heroIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },

  gridItem: { aspectRatio: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center', padding: SPACING.md },
  itemTitle: { fontSize: 16, fontWeight: '900', marginTop: 12, textAlign: 'center' },
  itemSubtitle: { fontSize: 11, marginTop: 4, textAlign: 'center', opacity: 0.7 }
});
