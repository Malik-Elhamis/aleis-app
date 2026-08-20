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
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const GRID_PADDING = SPACING.lg;
const ITEM_WIDTH = (width - GRID_PADDING * 2 - SPACING.md) / 2;

export const AdminProjectsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const MENU_ITEMS = [
    { 
      id: 'in_progress', 
      title: 'مشاريع قيد التنفيذ', 
      icon: 'construct-outline', 
      color: '#0284C7', 
      bgColor: '#E0F2FE',
      onPress: () => navigation.navigate('AdminProjectsList', { status: 'in_progress', title: 'مشاريع قيد التنفيذ' })
    },
    { 
      id: 'completed', 
      title: 'مشاريع منفذة', 
      icon: 'checkmark-circle-outline', 
      color: '#16A34A', 
      bgColor: '#DCFCE7',
      onPress: () => navigation.navigate('AdminProjectsList', { status: 'completed', title: 'مشاريع منفذة' })
    },
    { 
      id: 'planned', 
      title: 'مشاريع مخطط لها', 
      icon: 'calendar-outline', 
      color: '#D97706', 
      bgColor: '#FEF3C7',
      onPress: () => navigation.navigate('AdminProjectsList', { status: 'planned', title: 'مشاريع مخطط لها' })
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.gridItem, { backgroundColor: item.bgColor }, SHADOWS.medium]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={42} color="#FFFFFF" />
              </View>
              <Text style={[styles.itemTitle, { color: item.color }]}>{item.title}</Text>
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
  scrollContent: {
    padding: GRID_PADDING,
    flexGrow: 1,
    paddingTop: 40
  },
  gridContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING.md,
  },
  gridItem: {
    width: ITEM_WIDTH,
    aspectRatio: 0.85,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.small,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
});
