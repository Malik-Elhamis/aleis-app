import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../config/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>الصفحة الشخصية 👤</Text>
        <Text style={styles.subtitle}>قريباً: تسجيل الدخول للمواطنين، تتبع الطلبات الشخصية، وتلقي الإشعارات المخصصة.</Text>
        
        <TouchableOpacity 
          style={styles.adminBtn}
          onPress={() => navigation.navigate('AdminLogin')}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#FFF" />
          <Text style={styles.adminBtnText}>بوابة الإدارة والموظفين</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  content: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  adminBtn: {
    flexDirection: 'row-reverse',
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  adminBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
