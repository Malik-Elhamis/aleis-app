import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MunicipalProject } from '../types';

const { width } = Dimensions.get('window');

type ParamList = {
  ProjectDetails: { projectId: string };
};

export const ProjectDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'ProjectDetails'>>();
  const { projectId } = route.params;

  const [project, setProject] = useState<MunicipalProject | null>(null);
  const [loading, setLoading] = useState(true);
  
  const formattedImages = useMemo(() => project?.images?.map(uri => ({ uri })) || [], [project?.images]);
  
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() } as MunicipalProject);
        }
      } catch (error) {
        console.error("Error fetching project details: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.errorText}>لم يتم العثور على المشروع.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Images Carousel */}
        {project.images && project.images.length > 0 ? (
          <View style={styles.carouselContainer}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {project.images.map((img, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.imageWrapper}
                  activeOpacity={0.9}
                  onPress={() => {
                    setCurrentImageIndex(idx);
                    setIsImageViewerVisible(true);
                  }}
                >
                  <Image source={{ uri: img }} style={[styles.image, { position: 'absolute', opacity: 0.8 }]} blurRadius={15} />
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
                  <Image source={{ uri: img }} style={[styles.image, { resizeMode: 'contain' }]} />
                  {project.images.length > 1 && (
                    <View style={styles.imageCounter}>
                      <Text style={styles.imageCounterText}>{idx + 1} / {project.images.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={[styles.imageWrapper, styles.noImage]}>
            <Ionicons name="image-outline" size={48} color={COLORS.border} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={[
              styles.statusChip, 
              project.status === 'completed' && { backgroundColor: '#D1FAE5' },
              project.status === 'planned' && { backgroundColor: '#FEF3C7' },
              project.status === 'suggested' && { backgroundColor: '#F3E8FF' }
            ]}>
              <Text style={[
                styles.statusChipText,
                project.status === 'completed' && { color: '#059669' },
                project.status === 'planned' && { color: '#D97706' },
                project.status === 'suggested' && { color: '#9333EA' }
              ]}>{project.statusText}</Text>
            </View>
            <Text style={styles.categoryBadge}>{project.category}</Text>
          </View>

          <Text style={styles.title}>{project.title}</Text>
          
          <Text style={styles.sectionTitle}>التفاصيل:</Text>
          <Text style={styles.description}>{project.description}</Text>

          {!!project.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.sectionTitle}>ملاحظات:</Text>
              <Text style={styles.notesText}>{project.notes}</Text>
            </View>
          )}

          <View style={styles.divider} />
          
          {/* Progress */}
          {project.status !== 'suggested' && typeof project.progressPercentage === 'number' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressText}>نسبة الإنجاز: {project.progressPercentage}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${project.progressPercentage}%`,
                      backgroundColor: project.status === 'completed' ? '#10B981' : COLORS.primary
                    }
                  ]} 
                />
              </View>
            </View>
          )}

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
              <Text style={styles.infoLabel}>تاريخ البدء</Text>
              <Text style={styles.infoValue}>{project.startDate || 'غير محدد'}</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="calendar-clear-outline" size={24} color={COLORS.primary} />
              <Text style={styles.infoLabel}>تاريخ الانتهاء</Text>
              <Text style={styles.infoValue}>{project.endDate || 'غير محدد'}</Text>
            </View>
            
            {!!project.budget && (
              <View style={[styles.infoCard, { width: '100%' }]}>
                <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
                <Text style={styles.infoLabel}>الميزانية المقدرة</Text>
                <Text style={styles.infoValue}>{project.budget}</Text>
              </View>
            )}
          </View>

        </View>

      </ScrollView>

      {/* Full-screen Image Viewer Modal */}
      <Modal visible={isImageViewerVisible} transparent={true} animationType="fade" onRequestClose={() => setIsImageViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
          <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity 
              style={{ position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 }}
              onPress={() => setIsImageViewerVisible(false)}
            >
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
            
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: currentImageIndex * width, y: 0 }}
            >
              {formattedImages.map((img, idx) => (
                <View key={idx} style={{ width, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Image 
                    source={{ uri: img.uri }} 
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
                    resizeMethod="resize" 
                  />
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: COLORS.textMuted, marginTop: 12, fontWeight: '600' },
  
  scrollContent: { paddingBottom: 40 },
  
  carouselContainer: { width: '100%', height: 280 },
  imageWrapper: { width, height: 280, overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  noImage: { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageCounterText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  content: { padding: SPACING.lg, backgroundColor: COLORS.background },
  
  headerRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusChip: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusChipText: { color: '#2563EB', fontSize: 13, fontWeight: '700' },
  categoryBadge: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },

  title: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 16, lineHeight: 34 },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primary, textAlign: 'right', marginBottom: 8 },
  description: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 26, marginBottom: 16 },
  
  notesContainer: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 16 },
  notesText: { fontSize: 14, color: '#92400E', textAlign: 'right', lineHeight: 22 },

  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
  
  progressContainer: { marginBottom: 24 },
  progressHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  progressBarTrack: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },

  infoGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  infoCard: { 
    width: '48%', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8, marginBottom: 4, textAlign: 'center' },
  infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' }
});
