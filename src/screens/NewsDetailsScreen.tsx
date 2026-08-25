import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  Dimensions,
  TouchableOpacity,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../config/theme';
import { NewsArticle } from '../types';

const { width } = Dimensions.get('window');

export const NewsDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { newsItem } = route.params as { newsItem: NewsArticle };
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    if (!newsItem.images || newsItem.images.length <= 1) return;
    
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= newsItem.images.length) {
        nextIndex = 0;
      }
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, newsItem.images, viewerVisible]); // Pause auto-scroll when viewer is open

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل الخبر</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Category on the Left */}
        <View style={styles.categoryBadgeInline}>
          <Text style={styles.categoryTextInline}>{newsItem.category === 'أخرى' && newsItem.customCategory ? newsItem.customCategory : newsItem.category}</Text>
        </View>

        {/* Title Centered */}
        <Text style={styles.title}>{newsItem.title}</Text>
        
        {/* Inline Images Section (Smaller & Grid) */}
        {newsItem.images && newsItem.images.length > 0 && (
          <View style={styles.inlineGallery}>
            {newsItem.images.map((img, idx) => (
              <TouchableOpacity key={idx} activeOpacity={0.9} style={styles.inlineImageWrapper} onPress={() => { setViewerIndex(idx); setViewerVisible(true); }}>
                <Image source={{ uri: img }} style={styles.inlineImage} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.divider} />
        
        {/* Content */}
        <Text style={styles.content}>{newsItem.content}</Text>

        <View style={styles.divider} />

        {/* Date at the very end */}
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{newsItem.date}</Text>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
        </View>
        
        <View style={{ height: 60 }} />
      </View>

      <Modal visible={viewerVisible} transparent={true} animationType="fade" onRequestClose={() => setViewerVisible(false)}>
        <View style={styles.viewerContainer}>
          <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerVisible(false)}>
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          <ScrollView 
            horizontal 
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: viewerIndex * width, y: 0 }}
          >
            {newsItem.images?.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.viewerImage} />
            ))}
          </ScrollView>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', // Use row to respect native RTL
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8, marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  
  contentContainer: { padding: 24, paddingTop: 32 },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'center', lineHeight: 32, marginBottom: 24 },
  
  categoryBadgeInline: { alignSelf: 'flex-start', backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 12 },
  categoryTextInline: { color: COLORS.primaryDark, fontWeight: '800', fontSize: 13 },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 12 },
  dateText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },
  
  content: { fontSize: 16, color: COLORS.textPrimary, textAlign: 'left', lineHeight: 30 },
  
  inlineGallery: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start', 
    marginBottom: 24, 
  },
  inlineImageWrapper: { 
    width: '50%', 
    height: 150, 
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  inlineImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  viewerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  viewerClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  viewerImage: { width: width, height: '100%', resizeMode: 'contain' }
});
