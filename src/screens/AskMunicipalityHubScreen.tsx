import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { subscribeMunicipalityQuestions, addMunicipalityQuestion } from '../services/firestoreService';
import { MunicipalityQuestion } from '../types';

export const AskMunicipalityHubScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ask' | 'answers'>('ask');
  
  // Ask State
  const [questionText, setQuestionText] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Answers State
  const [questions, setQuestions] = useState<MunicipalityQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeMunicipalityQuestions('published', (data) => {
      setQuestions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!questionText.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة السؤال أولاً');
      return;
    }

    setIsSubmitting(true);
    try {
      await addMunicipalityQuestion(questionText.trim(), userName.trim());
      Alert.alert('نجاح', 'تم إرسال سؤالك للبلدية بنجاح، سيتم الرد عليه قريباً.');
      setQuestionText('');
      setUserName('');
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الإرسال');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPublishedQuestion = ({ item }: { item: MunicipalityQuestion }) => (
    <View style={styles.qaCard}>
      <View style={styles.qHeader}>
        <Ionicons name="person-circle" size={32} color={COLORS.textMuted} />
        <View style={styles.qHeaderText}>
          <Text style={styles.qUserName}>{item.userName}</Text>
          <Text style={styles.qDate}>{new Date(item.createdAt).toLocaleDateString('ar-SA')}</Text>
        </View>
      </View>
      <Text style={styles.qQuestionText}>{item.question}</Text>
      
      {item.answer && (
        <View style={styles.answerBox}>
          <View style={styles.answerHeader}>
            <Ionicons name="business" size={20} color="#059669" />
            <Text style={styles.answerTitle}>رد البلدية</Text>
          </View>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={48} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>اسأل البلدية</Text>
        <Text style={styles.headerSub}>تواصل معنا واطرح استفساراتك بكل شفافية</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'ask' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ask')}
        >
          <Text style={[styles.tabText, activeTab === 'ask' && styles.tabTextActive]}>اسأل من هنا</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'answers' && styles.tabBtnActive]}
          onPress={() => setActiveTab('answers')}
        >
          <Text style={[styles.tabText, activeTab === 'answers' && styles.tabTextActive]}>الأجوبة</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'ask' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>لديك استفسار؟</Text>
            <Text style={styles.formDesc}>اكتب سؤالك أو استفسارك وسنقوم بالرد عليه في أقرب وقت ممكن. قد يتم نشر السؤال والجواب لتعم الفائدة.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="الاسم (اختياري)"
              value={userName}
              onChangeText={setUserName}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="اكتب سؤالك هنا بوضوح..."
              value={questionText}
              onChangeText={setQuestionText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={[styles.submitBtn, (!questionText.trim() || isSubmitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!questionText.trim() || isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>إرسال السؤال</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={questions}
              keyExtractor={item => item.id}
              renderItem={renderPublishedQuestion}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.emptyText}>لا توجد أسئلة مجابة حالياً</Text>}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: '#0D9488', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, alignItems: 'center' },
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  headerSub: { fontSize: 15, color: '#CCFBF1' },
  
  tabsContainer: { flexDirection: 'row-reverse', padding: 12, backgroundColor: '#FFF', marginHorizontal: 16, marginTop: -20, borderRadius: 12, ...SHADOWS.small },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#0D9488' },
  tabText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
  tabTextActive: { color: '#FFF' },

  content: { padding: SPACING.lg, paddingBottom: 40 },
  formCard: { backgroundColor: COLORS.surface, padding: 24, borderRadius: 16, ...SHADOWS.medium },
  formTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8 },
  formDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22, marginBottom: 24 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 16, fontSize: 16, textAlign: 'right', marginBottom: 16 },
  textArea: { height: 120 },
  submitBtn: { backgroundColor: '#0D9488', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  listContainer: { flex: 1 },
  listContent: { padding: SPACING.lg, paddingBottom: 40 },
  qaCard: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, marginBottom: 16, ...SHADOWS.small },
  qHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 12 },
  qHeaderText: { marginRight: 12, flex: 1, alignItems: 'flex-end' },
  qUserName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  qDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  qQuestionText: { fontSize: 16, color: COLORS.textPrimary, textAlign: 'right', lineHeight: 24, marginBottom: 16 },
  
  answerBox: { backgroundColor: '#F0FDF4', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  answerHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 8 },
  answerTitle: { fontSize: 14, fontWeight: '800', color: '#059669', marginRight: 8 },
  answerText: { fontSize: 15, color: '#064E3B', textAlign: 'right', lineHeight: 24 },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textSecondary, fontSize: 16 },
});
