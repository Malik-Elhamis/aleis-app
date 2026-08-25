import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TractorScheduleItem, TractorScheduleNote } from '../../types';
import { 
  subscribeTractorSchedule, 
  subscribeTractorNotes, 
  addTractorScheduleItem, 
  updateTractorScheduleItem, 
  deleteTractorScheduleItem,
  addTractorNote,
  updateTractorNote,
  deleteTractorNote
} from '../../services/firestoreService';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';

export const AdminTractorScheduleScreen: React.FC = () => {
  const [scheduleItems, setScheduleItems] = useState<TractorScheduleItem[]>([]);
  const [notes, setNotes] = useState<TractorScheduleNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Schedule
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [day, setDay] = useState('');
  const [location, setLocation] = useState('');
  const [order, setOrder] = useState('');

  // Form states for Notes
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteOrder, setNoteOrder] = useState('');

  useEffect(() => {
    let unmounted = false;
    
    const unsubSchedule = subscribeTractorSchedule((items) => {
      if (!unmounted) {
        setScheduleItems(items);
        setLoading(false);
      }
    });

    const unsubNotes = subscribeTractorNotes((fetchedNotes) => {
      if (!unmounted) {
        setNotes(fetchedNotes);
      }
    });

    return () => {
      unmounted = true;
      unsubSchedule();
      unsubNotes();
    };
  }, []);

  const resetScheduleForm = () => {
    setEditingItemId(null);
    setDay('');
    setLocation('');
    setOrder('');
  };

  const handleSaveSchedule = async () => {
    if (!day || !location || !order) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول');
      return;
    }

    try {
      if (editingItemId) {
        await updateTractorScheduleItem(editingItemId, {
          day,
          location,
          order: Number(order)
        });
        Alert.alert('نجاح', 'تم تحديث اليوم بنجاح');
      } else {
        await addTractorScheduleItem({
          day,
          location,
          order: Number(order)
        });
        Alert.alert('نجاح', 'تم إضافة اليوم بنجاح');
      }
      resetScheduleForm();
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  const handleDeleteSchedule = (id: string) => {
    Alert.alert('تأكيد', 'هل أنت متأكد من حذف هذا اليوم؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteTractorScheduleItem(id);
          Alert.alert('نجاح', 'تم الحذف');
        } catch (error) {
          Alert.alert('خطأ', 'فشل الحذف');
        }
      }}
    ]);
  };

  const handleEditSchedule = (item: TractorScheduleItem) => {
    setEditingItemId(item.id);
    setDay(item.day);
    setLocation(item.location);
    setOrder(String(item.order));
  };


  const resetNoteForm = () => {
    setEditingNoteId(null);
    setNoteText('');
    setNoteOrder('');
  };

  const handleSaveNote = async () => {
    if (!noteText || !noteOrder) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول');
      return;
    }

    try {
      if (editingNoteId) {
        await updateTractorNote(editingNoteId, {
          text: noteText,
          order: Number(noteOrder)
        });
        Alert.alert('نجاح', 'تم تحديث الملاحظة بنجاح');
      } else {
        await addTractorNote({
          text: noteText,
          order: Number(noteOrder)
        });
        Alert.alert('نجاح', 'تم إضافة الملاحظة بنجاح');
      }
      resetNoteForm();
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert('تأكيد', 'هل أنت متأكد من حذف هذه الملاحظة؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteTractorNote(id);
        } catch (error) {
          Alert.alert('خطأ', 'فشل الحذف');
        }
      }}
    ]);
  };

  const handleEditNote = (note: TractorScheduleNote) => {
    setEditingNoteId(note.id);
    setNoteText(note.text);
    setNoteOrder(String(note.order));
  };

  const handleInitDefaultData = async () => {
    try {
      const INITIAL_TRACTOR_SCHEDULE = [
        { day: 'السبت', location: 'الحارة الغربية مع طريق بانص حتى مفرق برنة', order: 1 },
        { day: 'الأحد', location: 'الحارة الشرقية الشمالية شمال المدارس حتى الجبل', order: 2 },
        { day: 'الاثنين', location: 'الحارة الشرقية الجنوبية جنوب المدارس الكوع حتى السور الشرقي', order: 3 },
        { day: 'الثلاثاء', location: 'الحارة الغربية مع طريق بانص حتى مفرق برنة', order: 4 },
        { day: 'الأربعاء', location: 'الحارة الشرقية الشمالية شمال المدارس حتى الجبل', order: 5 },
        { day: 'الخميس', location: 'الحارة الشرقية الجنوبية جنوب المدارس الكوع حتى السور الشرقي', order: 6 }
      ];

      for (const item of INITIAL_TRACTOR_SCHEDULE) {
        await addTractorScheduleItem(item);
      }
      Alert.alert('نجاح', 'تم تهيئة البيانات الافتراضية بنجاح');
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تهيئة البيانات');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة حركة الجرار</Text>
        {scheduleItems.length === 0 && (
          <TouchableOpacity onPress={handleInitDefaultData} style={styles.initBtn}>
            <Text style={styles.initBtnText}>تهيئة البيانات الافتراضية</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={[{key: 'form'}, ...scheduleItems, {key: 'notesForm'}, ...notes]}
        keyExtractor={(item) => (item as any).id || (item as any).key}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          if ((item as any).key === 'form') {
            return (
              <View style={[styles.formContainer, SHADOWS.small]}>
                <Text style={styles.formTitle}>{editingItemId ? 'تعديل جدول اليوم' : 'إضافة يوم جديد'}</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="اليوم (مثال: السبت)"
                  value={day}
                  onChangeText={setDay}
                  textAlign="right"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="المنطقة (مثال: الحارة الغربية...)"
                  value={location}
                  onChangeText={setLocation}
                  textAlign="right"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="الترتيب (مثال: 1)"
                  value={order}
                  onChangeText={setOrder}
                  keyboardType="numeric"
                  textAlign="right"
                />

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSchedule}>
                    <Text style={styles.saveBtnText}>حفظ</Text>
                  </TouchableOpacity>
                  {editingItemId && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={resetScheduleForm}>
                      <Text style={styles.cancelBtnText}>إلغاء</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }

          if ((item as any).key === 'notesForm') {
            return (
              <View style={[styles.formContainer, SHADOWS.small, { marginTop: SPACING.xl }]}>
                <Text style={styles.formTitle}>{editingNoteId ? 'تعديل ملاحظة' : 'إضافة ملاحظة جديدة'}</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="نص الملاحظة"
                  value={noteText}
                  onChangeText={setNoteText}
                  textAlign="right"
                  multiline
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="الترتيب (مثال: 1)"
                  value={noteOrder}
                  onChangeText={setNoteOrder}
                  keyboardType="numeric"
                  textAlign="right"
                />

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNote}>
                    <Text style={styles.saveBtnText}>حفظ</Text>
                  </TouchableOpacity>
                  {editingNoteId && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={resetNoteForm}>
                      <Text style={styles.cancelBtnText}>إلغاء</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }

          const isNote = 'text' in item;

          if (isNote) {
            const noteItem = item as TractorScheduleNote;
            return (
              <View style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemText}>{noteItem.text}</Text>
                  <Text style={styles.itemOrder}>الترتيب: {noteItem.order}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => handleEditNote(noteItem)} style={styles.actionBtn}>
                    <Ionicons name="pencil" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteNote(noteItem.id)} style={styles.actionBtn}>
                    <Ionicons name="trash" size={20} color="#E11D48" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          } else {
            const scheduleItem = item as TractorScheduleItem;
            return (
              <View style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{scheduleItem.day}</Text>
                  <Text style={styles.itemText}>{scheduleItem.location}</Text>
                  <Text style={styles.itemOrder}>الترتيب: {scheduleItem.order}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => handleEditSchedule(scheduleItem)} style={styles.actionBtn}>
                    <Ionicons name="pencil" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteSchedule(scheduleItem.id)} style={styles.actionBtn}>
                    <Ionicons name="trash" size={20} color="#E11D48" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primaryDark },
  initBtn: {
    marginTop: SPACING.sm,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  initBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContent: { padding: SPACING.md, paddingBottom: 100 },
  formContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: SPACING.md,
    textAlign: 'right',
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: 'System',
  },
  formActions: { flexDirection: 'row-reverse', justifyContent: 'flex-start', gap: 10 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' },
  cancelBtn: {
    backgroundColor: '#94A3B8',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtnText: { color: '#FFF', fontWeight: 'bold' },
  itemCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemInfo: { flex: 1, alignItems: 'flex-end', marginLeft: 10 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  itemText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right' },
  itemOrder: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  itemActions: { flexDirection: 'row-reverse', gap: 10 },
  actionBtn: { padding: 8, backgroundColor: COLORS.inputBg, borderRadius: 8 },
});
