import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, I18nManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeCleaningFees, addCleaningFee, updateCleaningFee, deleteCleaningFee, subscribeCleaningFeesNotes, updateCleaningFeesNotes } from '../../services/firestoreService';
import { CleaningFee } from '../../types';

export const AdminCleaningFeesScreen: React.FC<any> = ({ navigation }) => {
  const [fees, setFees] = useState<CleaningFee[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activityType, setActivityType] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [sypAmount, setSypAmount] = useState('');
  const [tryAmount, setTryAmount] = useState('');
  const [iconName, setIconName] = useState('document-text-outline');
  const [order, setOrder] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let unmounted = false;
    const unsubscribeFees = subscribeCleaningFees((data) => {
      if (!unmounted) setFees(data);
      if (!unmounted && notes) setLoading(false);
    });
    const unsubscribeNotes = subscribeCleaningFeesNotes((data) => {
      if (!unmounted) setNotes(data);
      if (!unmounted && fees) setLoading(false);
    });
    return () => {
      unmounted = true;
      unsubscribeFees();
      unsubscribeNotes();
    };
  }, []);

  const openModal = (fee?: CleaningFee) => {
    if (fee) {
      setEditingId(fee.id);
      setActivityType(fee.activityType);
      setUsdAmount(fee.usdAmount.toString());
      setSypAmount(fee.sypAmount.toString());
      setTryAmount(fee.tryAmount.toString());
      setIconName(fee.iconName);
      setOrder(fee.order.toString());
    } else {
      setEditingId(null);
      setActivityType('');
      setUsdAmount('');
      setSypAmount('');
      setTryAmount('');
      setIconName('document-text-outline');
      setOrder((fees.length + 1).toString());
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!activityType || !usdAmount || !sypAmount || !tryAmount) {
      Alert.alert('خطأ', 'يرجى تعبئة كافة الحقول');
      return;
    }

    setSubmitting(true);
    try {
      const feeData = {
        activityType,
        usdAmount: Number(usdAmount),
        sypAmount: Number(sypAmount),
        tryAmount: Number(tryAmount),
        iconName,
        order: Number(order)
      };

      if (editingId) {
        await updateCleaningFee(editingId, feeData);
      } else {
        await addCleaningFee(feeData);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد', 'هل أنت متأكد من حذف هذه الرسوم؟', [
      { text: 'إلغاء', style: 'cancel' },
      { 
        text: 'حذف', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCleaningFee(id);
          } catch (e) {
            Alert.alert('خطأ', 'فشل في الحذف');
          }
        }
      }
    ]);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const updatedNotes = [...notes, newNote.trim()];
    await updateCleaningFeesNotes(updatedNotes);
    setNewNote('');
    setNoteModalVisible(false);
  };

  const handleDeleteNote = (index: number) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذه الملاحظة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          const updatedNotes = notes.filter((_, i) => i !== index);
          await updateCleaningFeesNotes(updatedNotes);
        }
      }
    ]);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة رسوم النظافة</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listPadding}>
        {fees.map((fee) => (
          <View key={fee.id} style={[styles.card, SHADOWS.medium]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{fee.activityType}</Text>
            </View>

            <View style={styles.currenciesRow}>
              <View style={styles.currencyBlock}>
                <Text style={styles.currencyLabel}>دولار ($)</Text>
                <Text style={styles.currencyVal}>{fee.usdAmount}</Text>
              </View>
              <View style={styles.currencyBlock}>
                <Text style={styles.currencyLabel}>ل.س (SYP)</Text>
                <Text style={styles.currencyVal}>{fee.sypAmount}</Text>
              </View>
              <View style={styles.currencyBlock}>
                <Text style={styles.currencyLabel}>ل.ت (TRY)</Text>
                <Text style={styles.currencyVal}>{fee.tryAmount}</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(fee)}>
                <Ionicons name="pencil" size={18} color={COLORS.primary} />
                <Text style={styles.actionText}>تعديل</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => handleDelete(fee.id)}>
                <Ionicons name="trash" size={18} color={COLORS.danger} />
                <Text style={[styles.actionText, { color: COLORS.danger }]}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.notesSection}>
          <View style={styles.notesHeader}>
            <Text style={styles.notesTitle}>الملاحظات (أسفل الجدول)</Text>
            <TouchableOpacity style={styles.addNoteBtn} onPress={() => setNoteModalVisible(true)}>
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>إضافة</Text>
            </TouchableOpacity>
          </View>
          {notes.map((note, index) => (
            <View key={index} style={styles.noteCard}>
              <Text style={styles.noteText}>{note}</Text>
              <TouchableOpacity onPress={() => handleDeleteNote(index)} style={styles.deleteNoteBtn}>
                <Ionicons name="trash" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'تعديل رسوم' : 'إضافة رسوم جديدة'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>نوع النشاط (مثال: منزل)</Text>
              <TextInput style={styles.input} value={activityType} onChangeText={setActivityType} placeholder="أدخل نوع النشاط..." />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>السعر ($)</Text>
                  <TextInput style={styles.input} value={usdAmount} onChangeText={setUsdAmount} keyboardType="numeric" placeholder="3" />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>السعر (SYP)</Text>
                  <TextInput style={styles.input} value={sypAmount} onChangeText={setSypAmount} keyboardType="numeric" placeholder="500" />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>السعر (TRY)</Text>
                  <TextInput style={styles.input} value={tryAmount} onChangeText={setTryAmount} keyboardType="numeric" placeholder="150" />
                </View>
              </View>

              <Text style={styles.label}>الترتيب (Order)</Text>
              <TextInput style={styles.input} value={order} onChangeText={setOrder} keyboardType="numeric" />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>حفظ</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Note Modal */}
      <Modal visible={noteModalVisible} transparent={true} animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إضافة ملاحظة</Text>
              <TouchableOpacity onPress={() => setNoteModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <TextInput 
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
              value={newNote} 
              onChangeText={setNewNote} 
              placeholder="اكتب الملاحظة هنا..." 
              multiline 
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddNote}>
              <Text style={styles.saveBtnText}>إضافة</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  backBtn: { padding: 4 },
  addBtn: { padding: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  
  listPadding: { padding: SPACING.md, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, flex: 1, textAlign: 'right' },
  
  currenciesRow: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  currencyBlock: { alignItems: 'center', flex: 1 },
  currencyLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '700' },
  currencyVal: { fontSize: 18, fontWeight: '900', color: COLORS.primary },

  cardActions: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', gap: 12 },
  actionBtn: { flex: 1, flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primaryLight, paddingVertical: 10, borderRadius: 10 },
  actionText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  notesSection: { marginTop: 20 },
  notesHeader: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  notesTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  addNoteBtn: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  noteCard: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  noteText: { flex: 1, textAlign: 'right', fontSize: 14, color: COLORS.textSecondary, marginRight: 12 },
  deleteNoteBtn: { padding: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, textAlign: 'right' },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: COLORS.textPrimary, textAlign: 'right', marginBottom: 16 },
  row: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse' },
  
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 30 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
