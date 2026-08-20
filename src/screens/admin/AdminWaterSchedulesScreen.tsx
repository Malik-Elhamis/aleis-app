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
import { WaterScheduleItem } from '../../types';
import { subscribeWaterSchedule, addWaterSchedule, deleteWaterSchedule, updateWaterSchedule } from '../../services/firestoreService';

const PREDEFINED_NEIGHBORHOODS = [
  'طريق تل حديا ومحيطه غرباً',
  'طريق تل حديا ومحيطه شرقاً',
  'حي طريق بانص',
  'حي القلعة',
  'الحارة الشرقية جنوب جامع خالد بن الوليد',
  'الحارة الشرقية باتجاه أبو زهير',
  'الحارة الشرقية - حي المعبر',
  'الحارة الوسطى من المستوصف حتى المغسلة',
  'الحارة الوسطى (الطريق العام + ساحة البازار + مفرق أبو خالد عويس)',
  'الحارة الشمالية حتى الجدمة',
  'حارة الهضبة',
  'الحارة الشمالية من بيت خيراوي حتى بيت صفوف المطر',
  'محيط المدرسة',
  'الحارة الغربية بين طريق بانص وتل حديا غرباً (حج عبد المطلب)',
  'الحي الشرقي طريق بيت حج عثمان'
];

export const AdminWaterSchedulesScreen: React.FC = () => {
  const [schedules, setSchedules] = useState<WaterScheduleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Dropdown UI state
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomNeighborhood, setShowCustomNeighborhood] = useState(false);

  // Form State
  const [neighborhood, setNeighborhood] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [expectedPumpingDay, setExpectedPumpingDay] = useState('');
  const [status, setStatus] = useState<'active' | 'scheduled' | 'delayed' | 'stopped'>('scheduled');
  const [statusText, setStatusText] = useState('مجدول');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const unsub = subscribeWaterSchedule((items) => {
      setSchedules(items);
    });
    return () => unsub();
  }, []);

  const openFormForAdd = () => {
    setEditingId(null);
    setNeighborhood('');
    setShowCustomNeighborhood(false);
    setShowDropdown(false);
    setStartTime('');
    setEndTime('');
    setExpectedPumpingDay('');
    setNotes('');
    setShowForm(true);
  };

  const openFormForEdit = (item: WaterScheduleItem) => {
    setEditingId(item.id);
    setNeighborhood(item.neighborhood || '');
    // If the neighborhood is in our predefined list, show the dropdown mode
    // Otherwise, it was custom typed, so show custom mode
    if (item.neighborhood && !PREDEFINED_NEIGHBORHOODS.includes(item.neighborhood)) {
      setShowCustomNeighborhood(true);
    } else {
      setShowCustomNeighborhood(false);
    }
    setShowDropdown(false);
    setStartTime(item.startTime || '');
    setEndTime(item.endTime || '');
    setExpectedPumpingDay(item.expectedPumpingDay || '');
    setStatus(item.status);
    setStatusText(item.statusText || '');
    setNotes(item.notes || '');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!neighborhood || !startTime || !endTime || !expectedPumpingDay) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول الأساسية');
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await updateWaterSchedule(editingId, {
          neighborhood,
          startTime,
          endTime,
          expectedPumpingDay,
          status,
          statusText,
          notes,
        });
        Alert.alert('نجاح', 'تم تعديل الجدول بنجاح!');
      } else {
        await addWaterSchedule({
          neighborhood,
          startTime,
          endTime,
          expectedPumpingDay,
          status,
          statusText,
          notes,
        });
        Alert.alert('نجاح', 'تمت إضافة الجدول بنجاح!');
      }
      setShowForm(false);
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا الجدول؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteWaterSchedule(id);
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
          <Text style={styles.formTitle}>{editingId ? 'تعديل جدول المياه' : 'إضافة جدول جديد'}</Text>
          
          <Text style={styles.label}>اسم الحي</Text>
          {showCustomNeighborhood ? (
            <View style={{ marginBottom: 16 }}>
              <TextInput 
                style={[styles.input, { marginBottom: 8 }]} 
                value={neighborhood} 
                onChangeText={setNeighborhood} 
                placeholder="اكتب اسم الحي الجديد هنا..." 
                textAlign="right" 
                autoFocus
              />
              <TouchableOpacity onPress={() => { setShowCustomNeighborhood(false); setNeighborhood(''); }}>
                <Text style={{ color: COLORS.primary, textAlign: 'right', fontWeight: '700', fontSize: 13 }}>العودة للقائمة المنسدلة</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ zIndex: 100, marginBottom: 16 }}>
              <TouchableOpacity 
                style={styles.dropdownToggle}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textSecondary} />
                <Text style={[styles.dropdownToggleText, !neighborhood && { color: '#94A3B8' }]}>
                  {neighborhood || 'اختر اسم الحي...'}
                </Text>
              </TouchableOpacity>
              
              {showDropdown && (
                <View style={styles.dropdownMenu}>
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                    {PREDEFINED_NEIGHBORHOODS.map((nh, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={styles.dropdownItem}
                        onPress={() => {
                          setNeighborhood(nh);
                          setShowDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{nh}</Text>
                      </TouchableOpacity>
                    ))}
                    <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 4 }} />
                    <TouchableOpacity 
                      style={styles.dropdownItem}
                      onPress={() => {
                        setNeighborhood('');
                        setShowDropdown(false);
                        setShowCustomNeighborhood(true);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: COLORS.primary, fontWeight: '800' }]}>+ إضافة حي جديد...</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          <Text style={styles.label}>وقت البدء</Text>
          <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="مثال: 08:00 صباحاً" textAlign="right" />

          <Text style={styles.label}>وقت الانتهاء</Text>
          <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="مثال: 04:00 مساءً" textAlign="right" />

          <Text style={styles.label}>اليوم المجدول</Text>
          <TextInput style={styles.input} value={expectedPumpingDay} onChangeText={setExpectedPumpingDay} placeholder="مثال: يوم الإثنين" textAlign="right" />

          <Text style={styles.label}>ملاحظات (اختياري)</Text>
          <TextInput style={[styles.input, { height: 80 }]} value={notes} onChangeText={setNotes} placeholder="اكتب ملاحظات للمواطنين" textAlign="right" multiline />

          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.primary }]} onPress={handleSave} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'جاري الحفظ...' : 'حفظ ونشر'}</Text>
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
          <Text style={styles.addBtnText}>إضافة جدول</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.small]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.neighborhood}</Text>
              <Text style={styles.cardSub}>{item.expectedPumpingDay} | {item.startTime} - {item.endTime}</Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => openFormForEdit(item)} style={styles.editIcon}>
                <Ionicons name="pencil-outline" size={20} color="#0369A1" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteIcon}>
                <Ionicons name="trash-outline" size={20} color="#E11D48" />
              </TouchableOpacity>
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
  addBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 },
  addBtnText: { color: '#FFF', fontWeight: '700' },
  list: { padding: SPACING.md },
  card: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md, flexDirection: 'row-reverse', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right' },
  cardSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4 },
  actionRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  editIcon: { padding: 8, backgroundColor: '#E0F2FE', borderRadius: 8 },
  deleteIcon: { padding: 8, backgroundColor: '#FFE4E6', borderRadius: 8 },
  formContainer: { padding: SPACING.lg },
  formTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primaryDark, textAlign: 'right', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8 },
  dropdownToggle: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12 },
  dropdownToggleText: { fontSize: 15, color: COLORS.textPrimary, textAlign: 'right' },
  dropdownMenu: { backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, marginTop: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, overflow: 'hidden' },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemText: { fontSize: 14, color: COLORS.textPrimary, textAlign: 'right' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 15, color: COLORS.textPrimary },
  btnRow: { flexDirection: 'row-reverse', gap: 12, marginTop: 10 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});
