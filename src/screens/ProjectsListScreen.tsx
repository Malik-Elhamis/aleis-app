import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { subscribeProjects } from '../services/firestoreService';
import { MunicipalProject } from '../types';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

type ParamList = {
  ProjectsList: {
    status: 'completed' | 'in_progress' | 'planned' | 'suggested';
    title: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProjectsListScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'ProjectsList'>>();
  const navigation = useNavigation<NavigationProp>();
  const { status, title } = route.params;

  const [projects, setProjects] = useState<MunicipalProject[]>([]);

  useEffect(() => {
    const unsub = subscribeProjects((data) => setProjects(data));
    return () => unsub();
  }, []);

  const filteredProjects = projects.filter(p => {
    if (status === 'suggested') {
      return p.status === 'suggested' && p.isApproved === true;
    }
    return p.status === status;
  });



  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textMuted }}>لا يوجد مشاريع في هذا القسم حالياً.</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.projectCard, SHADOWS.medium]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ProjectDetails', { projectId: item.id })}
          >
            {/* Main Image */}
            {item.images && item.images.length > 0 ? (
              <Image source={{ uri: item.images[0] }} style={styles.coverImage} />
            ) : (
              <View style={[styles.coverImage, { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="image-outline" size={32} color="#CBD5E1" />
              </View>
            )}

            <View style={styles.cardContent}>
              <View style={styles.badgeRow}>
                <View style={[
                  styles.statusChip, 
                  item.status === 'completed' && { backgroundColor: '#D1FAE5' },
                  item.status === 'planned' && { backgroundColor: '#FEF3C7' },
                  item.status === 'suggested' && { backgroundColor: '#F3E8FF' }
                ]}>
                  <Text style={[
                    styles.statusChipText,
                    item.status === 'completed' && { color: '#059669' },
                    item.status === 'planned' && { color: '#D97706' },
                    item.status === 'suggested' && { color: '#9333EA' }
                  ]}>{item.statusText}</Text>
                </View>
                <Text style={styles.categoryBadge}>{item.category}</Text>
              </View>

              <Text style={styles.projectTitle}>{item.title}</Text>
              
              <View style={styles.datesContainer}>
                <Text style={styles.dateText}>تاريخ البدء: {item.startDate}</Text>
                <Text style={styles.dateText}>تاريخ الانتهاء: {item.endDate}</Text>
              </View>

              {item.status !== 'suggested' && typeof item.progressPercentage === 'number' && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarTrack}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${item.progressPercentage}%`,
                          backgroundColor: item.status === 'completed' ? '#10B981' : COLORS.primary
                        }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  listPadding: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  projectCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  coverImage: { width: '100%', height: 180 },
  cardContent: {
    padding: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusChip: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  categoryBadge: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'left',
    marginBottom: 8,
  },
  progressContainer: { 
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600'
  }
});
