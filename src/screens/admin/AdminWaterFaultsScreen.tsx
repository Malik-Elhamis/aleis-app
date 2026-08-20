import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { WaterFault } from '../../types';
import { subscribeWaterFaults, addWaterFault, deleteWaterFault, updateWaterFaultStatus, updateWaterFault } from '../../services/firestoreService';

export const AdminWaterFaultsScreen: React.FC = () => {
  const [faults, setFaults] = useState<WaterFault[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const unsub = subscribeWaterFaults((items) => {
      setFaults(items);
    });
    return () => unsub();
  }, []);

  const openFormForAdd = () => {
    setEditingId(null);
    setTitle(''); setDescription(''); setLocation(''); setReason(''); setDate(''); setNotes('');
    setShowForm(true);
  };

  const openFormForEdit = (item: WaterFault) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setLocation(item.location || '');
    setReason(item.reason || '');
    setDate(item.date || '');
    setNotes(item.notes || '');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title || !description || !location || !reason || !date) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول الأساسية');
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await updateWaterFault(editingId, {
          title, description, location, reason, date, notes
        });
        Alert.alert('نجاح', 'تم تعديل الإعلان بنجاح!');
      } else {
        await addWaterFault({
          title,
          description,
          location,
          reason,
          date,
          notes,
          status: 'ongoing'
        });
        Alert.alert('نجاح', 'تم الإعلان عن العطل بنجاح!');
      }
      setShowForm(false);
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateWaterFaultStatus(id, newStatus as any);
    } catch (e) {
      Alert.alert('خطأ', 'تعذر تحديث الحالة');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا العطل بشكل نهائي؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteWaterFault(id);
        } catch (e) {
          Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
        }
      }}
    ]);
  };

  if (showForm) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.formTitle}>{editingId ? 'تعديل إعلان العطل' : 'إضافة إعلان عطل جديد'}</Text>
          
          <Text style={styles.label}>عنوان العطل</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="مثال: كسر في الخط الرئيسي" textAlign="right" />

          <Text style={styles.label}>التفاصيل (الشرح)</Text>
          <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="اكتب تفاصيل العطل..." textAlign="right" multiline />

          <Text style={styles.label}>تاريخ العطل</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="مثال: 12 أغسطس 2026" textAlign="right" />

          <Text style={styles.label}>مكان العطل</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="الحي أو الشارع" textAlign="right" />

          <Text style={styles.label}>سبب العطل</Text>
          <TextInput style={styles.input} value={reason} onChangeText={setReason} placeholder="مثال: ضغط مياه زائد" textAlign="right" />

          <Text style={styles.label}>ملاحظات (اختياري)</Text>
          <TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholder="مثال: سيتم الإصلاح خلال ساعتين" textAlign="right" />

          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.primary }]} onPress={handleSave} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'جاري الحفظ...' : (editingId ? 'تعديل وحفظ' : 'نشر الإعلان')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#94A3B8' }]} onPress={() => setShowForm(false)}>
              <Text style={styles.btnText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.addBtn} onPress={openFormForAdd}>
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.addBtnText}>إعلان عطل جديد</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={faults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.small, { borderRightColor: item.status === 'resolved' ? '#059669' : '#E11D48' }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => openFormForEdit(item)} style={styles.editIcon}>
                    <Ionicons name="pencil-outline" size={20} color="#0369A1" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteIcon}>
                    <Ionicons name="trash-outline" size={20} color="#E11D48" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.cardSub}>{item.location} | {item.date}</Text>
              <View style={styles.statusGroup}>
                <TouchableOpacity 
                  style={[styles.statusBtn, item.status === 'ongoing' ? { backgroundColor: '#FDE047' } : { backgroundColor: '#FEF08A' }]}
                  onPress={() => handleUpdateStatus(item.id, 'ongoing')}
                >
                  <Text style={[styles.statusBtnText, { color: '#854D0E' }]}>جاري الإصلاح</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.statusBtn, item.status === 'resolved' ? { backgroundColor: '#86EFAC' } : { backgroundColor: '#DCFCE7' }]}
                  onPress={() => handleUpdateStatus(item.id, 'resolved')}
                >
                  <Text style={[styles.statusBtnText, { color: '#166534' }]}>تم الإصلاح</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.statusBtn, item.status === 'unresolved' ? { backgroundColor: '#FCA5A5' } : { backgroundColor: '#FEE2E2' }]}
                  onPress={() => handleUpdateStatus(item.id, 'unresolved')}
                >
                  <Text style={[styles.statusBtnText, { color: '#991B1B' }]}>لم يتم الإصلاح</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.statusBtn, item.status === 'difficulty' ? { backgroundColor: '#FDBA74' } : { backgroundColor: '#FFEDD5' }]}
                  onPress={() => handleUpdateStatus(item.id, 'difficulty')}
                >
                  <Text style={[styles.statusBtnText, { color: '#C2410C' }]}>صعوبة في الإصلاح</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'flex-start' },
  addBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#E11D48', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 },
  addBtnText: { color: '#FFF', fontWeight: '700' },
  list: { padding: SPACING.md },
  card: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md, flexDirection: 'row-reverse', alignItems: 'center', borderRightWidth: 4 },
  cardHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', flex: 1 },
  cardSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4 },
  statusGroup: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  statusBtnText: { fontSize: 11, fontWeight: '700' },
  actionRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginRight: 8 },
  editIcon: { padding: 6, backgroundColor: '#E0F2FE', borderRadius: 8 },
  deleteIcon: { padding: 6, backgroundColor: '#FFE4E6', borderRadius: 8 },
  formContainer: { padding: SPACING.lg },
  formTitle: { fontSize: 20, fontWeight: '800', color: '#E11D48', textAlign: 'right', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 15, color: COLORS.textPrimary },
  btnRow: { flexDirection: 'row-reverse', gap: 12, marginTop: 10 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});
