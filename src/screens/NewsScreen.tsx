import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Image,
  ScrollView,
  I18nManager
} from 'react-native';
import { ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { subscribeNews, subscribeNewsSettings } from '../services/firestoreService';
import { NewsArticle, NewsCategory } from '../types';

const BASE_CATEGORIES: string[] = ['الكل', 'خبر عاجل', 'عامة', 'خدمات', 'ثقافية', 'صحية'];

export const NewsScreen: React.FC<any> = ({ navigation }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [activeTab, setActiveTab] = useState<string>('الكل');
  const [coverImage, setCoverImage] = useState<string>('https://images.unsplash.com/photo-1542104470-36a536b04a08?q=80&w=600&auto=format&fit=crop');

  useEffect(() => {
    let unsubs: Function[] = [];
    unsubs.push(subscribeNews((items) => setNews(items)));
    unsubs.push(subscribeNewsSettings((data) => {
      if (data.coverImage) setCoverImage(data.coverImage);
    }));
    return () => unsubs.forEach(u => u());
  }, []);

  const filteredNews = news.filter(item => {
    if (activeTab === 'الكل') return true;
    if (item.category === 'أخرى' && item.customCategory) {
      return item.customCategory === activeTab;
    }
    return item.category === activeTab;
  });

  const dynamicCategories = [...BASE_CATEGORIES];
  news.forEach(item => {
    if (item.category === 'أخرى' && item.customCategory && !dynamicCategories.includes(item.customCategory)) {
      dynamicCategories.push(item.customCategory);
    }
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground source={{ uri: coverImage }} style={styles.header}>
        <View style={styles.headerOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>أخبار المجلس البلدي</Text>
        <Text style={styles.headerSub}>اطلع على أحدث القرارات</Text>
      </ImageBackground>

      {/* Categories Filter */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {[...dynamicCategories].reverse().map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catBtn, activeTab === cat && styles.catBtnActive]}
              onPress={() => setActiveTab(cat)}
            >
              <Text style={[styles.catText, activeTab === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* News List */}
      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا توجد أخبار متاحة حالياً في هذا القسم</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, SHADOWS.medium]}
            onPress={() => navigation.navigate('NewsDetails', { newsItem: item })}
            activeOpacity={0.9}
          >
            {/* Image on the Left (1st) */}
            <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400' }} style={styles.cardImage} />

            {/* Content on the Right (2nd) */}
            <View style={styles.cardContent}>
              {/* Category Top Right */}
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{item.category === 'أخرى' && item.customCategory ? item.customCategory : item.category}</Text>
              </View>
              
              {/* Title & Desc */}
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.content}</Text>
              
              <View style={{ flex: 1 }} />

              {/* Date Bottom Right */}
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>{item.date}</Text>
                <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 100, paddingBottom: 40, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  backBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 4, zIndex: 1 },
  headerSub: { fontSize: 14, color: '#E0E7FF', zIndex: 1 },
  
  categoriesWrapper: { backgroundColor: '#FFF', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  categoriesScroll: { paddingHorizontal: SPACING.md, gap: 8, flexDirection: 'row', justifyContent: 'flex-end', minWidth: '100%' },
  catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', marginLeft: 8 },
  catBtnActive: { backgroundColor: COLORS.primary },
  catText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  catTextActive: { color: '#FFF' },

  listPadding: { padding: SPACING.md, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', marginBottom: 16, height: 130 },
  cardImage: { width: 110, height: '100%', resizeMode: 'cover' },
  
  cardContent: { flex: 1, padding: 12 },
  categoryTag: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-end', marginBottom: 6 },
  categoryTagText: { fontSize: 10, fontWeight: '800', color: COLORS.primaryDark },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  dateText: { fontSize: 11, color: COLORS.textMuted },
  
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 4, lineHeight: 22 },
  cardDesc: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 18 },

  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
});
