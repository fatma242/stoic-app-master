import SignUp from '@/app/signup';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: {
    onboarding: {
      skip: 'Skip',
      welcome: 'Welcome to Stoic!',
      continue: 'Continue',
      back: 'Back',
      select_option: 'Please select an option:',
      moodOptions: {
        overwhelmed: "I’m finding it hard to cope with life",                   //Stress
        disconnected: "I feel distant from people or myself",               //Anxiety
        low_energy: "I’m tired and unmotivated most of the time",        //Depression Mild to Moderate
        hopeless: "I feel like nothing will ever get better",            //Severe Depression / Suicidal Ideation	
        normal: "I feel generally okay and just checking in"          //Normal / Mentally Well
      },
      questions: {
        initial_mood: 'How have you been feeling lately?',
        normal: {
          q1: 'Have you been feeling mostly balanced and able to cope with daily life?',
          q2: 'Are you generally sleeping, eating, and functioning well?',
          q3: 'Do you feel mostly positive or neutral emotions throughout your days?',
          q4: 'Do you feel connected and in control of your emotions?',
          q5: 'Do you find yourself enjoying or engaging with your daily activities?'
        },
        overwhelmed: {
          q1: 'Have you been facing situations that feel beyond your capacity?',
          q2: 'Do you feel like you have too much to handle?',
          q3: 'Do you struggle to find time for self-care?',
          q4: 'Do you feel physically or emotionally drained?',
          q5: 'Do you find it hard to relax even when you have time?'
        },
        disconnected: {
          q1: 'Do you feel isolated from others?',
          q2: 'Do you find it hard to connect with people?',
          q3: 'Do you avoid social interactions?',
          q4: 'Do you feel misunderstood by others?',
          q5: 'Does socializing make you anxious?'
        },
        low_energy: {
          q1: 'Do you struggle to get motivated?',
          q2: 'Do simple tasks feel overwhelming?',
          q3: 'Has your sleep pattern changed significantly?',
          q4: 'Do you lose interest in things quickly?',
          q5: 'Do you feel physically exhausted often?'
        },
        hopeless: {
          q1: 'Do you feel like things will never get better?',
          q2: 'Do you struggle to see positive aspects in life?',
          q3: 'Have you lost interest in future plans?',
          q4: 'Do you feel like giving up on challenges?',
          q5: 'Do you feel trapped in your current situation?'
        },
        crisis_resources: 'Immediate Support Resources:'
      },
      answers: {
        yes: 'Yes',
        no: 'No',
        sometimes: 'Sometimes'
      },
      resources: {
        overwhelmed: "It sounds like you're feeling overwhelmed. Try using tools that help you prioritize tasks, take short breaks during the day, and practice simple breathing or mindfulness exercises to stay grounded.",
        
        disconnected: "Feeling disconnected is tough. You might benefit from talking to someone you trust, joining a support community, or trying out activities that help you reconnect with others and yourself.",
        
        low_energy: "Low energy can be a sign that your body or mind needs rest. Focus on getting enough quality sleep, staying hydrated, and adding small positive habits to your daily routine.",
        
        hopeless: `If you're feeling hopeless, please know you're not alone. In Egypt, you can call the Mental Health Hotline at 16328 for support. There are professionals ready to help you. Reaching out is a strong and brave step.`,
        
        needsSupport: "You're going through a challenging time, and it's okay to ask for help. Try reaching out to a trusted person or a mental health professional. You're not alone—there is support available, and healing is possible.",

        general: "Thank you for opening up. Taking this first step to check in with yourself is powerful. We're here to support you with resources, tools, and guidance to help you feel better and move forward."
      }

    },
    weeklyCheckIn: {
      questions: {
        stress: {
          q1: "Have you felt under pressure or overwhelmed recently?",
          q2: "Have you struggled to manage daily responsibilities?",
          q3: "Have you had physical symptoms like tension or headaches due to stress?",
          q4: "Have you found it difficult to take breaks or relax?",
          q5: "Have you been constantly worried about tasks or time?",
        },
        anxiety: {
          q1: "Have you felt unusually anxious or nervous this week?",
          q2: "Have you experienced racing thoughts or difficulty focusing?",
          q3: "Have you felt restless or on edge without clear reasons?",
          q4: "Have you avoided activities due to worry or fear?",
          q5: "Have you noticed physical symptoms like rapid heartbeat or sweating when anxious?",
        },
        depression: {
          q1: "Have you felt persistently down, sad, or empty?",
          q2: "Have you lost interest in activities you usually enjoy?",
          q3: "Have you experienced changes in sleep or appetite?",
          q4: "Have you had trouble concentrating or making decisions?",
          q5: "Have you felt worthless or guilty without reason?",
        },
        normal: {
          q1: "Have you been feeling emotionally stable this week?",
          q2: "Are you maintaining your sleep, nutrition, and energy levels?",
          q3: "Have you been enjoying your daily activities?",
          q4: "Have you felt generally productive and focused?",
          q5: "Do you feel connected to others and yourself?",
        }
      },
      resources: {
        stress: "Try stress-relief techniques like deep breathing, short walks, and managing your time with breaks.",
        anxiety: "Try calming techniques like journaling your thoughts, mindful breathing, and light exercise.",
        depression: "Focus on self-compassion, routine, and consider reaching out to someone or a professional.",
        normal: "Keep up the healthy habits! You're doing well, and we’re here to support you."
      },
      answers: {
        yes: 'Yes',
        no: 'No',
        sometimes: 'Sometimes',
      },
      errors: {
        userNotFound: "User not found. Please log in again.",
        fetchFailed: "Failed to fetch data",
        submitFailed: "Failed to submit check-in. Please try again.",
        incompleteAnswers: "Please answer all questions."
      },
      alerts: {
        alreadySubmitted: "You've already completed your weekly check-in.",
        success: "Your check-in has been recorded!"
      },
      navigation: {
        previous: "Previous",
        submit: "Submit"
      }
    },
    landing: {
      subtitle: "Your daily mental wellness companion",
      google: "Continue with Google",
      email: "Sign up with Email",
      haveAccount: "Already have an account?",
      login: "Log in"
    },
    login: {
      title: "Welcome Back",
      subtitle: "Continue your wellness journey",
      email: "Email",
      password: "Password",
      login: "Log In",
      dontHaveAccount: "Don't have an account?",
      signUp: "Sign up",
      emailRequired: "Email is required",
      emailInvalid: "Enter a valid email",
      userNotExist: "User does not exist",
      passwordRequired: "Password is required",
      passwordShort: "Password must be at least 6 characters",
      errorTitle: "Login Error"
    },
    validation: {
      username_required: "Username is required",
      username_short: "Username must be at least 3 characters",
      email_required: "Email is required",
      email_invalid: "Please enter a valid email",
      password_required: "Password is required",
      password_short: "Password must be at least 6 characters",
      confirm_password_mismatch: "Passwords don't match",
      gender_required: "Please select your gender",
      age_required: "Age is required",
      age_invalid: "Please enter a valid age (13-120)",
      emptyFields: "Username and email cannot be empty.",
      invalidEmail: "Email must end with .com, .org, or .edu",
      shortPassword: "Password must be at least 6 characters.",
      userIdMissing: "User ID is missing.",
      success: "Profile updated successfully.",
      error: "Failed to update profile.",
      fetchError: "Failed to fetch user data."
    },
    signup: {
      title: "Create a New Account",
      subtitle: "Start your journey to mental wellness",
      username: "Username",
      email: "Email",
      password: "Password",
      passwordtitle1: "Secure Your Space",
      passwordtitle2: "Create a safe sanctuary for your thoughts",
      confirmPassword: "Confirm Password",
      age: "Your Age",
      identity: "Identity",
      subtitle2: "Help us tailor your healing experience",
      female: "Female",
      male: "Male",
      continue: "Continue",
      beginJourney: "Begin Your Journey",
      back: "Back",
      alreadyMember: "Already part of our community?",
      welcomeBack: "Welcome back",
    },
    home: {
      welcomeBack: "Welcome Back!",
      weeklyCheckin: "Weekly Check-in",
      howAreYou: "How are you feeling now?",
      startCheckin: "Start Check-in",
      quickAccess: "Quick Access",
      community: "Community",
      aiChat: "AI Chat",
      progress: "Progress",
      settings: "Settings",
      loading: "Loading..."
    },
    settings: {
      title: "Settings",
      accountSettings: "Account Settings",
      editProfile: "Edit Profile",
      appInformation: "App Information",
      version: "Version",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      logOut: "Log Out",
      deleteAccount: "Delete Account",
      confirm: "Confirm",
      confirmDelete: "Are you sure you want to delete your account?",
      delete: "Delete",
      cancel: "Cancel",
      logoutError: "Logout Error",
      logoutFailed: "Failed to log out",
      deleteError: "Error",
      deleteFailed: "Failed to delete account",
      userIdNotFound: "User ID not found"
    },
    editProfile: {
      title: "Edit Profile",
      usernamePlaceholder: "Username",
      emailPlaceholder: "Email",
      passwordPlaceholder: "New Password (optional)",
      saveButton: "Save Changes",
    },
    progress: {
      title: "Your Mental Health Journey 🌱",
      streakTitle: "Day Mindfulness Streak! 🔥",
      streakText: "Keep logging your mood weekly to grow your streak",
      moodTrends: "Mood Trends",
      moodProgress: "Mood Progress (Last week)",
      noData: "You haven't submitted any check-ins yet.",
      errors: {
        userNotFound: "User not found. Please log in again.",
        fetchFailed: "Failed to fetch mood data"
      }
    },
    privacyPolicy: {
      title: "Your Privacy Matters",
      paragraphs: [
        "Stoic is your friendly AI companion, here to support your mental well-being and personal growth journey. Think of me as a supportive guide - not a replacement for professional therapists or healthcare providers.",
        "Your privacy is sacred to us. We never access sensitive personal information without your clear permission, and any data we use to improve your experience is completely anonymous.",
        "If you're ever experiencing significant emotional distress or a mental health crisis, please reach out to a licensed professional or local support services. Your well-being is our highest priority."
      ]
    },
    termsOfService: {
      title: "Our Commitment to You",
      paragraphs: [
        "Stoic is your supportive AI companion, here to help with your mental well-being and personal growth journey. Please remember I'm designed as a guide - not a replacement for professional therapists or healthcare providers.",
        "Your privacy is deeply respected. We only use information you choose to share with us, and any data that helps improve your experience is carefully anonymized to protect your identity.",
        "If you ever face significant emotional challenges or a mental health crisis, we encourage you to connect with licensed professionals or local support services. Your safety and well-being come first."
      ]
    },
    community: {
      adminCommunity: "Admin Community",
      yourCommunity: "Your Community",
      createPublicRoom: "Create Public Room",
      createPrivateRoom: "Create Private Room",
      enterJoinCode: "Enter room join code",
      joinRoom: "Join Room",
      roomsYouOwn: "Rooms You Own",
      noRoomsOwned: "No rooms owned yet",
      joinedRooms: "Joined Rooms",
      noJoinedRooms: "No joined rooms yet",
      publicRooms: "Public Rooms",
      noPublicRooms: "No public rooms available",
      public: "Public",
      private: "Private",
      owner: "Owner",
      code: "Code",
      deleteRoom: "Delete Room",
      deleteRoomConfirmation: "Are you sure you want to delete this room? This will delete all posts in the room.",
      roomNamePlaceholder: "Room name",
      errors: {
        userNotFound: "User not found. Please log in again.",
        failedToLoadUserData: "Failed to load user data",
        failedFetchPublicRooms: "Failed to fetch public rooms",
        couldNotLoadPublicRooms: "Could not load public rooms",
        failedFetchOwnerRooms: "Failed to fetch owner rooms",
        couldNotLoadOwnerRooms: "Could not load owner rooms",
        failedFetchNonOwnerRooms: "Failed to fetch non-owner rooms",
        couldNotLoadRooms: "Could not load rooms",
        roomNameRequired: "Room name is required",
        joinCodeRequired: "Join code is required",
        roomCreationFailed: "Room creation failed",
        couldNotCreateRoom: "Could not create room",
        failedToJoinRoom: "Failed to join room",
        errorJoiningRoom: "Error joining room",
        failedToDeleteRoom: "Failed to delete room",
        couldNotDeleteRoom: "Could not delete room"
      },
      success: {
        joinedRoom: "Joined room successfully!",
        roomDeleted: "Room deleted!"
      }
    },
    common: {
      cancel: "Cancel",
      create: "Create",
      delete: "Delete"
    },
  },
  ar: {
    onboarding: {
      skip: 'تخطى',
      welcome: 'مرحبًا بك في تطبيق ستويك!',
      continue: 'استمرار',
      back: 'رجوع',
      select_option: 'الرجاء اختيار خيار:',
      moodOptions: {
        overwhelmed: 'أشعر أنني غير قادر على التعامل مع الحياة',
        disconnected: 'أشعر أنني بعيد عن الناس أو عن نفسي',
        low_energy: 'أشعر بالتعب وانعدام الحافز معظم الوقت',
        hopeless: 'أشعر أن لا شيء سيتحسن أبدًا',
        normal: 'أشعر أنني بخير بشكل عام وأقوم فقط بالتحقق من حالتي'
      },
      questions: {
        initial_mood: 'كيف تشعر في الفترة الأخيرة؟',
        normal: {
          q1: 'هل تشعر أنك متوازن وقادر على التعامل مع الحياة اليومية؟',
          q2: 'هل تنام وتتناول الطعام وتؤدي وظائفك بشكل جيد؟',
          q3: 'هل تشعر بمشاعر إيجابية أو محايدة بشكل عام خلال يومك؟',
          q4: 'هل تشعر أنك متصل ومتحكم في عواطفك؟',
          q5: 'هل تجد نفسك تستمتع أو تتفاعل مع أنشطتك اليومية؟'
        },
        overwhelmed: {
          q1: 'هل تواجه مواقف تشعر أنها تفوق طاقتك؟',
          q2: 'هل تشعر أن لديك الكثير مما يمكنك تحمله؟',
          q3: 'هل تعاني في إيجاد وقت للعناية بنفسك؟',
          q4: 'هل تشعر بالإرهاق جسدياً أو عاطفياً؟',
          q5: 'هل تجد صعوبة في الاسترخاء حتى عندما يكون لديك وقت؟'
        },
        disconnected: {
          q1: 'هل تشعر بالعزلة عن الآخرين؟',
          q2: 'هل تجد صعوبة في التواصل مع الناس؟',
          q3: 'هل تتجنب التفاعلات الاجتماعية؟',
          q4: 'هل تشعر أن الآخرين لا يفهمونك؟',
          q5: 'هل يسبب لك التفاعل الاجتماعي القلق؟'
        },
        low_energy: {
          q1: 'هل تعاني من عدم وجود حافز؟',
          q2: 'هل تبدو المهام البسيطة مرهقة؟',
          q3: 'هل تغير نمط نومك بشكل ملحوظ؟',
          q4: 'هل تفقد الاهتمام بالأشياء بسرعة؟',
          q5: 'هل تشعر بالإرهاق الجسدي غالباً؟'
        },
        hopeless: {
          q1: 'هل تشعر أن الأمور لن تتحسن أبداً؟',
          q2: 'هل تعاني في رؤية الجوانب الإيجابية في الحياة؟',
          q3: 'هل فقدت الاهتمام بخطط المستقبل؟',
          q4: 'هل تشعر بالرغبة في الاستسلام أمام التحديات؟',
          q5: 'هل تشعر أنك محاصر في وضعك الحالي؟'
        },
        crisis_resources: 'موارد الدعم الفوري:'
      },
      answers: {
        yes: 'نعم',
        no: 'لا',
        sometimes: 'أحياناً'
      },
      resources: {
        overwhelmed: "يبدو أن هناك شعورًا بالإرهاق. جرّب استخدام أدوات تساعد على ترتيب الأولويات، وخذ فترات راحة قصيرة خلال اليوم، وجرب تمارين التنفس أو التأمل لتخفيف التوتر.",
        
        disconnected: "الشعور بالانفصال ليس سهلًا. قد يكون من المفيد التحدث مع شخص موثوق، أو الانضمام إلى مجموعة دعم، أو تجربة أنشطة تساعد على استعادة التواصل مع النفس والآخرين.",
        
        low_energy: "انخفاض الطاقة قد يكون إشارة إلى حاجة الجسد أو العقل للراحة. احرص على نوم جيد، واشرب كمية كافية من الماء، وابدأ بإضافة عادات بسيطة وإيجابية إلى روتينك اليومي.",
        
        hopeless: "إذا كان هناك شعور باليأس، فتذكر أنك لست وحدك. في مصر، يمكن الاتصال بخط الدعم النفسي على الرقم 16328. هناك مختصون مستعدون للاستماع والمساعدة. طلب الدعم خطوة قوية وشجاعة.",
        
        needsSupport: "قد تمرّ بوقت صعب، ومن الطبيعي أن تحتاج إلى دعم. التحدث مع شخص موثوق أو مختص نفسي يمكن أن يساعد. لست وحدك—الدعم متاح، والتعافي ممكن.",
        
        general: "شكرًا لمشاركة ما تشعر به. اتخاذ خطوة لفهم الحالة النفسية أمر قوي. نحن هنا لتقديم الدعم والموارد والإرشادات التي تساعد على التحسّن والمضي قدمًا."
      }
    },
    weeklyCheckIn: {
      questions: {
        stress: {
          q1: "هل شعرت بالضغط أو الإرهاق مؤخرًا؟",
          q2: "هل واجهت صعوبة في التعامل مع مسؤولياتك اليومية؟",
          q3: "هل عانيت من أعراض جسدية مثل التوتر أو الصداع بسبب التوتر؟",
          q4: "هل وجدت صعوبة في أخذ فترات راحة أو الاسترخاء؟",
          q5: "هل كنت قلقًا باستمرار بشأن المهام أو الوقت؟",
        },
        anxiety: {
          q1: "هل شعرت بقلق أو توتر غير معتاد هذا الأسبوع؟",
          q2: "هل واجهت أفكارًا متسارعة أو صعوبة في التركيز؟",
          q3: "هل شعرت بالتوتر أو القلق دون سبب واضح؟",
          q4: "هل تجنبت أنشطة معينة بسبب القلق أو الخوف؟",
          q5: "هل لاحظت أعراضًا جسدية مثل تسارع ضربات القلب أو التعرق عند القلق؟",
        },
        depression: {
          q1: "هل شعرت بالحزن أو الفراغ المستمر؟",
          q2: "هل فقدت الاهتمام بالأنشطة التي تستمتع بها عادة؟",
          q3: "هل لاحظت تغيرات في النوم أو الشهية؟",
          q4: "هل واجهت صعوبة في التركيز أو اتخاذ القرارات؟",
          q5: "هل شعرت بانعدام القيمة أو الذنب دون سبب واضح؟",
        },
        normal: {
          q1: "هل شعرت بالاستقرار العاطفي هذا الأسبوع؟",
          q2: "هل تحافظ على نمط نوم وتغذية ومستوى طاقة جيد؟",
          q3: "هل تستمتع بأنشطتك اليومية؟",
          q4: "هل شعرت بأنك منتج ومركز بشكل عام؟",
          q5: "هل تشعر بالترابط مع الآخرين ومع نفسك؟",
        }
      },
      resources: {
        stress: "جرّب تمارين التنفس العميق، فترات راحة قصيرة، وتنظيم وقتك لتقليل التوتر.",
        anxiety: "دوّن أفكارك، تنفّس بعمق، وجرب تمارين خفيفة لتخفيف القلق.",
        depression: "اهتم بروتينك اليومي، كن لطيفًا مع نفسك، ولا تتردد في طلب المساعدة.",
        normal: "حافظ على عاداتك الصحية! أنت بخير، ونحن هنا لدعمك."
      },
      answers: {
        yes: 'نعم',
        no: 'لا',
        sometimes: 'أحياناً',
      },
      errors: {
        userNotFound: "المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.",
        fetchFailed: "فشل جلب البيانات",
        submitFailed: "فشل إرسال الفحص. يرجى المحاولة مرة أخرى.",
        incompleteAnswers: "يرجى الإجابة على جميع الأسئلة."
      },
      alerts: {
        alreadySubmitted: "لقد أكملت فحصك الأسبوعي بالفعل.",
        success: "تم تسجيل فحصك بنجاح!"
      },
      navigation: {
        previous: "السابق",
        submit: "إرسال"
      }
    },
    landing: {
      subtitle: "رفيقك اليومي للصحة النفسية",
      google: "الدخول باستخدام جوجل",
      email: "إنشاء حساب بالبريد الإلكتروني",
      haveAccount: "هل لديك حساب بالفعل؟",
      login: "تسجيل الدخول"
    },
    login: {
      title: "مرحباً بعودتك",
      subtitle: "تابع رحلتك نحو العافية",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      login: "تسجيل الدخول",
      dontHaveAccount: "ليس لديك حساب؟",
      signUp: "إنشاء حساب",
      emailRequired: "البريد الإلكتروني مطلوب",
      emailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
      userNotExist: "المستخدم غير موجود",
      passwordRequired: "كلمة المرور مطلوبة",
      passwordShort: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      errorTitle: "خطأ في تسجيل الدخول"
    },
    validation: {
      username_required: "اسم المستخدم مطلوب",
      username_short: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل",
      email_required: "البريد الإلكتروني مطلوب",
      email_invalid: "يرجى إدخال بريد إلكتروني صالح",
      password_required: "كلمة المرور مطلوبة",
      password_short: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      confirm_password_mismatch: "كلمتا المرور غير متطابقتين",
      gender_required: "يرجى تحديد النوع",
      age_required: "العمر مطلوب",
      age_invalid: "يرجى إدخال عمر صالح (من 13 إلى 120)",
      emptyFields: "لا يمكن ترك اسم المستخدم أو البريد الإلكتروني فارغاً.",
      invalidEmail: "يجب أن ينتهي البريد الإلكتروني بنطاق معرف",
      shortPassword: "يجب أن تكون كلمة المرور 6 أحرف على الأقل.",
      userIdMissing: "معرف المستخدم مفقود.",
      success: "تم تحديث الملف الشخصي بنجاح.",
      error: "فشل تحديث الملف الشخصي.",
      fetchError: "فشل في جلب بيانات المستخدم."
    },
    signup: {
      title: "إنشاء حساب جديد",
      subtitle: "ابدأ رحلتك نحو العافية النفسية",
      username: "اسم المستخدم",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      passwordtitle1: "تأمين المساحة الخاصة بك",
      passwordtitle2: "إنشاء مكان آمن لأفكارك",
      confirmPassword: "تأكيد كلمة المرور",
      age: "عمرك",
      identity: "الهوية",
      subtitle2: "ساعدنا في تخصيص تجربتك العلاجية",
      female: "أنثى",
      male: "ذكر",
      continue: "استمرار",
      beginJourney: "ابدأ رحلتك",
      back: "رجوع",
      alreadyMember: "هل لديك حساب بالفعل؟",
      welcomeBack: "مرحباً بعودتك",
    },
    home: {
      welcomeBack: "مرحباً بعودتك!",
      weeklyCheckin: "الفحص الأسبوعي",
      howAreYou: "كيف تشعر الآن؟",
      startCheckin: "بدء الفحص",
      quickAccess: "وصول سريع",
      community: "المجتمع",
      aiChat: "دردشة الذكاء الاصطناعي",
      progress: "التقدم",
      settings: "الإعدادات",
      loading: "جار التحميل..."
    },
    settings: {
      title: "الإعدادات",
      accountSettings: "إعدادات الحساب",
      editProfile: "تعديل الملف الشخصي",
      appInformation: "معلومات التطبيق",
      version: "الإصدار",
      privacyPolicy: "سياسة الخصوصية",
      termsOfService: "شروط الخدمة",
      logOut: "تسجيل الخروج",
      deleteAccount: "حذف الحساب",
      confirm: "تأكيد",
      confirmDelete: "هل أنت متأكد أنك تريد حذف حسابك؟",
      delete: "حذف",
      cancel: "إلغاء",
      logoutError: "خطأ في تسجيل الخروج",
      logoutFailed: "فشل في تسجيل الخروج",
      deleteError: "خطأ",
      deleteFailed: "فشل في حذف الحساب",
      userIdNotFound: "لم يتم العثور على معرف المستخدم"
    },
    editProfile: {
      title: "تعديل الملف الشخصي",
      usernamePlaceholder: "اسم المستخدم",
      emailPlaceholder: "البريد الإلكتروني",
      passwordPlaceholder: "كلمة مرور جديدة (اختياري)",
      saveButton: "حفظ التغييرات",
    },
    progress: {
      title: "رحلتك نحو الصحة النفسية 🌱",
      streakTitle: "تتابع اليقظة الذهنية! 🔥",
      streakText: "استمر في تسجيل حالتك المزاجية أسبوعياً لزيادة تتابعك",
      moodTrends: "اتجاهات المزاج",
      moodProgress: "تقدم المزاج (الأسبوع الماضي)",
      noData: "لم تقم بتسجيل أي فحوصات بعد.",
      errors: {
        userNotFound: "المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.",
        fetchFailed: "فشل جلب بيانات المزاج"
      }
    },
    privacyPolicy: {
      title: "خصوصيتك تهمنا",
      paragraphs: [
        "ستويك هو رفيقك الودود للذكاء الاصطناعي، هنا لدعم رحلتك نحو الصحة النفسية والنمو الشخصي. اعتبرني دليلاً داعماً - وليس بديلاً عن المعالجين المحترفين أو مقدمي الرعاية الصحية.",
        "خصوصيتك مقدسة بالنسبة لنا. نحن لا نصل أبداً إلى المعلومات الشخصية الحساسة دون إذن واضح منك، وأي بيانات نستخدمها لتحسين تجربتك تكون مجهولة تماماً.",
        "إذا كنت تعاني من ضغوط عاطفية كبيرة أو أزمة صحية نفسية، يرجى التواصل مع محترف مرخص أو خدمات الدعم المحلية. رفاهيتك هي أولويتنا القصوى."
      ]
    },
    termsOfService: {
      title: "التزامنا تجاهك",
      paragraphs: [
        "ستويك هو رفيقك الداعم للذكاء الاصطناعي، هنا لمساعدتك في رحلتك نحو الصحة النفسية والنمو الشخصي. يرجى تذكر أنني مصمم كدليل - وليس بديلاً عن المعالجين المحترفين أو مقدمي الرعاية الصحية.",
        "خصوصيتك تحظى باحترام عميق. نحن نستخدم فقط المعلومات التي تختار مشاركتها معنا، وأي بيانات تساعد في تحسين تجربتك يتم إخفاء هويتها بعناية لحماية هويتك.",
        "إذا واجهت أي تحديات عاطفية كبيرة أو أزمة صحية نفسية، نشجعك على التواصل مع محترفين مرخصين أو خدمات الدعم المحلية. سلامتك ورفاهيتك تأتي في المقام الأول."
      ]
    },
    community: {
      adminCommunity: "مجتمع المشرفين",
      yourCommunity: "مجتمعك",
      createPublicRoom: "إنشاء غرفة عامة",
      createPrivateRoom: "إنشاء غرفة خاصة",
      enterJoinCode: "أدخل رمز الانضمام للغرفة",
      joinRoom: "انضم للغرفة",
      roomsYouOwn: "الغرف التي تمتلكها",
      noRoomsOwned: "لا توجد غرف تمتلكها بعد",
      joinedRooms: "الغرف المنضم إليها",
      noJoinedRooms: "لا توجد غرف منضم إليها بعد",
      publicRooms: "الغرف العامة",
      noPublicRooms: "لا توجد غرف عامة متاحة",
      public: "عامة",
      private: "خاصة",
      owner: "المالك",
      code: "الكود",
      deleteRoom: "حذف الغرفة",
      deleteRoomConfirmation: "هل أنت متأكد أنك تريد حذف هذه الغرفة؟ سيؤدي هذا إلى حذف جميع المنشورات في الغرفة.",
      roomNamePlaceholder: "اسم الغرفة",
      errors: {
        userNotFound: "المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.",
        failedToLoadUserData: "فشل تحميل بيانات المستخدم",
        failedFetchPublicRooms: "فشل جلب الغرف العامة",
        couldNotLoadPublicRooms: "تعذر تحميل الغرف العامة",
        failedFetchOwnerRooms: "فشل جلب الغرف المملوكة",
        couldNotLoadOwnerRooms: "تعذر تحميل الغرف المملوكة",
        failedFetchNonOwnerRooms: "فشل جلب الغرف غير المملوكة",
        couldNotLoadRooms: "تعذر تحميل الغرف",
        roomNameRequired: "اسم الغرفة مطلوب",
        joinCodeRequired: "رمز الانضمام مطلوب",
        roomCreationFailed: "فشل إنشاء الغرفة",
        couldNotCreateRoom: "تعذر إنشاء الغرفة",
        failedToJoinRoom: "فشل الانضمام للغرفة",
        errorJoiningRoom: "خطأ في الانضمام للغرفة",
        failedToDeleteRoom: "فشل حذف الغرفة",
        couldNotDeleteRoom: "تعذر حذف الغرفة"
      },
      success: {
        joinedRoom: "تم الانضمام للغرفة بنجاح!",
        roomDeleted: "تم حذف الغرفة!"
      }
    },
    common: {
      cancel: "إلغاء",
      create: "إنشاء",
      delete: "حذف"
    },
  }
};

const i18n = new I18n(translations);

// Simplify locale handling
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Set initial locale
const setLocale = (locale: string) => {
  i18n.locale = locale.startsWith('ar') ? 'ar' : 'en';
};

setLocale(Localization.locale);

export const changeLanguage = (locale: 'en' | 'ar') => {
  i18n.locale = locale;
};

export default i18n;
