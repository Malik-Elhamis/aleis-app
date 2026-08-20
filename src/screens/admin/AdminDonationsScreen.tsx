import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeOngoingDonations, deleteOngoingDonation, subscribeDonationMethods, deleteDonationMethod } from '../../services/firestoreService';
import { OngoingDonation, DonationMethod } from '../../types';

export const AdminDonationsScreen: React.FC<any> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'methods'>('methods');
  const [ongoing, setOngoing] = useState<OngoingDonation[]>([]);
  const [methods, setMethods] = useState<DonationMethod[]>([]);

  useEffect(() => {
    const unsubOngoing = subscribeOngoingDonations(setOngoing);
    const unsubMethods = subscribeDonationMethods(setMethods);
    return () => {
      unsubOngoing();
      unsubMethods();
    };
  }, []);

  const handleDeleteOngoing = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteOngoingDonation(id) }
    ]);
  };

  const handleDeleteMethod = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteDonationMethod(id) }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'ongoing' && styles.tabBtnActive]} onPress={() => setActiveTab('ongoing')}>
          <Text style={[styles.tabText, activeTab === 'ongoing' && styles.tabTextActive]}>تبرعات جارية</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'methods' && styles.tabBtnActive]} onPress={() => setActiveTab('methods')}>
          <Text style={[styles.tabText, activeTab === 'methods' && styles.tabTextActive]}>طرق التبرع</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.addBtn}
        onPress={() => {
          if (activeTab === 'methods') {
            navigation.navigate('AdminDonationMethodForm');
          } else {
            navigation.navigate('AdminOngoingDonationForm');
          }
        }}
      >
        <Ionicons name="add-circle-outline" size={24} color="#FFF" />
        <Text style={styles.addBtnText}>
          {activeTab === 'methods' ? 'إضافة طريقة تبرع جديدة' : 'إضافة تبرع جاري جديد'}
        </Text>
      </TouchableOpacity>

      {activeTab === 'ongoing' ? (
        <FlatList
          data={ongoing}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, SHADOWS.small]}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => navigation.navigate('AdminOngoingDonationForm', { donation: item })}>
                    <Ionicons name="create-outline" size={24} color={COLORS.primary} style={{marginLeft: 12}} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteOngoing(item.id)}>
                    <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={methods}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, SHADOWS.small]}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => navigation.navigate('AdminDonationMethodForm', { method: item })}>
                    <Ionicons name="create-outline" size={24} color={COLORS.primary} style={{marginLeft: 12}} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteMethod(item.id)}>
                    <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              {item.bankAccountDetails && <Text style={styles.desc}>الحساب: {item.bankAccountDetails}</Text>}
              {item.phoneNumber && <Text style={styles.desc}>رقم الهاتف: {item.phoneNumber}</Text>}
            </View>
          )}
        />
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#FFF', padding: 8, marginHorizontal: 16, marginTop: 16, borderRadius: 12, ...SHADOWS.small },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
  tabTextActive: { color: '#FFF' },

  list: { padding: SPACING.md, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardActions: { flexDirection: 'row-reverse', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, flex: 1, textAlign: 'right' },
  desc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4 },

  addBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, marginHorizontal: 16, marginTop: 12, paddingVertical: 12, borderRadius: 12, ...SHADOWS.small },
  addBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginRight: 8 }
});
