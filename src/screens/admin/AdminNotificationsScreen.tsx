import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppNotification, AppNotificationType } from '../../types';
import { subscribeAppNotifications, addAppNotification, updateAppNotification, deleteAppNotification, sendPushNotification } from '../../services/firestoreService';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';

export const AdminNotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AppNotificationType>('info');

  useEffect(() => {
    const unsub = subscribeAppNotifications((fetched) => {
      setNotifications(fetched);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setType('info');
  };

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('تنبيه', 'الرجاء تعبئة العنوان ونص الإشعار');
      return;
    }

    try {
      setIsSending(true);
      if (editingId) {
        await updateAppNotification(editingId, { title, message, type });
        Alert.alert('نجاح', 'تم تحديث الإشعار بنجاح');
      } else {
        await addAppNotification({ title, message, type });
        await sendPushNotification(title, message, { type });
        Alert.alert('نجاح', 'تم إرسال الإشعار بنجاح لجميع المستخدمين');
      }
      resetForm();
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا الإشعار؟ سيختفي من هواتف المستخدمين.', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteAppNotification(id);
        } catch (error) {
          Alert.alert('خطأ', 'فشل الحذف');
        }
      }}
    ]);
  };

  const handleEdit = (item: AppNotification) => {
    setEditingId(item.id!);
    setTitle(item.title);
    setMessage(item.message);
    setType(item.type);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderTypeSelector = () => (
    <View style={styles.typeSelector}>
      <TouchableOpacity 
        style={[styles.typeBtn, type === 'urgent' && styles.typeBtnUrgent]}
        onPress={() => setType('urgent')}
      >
        <Text style={[styles.typeText, type === 'urgent' && { color: '#FFF' }]}>عاجل</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.typeBtn, type === 'warning' && styles.typeBtnWarning]}
        onPress={() => setType('warning')}
      >
        <Text style={[styles.typeText, type === 'warning' && { color: '#FFF' }]}>تحذير</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.typeBtn, type === 'info' && styles.typeBtnInfo]}
        onPress={() => setType('info')}
      >
        <Text style={[styles.typeText, type === 'info' && { color: '#FFF' }]}>عادي</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[{ key: 'form' }, ...notifications]}
        keyExtractor={(item) => (item as any).id || (item as any).key}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          if ((item as any).key === 'form') {
            return (
              <View style={[styles.formContainer, SHADOWS.small]}>
                <Text style={styles.formTitle}>{editingId ? 'تعديل الإشعار' : 'إرسال إشعار جديد'}</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="عنوان الإشعار (مثال: هام جداً)"
                  value={title}
                  onChangeText={setTitle}
                  textAlign="right"
                />
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="نص الإشعار والتفاصيل..."
                  value={message}
                  onChangeText={setMessage}
                  textAlign="right"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.label}>نوع الإشعار:</Text>
                {renderTypeSelector()}

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSending}>
                    {isSending ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.saveBtnText}>{editingId ? 'تحديث الإشعار' : 'إرسال الإشعار'}</Text>
                    )}
                  </TouchableOpacity>
                  {editingId && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={resetForm} disabled={isSending}>
                      <Text style={styles.cancelBtnText}>إلغاء</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }

          const notification = item as AppNotification;
          return (
            <View style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{notification.title}</Text>
                <Text style={styles.itemMessage} numberOfLines={2}>{notification.message}</Text>
                {notification.createdAt && (
                  <Text style={styles.itemDate}>
                    {new Date(notification.createdAt).toLocaleString('ar-EG')}
                  </Text>
                )}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleEdit(notification)} style={styles.actionBtn}>
                  <Ionicons name="pencil" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(notification.id!)} style={[styles.actionBtn, { marginTop: 10 }]}>
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
  label: {
    textAlign: 'right',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  typeSelector: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeBtnUrgent: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  typeBtnWarning: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  typeBtnInfo: { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' },
  typeText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  formActions: { flexDirection: 'row-reverse', justifyContent: 'flex-start', gap: 10 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: {
    backgroundColor: '#94A3B8',
    paddingHorizontal: 24,
    paddingVertical: 12,
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
  itemMessage: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 8 },
  itemDate: { fontSize: 12, color: COLORS.textMuted },
  itemActions: { flexDirection: 'column', gap: 5 },
  actionBtn: { padding: 8, backgroundColor: COLORS.inputBg, borderRadius: 8, alignItems: 'center' },
});
