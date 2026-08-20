import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { UnifiedReportFormScreen } from '../screens/UnifiedReportFormScreen';
import { ServiceProvidersListScreen } from "../screens/ServiceProvidersListScreen";
import { UnifiedReportsListScreen } from '../screens/UnifiedReportsListScreen';
import { ComplaintsViolationsHubScreen } from '../screens/ComplaintsViolationsHubScreen';
import { ComplaintDetailsScreen } from '../screens/ComplaintDetailsScreen';
import { ViolationDetailsScreen } from '../screens/ViolationDetailsScreen';
import { WaterHubScreen } from '../screens/WaterHubScreen';
import { WaterScheduleScreen } from '../screens/WaterScheduleScreen';
import { WaterFaultsScreen } from '../screens/WaterFaultsScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { ProjectsListScreen } from '../screens/ProjectsListScreen';
import { ProjectDetailsScreen } from '../screens/ProjectDetailsScreen';
import { SuggestionsHubScreen } from '../screens/SuggestionsHubScreen';
import { SuggestionDetailsScreen } from '../screens/SuggestionDetailsScreen';
import { EmergencyScreen } from '../screens/EmergencyScreen';
import { NewsDetailsScreen } from '../screens/NewsDetailsScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { MunicipalServicesScreen } from '../screens/MunicipalServicesScreen';
import { HumanitarianScreen } from '../screens/HumanitarianScreen';
import { HumanitarianListScreen } from '../screens/HumanitarianListScreen';
import { HumanitarianDetailsScreen } from '../screens/HumanitarianDetailsScreen';
import { ReportHumanitarianCaseScreen } from '../screens/ReportHumanitarianCaseScreen';
import { DonationMethodDetailsScreen } from '../screens/DonationMethodDetailsScreen';
import { DonationsScreen } from '../screens/DonationsScreen';
import { DonationsListScreen } from '../screens/DonationsListScreen';
import { ObituariesScreen } from '../screens/ObituariesScreen';
import { ObituaryDetailsScreen } from '../screens/ObituaryDetailsScreen';
import { CouncilScreen } from '../screens/CouncilScreen';
import { CouncilMemberDetailsScreen } from '../screens/CouncilMemberDetailsScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';
import { AleisScreen } from '../screens/AleisScreen';
import { CleanlinessHubScreen } from '../screens/CleanlinessHubScreen';
import { CleanlinessFormScreen } from '../screens/CleanlinessFormScreen';
import { CleaningFeesScreen } from '../screens/CleaningFeesScreen';
import { ElectricityHubScreen } from '../screens/ElectricityHubScreen';
import { ElectricityFaultsScreen } from '../screens/ElectricityFaultsScreen';
import { ElectricityAlertsScreen } from '../screens/ElectricityAlertsScreen';
import { ElectricityAlertDetailsScreen } from '../screens/ElectricityAlertDetailsScreen';

// Admin Screens
import { AdminLoginScreen } from '../screens/admin/AdminLoginScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminNewsScreen } from '../screens/admin/AdminNewsScreen';
import { AdminNewsFormScreen } from '../screens/admin/AdminNewsFormScreen';
import { MunicipalityPapersScreen } from '../screens/MunicipalityPapersScreen';
import { AskMunicipalityHubScreen } from '../screens/AskMunicipalityHubScreen';
import { AdminMunicipalityPapersScreen } from '../screens/admin/AdminMunicipalityPapersScreen';
import { AdminMunicipalityQuestionsScreen } from '../screens/admin/AdminMunicipalityQuestionsScreen';
import { AdminWaterSchedulesScreen } from '../screens/admin/AdminWaterSchedulesScreen';
import { AdminWaterFaultsScreen } from '../screens/admin/AdminWaterFaultsScreen';
import { AdminProjectsScreen } from '../screens/admin/AdminProjectsScreen';
import { AdminProjectsListScreen } from '../screens/admin/AdminProjectsListScreen';
import { AdminProjectFormScreen } from '../screens/admin/AdminProjectFormScreen';
import { AdminProjectDetailsScreen } from '../screens/admin/AdminProjectDetailsScreen';
import { AdminSuggestionsScreen } from '../screens/admin/AdminSuggestionsScreen';
import { AdminSuggestionDetailsScreen } from '../screens/admin/AdminSuggestionDetailsScreen';
import { AdminUnifiedReportsScreen } from '../screens/admin/AdminUnifiedReportsScreen';
import { AdminComplaintDetailsScreen } from '../screens/admin/AdminComplaintDetailsScreen';
import { AdminViolationDetailsScreen } from '../screens/admin/AdminViolationDetailsScreen';
import { AdminHumanitarianScreen } from '../screens/admin/AdminHumanitarianScreen';
import { AdminObituariesScreen } from '../screens/admin/AdminObituariesScreen';
import { AdminDonationsScreen } from '../screens/admin/AdminDonationsScreen';
import { AdminDonationMethodFormScreen } from '../screens/admin/AdminDonationMethodFormScreen';
import { AdminOngoingDonationFormScreen } from '../screens/admin/AdminOngoingDonationFormScreen';
import { AdminHumanitarianReportsScreen } from '../screens/admin/AdminHumanitarianReportsScreen';
import { AdminCouncilScreen } from '../screens/admin/AdminCouncilScreen';
import { AdminCleanlinessScreen } from '../screens/admin/AdminCleanlinessScreen';
import { AdminCleaningFeesScreen } from '../screens/admin/AdminCleaningFeesScreen';
import { AdminElectricityFaultsScreen } from '../screens/admin/AdminElectricityFaultsScreen';
import { AdminElectricityFaultDetailsScreen } from '../screens/admin/AdminElectricityFaultDetailsScreen';
import { AdminElectricityAlertsScreen } from '../screens/admin/AdminElectricityAlertsScreen';
import { AdminElectricityAlertFormScreen } from '../screens/admin/AdminElectricityAlertFormScreen';
import { AdminHomeSliderScreen } from '../screens/admin/AdminHomeSliderScreen';
import { AdminLogoScreen } from '../screens/admin/AdminLogoScreen';
import { AdminAboutUsScreen } from '../screens/admin/AdminAboutUsScreen';
import { AdminAleisScreen } from '../screens/admin/AdminAleisScreen';
import { AdminEmergencyScreen } from '../screens/admin/AdminEmergencyScreen';
import { AleisDetailsScreen } from '../screens/AleisDetailsScreen';
import { AdminServiceProvidersScreen } from '../screens/admin/AdminServiceProvidersScreen';
import { BottomTabNavigator } from './BottomTabNavigator';

import { COLORS } from '../config/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { authMode, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="NewsHub"
        component={NewsScreen}
        options={{ headerShown: false }}
      />
      
      {/* New Modules */}
      <Stack.Screen name="MunicipalServices" component={MunicipalServicesScreen} options={{ title: 'المعاملات الورقية' }} />
      <Stack.Screen name="Humanitarian" component={HumanitarianScreen} options={{ title: 'الحالات الإنسانية' }} />
      <Stack.Screen name="HumanitarianList" component={HumanitarianListScreen} options={{ title: 'قائمة الحالات' }} />
      <Stack.Screen name="HumanitarianDetails" component={HumanitarianDetailsScreen} options={{ title: 'تفاصيل الحالة' }} />
      <Stack.Screen name="ReportHumanitarianCase" component={ReportHumanitarianCaseScreen} options={{ title: 'الإبلاغ عن حالة إنسانية' }} />
      <Stack.Screen name="Donations" component={DonationsScreen} options={{ title: 'التبرعات' }} />
      <Stack.Screen name="DonationsList" component={DonationsListScreen} options={({ route }) => ({ title: (route.params as any).title })} />
      <Stack.Screen name="Obituaries" component={ObituariesScreen} options={{ title: 'الوفيات' }} />
      <Stack.Screen name="ObituaryDetails" component={ObituaryDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Council" component={CouncilScreen} options={{ title: 'المجلس البلدي' }} />
      <Stack.Screen name="CouncilMemberDetails" component={CouncilMemberDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ServiceProvidersList" component={ServiceProvidersListScreen} options={{ title: 'الخدمات والمهن' }} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} options={{ title: 'من نحن' }} />
      <Stack.Screen name="Aleis" component={AleisScreen} options={{ title: 'العيس' }} />
      
      <Stack.Screen name="CleanlinessHub" component={CleanlinessHubScreen} options={{ title: 'النظافة' }} />
      <Stack.Screen name="CleanlinessForm" component={CleanlinessFormScreen} options={{ title: 'طلب نظافة' }} />
      <Stack.Screen name="CleaningFees" component={CleaningFeesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ElectricityHub" component={ElectricityHubScreen} options={{ title: 'الكهرباء والإنارة' }} />
      <Stack.Screen name="ElectricityFaults" component={ElectricityFaultsScreen} options={{ title: 'أعطال الكهرباء' }} />
      <Stack.Screen name="ElectricityAlerts" component={ElectricityAlertsScreen} options={{ title: 'تنبيهات الأعطال' }} />
      <Stack.Screen name="ElectricityAlertDetails" component={ElectricityAlertDetailsScreen} options={{ title: 'تفاصيل التنبيه' }} />
      
      <Stack.Screen 
        name="NewsDetails" 
        component={NewsDetailsScreen}
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'الملف الشخصي' }}
      />
      <Stack.Screen
        name="Services"
        component={ServicesScreen}
        options={{ title: 'الخدمات والمعاملات' }}
      />
      <Stack.Screen
        name="UnifiedReportForm"
        component={UnifiedReportFormScreen}
        options={{ title: 'تقديم بلاغ جديد' }}
      />
      <Stack.Screen
        name="ComplaintsViolationsHub"
        component={ComplaintsViolationsHubScreen}
        options={{ title: 'الشكاوى والمخالفات' }}
      />
      <Stack.Screen
        name="ComplaintsList"
        component={UnifiedReportsListScreen}
        options={{ title: 'سجل البلاغات والشكاوى' }}
      />
      <Stack.Screen
        name="ComplaintDetails"
        component={ComplaintDetailsScreen}
        options={{ title: 'تفاصيل البلاغ' }}
      />
      <Stack.Screen
        name="DonationMethodDetails"
        component={DonationMethodDetailsScreen}
        options={{ title: 'طريقة التبرع', headerBackTitle: 'رجوع' }}
      />
      <Stack.Screen 
        name="ViolationDetails" 
        component={ViolationDetailsScreen} 
        options={{ headerTitle: 'تفاصيل المخالفة', headerBackTitle: 'رجوع' }} 
      />

      {/* Admin Flow */}
      <Stack.Screen 
        name="AdminComplaintDetails" 
        component={AdminComplaintDetailsScreen} 
        options={{ headerTitle: 'معالجة الشكوى', headerBackTitle: 'رجوع' }} 
      />
      <Stack.Screen 
        name="AdminUnifiedReports" 
        component={AdminUnifiedReportsScreen} 
        options={{ headerTitle: 'إدارة الشكاوى والمخالفات', headerBackTitle: 'رجوع' }} 
      />
      <Stack.Screen 
        name="AdminViolationDetails" 
        component={AdminViolationDetailsScreen} 
        options={{ headerTitle: 'معالجة المخالفة', headerBackTitle: 'رجوع' }} 
      />
      <Stack.Screen
        name="WaterHub"
        component={WaterHubScreen}
        options={{ title: 'قسم المياه' }}
      />
      <Stack.Screen
        name="WaterSchedule"
        component={WaterScheduleScreen}
        options={{ title: 'جدول توزيع المياه' }}
      />
      <Stack.Screen
        name="WaterFaults"
        component={WaterFaultsScreen}
        options={{ title: 'إعلانات الأعطال' }}
      />
      <Stack.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{ title: 'المشاريع والإنجازات' }}
      />
      <Stack.Screen
        name="ProjectsList"
        component={ProjectsListScreen}
        options={({ route }) => ({ title: (route.params as any)?.title || 'قائمة المشاريع' })}
      />
      <Stack.Screen 
        name="ProjectDetails" 
        component={ProjectDetailsScreen} 
        options={{ title: 'تفاصيل المشروع' }} 
      />
      <Stack.Screen 
        name="SuggestionsHub" 
        component={SuggestionsHubScreen} 
        options={{ title: 'بوابة المقترحات' }} 
      />
      <Stack.Screen 
        name="SuggestionDetails" 
        component={SuggestionDetailsScreen} 
        options={{ title: 'تفاصيل المقترح' }} 
      />
      <Stack.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{ title: 'دليل الطوارئ' }}
      />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminWaterSchedules" component={AdminWaterSchedulesScreen} options={{ title: 'إدارة جداول المياه' }} />
      <Stack.Screen name="AdminWaterFaults" component={AdminWaterFaultsScreen} options={{ title: 'إدارة أعطال المياه' }} />
      <Stack.Screen name="AdminProjects" component={AdminProjectsScreen} options={{ title: 'المشاريع والإنجازات' }} />
      <Stack.Screen name="AdminProjectsList" component={AdminProjectsListScreen} options={({ route }) => ({ title: (route.params as any)?.title || 'قائمة المشاريع' })} />
      <Stack.Screen name="AdminProjectDetails" component={AdminProjectDetailsScreen} options={{ title: 'تفاصيل المشروع' }} />
      <Stack.Screen name="AdminProjectForm" component={AdminProjectFormScreen} options={{ title: 'نموذج المشروع' }} />
      <Stack.Screen name="AdminSuggestions" component={AdminSuggestionsScreen} options={{ title: 'إدارة المقترحات' }} />
      <Stack.Screen name="AdminSuggestionDetails" component={AdminSuggestionDetailsScreen} options={{ title: 'تفاصيل المقترح' }} />
      
      {/* News Admin */}
      <Stack.Screen name="AdminNews" component={AdminNewsScreen} options={{ title: 'إدارة الأخبار' }} />
      <Stack.Screen name="AdminNewsForm" component={AdminNewsFormScreen} options={{ title: 'تفاصيل الخبر' }} />
      <Stack.Screen name="MunicipalityPapers" component={MunicipalityPapersScreen} options={{ title: 'أوراق البلدية' }} />
      <Stack.Screen name="AskMunicipalityHub" component={AskMunicipalityHubScreen} options={{ title: 'اسأل البلدية' }} />
      <Stack.Screen name="AdminMunicipalityPapers" component={AdminMunicipalityPapersScreen} options={{ title: 'إدارة أوراق البلدية' }} />
      <Stack.Screen name="AdminMunicipalityQuestions" component={AdminMunicipalityQuestionsScreen} options={{ title: 'إدارة أسئلة البلدية' }} />
        
      {/* New Admin Modules */}
      <Stack.Screen name="AdminHumanitarian" component={AdminHumanitarianScreen} options={{ title: 'إدارة الحالات الإنسانية' }} />
      <Stack.Screen name="AdminDonations" component={AdminDonationsScreen} options={{ title: 'إدارة التبرعات' }} />
      <Stack.Screen name="AdminDonationMethodForm" component={AdminDonationMethodFormScreen} options={{ title: 'طريقة التبرع' }} />
      <Stack.Screen name="AdminOngoingDonationForm" component={AdminOngoingDonationFormScreen} options={{ title: 'التبرع الجاري' }} />
      <Stack.Screen name="AdminHumanitarianReports" component={AdminHumanitarianReportsScreen} options={{ title: 'بلاغات الحالات الإنسانية' }} />
      <Stack.Screen name="AdminObituaries" component={AdminObituariesScreen} options={{ title: 'إدارة الوفيات' }} />
      <Stack.Screen name="AdminCouncil" component={AdminCouncilScreen} options={{ title: 'إدارة المجلس' }} />
      <Stack.Screen name="AdminCleanliness" component={AdminCleanlinessScreen} options={{ title: 'إدارة طلبات النظافة' }} />
      <Stack.Screen name="AdminCleaningFees" component={AdminCleaningFeesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminElectricityFaults" component={AdminElectricityFaultsScreen} options={{ title: 'إدارة أعطال الكهرباء' }} />
      <Stack.Screen name="AdminElectricityFaultDetails" component={AdminElectricityFaultDetailsScreen} options={{ title: 'تفاصيل العطل الكهربائي' }} />
      <Stack.Screen name="AdminElectricityAlerts" component={AdminElectricityAlertsScreen} options={{ title: 'إدارة تنبيهات الأعطال' }} />
      <Stack.Screen name="AdminElectricityAlertForm" component={AdminElectricityAlertFormScreen} options={{ title: 'تنبيه عطل كهربائي' }} />
      <Stack.Screen name="AdminHomeSlider" component={AdminHomeSliderScreen} options={{ title: 'إدارة البانر الرئيسي' }} />
      <Stack.Screen name="AdminLogo" component={AdminLogoScreen} options={{ title: 'إدارة شعار التطبيق' }} />
      <Stack.Screen name="AdminAboutUs" component={AdminAboutUsScreen} options={{ title: 'إدارة قسم من نحن' }} />
      <Stack.Screen name="AdminAleis" component={AdminAleisScreen} options={{ title: 'إدارة العيس' }} />
      <Stack.Screen name="AdminEmergency" component={AdminEmergencyScreen} options={{ title: 'إدارة الطوارئ' }} />
      <Stack.Screen name="AleisDetails" component={AleisDetailsScreen} options={{ title: 'تفاصيل العيس' }} />
      <Stack.Screen name="AdminServiceProviders" component={AdminServiceProvidersScreen} options={{ title: 'إدارة الخدمات والمهن' }} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
