import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions
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

// Modern Electric Palette (Deep & Premium)
const ELECTRIC_COLORS = {
  background: '#F8FAFC',
  header: '#1E3A8A', // Deep Indigo/Blue
};

const ELECTRICITY_ITEMS = [
  { id: '1', title: 'بلاغات الأعطال', subtitle: 'الإبلاغ عن أعطال الكهرباء والإنارة', icon: 'warning', color: '#E11D48', bgColor: '#FFF1F2', route: 'ElectricityFaults' }, // Vivid Rose
  { id: '2', title: 'جداول الانقطاع', subtitle: 'متابعة مواعيد القطع والتوصيل', icon: 'time', color: '#0EA5E9', bgColor: '#F0F9FF', route: 'ElectricitySchedules' }, // Bright Sky
  { id: '3', title: 'تنبيهات عاجلة', subtitle: 'إشعارات الأعطال المفاجئة', icon: 'alert-circle', color: '#8B5CF6', bgColor: '#F5F3FF', route: 'ElectricityAlerts' } // Vivid Violet
];

export const ElectricityHubScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flash" size={48} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>بوابة الكهرباء والإنارة</Text>
        <Text style={styles.headerSub}>دليلك الشامل لخدمات الكهرباء</Text>
      </View>

      <View style={styles.gridContainer}>
        {ELECTRICITY_ITEMS.map((item, index) => {
          const isHero = index === 0;
          return (
            <TouchableOpacity 
              key={item.id} 
              style={[
                isHero ? styles.heroItem : styles.gridItem, 
                { width: isHero ? FULL_WIDTH : ITEM_WIDTH, backgroundColor: item.bgColor }, 
                isHero ? SHADOWS.medium : SHADOWS.small
              ]}
              onPress={() => item.route ? navigation.navigate(item.route as any) : null}
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
                  <Ionicons name={item.icon as any} size={36} color={item.color} />
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
  container: { flex: 1, backgroundColor: ELECTRIC_COLORS.background },
  header: { backgroundColor: ELECTRIC_COLORS.header, paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  headerSub: { fontSize: 15, color: '#DBEAFE', opacity: 0.9 },
  
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
