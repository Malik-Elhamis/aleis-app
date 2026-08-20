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

const SERVICE_ITEMS = [
  { id: '1', title: 'التعليم', icon: 'school', color: '#059669', bgColor: '#D1FAE5' },
  { id: '2', title: 'الصحة', icon: 'medkit', color: '#E11D48', bgColor: '#FFE4E6' },
  { id: '3', title: 'الحرف', icon: 'hammer', color: '#D97706', bgColor: '#FEF3C7' },
  { id: '4', title: 'صهاريج المياه', icon: 'water', color: '#0284C7', bgColor: '#E0F2FE' },
  { id: '5', title: 'أوراق البلدية', icon: 'document-text', color: '#6366F1', bgColor: '#E0E7FF' },
  { id: '7', title: 'سيارات نقل', icon: 'car', color: '#9333EA', bgColor: '#F3E8FF' },
  { id: '8', title: 'أخرى', icon: 'ellipsis-horizontal-circle', color: '#4B5563', bgColor: '#F3F4F6' },
];

export const ServicesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="apps" size={48} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>بوابة الخدمات</Text>
        <Text style={styles.headerSub}>دليلك الشامل لجميع خدمات العيس</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {SERVICE_ITEMS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.gridItem, { width: ITEM_WIDTH, backgroundColor: item.bgColor }, SHADOWS.small]}
              onPress={() => {
                if (item.id === '5') {
                  navigation.navigate('MunicipalityPapers');
                } else {
                  navigation.navigate('ServiceProvidersList', { categoryId: item.id, categoryTitle: item.title });
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name={item.icon as any} size={36} color={item.color} />
              <Text style={[styles.itemTitle, { color: item.color }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 100 },
  header: { backgroundColor: '#D97706', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' }, // Amber
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  headerSub: { fontSize: 14, color: '#FEF3C7' },
  
  gridContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', padding: GRID_SPACING, gap: GRID_SPACING, justifyContent: 'flex-start' },
  gridItem: { aspectRatio: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center', padding: SPACING.md },
  itemTitle: { fontSize: 16, fontWeight: '800', marginTop: 12, textAlign: 'center' }
});
