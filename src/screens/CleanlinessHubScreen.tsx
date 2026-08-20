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
const CLEANLINESS_ITEMS = [
  { id: '1', title: 'طلب حاوية', icon: 'trash-bin', color: '#059669', bgColor: '#D1FAE5', type: 'container', route: 'CleanlinessForm' },
  { id: '2', title: 'تراكم نفايات', icon: 'alert-circle', color: '#DC2626', bgColor: '#FEE2E2', type: 'hygiene', route: 'CleanlinessForm' },
  { id: '3', title: 'مكافحة حشرات', icon: 'bug', color: '#D97706', bgColor: '#FEF3C7', type: 'pest_control', route: 'CleanlinessForm' },
  { id: '4', title: 'رسوم النظافة', icon: 'pricetags', color: '#2563EB', bgColor: '#DBEAFE', type: 'fees', route: 'CleaningFees' },
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
        {CLEANLINESS_ITEMS.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.gridItem, { width: ITEM_WIDTH, backgroundColor: item.bgColor }, SHADOWS.small]}
            onPress={() => {
              if (item.route === 'CleaningFees') {
                navigation.navigate('CleaningFees' as any);
              } else {
                navigation.navigate('CleanlinessForm', { requestType: item.type as any });
              }
            }}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: '#10B981', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' }, // Emerald
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  headerSub: { fontSize: 14, color: '#D1FAE5' },
  
  gridContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', padding: GRID_SPACING, gap: GRID_SPACING, justifyContent: 'flex-start' },
  gridItem: { aspectRatio: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center', padding: SPACING.md },
  itemTitle: { fontSize: 16, fontWeight: '800', marginTop: 12, textAlign: 'center' }
});
