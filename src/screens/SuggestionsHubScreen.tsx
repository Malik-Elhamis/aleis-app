import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { submitProjectSuggestion, subscribeProjects } from '../services/firestoreService';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { MunicipalProject } from '../types';

export const SuggestionsHubScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // List State
  const [approvedSuggestions, setApprovedSuggestions] = useState<MunicipalProject[]>([]);

  useEffect(() => {
    const unsub = subscribeProjects((items) => {
      // Filter for published suggestions (status 'suggested' and isApproved true)
      const approved = items.filter(p => p.status === 'suggested' && p.isApproved);
      setApprovedSuggestions(approved);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المقترح والتفاصيل.');
      return;
    }

    setIsSubmitting(true);
    const success = await submitProjectSuggestion(title, description, authorName.trim());
    setIsSubmitting(false);

    if (success) {
      Alert.alert('تم بنجاح', 'تم إرسال مقترحك بنجاح. سيتم مراجعته من قبل إدارة البلدية وعرضه للعامة إذا تمت الموافقة عليه.', [
        { text: 'حسناً', onPress: () => {
          setTitle('');
          setDescription('');
          setAuthorName('');
          setActiveTab('list');
        }}
      ]);
    } else {
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال المقترح. يرجى المحاولة لاحقاً.');
    }
  };

  const renderForm = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.formContainer, SHADOWS.medium]}>
        <Text style={styles.label}>الاسم (اختياري)</Text>
        <TextInput
          style={styles.input}
          placeholder="إذا أردت، اكتب اسمك ليظهر مع المقترح"
          value={authorName}
          onChangeText={setAuthorName}
          textAlign="right"
        />

        <Text style={styles.label}>عنوان المقترح *</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: حديقة عامة، تحسين طريق..."
          value={title}
          onChangeText={setTitle}
          textAlign="right"
        />

        <Text style={styles.label}>تفاصيل وفكرة المقترح *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="اشرح فكرة المقترح والفوائد التي سيقدمها للبلدة..."
          value={description}
          onChangeText={setDescription}
          textAlign="right"
          multiline
          numberOfLines={5}
        />

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال المقترح'}
          </Text>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderList = () => (
    <FlatList
      data={approvedSuggestions}
      keyExtractor={(item) => item.id || Math.random().toString()}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>لا توجد مقترحات معروضة حالياً.</Text>
          <Text style={styles.emptySub}>كن أول من يطرح فكرة تطويرية للعيس!</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={[styles.suggestionCard, SHADOWS.small]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SuggestionDetails', { suggestionId: item.id })}
        >
          <View style={styles.cardHeaderRow}>
            <Ionicons name="bulb" size={24} color="#9333EA" />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
          <Text style={styles.cardDesc}>{item.description}</Text>
          {!!item.authorName && (
            <Text style={styles.authorText}>بواسطة: {item.authorName}</Text>
          )}
          <View style={styles.cardFooterRow}>
            <Text style={styles.dateText}>
              📅 {typeof item.createdAt === 'string' ? new Date(item.createdAt).toLocaleDateString('ar-EG') : 'حديث'}
            </Text>
            <View style={styles.approvedBadge}>
              <Text style={styles.approvedBadgeText}>معتمد</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name="bulb" size={48} color="#9333EA" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>بوابة المقترحات</Text>
        <Text style={styles.headerSub}>ماذا تقترح للبلدية؟ ماذا تقترح للعيس لتطويرها؟ لو كنت مسؤولاً أو لو كنت صاحب قرار، ماذا تستطيع أن تقدم أو تقترح للعيس من خدمات ومن تطوير في جميع المجالات؟</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'list' && styles.activeTab]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>المقترحات المنشورة</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'form' && styles.activeTab]}
          onPress={() => setActiveTab('form')}
        >
          <Text style={[styles.tabText, activeTab === 'form' && styles.activeTabText]}>تقديم اقتراح</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {activeTab === 'form' ? renderForm() : renderList()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerContainer: { backgroundColor: '#F3E8FF', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#7E22CE', marginBottom: 8 },
  headerSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  
  tabsContainer: { flexDirection: 'row-reverse', backgroundColor: '#FFF', elevation: 2, zIndex: 10 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#9333EA' },
  tabText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
  activeTabText: { color: '#9333EA', fontWeight: '900' },

  contentArea: { flex: 1 },

  // Form Styles
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  formContainer: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20 },
  label: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, textAlign: 'right' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 16, fontSize: 15, marginBottom: 20 },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#9333EA', flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, gap: 10, marginTop: 10 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },

  // List Styles
  listContent: { padding: SPACING.lg, paddingBottom: 100 },
  emptyContainer: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '700' },
  emptySub: { marginTop: 8, fontSize: 14, color: COLORS.textMuted },
  
  suggestionCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderRightWidth: 4, borderRightColor: '#9333EA' },
  cardHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, flex: 1, textAlign: 'right' },
  cardDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22, marginBottom: 12 },
  authorText: { fontSize: 13, color: '#9333EA', textAlign: 'right', fontWeight: '700', marginBottom: 16 },
  
  cardFooterRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  dateText: { fontSize: 13, color: COLORS.textMuted },
  approvedBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  approvedBadgeText: { color: '#059669', fontSize: 12, fontWeight: '700' }
});
