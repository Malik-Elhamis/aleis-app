import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GRID_SPACING = SPACING.md;
const ITEM_WIDTH = (width - (GRID_SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;
const FULL_WIDTH = width - (GRID_SPACING * 2);

const CLEANLINESS_ITEMS = [
  { id: '4', title: 'رسوم النظافة', subtitle: 'الاستعلام عن الرسوم', icon: 'pricetags', color: '#3B82F6', bgColor: '#EFF6FF', type: 'fees', route: 'CleaningFees' },
  { id: '2', title: 'تراكم نفايات', subtitle: 'الإبلاغ عن تكدس للنفايات', icon: 'alert-circle', color: '#E11D48', bgColor: '#FFF1F2', type: 'hygiene', route: 'CleanlinessForm' },
  { id: '3', title: 'مكافحة حشرات', subtitle: 'طلب رش مبيدات حشرية', icon: 'bug', color: '#7C3AED', bgColor: '#F5F3FF', type: 'pest_control', route: 'CleanlinessForm' },
  { id: '5', title: 'حركة الجرار', subtitle: 'متابعة مسار جرار النظافة', icon: 'tractor', color: '#F59E0B', bgColor: '#FFFBEB', type: 'tractor', route: 'TractorSchedule' },
  { id: '1', title: 'طلب حاوية', subtitle: 'تقديم طلب للحصول على حاوية نفايات لموقعك', icon: 'trash-bin', color: '#10B981', bgColor: '#F0FDF4', type: 'container', route: 'CleanlinessForm' },
];

export const CleanlinessHubScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="leaf" size={48} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>بوابة النظافة والبيئة</Text>
        <Text style={styles.headerSub}>معاً لبيئة نظيفة ومستدامة</Text>
      </View>

      <View style={styles.gridContainer}>
        {CLEANLINESS_ITEMS.map((item, index) => {
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
                if (item.route === 'CleaningFees') {
                  navigation.navigate('CleaningFees' as any);
                } else if (item.route === 'TractorSchedule') {
                  navigation.navigate('TractorSchedule' as any);
                } else {
                  navigation.navigate('CleanlinessForm', { requestType: item.type as any });
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
                // Standard Grid Layout
                <>
                  {item.icon === 'tractor' ? (
                    <FontAwesome5 name="tractor" size={32} color={item.color} />
                  ) : (
                    <Ionicons name={item.icon as any} size={36} color={item.color} />
                  )}
                  <Text style={[styles.itemTitle, { color: item.color }]}>{item.title}</Text>
                  <Text style={[styles.itemSubtitle, { color: item.color }]} numberOfLines={1}>{item.subtitle}</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: '#047857', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }, 
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  headerSub: { fontSize: 15, color: '#D1FAE5', opacity: 0.9 },
  
  gridContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', padding: GRID_SPACING, gap: GRID_SPACING, justifyContent: 'flex-start', marginTop: 10 },
  
  heroItem: { borderRadius: 24, padding: 24, justifyContent: 'center', height: 130 },
  heroContent: { width: '100%', height: '100%', justifyContent: 'center' },
  heroTextContent: { width: '100%', paddingLeft: 85, alignItems: 'flex-end' },
  heroTitle: { fontSize: 24, fontWeight: '900', marginBottom: 6, textAlign: 'right' },
  heroSubtitle: { fontSize: 13, textAlign: 'right', opacity: 0.85, lineHeight: 20 },
  heroIconCircle: { position: 'absolute', left: 0, top: '50%', marginTop: -35, width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },

  gridItem: { aspectRatio: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center', padding: SPACING.md },
  itemTitle: { fontSize: 16, fontWeight: '900', marginTop: 12, textAlign: 'center' },
  itemSubtitle: { fontSize: 11, marginTop: 4, textAlign: 'center', opacity: 0.7 }
});
