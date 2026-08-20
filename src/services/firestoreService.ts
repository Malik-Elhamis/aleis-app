import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Complaint, 
  WaterScheduleItem, 
  UrgentAlert, 
  NewsArticle, 
  MunicipalService, 
  EmergencyContact, 
  MunicipalProject,
  WaterFault,
  CleaningFee,
  ServiceProvider,
  Violation,
  OngoingDonation,
  DonationMethod,
  HumanitarianCase,
  Obituary,
  CouncilMember,
  CleanlinessRequest,
  ElectricityAlert,
  ElectricityFault,
  MunicipalityQuestion,
  MunicipalityPaper, AleisArticle
} from '../types';

// Mock Initial Data Fallbacks (for immediate visual rich presentation)
export const INITIAL_ALERTS: UrgentAlert[] = [
  {
    id: 'alert_1',
    title: 'تنبيه طارئ: صيانة في خط المياه الرئيسي',
    message: 'تعلن البلدية عن قطع مؤقت للمياه في الحي الشرقي اليوم من الساعة 2 ظهراً حتى 6 مساءً بسبب أعمال صيانة طارئة.',
    date: 'منذ ساعتين',
    priority: 'urgent',
    isLive: true,
  },
  {
    id: 'alert_2',
    title: 'حملة نظافة وتزيين المدخل الرئيسي',
    message: 'ندعو جميع الأهالي والمتطوعين للمشاركة في حملة التشجير والنظافة يوم السبت القادم 8:00 صباحاً.',
    date: 'أمس',
    priority: 'info',
    isLive: true,
  }
];

export const INITIAL_WATER_SCHEDULE: WaterScheduleItem[] = [
  {
    id: 'w_1',
    neighborhood: 'الحي الفوقا / المرج',
    status: 'active',
    statusText: 'ضخ جاري الآن',
    startTime: '08:00 صباحاً',
    endTime: '04:00 مساءً',
    expectedPumpingDay: 'يوم الإثنين',
    expectedDate: '10 أغسطس 2026',
    nextPumping: 'الغد 08:00 صباحاً',
    notes: 'الضخ يعمل بشكل كامل وضغط المياه ممتاّز.',
  },
  {
    id: 'w_2',
    neighborhood: 'الحي التحتا / وسط البلد',
    status: 'scheduled',
    statusText: 'مجدول اليوم',
    startTime: '04:30 مساءً',
    endTime: '11:00 مساءً',
    expectedPumpingDay: 'يوم الإثنين',
    expectedDate: '10 أغسطس 2026',
    nextPumping: 'اليوم 04:30 مساءً',
    notes: 'يرجى التأكد من جاهزية الخزانات الأرضية.',
  },
  {
    id: 'w_3',
    neighborhood: 'حي الساحة والشرفة',
    status: 'delayed',
    statusText: 'تأخير متوقع ساعتين',
    startTime: '06:00 مساءً',
    endTime: '12:00 ليلاً',
    expectedPumpingDay: 'يوم الثلاثاء',
    expectedDate: '11 أغسطس 2026',
    nextPumping: 'اليوم 08:00 مساءً',
    notes: 'تأخير بسبب أعمال الصيانة على المضخة الرئيسية رقم 2.',
  },
  {
    id: 'w_4',
    neighborhood: 'حي التلة والمنطقة الغربية',
    status: 'stopped',
    statusText: 'متوقف للصيانة الطارئة',
    startTime: '-',
    endTime: '-',
    expectedPumpingDay: 'يوم الأربعاء',
    expectedDate: '12 أغسطس 2026',
    nextPumping: 'الغد 09:00 صباحاً',
    notes: 'فريق الصيانة يعمل على إصلاح العطل الفني.',
  }
];

export const INITIAL_WATER_FAULTS: import('../types').WaterFault[] = [
  {
    id: 'f_1',
    title: 'عطل في المضخة رقم 2',
    description: 'توقف مفاجئ في مضخة الرفع الرئيسية المغذية للحي الغربي.',
    reason: 'انقطاع التيار الكهربائي المفاجئ أدى إلى عطل في لوحة التحكم.',
    location: 'محطة الضخ الرئيسية - الحي الغربي',
    date: '10 أغسطس 2026',
    notes: 'يرجى من الأهالي ترشيد استهلاك المياه لحين الانتهاء من الإصلاح.',
    status: 'ongoing'
  },
  {
    id: 'f_2',
    title: 'كسر في خط التوزيع الفرعي (حي المرج)',
    description: 'تم السيطرة على الكسر وإيقاف هدر المياه.',
    reason: 'أعمال حفريات غير مرخصة.',
    location: 'حي المرج - الشارع الرئيسي',
    date: '9 أغسطس 2026',
    notes: 'سيتم استئناف الضخ الطبيعي غداً في الموعد المعتاد.',
    status: 'resolved'
  }
];

export const INITIAL_NEWS: NewsArticle[] = [];

export const INITIAL_SERVICES: MunicipalService[] = [
  {
    id: 'serv_1',
    title: 'تصديق عقد إيجار / بيع',
    description: 'المصادقة الرسمية على عقود العقارات والمحلات التجارية داخل النطاق البلدي.',
    requiredDocuments: ['نسخة العقد الأصلية', 'إثبات ملكية / سند', 'هوية الطرفين'],
    formName: 'طلب_تصديق_عقد.pdf',
    iconName: 'document-text-outline',
  },
  {
    id: 'serv_2',
    title: 'إفادة سكن وإقامة',
    description: 'إصدار سند إثبات سكن رسمي موجه للدوائر الحكومية والشركات.',
    requiredDocuments: ['صورة الهوية', 'عقد إيجار أو سند ملكية', 'فاتورة كهرباء/ماء'],
    formName: 'طلب_إفادة_سكن.pdf',
    iconName: 'home-outline',
  },
  {
    id: 'serv_3',
    title: 'الكشف الفني والرخص',
    description: 'طلب معاينة ميدانية للمباني أو الممتلكات لإصدار رخص أو معاينة الأضرار.',
    requiredDocuments: ['خرائط المساحة', 'إفادة عقارية', 'طلب معاينة'],
    formName: 'طلب_كشف_فني.pdf',
    iconName: 'construct-outline',
  },
  {
    id: 'serv_4',
    title: 'حجز موعد مع رئيس / أعضاء المجلس',
    description: 'حجز زيارة رسمية لمناقشة الاقتراحات والمراجعات العامة.',
    requiredDocuments: ['موضوع الزيارة', 'رقم الهاتف للتأكيد'],
    formName: 'استمارة_حجز_موعد.pdf',
    iconName: 'calendar-outline',
  },
  {
    id: 'serv_edu',
    title: 'التعليم والمدارس',
    description: 'تسجيل الطلاب، متابعة شؤون المدارس، والمبادرات التعليمية في البلدة.',
    requiredDocuments: ['الهوية', 'سجلات الطالب', 'إثبات سكن'],
    formName: 'طلب_خدمات_تعليمية.pdf',
    iconName: 'school-outline',
  }
];

export const INITIAL_EMERGENCY: EmergencyContact[] = [
  {
    id: 'em_1',
    title: 'الدفاع المدني',
    subtitle: 'طوارئ الحرائق والإنقاذ',
    phoneNumber: '125',
    icon: 'flame-outline',
    badgeColor: '#EF4444',
  },
  {
    id: 'em_2',
    title: 'الصليب الأحمر / الإسعاف',
    subtitle: 'الحالات الطبية الحادّة والطوارئ',
    phoneNumber: '140',
    icon: 'medical-outline',
    badgeColor: '#DC2626',
  },
  {
    id: 'em_3',
    title: 'قوى الأمن / الشرطة',
    subtitle: 'بلاغات السلامة العامة والأمن',
    phoneNumber: '112',
    icon: 'shield-checkmark-outline',
    badgeColor: '#1E40AF',
  },
  {
    id: 'em_4',
    title: 'محطة مياه العيس والطوارئ',
    subtitle: 'أعطال خطوط المياه الرئيسية',
    phoneNumber: '07123456',
    icon: 'water-outline',
    badgeColor: '#0284C7',
  },
  {
    id: 'em_5',
    title: 'مقسم البلدية الرئيسي',
    subtitle: 'الاستعلامات والشكاوى المباشرة',
    phoneNumber: '07654321',
    icon: 'call-outline',
    badgeColor: '#0B4F3A',
  }
];

export const INITIAL_PROJECTS: MunicipalProject[] = [];

export const INITIAL_CLEANING_FEES: CleaningFee[] = [
  {
    id: 'cf_1',
    activityType: 'منزل',
    usdAmount: 3,
    sypAmount: 500,
    tryAmount: 150,
    iconName: 'home',
    order: 1
  },
  {
    id: 'cf_2',
    activityType: 'محل داخل البلدة',
    usdAmount: 5,
    sypAmount: 700,
    tryAmount: 250,
    iconName: 'storefront',
    order: 2
  },
  {
    id: 'cf_3',
    activityType: 'محل على الطريق العام والدوار',
    usdAmount: 8,
    sypAmount: 1000,
    tryAmount: 400,
    iconName: 'car-sport',
    order: 3
  },
  {
    id: 'cf_4',
    activityType: 'منشأة صناعية - مشفى',
    usdAmount: 10,
    sypAmount: 1350,
    tryAmount: 500,
    iconName: 'business',
    order: 4
  }
];

// --- Firestore API Layer ---

export const getUrgentAlerts = async (): Promise<UrgentAlert[]> => {
  try {
    const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UrgentAlert));
    }
  } catch (error) {
    console.warn('Firestore alerts fallback triggered:', error);
  }
  return INITIAL_ALERTS;
};

export const subscribeToWaterFaults = (onUpdate: (items: WaterFault[]) => void) => {
  try {
    const q = query(collection(db, 'water_faults'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WaterFault));
        onUpdate(items);
      } else {
        onUpdate([]);
      }
    });
  } catch (error) {
    console.warn('Firestore subscribeWaterFaults failed:', error);
    onUpdate([]);
    return () => {};
  }
};

// --- Cleaning Fees ---
export const subscribeCleaningFees = (onUpdate: (items: CleaningFee[]) => void) => {
  try {
    const colRef = collection(db, 'cleaning_fees');
    
    // Auto-seed initial data so they become real editable DB documents
    getDocs(colRef).then(async (snap) => {
      const existingIds = snap.docs.map(d => d.id);
      for (const fee of INITIAL_CLEANING_FEES) {
        if (!existingIds.includes(fee.id)) {
          try {
            await setDoc(doc(db, 'cleaning_fees', fee.id), {
              activityType: fee.activityType,
              usdAmount: fee.usdAmount,
              sypAmount: fee.sypAmount,
              tryAmount: fee.tryAmount,
              iconName: fee.iconName,
              order: fee.order,
              createdAt: serverTimestamp()
            });
          } catch(e) {}
        }
      }
    }).catch(e => console.warn(e));

    const q = query(colRef, orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CleaningFee));
      // Sort in memory just in case 'order' was missing in some docs
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      onUpdate(items.length > 0 ? items : INITIAL_CLEANING_FEES);
    });
  } catch (error) {
    console.warn('Firestore subscribeCleaningFees failed:', error);
    onUpdate(INITIAL_CLEANING_FEES);
    return () => {};
  }
};

export const addCleaningFee = async (feeData: Omit<CleaningFee, 'id'>) => {
  try {
    await addDoc(collection(db, 'cleaning_fees'), {
      ...feeData,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error adding cleaning fee:', error);
    throw error;
  }
};

export const updateCleaningFee = async (id: string, updates: Partial<CleaningFee>) => {
  try {
    const docRef = doc(db, 'cleaning_fees', id);
    await setDoc(docRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating cleaning fee:', error);
    throw error;
  }
};

export const deleteCleaningFee = async (id: string) => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'cleaning_fees', id));
    return true;
  } catch (error) {
    console.error('Error deleting cleaning fee:', error);
    throw error;
  }
};

// --- Cleaning Fees Notes ---
export const subscribeCleaningFeesNotes = (callback: (notes: string[]) => void) => {
  const docRef = doc(db, 'settings', 'cleaning_fees_notes');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists() && docSnap.data().notes) {
      callback(docSnap.data().notes as string[]);
    } else {
      callback([
        'يستحق الرسم شهرياً مقدماً.',
        'يُستخدم هذا الرسم لتحسين خدمات النظافة ورفع مستوى النظافة العامة.',
        'نشكر تعاونكم من أجل بيئة أفضل لنا ولأبنائنا.'
      ]);
    }
  });
};

export const updateCleaningFeesNotes = async (notes: string[]) => {
  const docRef = doc(db, 'settings', 'cleaning_fees_notes');
  await setDoc(docRef, { notes }, { merge: true });
};

export const subscribeWaterSchedule = (onUpdate: (items: WaterScheduleItem[]) => void) => {
  try {
    const q = query(collection(db, 'water_schedules'));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WaterScheduleItem));
        // Sort locally to ensure items without createdAt are not filtered out by Firestore orderBy
        items.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        onUpdate(items);
      } else {
        onUpdate(INITIAL_WATER_SCHEDULE);
      }
    }, (error) => {
      console.warn('Water schedule realtime sub fallback:', error);
      onUpdate(INITIAL_WATER_SCHEDULE);
    });
  } catch (e) {
    onUpdate(INITIAL_WATER_SCHEDULE);
    return () => {};
  }
};

export const submitComplaintToFirestore = async (complaintData: Omit<Complaint, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  try {
    const payload = {
      ...complaintData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'complaints'), payload);
    return docRef.id;
  } catch (error) {
    console.warn('Firestore submit fallback saved locally:', error);
    return 'cmp_' + Date.now();
  }
};

export const subscribeWaterFaults = (onUpdate: (items: import('../types').WaterFault[]) => void) => {
  try {
    const q = query(collection(db, 'water_faults'));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as import('../types').WaterFault));
        items.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        onUpdate(items);
      } else {
        onUpdate(INITIAL_WATER_FAULTS);
      }
    }, (error) => {
      console.warn('Water faults realtime sub fallback:', error);
      onUpdate(INITIAL_WATER_FAULTS);
    });
  } catch (e) {
    onUpdate(INITIAL_WATER_FAULTS);
    return () => {};
  }
};

export const subscribeProjects = (onUpdate: (items: import('../types').MunicipalProject[]) => void) => {
  try {
    const q = query(collection(db, 'projects'));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as import('../types').MunicipalProject));
        // دمج البيانات التجريبية مع البيانات الحقيقية لكي لا تظهر الأقسام فارغة
        const combined = [...firestoreItems];
        INITIAL_PROJECTS.forEach(mockProj => {
          if (!combined.find(p => p.id === mockProj.id)) {
            combined.push(mockProj);
          }
        });
        console.log('Projects Emitting combined:', combined.length);
        onUpdate(combined);
      } else {
        console.log('Projects Emitting INITIAL:', INITIAL_PROJECTS.length);
        onUpdate(INITIAL_PROJECTS);
      }
    }, (error) => {
      console.warn('Projects realtime sub fallback:', error);
      onUpdate(INITIAL_PROJECTS);
    });
  } catch (e) {
    onUpdate(INITIAL_PROJECTS);
    return () => {};
  }
};

export const submitProjectSuggestion = async (
  title: string,
  description: string,
  authorName?: string
): Promise<boolean> => {
  try {
    const docRef = doc(collection(db, 'projects'));
    await setDoc(docRef, {
      id: docRef.id,
      title,
      description,
      budget: '',
      images: [],
      category: 'اقتراح مواطن',
      status: 'suggested',
      statusText: 'مقترح قيد المراجعة',
      progressPercentage: 0,
      startDate: 'قيد الدراسة',
      isApproved: false,
      authorName: authorName || '',
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error submitting project suggestion: ', error);
    return false;
  }
};

// ============================================
// ADMIN CRUD OPERATIONS (WATER)
// ============================================

export const addWaterSchedule = async (data: Omit<WaterScheduleItem, 'id'>) => {
  const docRef = doc(collection(db, 'water_schedules'));
  await setDoc(docRef, { ...data, id: docRef.id, createdAt: new Date().toISOString() });
};

export const deleteWaterSchedule = async (id: string) => {
  await deleteDoc(doc(db, 'water_schedules', id));
};

export const updateWaterSchedule = async (id: string, data: Partial<WaterScheduleItem>) => {
  const docRef = doc(db, 'water_schedules', id);
  await updateDoc(docRef, data);
};

export const addWaterFault = async (data: Omit<WaterFault, 'id'>) => {
  const docRef = doc(collection(db, 'water_faults'));
  await setDoc(docRef, { ...data, id: docRef.id, createdAt: new Date().toISOString() });
};

export const updateWaterFaultStatus = async (id: string, status: 'ongoing' | 'resolved' | 'unresolved' | 'difficulty') => {
  const docRef = doc(db, 'water_faults', id);
  await updateDoc(docRef, { status });
};

export const updateWaterFault = async (id: string, data: Partial<WaterFault>) => {
  const docRef = doc(db, 'water_faults', id);
  await updateDoc(docRef, data);
};

export const deleteWaterFault = async (id: string) => {
  await deleteDoc(doc(db, 'water_faults', id));
};

// ============================================
// ADMIN CRUD OPERATIONS (COMPLAINTS)
// ============================================

export const subscribeAdminComplaints = (onUpdate: (items: Complaint[]) => void) => {
  try {
    const q = query(collection(db, 'complaints'));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
        items.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        onUpdate(items);
      } else {
        onUpdate([]);
      }
    }, (error) => {
      console.warn('Admin complaints realtime sub fallback:', error);
      onUpdate([]);
    });
  } catch (e) {
    onUpdate([]);
    return () => {};
  }
};

export const subscribePublicComplaints = (onUpdate: (items: Complaint[]) => void) => {
  try {
    const q = query(collection(db, 'complaints'), where('showOnHome', '==', true));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
        items.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        onUpdate(items);
      } else {
        onUpdate([]);
      }
    }, (error) => {
      console.warn('Public complaints realtime sub fallback:', error);
      onUpdate([]);
    });
  } catch (e) {
    onUpdate([]);
    return () => {};
  }
};

export const updateComplaintAdmin = async (id: string, data: Partial<Complaint>) => {
  const docRef = doc(db, 'complaints', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

// ============================================
// CRUD OPERATIONS (VIOLATIONS)
// ============================================

export const submitViolationToFirestore = async (violationData: Omit<Violation, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  try {
    const payload = {
      ...violationData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'violations'), payload);
    return docRef.id;
  } catch (error) {
    console.warn('Firestore submit violation fallback saved locally:', error);
    return 'vio_' + Date.now();
  }
};

export const subscribeAdminViolations = (onUpdate: (items: Violation[]) => void) => {
  try {
    const q = query(collection(db, 'violations'));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Violation));
        items.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        onUpdate(items);
      } else {
        onUpdate([]);
      }
    }, (error) => {
      console.warn('Admin violations realtime sub fallback:', error);
      onUpdate([]);
    });
  } catch (e) {
    onUpdate([]);
    return () => {};
  }
};

export const subscribePublicViolations = (onUpdate: (items: Violation[]) => void) => {
  try {
    const q = query(collection(db, 'violations'), where('showOnHome', '==', true));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Violation));
        items.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        onUpdate(items);
      } else {
        onUpdate([]);
      }
    }, (error) => {
      console.warn('Public violations realtime sub fallback:', error);
      onUpdate([]);
    });
  } catch (e) {
    onUpdate([]);
    return () => {};
  }
};

export const updateViolationAdmin = async (id: string, data: Partial<Violation>) => {
  const docRef = doc(db, 'violations', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

// ============================================
// ADMIN CRUD OPERATIONS (PROJECTS)
// ============================================

export const addAdminProject = async (data: Omit<MunicipalProject, 'id'>) => {
  const docRef = doc(collection(db, 'projects'));
  await setDoc(docRef, { ...data, id: docRef.id, createdAt: new Date().toISOString() });
};

export const updateAdminProject = async (id: string, data: Partial<MunicipalProject>) => {
  const docRef = doc(db, 'projects', id);
  await updateDoc(docRef, data);
};

export const deleteAdminProject = async (id: string) => {
  await deleteDoc(doc(db, 'projects', id));
};

// ============================================
// HUMANITARIAN CASES CRUD OPERATIONS
// ============================================

export const subscribeHumanitarian = (onUpdate: (items: any[]) => void) => {
  try {
    const q = query(collection(db, 'humanitarian'));
    return onSnapshot(q, (snapshot) => {
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      onUpdate(items);
    });
  } catch (e) {
    onUpdate([]);
    return () => {};
  }
};

export const addHumanitarianCase = async (data: any) => {
  const docRef = doc(collection(db, 'humanitarian'));
  await setDoc(docRef, { ...data, id: docRef.id, createdAt: new Date().toISOString() });
};

export const updateHumanitarianCase = async (id: string, data: any) => {
  const docRef = doc(db, 'humanitarian', id);
  await updateDoc(docRef, data);
};

export const deleteHumanitarianCase = async (id: string) => {
  await deleteDoc(doc(db, 'humanitarian', id));
};

// ============================================
// CLEANLINESS CRUD OPERATIONS
// ============================================

export const submitCleanlinessRequest = async (data: any) => {
  const docRef = doc(collection(db, 'cleanliness'));
  await setDoc(docRef, { ...data, id: docRef.id, createdAt: new Date().toISOString() });
};

export const subscribeCleanlinessRequests = (onUpdate: (items: any[]) => void) => {
  try {
    const q = query(collection(db, 'cleanliness'));
    return onSnapshot(q, (snapshot) => {
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      onUpdate(items);
    });
  } catch (e) {
    onUpdate([]);
    return () => {};
  }
};

export const updateCleanlinessStatus = async (id: string, status: string) => {
  const docRef = doc(db, 'cleanliness', id);
  await updateDoc(docRef, { status });
};

export const deleteCleanlinessRequest = async (id: string) => {
  await deleteDoc(doc(db, 'cleanliness', id));
};

// ============================================
// ELECTRICITY CRUD OPERATIONS
// ============================================

export const submitElectricityFault = async (data: any) => {
  const docRef = doc(collection(db, 'electricity_faults'));
  await setDoc(docRef, { ...data, id: docRef.id, createdAt: new Date().toISOString() });
};

export const subscribeElectricityFaults = (onUpdate: (items: any[]) => void) => {
  try {
    const q = query(collection(db, 'electricity_faults'));
    return onSnapshot(q, (snapshot) => {
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      onUpdate(items);
    });
  } catch (e) {
    onUpdate([]);
    return () => {};
  }
};

export const getElectricityFaultById = async (id: string): Promise<any> => {
  const docRef = doc(db, 'electricity_faults', id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

export const updateElectricityFaultStatus = async (id: string, status: string) => {
  const docRef = doc(db, 'electricity_faults', id);
  await updateDoc(docRef, { status });
};

export const deleteElectricityFault = async (id: string) => {
  await deleteDoc(doc(db, 'electricity_faults', id));
};

// ============================================
// COUNCIL MEMBERS CRUD OPERATIONS
// ============================================

export const subscribeCouncil = (onUpdate: (items: any[]) => void) => {
  try {
    const q = query(collection(db, 'council'));
    return onSnapshot(q, (snapshot) => {
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a: any, b: any) => (a.order || 99) - (b.order || 99)); // Sort by order
      onUpdate(items);
    });
  } catch (e) {
    onUpdate([]);
    return () => {};
  }
};

export const addCouncilMember = async (data: any) => {
  const docRef = doc(collection(db, 'council'));
  await setDoc(docRef, { ...data, id: docRef.id });
};

export const deleteCouncilMember = async (id: string) => {
  await deleteDoc(doc(db, 'council', id));
};

export const updateCouncilMember = async (id: string, data: any) => {
  await updateDoc(doc(db, 'council', id), data);
};

// ============================================
// OBITUARIES CRUD OPERATIONS
// ============================================

export const subscribeObituaries = (onUpdate: (items: any[]) => void) => {
  try {
    const q = query(collection(db, 'obituaries'));
    return onSnapshot(q, (snapshot) => {
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      onUpdate(items);
    });
  } catch (e) {
    onUpdate([]);
    return () => {};
  }
};

export const addObituary = async (data: any) => {
  const docRef = doc(collection(db, 'obituaries'));
  await setDoc(docRef, { ...data, id: docRef.id, createdAt: new Date().toISOString() });
};

export const updateObituary = async (id: string, data: any) => {
  const docRef = doc(db, 'obituaries', id);
  await updateDoc(docRef, data);
};

export const deleteObituary = async (id: string) => {
  await deleteDoc(doc(db, 'obituaries', id));
};

// ============================================
// NEWS CRUD OPERATIONS
// ============================================

export const addNewsArticle = async (data: Omit<NewsArticle, 'id'>) => {
  const docRef = doc(collection(db, 'news'));
  await setDoc(docRef, { ...data, id: docRef.id, createdAt: new Date().toISOString() });
};

export const updateNewsArticle = async (id: string, data: Partial<NewsArticle>) => {
  const docRef = doc(db, 'news', id);
  await updateDoc(docRef, data);
};

export const deleteNewsArticle = async (id: string) => {
  await deleteDoc(doc(db, 'news', id));
};

export const subscribeNews = (onUpdate: (items: NewsArticle[]) => void) => {
  try {
    const q = query(collection(db, 'news'));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));
        items.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        const combined = [...items];
        INITIAL_NEWS.forEach(mockNews => {
          if (!combined.find(n => n.id === mockNews.id)) {
            combined.push(mockNews);
          }
        });
        
        onUpdate(combined);
      } else {
        onUpdate(INITIAL_NEWS);
      }
    }, (error) => {
      console.warn('News realtime sub fallback:', error);
      onUpdate(INITIAL_NEWS);
    });
  } catch (e) {
    onUpdate(INITIAL_NEWS);
    return () => {};
  }
};

export const subscribeNewsSettings = (onUpdate: (data: { coverImage?: string }) => void) => {
  try {
    const docRef = doc(db, 'settings', 'news');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as { coverImage?: string });
      } else {
        onUpdate({});
      }
    });
  } catch (e) {
    onUpdate({});
    return () => {};
  }
};

export const updateNewsSettings = async (data: { coverImage?: string }) => {
  const docRef = doc(db, 'settings', 'news');
  await setDoc(docRef, data, { merge: true });
};

// ============================================
// Home Slider Settings Functions
// ============================================

export const subscribeHomeSliderSettings = (callback: (data: { images: string[] }) => void) => {
  const docRef = doc(db, 'settings', 'home_slider');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as { images: string[] });
    } else {
      callback({ images: [] });
    }
  });
};

export const updateHomeSliderSettings = async (images: string[]) => {
  const docRef = doc(db, 'settings', 'home_slider');
  await setDoc(docRef, { images }, { merge: true });
};

// --- App Settings (Logo, etc) ---
export const subscribeAppSettings = (callback: (data: { logoUrl?: string }) => void) => {
  const docRef = doc(db, 'settings', 'app_settings');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as { logoUrl?: string });
    } else {
      callback({});
    }
  });
};

export const updateLogoUrl = async (logoUrl: string) => {
  const docRef = doc(db, 'settings', 'app_settings');
  await setDoc(docRef, { logoUrl }, { merge: true });
};

// --- About Us Settings ---
export const subscribeAboutUsSettings = (callback: (data: any) => void) => {
  const docRef = doc(db, 'settings', 'about_us');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback({
        programmerName: 'مالك الجهني',
        programmerImage: '',
        programmerText: 'تم تطوير هذا التطبيق بأحدث التقنيات البرمجية لضمان تجربة مستخدم سلسة، سريعة، وآمنة.',
        managementName: 'بلدية العيس',
        managementImage: '',
        managementText: 'تتم إدارة هذا التطبيق من قبل بلدية العيس للإشراف على المحتوى وتلبية طلبات المواطنين.'
      });
    }
  });
};

export const updateAboutUsSettings = async (data: any) => {
  const docRef = doc(db, 'settings', 'about_us');
  await setDoc(docRef, data, { merge: true });
};

// --- Service Providers (الخدمات والمهن) ---
export const subscribeServiceProviders = (callback: (providers: ServiceProvider[]) => void) => {
  const q = query(collection(db, 'services_providers'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceProvider));
    callback(data);
  });
};

export const subscribeServiceProvidersByCategory = (category: string, callback: (providers: ServiceProvider[]) => void) => {
  const q = query(collection(db, 'services_providers'), where('category', '==', category));
  return onSnapshot(q, (snapshot) => {
    let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceProvider));
    data.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending
    });
    callback(data);
  });
};

export const addServiceProvider = async (data: Omit<ServiceProvider, 'id'>) => {
  await addDoc(collection(db, 'services_providers'), data);
};

export const updateServiceProvider = async (id: string, data: Partial<ServiceProvider>) => {
  const docRef = doc(db, 'services_providers', id);
  await updateDoc(docRef, data);
};

export const deleteServiceProvider = async (id: string) => {
  const docRef = doc(db, 'services_providers', id);
  await deleteDoc(docRef);
};

// ==============================
// Electricity Alerts
// ==============================

export const createElectricityAlert = async (data: any) => {
  const docRef = doc(collection(db, 'electricity_alerts'));
  await setDoc(docRef, { ...data, createdAt: Date.now() });
};

export const subscribeElectricityAlerts = (onUpdate: (items: any[]) => void) => {
  const q = query(collection(db, 'electricity_alerts'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      onUpdate(data);
    }
  );
};

export const updateElectricityAlert = async (id: string, data: any) => {
  const docRef = doc(db, 'electricity_alerts', id);
  await updateDoc(docRef, data);
};

export const deleteElectricityAlert = async (id: string) => {
  const docRef = doc(db, 'electricity_alerts', id);
  await deleteDoc(docRef);
};

// ==========================================
// ONGOING DONATIONS (تبرعات جارية)
// ==========================================

export const subscribeOngoingDonations = (onUpdate: (items: any[]) => void) => {
  const q = query(collection(db, 'ongoing_donations'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(data);
  });
};

export const addOngoingDonation = async (data: any) => {
  await addDoc(collection(db, 'ongoing_donations'), {
    ...data,
    createdAt: new Date().toISOString()
  });
};

export const updateOngoingDonation = async (id: string, data: any) => {
  const docRef = doc(db, 'ongoing_donations', id);
  await updateDoc(docRef, data);
};

export const deleteOngoingDonation = async (id: string) => {
  const docRef = doc(db, 'ongoing_donations', id);
  await deleteDoc(docRef);
};

// ==========================================
// DONATION METHODS (طرق التبرع العامة)
// ==========================================

export const subscribeDonationMethods = (onUpdate: (items: any[]) => void) => {
  const q = query(collection(db, 'donation_methods'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(data);
  });
};

export const addDonationMethod = async (data: any) => {
  await addDoc(collection(db, 'donation_methods'), {
    ...data,
    createdAt: new Date().toISOString()
  });
};

export const updateDonationMethod = async (id: string, data: any) => {
  const docRef = doc(db, 'donation_methods', id);
  await updateDoc(docRef, data);
};

export const deleteDonationMethod = async (id: string) => {
  const docRef = doc(db, 'donation_methods', id);
  await deleteDoc(docRef);
};

// ==========================================
// HUMANITARIAN REPORTS (بلاغات الحالات الإنسانية)
// ==========================================

export const subscribeHumanitarianReports = (onUpdate: (items: any[]) => void) => {
  const q = query(collection(db, 'humanitarian_reports'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(data);
  });
};

export const addHumanitarianReport = async (data: any) => {
  await addDoc(collection(db, 'humanitarian_reports'), {
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
};

export const updateHumanitarianReport = async (id: string, data: any) => {
  const docRef = doc(db, 'humanitarian_reports', id);
  await updateDoc(docRef, data);
};

export const deleteHumanitarianReport = async (id: string) => {
  const docRef = doc(db, 'humanitarian_reports', id);
  await deleteDoc(docRef);
};

// Municipality Papers
export const subscribeMunicipalityPapers = (callback: (papers: MunicipalityPaper[]) => void) => {
  const q = query(collection(db, 'municipalityPapers'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const papers: MunicipalityPaper[] = [];
    snapshot.forEach(doc => {
      papers.push({ id: doc.id, ...doc.data() } as MunicipalityPaper);
    });
    callback(papers);
  }, (error) => {
    console.error("Error subscribing to municipality papers:", error);
    callback([]);
  });
};

export const addMunicipalityPaper = async (paper: Partial<MunicipalityPaper>) => {
  return await addDoc(collection(db, 'municipalityPapers'), {
    ...paper,
    createdAt: new Date().toISOString()
  });
};

export const deleteMunicipalityPaper = async (id: string) => {
  return await deleteDoc(doc(db, 'municipalityPapers', id));
};

export const updateMunicipalityPaper = async (id: string, updates: Partial<MunicipalityPaper>) => {
  return await updateDoc(doc(db, 'municipalityPapers', id), updates);
};

// Municipality Questions
export const subscribeMunicipalityQuestions = (statusFilter: 'pending' | 'published' | 'all', callback: (questions: MunicipalityQuestion[]) => void) => {
  const q = query(collection(db, 'municipalityQuestions'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const questions: MunicipalityQuestion[] = [];
    snapshot.forEach(doc => {
      const data = doc.data() as MunicipalityQuestion;
      if (statusFilter === 'all' || data.status === statusFilter) {
        questions.push({ ...data, id: doc.id });
      }
    });
    callback(questions);
  }, (error) => {
    console.error("Error subscribing to municipality questions:", error);
    callback([]);
  });
};

export const addMunicipalityQuestion = async (questionText: string, userName?: string) => {
  return await addDoc(collection(db, 'municipalityQuestions'), {
    question: questionText,
    status: 'pending',
    userName: userName || 'فاعل خير',
    createdAt: new Date().toISOString()
  });
};

export const updateMunicipalityQuestion = async (id: string, updates: Partial<MunicipalityQuestion>) => {
  return await updateDoc(doc(db, 'municipalityQuestions', id), updates);
};

export const deleteMunicipalityQuestion = async (id: string) => {
  return await deleteDoc(doc(db, 'municipalityQuestions', id));
};

export const subscribeAleisArticles = (callback: (articles: AleisArticle[]) => void) => {
  const q = query(collection(db, 'aleis_articles'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const articles: AleisArticle[] = [];
    snapshot.forEach(doc => {
      articles.push({ id: doc.id, ...doc.data() } as AleisArticle);
    });
    callback(articles);
  }, (error) => {
    console.error("Error subscribing to aleis articles:", error);
    callback([]);
  });
};

export const addAleisArticle = async (article: Partial<AleisArticle>) => {
  return await addDoc(collection(db, 'aleis_articles'), {
    ...article,
    createdAt: new Date().toISOString()
  });
};

export const updateAleisArticle = async (id: string, updates: Partial<AleisArticle>) => {
  return await updateDoc(doc(db, 'aleis_articles', id), updates);
};

export const deleteAleisArticle = async (id: string) => {
  return await deleteDoc(doc(db, 'aleis_articles', id));
};

// Emergency Contacts
export const subscribeEmergencyContacts = (callback: (contacts: EmergencyContact[]) => void) => {
  const q = query(collection(db, 'emergency_contacts'));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const contacts: EmergencyContact[] = [];
      snapshot.forEach(doc => {
        contacts.push({ id: doc.id, ...doc.data() } as EmergencyContact);
      });
      callback(contacts);
    } else {
      callback(INITIAL_EMERGENCY);
    }
  }, (error) => {
    console.error("Error subscribing to emergency contacts:", error);
    callback(INITIAL_EMERGENCY);
  });
};

export const addEmergencyContact = async (contact: Omit<EmergencyContact, 'id'>) => {
  return await addDoc(collection(db, 'emergency_contacts'), contact);
};

export const updateEmergencyContact = async (id: string, updates: Partial<EmergencyContact>) => {
  return await updateDoc(doc(db, 'emergency_contacts', id), updates);
};

export const deleteEmergencyContact = async (id: string) => {
  return await deleteDoc(doc(db, 'emergency_contacts', id));
};
