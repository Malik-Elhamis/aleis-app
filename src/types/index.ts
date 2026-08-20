export type AuthMode = 'unauthenticated' | 'authenticated' | 'guest';

export interface CitizenUser {
  uid: string;
  phoneNumber: string;
  fullName?: string;
  neighborhood?: string;
  isGuest: boolean;
}

export type ComplaintCategory =
  | 'water'          // مياه
  | 'sanitation'     // نظافة
  | 'roads'          // طرق
  | 'electricity'    // كهرباء
  | 'sewage'         // صرف صحي
  | 'other';         // أخرى

export type ComplaintStatus = 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected' | 'other';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Complaint {
  id?: string;
  category: ComplaintCategory;
  categoryLabel: string;
  title: string;
  description: string;
  location: LocationCoords;
  images: string[];
  status: ComplaintStatus;
  customStatusText?: string;
  citizenName: string;
  citizenPhone: string;
  isGuestSubmission: boolean;
  createdAt: string | number;
  updatedAt?: string | number;
  adminNote?: string;
  municipalityReply?: string;
  showOnHome?: boolean;
}

export type ViolationCategory =
  | 'illegal_building' // بناء مخالف
  | 'public_property'  // تعدي على الأملاك العامة
  | 'littering'        // رمي نفايات
  | 'vandalism'        // تخريب مرافق عامة
  | 'water_network'    // تعدي على شبكة المياه
  | 'other';           // أخرى

export interface Violation {
  id?: string;
  category: ViolationCategory;
  categoryLabel: string;
  title: string;
  description: string;
  location: LocationCoords;
  images: string[];
  status: ComplaintStatus;
  customStatusText?: string;
  citizenName: string;
  citizenPhone: string;
  isGuestSubmission: boolean;
  createdAt: string | number;
  updatedAt?: string | number;
  adminNote?: string;
  municipalityReply?: string;
  showOnHome?: boolean;
}

export type WaterPumpingStatus = 'active' | 'scheduled' | 'delayed' | 'stopped';

export interface WaterScheduleItem {
  id: string;
  neighborhood: string;
  status: WaterPumpingStatus;
  statusText: string;
  startTime: string;
  endTime: string;
  expectedPumpingDay: string;
  expectedDate?: string;
  nextPumping?: string;
  notes?: string;
  createdAt?: string | number;
}

export interface AboutUsData {
  programmerName: string;
  programmerImage: string;
  programmerText: string;
  managementName: string;
  managementImage: string;
  managementText: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  phone: string;
  description: string;
  category: string;
  createdAt: Date | string | any;
}

export interface WaterFault {
  id: string;
  title: string;
  description: string;
  reason: string;
  location: string;
  date: string;
  notes?: string;
  status: 'ongoing' | 'resolved' | 'unresolved' | 'difficulty';
  createdAt?: string | number;
}

export interface UrgentAlert {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: 'urgent' | 'warning' | 'info';
  isLive: boolean;
}

export type NewsCategory = 'خبر عاجل' | 'عامة' | 'خدمات' | 'ثقافية' | 'صحية' | 'أخرى';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  category: NewsCategory;
  customCategory?: string; // used when category is 'أخرى'
  date: string;
  images: string[];
  isUrgent?: boolean;
  createdAt?: string | number;
}

export interface MunicipalService {
  id: string;
  title: string;
  description: string;
  requiredDocuments: string[];
  formName: string;
  formDownloadUrl?: string;
  iconName: string;
}

export interface EmergencyContact {
  id?: string;
  title: string;
  subtitle: string;
  phoneNumber: string;
  icon: string;
  badgeColor: string;
  image?: string;
}

export interface MunicipalProject {
  id: string;
  title: string;
  category: string;
  status: 'planned' | 'in_progress' | 'completed' | 'suggested';
  statusText: string;
  progressPercentage: number;
  description: string;
  notes?: string;
  budget?: string;
  images: string[];
  startDate: string;
  endDate?: string;
  createdAt?: string | number;
  isApproved?: boolean;
  authorName?: string;
}

export interface Obituary {
  id: string;
  name: string; // اسم المتوفى
  date: string; // تاريخ الوفاة
  details?: string; // مكان الدفن والصلاة (اختياري)
  condolencesDetails?: string; // تفاصيل العزاء (اختياري)
  image?: string; // صورة المتوفى (اختياري)
  gender?: 'male' | 'female'; // جنس المتوفى لتحديد صيغة الدعاء
  createdAt?: string | number;
}

export interface HumanitarianCase {
  id: string;
  title: string;
  description: string;
  targetAmount?: string;
  collectedAmount?: string;
  currency?: 'USD' | 'SYP' | 'TRY';
  isUrgent: boolean;
  images: string[];
  status: 'active' | 'completed';
  createdAt?: string | number;
  donationMethods?: {
    donationImages?: string[];
    bankAccountDetails?: string;
    donationExplanation?: string;
    viaMunicipality?: boolean;
  };
}

export interface OngoingDonation {
  id: string;
  title: string;
  description: string;
  targetUSD?: string;
  targetTRY?: string;
  targetSYP?: string;
  collectedUSD?: string;
  collectedUSD_Hand?: string;
  collectedUSD_Bank?: string;
  collectedTRY?: string;
  collectedTRY_Hand?: string;
  collectedTRY_Bank?: string;
  collectedSYP?: string;
  collectedSYP_Hand?: string;
  collectedSYP_Bank?: string;
  displayCurrencies?: ('USD' | 'TRY' | 'SYP')[];
  images?: string[];
  status: 'active' | 'completed';
  completedMessage?: string;
  completedNote?: string;
  completedImage?: string;
  createdAt: string;
  donationMethods?: {
    donationImages?: string[];
    bankAccountDetails?: string;
    donationExplanation?: string;
    viaMunicipality?: boolean;
  };
}

export interface DonationMethod {
  id: string;
  title: string;
  description?: string;
  bankAccountDetails?: string;
  phoneNumber?: string;
  contactPerson?: string;
  images?: string[];
  createdAt: string;
}

export interface HumanitarianReport {
  id: string;
  title: string;
  description: string;
  needs: string;
  images?: string[];
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  reporterName?: string;
  contactInfo?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface CouncilMember {
  id: string;
  name: string;
  role: string; // المنصب
  bio: string;
  image: string;
  order: number; // للترتيب
}

export interface CleanlinessRequest {
  id: string;
  type: 'container' | 'hygiene' | 'pest_control'; // نوع الطلب: حاوية، تراكم نفايات، مكافحة حشرات
  location: string;
  description: string;
  images: string[];
  status: 'pending' | 'in_progress' | 'completed';
  userId: string;
  createdAt?: string | number;
}

export interface ElectricityFault {
  id: string;
  location: string;
  description: string;
  type: 'outage' | 'street_light' | 'theft' | 'other' | string; // انقطاع، إنارة شوارع، سرقة، أخرى
  images: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'unrepairable';
  userId: string;
  createdAt?: string | number;
}

export interface ElectricityAlert {
  id: string;
  area: string;
  status: 'investigating' | 'working' | 'resolved'; 
  estimatedTime: string;
  notes: string;
  createdAt?: string | number;
}

export interface CleaningFee {
  id: string;
  activityType: string; // e.g. "منزل", "محل داخل البلدة"
  usdAmount: number;
  sypAmount: number;
  tryAmount: number;
  iconName: string; // e.g. "home", "storefront", "business", "business-outline"
  order: number; // For sorting
}

export interface MunicipalityQuestion {
  id: string;
  question: string;
  answer?: string;
  status: 'pending' | 'published';
  userId?: string;
  userName?: string;
  createdAt: string;
  answeredAt?: string;
}

export interface MunicipalityPaper {
  id: string;
  title: string;
  notes?: string;
  fileUrl: string;
  fileType: 'pdf' | 'image' | 'document';
  createdAt: string;
}

export interface AleisArticle {
  id?: string;
  title: string;
  description: string;
  images: string[];
  createdAt?: string | number;
}
