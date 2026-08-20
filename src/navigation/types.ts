export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Profile: undefined;
  Services: undefined;
  UnifiedReportForm: undefined;
  ComplaintsList: undefined; // I kept this as ComplaintsList in RootNavigator (pointing to UnifiedReportsListScreen)
  WaterHub: undefined;
  WaterSchedule: undefined;
  WaterFaults: undefined;
  Emergency: undefined;
  ComplaintsViolationsHub: undefined;
  ViolationDetails: { violationId: string };
  Projects: undefined;
  ProjectsList: {
    status: 'completed' | 'in_progress' | 'planned' | 'suggested';
    title: string;
  };
  ProjectDetails: { projectId: string };
  SuggestionsHub: undefined;
  SuggestionDetails: { suggestionId: string };
  NewsScreen: undefined;
  NewsHub: undefined;
  NewsDetails: { newsItem: import('../types').NewsArticle };
  ComplaintDetails: { complaintId: string };
  // New Modules
  Humanitarian: undefined;
  HumanitarianList: { status: 'active' | 'completed' };
  HumanitarianDetails: { caseItem: any };
  ReportHumanitarianCase: undefined;
  Donations: undefined;
  DonationsList: { type: 'ongoing' | 'completed' | 'methods', title: string };
  DonationMethodDetails: { method: import('../types').DonationMethod };
  Obituaries: undefined;
  ObituaryDetails: { obituary: import('../types').Obituary };
  Council: undefined;
  CouncilMemberDetails: { member: any };
  ServiceProvidersList: { categoryId: string; categoryTitle: string };
  MunicipalServices: undefined;
  CleanlinessHub: undefined;
  CleanlinessForm: { requestType: 'container' | 'hygiene' | 'pest_control' };
  SuggestProject: undefined;
  ElectricityHub: undefined;
  ElectricityFaults: undefined;
  ElectricityAlerts: undefined;
  CleaningFees: undefined;
  
  // Admin Routes
  AdminLogin: undefined;
  AdminDashboard: undefined;
  AdminWaterSchedules: undefined;
  AdminWaterFaults: undefined;
  AdminProjects: undefined;
  AdminComplaintsViolationsHub: undefined;
  AdminComplaintsList: undefined;
  AdminViolationsList: undefined;
  // New Admin Modules
  AdminElectricity: undefined;
  AdminHumanitarian: undefined;
  AdminDonations: undefined;
  AdminDonationMethodForm: { method?: import('../types').DonationMethod };
  AdminOngoingDonationForm: { donation?: import('../types').OngoingDonation };
  AdminHumanitarianReports: undefined;
  AdminObituaries: undefined;
  AdminCouncil: undefined;
  AdminCleanliness: undefined;
  AdminCleaningFees: undefined;
  AdminServiceProviders: undefined;
  AboutUs: undefined;
  Aleis: undefined;
  ElectricityAlertDetails: { alert: any };
  AdminElectricityFaults: undefined;
  AdminElectricityFaultDetails: { faultId: string };
  AdminElectricityAlerts: undefined;
  AdminElectricityAlertForm: { alert?: any };
  AdminHomeSlider: undefined;
  AdminLogo: undefined;
  AdminAboutUs: undefined;
  AdminAleis: undefined;
  AdminEmergency: undefined;
  AleisDetails: { article: import("../types").AleisArticle };
  AdminProjectsList: { status: 'completed' | 'in_progress' | 'planned'; title: string };
  AdminProjectDetails: { projectId: string };
  AdminProjectForm: { projectId?: string };
  AdminSuggestions: undefined;
  AdminSuggestionDetails: { suggestionId: string };
  AdminUnifiedReports: undefined;
  AdminComplaintDetails: { complaintId: string };
  AdminViolationDetails: { violationId: string };
  AdminNews: undefined;
  AdminNewsForm: { newsId?: string, newsItem?: import('../types').NewsArticle };
  
  // Municipality Services
  MunicipalityPapers: undefined;
  AskMunicipalityHub: undefined;
  AdminMunicipalityPapers: undefined;
  AdminMunicipalityQuestions: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  NotificationsTab: undefined;
  EventsTab: undefined;
  AboutUsTab: undefined;
  ProfileTab: undefined;
};
