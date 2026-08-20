import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeServiceProviders, addServiceProvider, updateServiceProvider, deleteServiceProvider } from '../../services/firestoreService';
import { ServiceProvider } from '../../types';
import { CustomButton } from '../../components/CustomButton';
import { CustomInput } from '../../components/CustomInput';

const CATEGORIES = [
  'التعليم',
  'الصحة',
  'الحرف',
  'صهاريج المياه',
  'معاملات ورقية',
  'رخص بناء',
  'سيارات نقل',
  'أخرى'
];

export const AdminServiceProvidersScreen: React.FC = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeServiceProviders((items) => {
      setProviders(items);
    });
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingProvider(null);
    setName('');
    setPhone('');
    setDescription('');
    setCategory(selectedFilter || CATEGORIES[0]);
    setModalVisible(true);
  };

  const openEditModal = (provider: ServiceProvider) => {
    setEditingProvider(provider);
    setName(provider.name);
    setPhone(provider.phone);
    setDescription(provider.description);
    setCategory(provider.category);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || !category) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم، ورقم الهاتف، واختيار القسم.');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        phone: phone.trim(),
        description: description.trim(),
        category,
        createdAt: editingProvider ? editingProvider.createdAt : new Date().toISOString()
      };

      if (editingProvider) {
        await updateServiceProvider(editingProvider.id, data);
        Alert.alert('نجاح', 'تم تحديث البيانات بنجاح!');
      } else {
        await addServiceProvider(data);
        Alert.alert('نجاح', 'تمت إضافة مقدم الخدمة بنجاح!');
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('خطأ', 'حدثت مشكلة أثناء الحفظ.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد', 'هل أنت متأكد من حذف مقدم الخدمة هذا؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteServiceProvider(id);
        } catch (e) {
          Alert.alert('خطأ', 'حدثت مشكلة أثناء الحذف.');
        }
      }}
    ]);
  };

  const filteredProviders = selectedFilter 
    ? providers.filter(p => p.category === selectedFilter)
    : providers;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="briefcase" size={48} color={COLORS.primary} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>إدارة الخدمات والمهن</Text>
        <Text style={styles.headerSub}>إضافة الحرفيين ومقدمي الخدمات</Text>
      </View>

      {/* Categories Filter */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, !selectedFilter && styles.filterChipActive]}
            onPress={() => setSelectedFilter(null)}
          >
            <Text style={[styles.filterChipText, !selectedFilter && styles.filterChipTextActive]}>الكل</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat}
              style={[styles.filterChip, selectedFilter === cat && styles.filterChipActive]}
              onPress={() => setSelectedFilter(cat)}
            >
              <Text style={[styles.filterChipText, selectedFilter === cat && styles.filterChipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا يوجد مقدمي خدمات مسجلين في هذا القسم.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.medium]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
              </View>
              <Ionicons name="person-circle" size={40} color={COLORS.primary} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.phoneRow}>
                <Ionicons name="call" size={16} color={COLORS.textSecondary} />
                <Text style={styles.phoneText} selectable>{item.phone}</Text>
              </View>
              {!!item.description && (
                <Text style={styles.descText}>{item.description}</Text>
              )}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
                <Ionicons name="pencil" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={[styles.fab, SHADOWS.large]} onPress={openAddModal}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingProvider ? 'تعديل بيانات مقدم الخدمة' : 'إضافة مقدم خدمة جديد'}
              </Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              
              <Text style={styles.inputLabel}>القسم / التصنيف</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat}
                    style={[styles.catBtn, category === cat && styles.catBtnActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <CustomInput
                label="الاسم (اسم الشخص أو الشركة)"
                placeholder="أدخل الاسم..."
                value={name}
                onChangeText={setName}
              />
              
              <CustomInput
                label="رقم الهاتف (للتواصل)"
                placeholder="05XXXXXXXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>تفاصيل الخدمة (اختياري)</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="مثال: نجار موبيليا وأبواب، خبرة طويلة..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlign="right"
                />
              </View>

              <CustomButton
                title={loading ? "جاري الحفظ..." : "حفظ"}
                onPress={handleSave}
                variant="primary"
                disabled={loading}
                style={{ marginTop: 24, marginBottom: 40 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8 },
  headerSub: { fontSize: 14, color: COLORS.textSecondary },

  filterWrapper: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#FFF' },
  filterScroll: { paddingHorizontal: 16, gap: 10, flexDirection: 'row-reverse' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  filterChipTextActive: { color: '#FFF' },

  listPadding: { padding: SPACING.lg, paddingBottom: 100 },
  
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardInfo: { flex: 1, marginRight: 12, alignItems: 'flex-end' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  cardCategory: { fontSize: 12, fontWeight: '700', color: COLORS.primary, backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  cardBody: { marginBottom: 16 },
  phoneRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: 8 },
  phoneText: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  descText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 20 },
  
  cardActions: { flexDirection: 'row', justifyContent: 'flex-start', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, gap: 12 },
  actionBtn: { padding: 8, borderRadius: 8 },
  deleteBtn: { backgroundColor: '#FEE2E2' },
  
  fab: { position: 'absolute', bottom: 30, left: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  
  inputLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8, marginTop: 12 },
  
  categoriesGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  catBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  catBtnText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  catBtnTextActive: { color: COLORS.primary, fontWeight: '800' },

  textAreaContainer: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12 },
  textArea: { height: 80, fontSize: 14, color: COLORS.textPrimary, textAlignVertical: 'top' },

  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
});
