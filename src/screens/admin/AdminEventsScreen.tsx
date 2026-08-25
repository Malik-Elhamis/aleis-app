import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventItem } from '../../types';
import { subscribeEvents, addEvent, updateEvent, deleteEvent } from '../../services/firestoreService';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';

export const AdminEventsScreen: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    const unsub = subscribeEvents((fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDetails('');
  };

  const handleSave = async () => {
    if (!title.trim() || !details.trim()) {
      Alert.alert('تنبيه', 'الرجاء تعبئة العنوان والتفاصيل');
      return;
    }

    try {
      if (editingId) {
        await updateEvent(editingId, { title, details });
        Alert.alert('نجاح', 'تم تحديث الفعالية بنجاح');
      } else {
        await addEvent({ title, details });
        Alert.alert('نجاح', 'تم إضافة الفعالية بنجاح');
      }
      resetForm();
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذه الفعالية؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteEvent(id);
        } catch (error) {
          Alert.alert('خطأ', 'فشل الحذف');
        }
      }}
    ]);
  };

  const handleEdit = (item: EventItem) => {
    setEditingId(item.id!);
    setTitle(item.title);
    setDetails(item.details);
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
        <Text style={styles.headerTitle}>إدارة الفعاليات</Text>
      </View>

      <FlatList
        data={[{ key: 'form' }, ...events]}
        keyExtractor={(item) => (item as any).id || (item as any).key}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          if ((item as any).key === 'form') {
            return (
              <View style={[styles.formContainer, SHADOWS.small]}>
                <Text style={styles.formTitle}>{editingId ? 'تعديل فعالية' : 'إضافة فعالية جديدة'}</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="عنوان الفعالية أو الاجتماع"
                  value={title}
                  onChangeText={setTitle}
                  textAlign="right"
                />
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="التفاصيل كاملة"
                  value={details}
                  onChangeText={setDetails}
                  textAlign="right"
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>{editingId ? 'تحديث الفعالية' : 'إضافة الفعالية'}</Text>
                  </TouchableOpacity>
                  {editingId && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                      <Text style={styles.cancelBtnText}>إلغاء</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }

          const event = item as EventItem;
          return (
            <View style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{event.title}</Text>
                <Text style={styles.itemDetails} numberOfLines={2}>{event.details}</Text>
                {event.createdAt && (
                  <Text style={styles.itemDate}>
                    {new Date(event.createdAt).toLocaleDateString('ar-EG')}
                  </Text>
                )}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleEdit(event)} style={styles.actionBtn}>
                  <Ionicons name="pencil" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(event.id!)} style={[styles.actionBtn, { marginTop: 10 }]}>
                  <Ionicons name="trash" size={20} color="#E11D48" />
                </TouchableOpacity>
              </View>
            </View>
          );
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
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primaryDark },
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
    textAlignVertical: 'top',
  },
  textArea: {
    minHeight: 100,
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemInfo: { flex: 1, alignItems: 'flex-end', marginLeft: 15 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4, textAlign: 'right' },
  itemDetails: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 8 },
  itemDate: { fontSize: 12, color: COLORS.textMuted },
  itemActions: { flexDirection: 'column', gap: 5 },
  actionBtn: { padding: 8, backgroundColor: COLORS.inputBg, borderRadius: 8, alignItems: 'center' },
});
