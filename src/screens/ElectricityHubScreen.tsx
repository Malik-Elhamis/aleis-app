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

// Modern Electric Palette (Light & Vibrant)
const ELECTRIC_COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#2563EB',
  accent: '#F59E0B',
};

const ELECTRICITY_ITEMS = [
  { id: '1', title: 'بلاغات الأعطال', icon: 'warning', color: '#F59E0B', bgColor: '#FFFBEB', route: 'ElectricityFaults' }, // Vibrant Amber
  { id: '2', title: 'جداول الانقطاع', icon: 'time', color: '#06B6D4', bgColor: '#ECFEFF', route: null }, // Bright Cyan
  { id: '3', title: 'تنبيهات الأعطال', icon: 'alert-circle', color: '#8B5CF6', bgColor: '#F5F3FF', route: 'ElectricityAlerts' } // Bright Purple
];

export const ElectricityHubScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flash" size={48} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>بوابة الكهرباء والإنارة</Text>
        <Text style={styles.headerSub}>دليلك لخدمات الكهرباء في العيس</Text>
      </View>

      <View style={styles.gridContainer}>
        {ELECTRICITY_ITEMS.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.gridItem, { width: ITEM_WIDTH, backgroundColor: item.bgColor }, SHADOWS.small]}
            onPress={() => item.route ? navigation.navigate(item.route as any) : null}
            activeOpacity={0.8}
          >
            <Ionicons name={item.icon as any} size={36} color={item.color} />
            <Text style={[styles.itemTitle, { color: item.color }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ELECTRIC_COLORS.background },
  header: { backgroundColor: ELECTRIC_COLORS.primary, paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 0 },
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  headerSub: { fontSize: 16, color: '#E0E7FF' },
  
  gridContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', padding: GRID_SPACING, gap: GRID_SPACING, justifyContent: 'center' },
  gridItem: { alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 20, height: ITEM_WIDTH },
  itemTitle: { marginTop: 12, fontSize: 15, fontWeight: '800', textAlign: 'center' }
});
