import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeMunicipalityQuestions, updateMunicipalityQuestion, deleteMunicipalityQuestion } from '../../services/firestoreService';
import { MunicipalityQuestion } from '../../types';

export const AdminMunicipalityQuestionsScreen: React.FC = () => {
  const [questions, setQuestions] = useState<MunicipalityQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedQuestion, setSelectedQuestion] = useState<MunicipalityQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeMunicipalityQuestions('all', (data) => {
      setQuestions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openQuestionModal = (q: MunicipalityQuestion) => {
    setSelectedQuestion(q);
    setAnswerText(q.answer || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedQuestion(null);
    setAnswerText('');
  };

  const handleUpdateStatus = async (status: 'published' | 'pending') => {
    if (!selectedQuestion) return;
    setIsUpdating(true);
    try {
      await updateMunicipalityQuestion(selectedQuestion.id, {
        answer: answerText.trim(),
        status,
        answeredAt: status === 'published' ? new Date().toISOString() : selectedQuestion.answeredAt
      });
      Alert.alert('نجاح', `تم ${status === 'published' ? 'نشر الإجابة' : 'إرجاع السؤال للمسودات'}`);
      closeModal();
    } catch (e) {
      Alert.alert('خطأ', 'تعذر تحديث السؤال');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا السؤال نهائياً؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await deleteMunicipalityQuestion(id);
          if (selectedQuestion?.id === id) closeModal();
        } catch (e) {
          Alert.alert('خطأ', 'تعذر الحذف');
        }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: MunicipalityQuestion }) => (
    <TouchableOpacity style={styles.card} onPress={() => openQuestionModal(item)}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, item.status === 'published' ? styles.badgeSuccess : styles.badgeWarning]}>
          <Text style={styles.badgeText}>{item.status === 'published' ? 'منشور (مجاب)' : 'معلق (بانتظار الرد)'}</Text>
        </View>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('ar-SA')}</Text>
      </View>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.questionText} numberOfLines={2}>{item.question}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>لا توجد أسئلة حالياً</Text>}
        />
      )}

      {selectedQuestion && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <Ionicons name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>إدارة السؤال</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.label}>السائل:</Text>
              <Text style={styles.value}>{selectedQuestion.userName}</Text>

              <Text style={styles.label}>نص السؤال:</Text>
              <Text style={styles.questionFullText}>{selectedQuestion.question}</Text>

              <Text style={styles.label}>الإجابة:</Text>
              <TextInput
                style={styles.answerInput}
                placeholder="اكتب رد البلدية هنا..."
                value={answerText}
                onChangeText={setAnswerText}
                multiline
                textAlignVertical="top"
              />

              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.publishBtn]} 
                  onPress={() => handleUpdateStatus('published')}
                  disabled={isUpdating}
                >
                  <Ionicons name="checkmark-done" size={20} color="#FFF" />
                  <Text style={styles.btnText}>حفظ ونشر</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.pendingBtn]} 
                  onPress={() => handleUpdateStatus('pending')}
                  disabled={isUpdating}
                >
                  <Ionicons name="time" size={20} color="#B45309" />
                  <Text style={[styles.btnText, { color: '#B45309' }]}>تعليق (مسودة)</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[styles.actionBtn, styles.deleteBtn]} 
                onPress={() => handleDelete(selectedQuestion.id)}
                disabled={isUpdating}
              >
                <Ionicons name="trash" size={20} color={COLORS.danger} />
                <Text style={[styles.btnText, { color: COLORS.danger }]}>حذف السؤال نهائياً</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md, paddingBottom: 40 },
  card: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 12, ...SHADOWS.small },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeSuccess: { backgroundColor: '#D1FAE5' },
  badgeWarning: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  date: { fontSize: 12, color: COLORS.textSecondary },
  userName: { fontSize: 14, fontWeight: '700', color: COLORS.primary, textAlign: 'right', marginBottom: 4 },
  questionText: { fontSize: 15, color: COLORS.textPrimary, textAlign: 'right', lineHeight: 22 },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textSecondary, fontSize: 16 },

  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  closeBtn: { padding: 4 },
  modalContent: { padding: 20 },
  label: { fontSize: 14, color: COLORS.textMuted, textAlign: 'right', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 16 },
  questionFullText: { fontSize: 16, color: COLORS.textPrimary, textAlign: 'right', lineHeight: 24, marginBottom: 24, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  
  answerInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, padding: 16, height: 150, fontSize: 16, textAlign: 'right', marginBottom: 24 },
  
  actionsRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 16 },
  actionBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8 },
  publishBtn: { backgroundColor: '#059669' },
  pendingBtn: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
  deleteBtn: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' },
  btnText: { fontSize: 15, fontWeight: '700', color: '#FFF' }
});
