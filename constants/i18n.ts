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
        success: "Your check-in has been recorded!",
        updateProgress: "Update Progress",
        reminderMessage: "Great work completing your weekly check-in! Would you like to update your progress tracker now?",
        progressReminder: "💡 Don't forget to track your daily progress after this check-in!"
      },
      navigation: {
        previous: "Previous",
        submit: "Submit",
        later: "Later"
      },
      notifications: {
        weeklyReminderTitle: "Weekly Check-in Reminder",
        weeklyReminderMessage: "It's time for your weekly mental health check-in! Take a moment to reflect on your week.",
        progressReminderTitle: "Progress Update Reminder",
        progressReminderMessage: "Don't forget to update your daily progress tracker to maintain your wellness journey!",
        completionTitle: "Weekly Check-in Completed!",
        completionMessage: "Great job completing your weekly mental health check-in! Your wellness journey continues."
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
      incorrectPassword: "Incorrect password",
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
   chatAI: {
  title: "AI Chat",
  subtitle: "Your AI Mental Health Companion",
  botName: "Stoic",
  botDescription: "Your friendly AI companion for mental wellness and personal growth. Here to listen, support, and guide you on your journey.",
  startChat: "Start Chatting",
  placeholder: "Share your thoughts with me...",
  send: "Send",
  loading: "Thinking...",
  typing: "Stoic is typing...",
  
  // Welcome Messages
  welcomeMessage: "Hello! I'm Stoic, your AI companion. Here to support your mental wellness and personal growth journey. How can I assist you today?",
  
  welcomeMessages: {
    normal: "Hello! I'm here to support your mental wellness journey. How are you feeling today?",
    stressed: "I understand you've been feeling overwhelmed lately. I'm here to listen and help you work through these feelings. What's on your mind?",
    anxious: "I notice you've been experiencing some anxiety. That takes courage to acknowledge. I'm here to support you. Would you like to talk about what's been worrying you?",
    depressed: "I see you've been going through a difficult time. I want you to know that your feelings are valid, and I'm here to listen without judgment. How can I support you today?",
    default: "I'm here to listen and support you. Please feel free to share what's on your mind.",
    crisis: "I'm concerned about how you've been feeling. Please know that you're not alone, and there are people who want to help. While I'm here to listen, I also want to make sure you have access to immediate professional support if needed."
  },
  
  // Error Messages
  errors: {
    general: "I'm having trouble connecting right now. Please try again in a moment.",
    noResponse: "I couldn't generate a response. Could you please rephrase your message?",
    networkError: "Network connection issue. Please check your internet and try again.",
    rateLimited: "I need a moment to process. Please wait a few seconds before sending another message.",
    invalidInput: "I didn't quite understand that. Could you please share more details?",
    serverError: "I'm experiencing technical difficulties. Please try again later.",
    longMessage: "Your message is quite long. Could you break it into smaller parts so I can better help you?",
    emptyMessage: "Please share your thoughts or questions with me.",
    inappropriateContent: "I'm here to support your mental wellness. Let's keep our conversation focused on helpful topics."
  },
  
  // Status Messages
  status: {
    connecting: "Connecting to Stoic...",
    reconnecting: "Reconnecting...",
    connected: "Connected",
    disconnected: "Connection lost. Tap to reconnect.",
    offline: "You're offline. Messages will be sent when connection is restored."
  },
  
  // Input Validation
  validation: {
    tooShort: "Please share a bit more so I can better understand and help you.",
    tooLong: "That's quite a lot to process. Could you break it into smaller parts?",
    inappropriate: "Let's keep our conversation supportive and appropriate.",
    spam: "I notice you're sending messages very quickly. Take a moment to breathe.",
    profanity: "I'm here to provide a safe, supportive space. Let's keep our language respectful."
  },
  
  // Suggestions
  suggestions: {
    title: "How can I help you today?",
    options: [
      "I'm feeling stressed",
      "I need someone to talk to",
      "Help me with anxiety",
      "I'm having trouble sleeping",
      "I want to improve my mood",
      "Share coping strategies"
    ]
  },
  
  // Quick Responses
  quickResponses: {
    thankYou: "You're welcome! I'm always here when you need support.",
    goodbye: "Take care of yourself. Remember, I'm here whenever you need to talk.",
    emergency: "If you're in immediate danger, please contact emergency services or a crisis hotline right away.",
    professional: "For serious mental health concerns, I encourage you to speak with a licensed professional.",
    support: "Remember, seeking help is a sign of strength, not weakness."
  },
  
  // Session Management
  session: {
    welcome: "Welcome back! How are you feeling since we last talked?",
    firstTime: "This is our first conversation. I'm excited to get to know you and support your journey.",
    continuing: "I'm glad you're back. What would you like to talk about today?",
    ended: "Our conversation has ended. Feel free to start a new one anytime.",
    timeout: "It seems you've been away for a while. I'm still here when you're ready to continue."
  },
  
  // Help and Information
  help: {
    title: "How to Chat with Stoic",
    description: "I'm here to listen, support, and provide guidance for your mental wellness journey.",
    tips: [
      "Share your thoughts and feelings openly",
      "Ask questions about mental health and wellness",
      "Request coping strategies and techniques",
      "Talk about your daily experiences and challenges"
    ],
    limitations: "Remember: I'm an AI assistant, not a replacement for professional therapy or medical care.",
    crisis: "In emergencies, please contact: Emergency Services (911) or Crisis Hotline (988)"
  },
  
  // Features
  features: {
    available: "Available features:",
    moodTracking: "Mood tracking and insights",
    copingStrategies: "Personalized coping strategies",
    mindfulness: "Mindfulness and breathing exercises",
    journaling: "Guided journaling prompts",
    resources: "Mental health resources and tips"
  }
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
      titleAdmin: "Admin Community",
      titleUser: "Your Community",
      createPublicRoom: "Create Public Room",
      createPrivateRoom: "Create Private Room",
      roomNamePlaceholder: "Room name",
      cancel: "Cancel",
      create: "Create",
      joinRoomPlaceholder: "Enter room join code",
      joinRoomButton: "Join Room",
      roomsOwned: "Rooms You Own",
      joinedRooms: "Joined Rooms",
      publicRooms: "Public Rooms",
      noRoomsOwned: "No rooms owned yet",
      noJoinedRooms: "No joined rooms yet",
      noPublicRooms: "No public rooms available",
      deleteRoomTitle: "Delete Room",
      deleteRoomMessage: "Are you sure you want to delete this room? This will delete all posts in the room.",
      delete: "Delete",
      roomOptionsTitle: "Room Options",
      roomOptionsMessage: "What would you like to do with this room?",
      leaveRoomTitle: "Leave Room",
      leaveRoomMessage: "Are you sure you want to leave this room?",
      leave: "Leave",
      leaveRoom: "Leave Room",
      successCreate: "Room created successfully!",
      successJoin: "Joined room successfully!",
      successDelete: "Room deleted!",
      successLeave: "Left room successfully!",
      errorJoining: "Error joining room",
      errorCreating: "Could not create room",
      errorDeleting: "Could not delete room",
      errorLeaving: "Could not leave room",
      errorFetching: "Could not load rooms",
      roomNameRequired: "Room name is required",
      joinCodeRequired: "Join code is required",
    },
    room: {
         removedFromRoom: "Removed from Room",
    youHaveBeenRemoved: "You have been removed from this room",
    youHaveBeenRemovedMessage: "You no longer have access to this room and cannot perform any actions here.",
    backToRooms: "Back to Rooms",
      websocketError: "Broker reported error: ",
      details: "Additional details: ",
      fetchRoomError: "Failed to fetch room",
      loadRoomError: "Could not load room",
      fetchRoleError: "Could not fetch user role:",
      fetchMessagesError: "Failed to fetch messages",
      loadMessagesError: "Could not load messages",
      fetchPostsError: "Failed to fetch posts",
      loadPostsError: "Could not load posts",
      fetchNotificationsError: "Failed to fetch notifications",
      loadNotificationsError: "Could not load notifications",
      fetchUsersError: "Failed to fetch room users",
      loadUsersError: "Could not load room users",
      sendMessageError: "Failed to send message",
      postFieldsRequired: "Title and content are required",
      createPostError: "Could not create post",
      postCreatedSuccess: "Post created successfully",
      roomNameRequired: "Room name is required",
      updateRoomError: "Could not update room",
      roomUpdatedSuccess: "Room updated successfully",
      confirmDeleteTitle: "Confirm Delete",
      confirmDeleteMessage: "Are you sure you want to delete this room?",
      delete: "Delete",
      deleteRoomError: "Could not delete room",
      roomDeletedSuccess: "Room deleted successfully",
      markNotificationsError: "Failed to mark notifications as read",
      roomCodeCopied: "Room code copied to clipboard",
      loadDataError: "Error loading data:",
      loadRoomDataError: "Failed to load room data",
      roomNotFound: "Room not found",
      userNotFound: "User not found. Please log in again.",
      toggleLikeError: "Failed to toggle like",
      removeUserTitle: "Remove User",
      removeUserMessage: "Are you sure you want to remove this user from this room?",
      remove: "Remove",
      removeUserError: "Could not remove user",
      userRemovedSuccess: "User has been removed from the room",
      adminOnlyDelete: "Only admins can delete posts",
      adminDeleteTitle: "Admin Force Delete",
      adminDeleteMessage: "Are you sure you want to permanently delete the post \"{postTitle}\"? This action cannot be undone.",
      deletePostError: "Could not delete post",
      postDeletedSuccess: "Post deleted successfully",
      userNotAuthenticated: "User not authenticated",
      deleteOwnPostsOnly: "You can only delete your own posts",
      deletePostTitle: "Delete Post",
      deletePostMessage: "Are you sure you want to delete this post? This action cannot be undone.",
      type: "Type",
      public: "Public",
      private: "Private",
      owner: "Owner",
      you: "You",
      user: "User",
      roomCode: "Room Code",
      users: "Users",
      noUsers: "No users joined yet",
      unknownUser: "Unknown User",
      chat: "Chat",
      back: "Back",
      noMessages: "No messages yet",
      posts: "Posts",
      noPosts: "No posts yet",
      createPost: "Create New Post",
      postTitlePlaceholder: "Post title",
      postContentPlaceholder: "Post content",
      createPostButton: "Create Post",
      messagePlaceholder: "Type a message...",
      by: "By",
      unknownAuthor: "Unknown Author",
      comment: "Comment",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      copied: "Copied"
    },
    "postDetails": {
      "loadingPost": "Loading your post...",
      "postNotFound": "Post not found",
      "goBack": "Go Back",
      "therapySession": "Therapy Session",
      "supportiveComments": "Supportive Comments",
      "shareYourThoughts": "Share your thoughts...",
      "addComment": "Add Comment",
      "loadingComments": "Loading comments...",
      "noComments": "No comments yet",
      "beFirst": "Be the first to share your thoughts",
      "reportComment": "Report Comment",
      "reportConfirm": "Are you sure you want to report this comment for inappropriate content?",
      "cancel": "Cancel",
      "report": "Report",
      "reported": "Reported",
      "commentAdded": "Comment added successfully",
      "commentReported": "Comment has been reported successfully",
      "commentRemoved": "Comment has been removed due to multiple reports",
      "reportError": "Could not report comment. Please try again.",
      "likeError": "Could not toggle like on comment.",
      "commentError": "Could not add comment. Please try again.",
      "mustLogin": "You must be logged in to comment",
      "loadUserError": "Error loading user data",
      "fetchPostError": "Failed to fetch post",
      "loadPostError": "Could not load post details",
      "fetchCommentsError": "Failed to fetch comments",
      "likeCommentError": "Failed to toggle like",
      "unknownDate": "Unknown date",
      "anonymous": "Anonymous",
      "success": "Success",
      "error": "Error"
    }
    ,"time": {
    "justNow": "Just now",
    "minutesAgo": "{{count}}m ago",
    "hoursAgo": "{{count}}h ago",
    "yesterday": "Yesterday",
    "daysAgo": "{{count}}d ago",
    "unknown":"Unknown"
  },
  "notifications": {
    "title": "Notifications",
    "noNotifications": "No Notifications",
    "caughtUp": "You're all caught up! New notifications will appear here automatically.",
    "realTimeActive": "Real-time updates active",
    "offlineMode": "Offline mode - Pull to refresh",
    "notification": "notification",
    "notifications": "notifications",
    "unread": "unread",
    "markAll": "Mark All",
    "markAllTitle": "Mark All as Read",
    "markAllMessage": "Mark all {{count}} notifications as read?",
    "refreshTitle": "Pull to refresh notifications"
  },
  "common": {
    "error":"Error",
    "ok": "OK",
    "cancel": "Cancel"
  }
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
        success: "تم تسجيل فحصك بنجاح!",
        updateProgress: "تحديث التقدم",
        reminderMessage: "عمل رائع في إكمال فحصك الأسبوعي! هل تريد تحديث متتبع التقدم الآن؟",
        progressReminder: "💡 لا تنس تتبع تقدمك اليومي بعد هذا الفحص!"
      },
      navigation: {
        previous: "السابق",
        submit: "إرسال",
        later: "لاحقاً"
      },
      notifications: {
        weeklyReminderTitle: "تذكير الفحص الأسبوعي",
        weeklyReminderMessage: "حان وقت فحصك الأسبوعي للصحة النفسية! خذ لحظة للتفكير في أسبوعك.",
        progressReminderTitle: "تذكير تحديث التقدم",
        progressReminderMessage: "لا تنس تحديث متتبع التقدم اليومي للحفاظ على رحلة العافية الخاصة بك!",
        completionTitle: "تم إكمال الفحص الأسبوعي!",
        completionMessage: "عمل رائع في إكمال فحصك الأسبوعي للصحة النفسية! رحلة العافية الخاصة بك مستمرة."
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
      incorrectPassword: "كلمة المرور غير صحيحة",
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
      titleAdmin: "مجتمع المدير",
      titleUser: "مجتمعك",
      createPublicRoom: "إنشاء غرفة عامة",
      createPrivateRoom: "إنشاء غرفة خاصة",
      roomNamePlaceholder: "اسم الغرفة",
      cancel: "إلغاء",
      create: "إنشاء",
      joinRoomPlaceholder: "أدخل كود الانضمام",
      joinRoomButton: "انضم إلى الغرفة",
      roomsOwned: "الغرف التي تملكها",
      joinedRooms: "الغرف المنضم إليها",
      publicRooms: "الغرف العامة",
      noRoomsOwned: "لا تملك أي غرف حالياً",
      noJoinedRooms: "لم تنضم إلى أي غرف بعد",
      noPublicRooms: "لا توجد غرف عامة متاحة",
      deleteRoomTitle: "حذف الغرفة",
      deleteRoomMessage: "هل أنت متأكد من حذف هذه الغرفة؟ سيتم حذف جميع المشاركات داخلها.",
      delete: "حذف",
      roomOptionsTitle: "خيارات الغرفة",
      roomOptionsMessage: "ماذا تريد أن تفعل مع هذه الغرفة؟",
      leaveRoomTitle: "مغادرة الغرفة",
      leaveRoomMessage: "هل أنت متأكد من مغادرة هذه الغرفة؟",
      leave: "مغادرة",
      leaveRoom: "مغادرة الغرفة",
      successCreate: "تم إنشاء الغرفة بنجاح!",
      successJoin: "تم الانضمام إلى الغرفة بنجاح!",
      successDelete: "تم حذف الغرفة!",
      successLeave: "تم مغادرة الغرفة بنجاح!",
      errorJoining: "فشل في الانضمام إلى الغرفة",
      errorCreating: "فشل في إنشاء الغرفة",
      errorDeleting: "فشل في حذف الغرفة",
      errorLeaving: "فشل في مغادرة الغرفة",
      errorFetching: "تعذر تحميل الغرف",
      roomNameRequired: "اسم الغرفة مطلوب",
      joinCodeRequired: "كود الانضمام مطلوب",
    },
    
  chatAI: {
  title: "دردشة الذكاء الاصطناعي",
  subtitle: "رفيقك الذكي للصحة النفسية",
  botName: "ستويك",
  botDescription: "رفيقك الودود للذكاء الاصطناعي للعافية النفسية والنمو الشخصي. هنا للاستماع والدعم وإرشادك في رحلتك.",
  startChat: "بدء المحادثة",
  placeholder: "شاركني أفكارك...",
  send: "إرسال",
  loading: "أفكر...",
  typing: "ستويك يكتب...",
  
  // Welcome Messages
  welcomeMessage: "مرحباً! أنا ستويك، رفيقك الذكي. هنا لدعم رحلتك نحو العافية النفسية والنمو الشخصي. كيف يمكنني مساعدتك اليوم؟",
  
  welcomeMessages: {
    normal: "مرحباً! أنا هنا لدعم رحلتك نحو العافية النفسية. كيف تشعر اليوم؟",
    stressed: "أفهم أنك تشعر بالإرهاق مؤخراً. أنا هنا للاستماع ومساعدتك في التعامل مع هذه المشاعر. ما الذي يشغل بالك؟",
    anxious: "ألاحظ أنك تعاني من بعض القلق. يتطلب الأمر شجاعة للاعتراف بذلك. أنا هنا لدعمك. هل تريد التحدث عما يقلقك؟",
    depressed: "أرى أنك تمر بوقت صعب. أريدك أن تعلم أن مشاعرك مبررة، وأنا هنا للاستماع دون إصدار أحكام. كيف يمكنني دعمك اليوم؟",
    default: "مرحباً! أنا ستويك، رفيقك الذكي. هنا لدعم رحلتك نحو العافية النفسية والنمو الشخصي. كيف يمكنني مساعدتك اليوم؟",
    crisis: "أنا قلق بشأن ما تشعر به. اعلم أنك لست وحدك، وهناك أشخاص يريدون المساعدة. بينما أنا هنا للاستماع، أريد أيضاً التأكد من وصولك للدعم المهني الفوري إذا لزم الأمر."
  },
  
  // Error Messages
  errors: {
    general: "أواجه مشكلة في الاتصال الآن. يرجى المحاولة مرة أخرى بعد لحظة.",
    noResponse: "لم أتمكن من توليد رد. هل يمكنك إعادة صياغة رسالتك؟",
    networkError: "مشكلة في الاتصال بالشبكة. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.",
    rateLimited: "أحتاج لحظة للمعالجة. يرجى الانتظار بضع ثوان قبل إرسال رسالة أخرى.",
    invalidInput: "لم أفهم ذلك تماماً. هل يمكنك مشاركة المزيد من التفاصيل؟",
    serverError: "أواجه صعوبات تقنية. يرجى المحاولة مرة أخرى لاحقاً.",
    longMessage: "رسالتك طويلة جداً. هل يمكنك تقسيمها إلى أجزاء أصغر لأتمكن من مساعدتك بشكل أفضل؟",
    emptyMessage: "يرجى مشاركة أفكارك أو أسئلتك معي.",
    inappropriateContent: "أنا هنا لدعم عافيتك النفسية. دعنا نحافظ على محادثتنا مركزة على المواضيع المفيدة."
  },
  
  // Status Messages
  status: {
    connecting: "الاتصال بستويك...",
    reconnecting: "إعادة الاتصال...",
    connected: "متصل",
    disconnected: "انقطع الاتصال. اضغط لإعادة الاتصال.",
    offline: "أنت غير متصل. سيتم إرسال الرسائل عند استعادة الاتصال."
  },
  
  // Input Validation
  validation: {
    tooShort: "يرجى مشاركة المزيد حتى أتمكن من فهمك ومساعدتك بشكل أفضل.",
    tooLong: "هذا كثير للمعالجة. هل يمكنك تقسيمه إلى أجزاء أصغر؟",
    inappropriate: "دعنا نحافظ على محادثتنا داعمة ومناسبة.",
    spam: "ألاحظ أنك ترسل رسائل بسرعة كبيرة. خذ لحظة للتنفس.",
    profanity: "أنا هنا لتوفير مساحة آمنة وداعمة. دعنا نحافظ على لغتنا محترمة."
  },
  
  // Suggestions
  suggestions: {
    title: "كيف يمكنني مساعدتك اليوم؟",
    options: [
      "أشعر بالتوتر",
      "أحتاج شخصاً للحديث معه",
      "ساعدني مع القلق",
      "أواجه مشكلة في النوم",
      "أريد تحسين مزاجي",
      "شارك استراتيجيات التأقلم"
    ]
  },
  
  // Quick Responses
  quickResponses: {
    thankYou: "عفواً! أنا هنا دائماً عندما تحتاج للدعم.",
    goodbye: "اعتن بنفسك. تذكر، أنا هنا كلما احتجت للحديث.",
    emergency: "إذا كنت في خطر فوري، يرجى الاتصال بخدمات الطوارئ أو خط الأزمات فوراً.",
    professional: "للمخاوف الجدية حول الصحة النفسية، أشجعك على التحدث مع مختص مرخص.",
    support: "تذكر، طلب المساعدة علامة قوة وليس ضعف."
  },
  
  // Session Management
  session: {
    welcome: "مرحباً بعودتك! كيف تشعر منذ آخر محادثة لنا؟",
    firstTime: "هذه محادثتنا الأولى. أنا متحمس للتعرف عليك ودعم رحلتك.",
    continuing: "أنا سعيد بعودتك. عن ماذا تريد أن نتحدث اليوم؟",
    ended: "انتهت محادثتنا. لا تتردد في بدء محادثة جديدة في أي وقت.",
    timeout: "يبدو أنك كنت بعيداً لفترة. أنا ما زلت هنا عندما تكون مستعداً للمتابعة."
  },
  
  // Help and Information
  help: {
    title: "كيفية الدردشة مع ستويك",
    description: "أنا هنا للاستماع والدعم وتقديم الإرشاد لرحلتك نحو العافية النفسية.",
    tips: [
      "شارك أفكارك ومشاعرك بصراحة",
      "اسأل أسئلة حول الصحة النفسية والعافية",
      "اطلب استراتيجيات وتقنيات التأقلم",
      "تحدث عن تجاربك وتحدياتك اليومية"
    ],
    limitations: "تذكر: أنا مساعد ذكي، وليس بديلاً عن العلاج المهني أو الرعاية الطبية.",
    crisis: "في حالات الطوارئ، يرجى الاتصال: خدمات الطوارئ (911) أو خط الأزمات (988)"
  },
  
  // Features
  features: {
    available: "الميزات المتاحة:",
    moodTracking: "تتبع المزاج والرؤى",
    copingStrategies: "استراتيجيات التأقلم المخصصة",
    mindfulness: "تمارين اليقظة الذهنية والتنفس",
    journaling: "مطالبات الكتابة الموجهة",
    resources: "موارد ونصائح الصحة النفسية"
  }
},
    
    room: {
      removedFromRoom: "تم إزالتك من الغرفة",
    youHaveBeenRemoved: "تم إزالتك من هذه الغرفة",
    youHaveBeenRemovedMessage: "لم تعد تملك صلاحية الوصول إلى هذه الغرفة ولا يمكنك تنفيذ أي إجراءات هنا.",
    backToRooms: "العودة للغرف",
      websocketError: "الوسيط أبلغ عن خطأ: ",
      details: "تفاصيل إضافية: ",
      fetchRoomError: "فشل جلب معلومات الغرفة",
      loadRoomError: "تعذر تحميل الغرفة",
      fetchRoleError: "تعذر جلب دور المستخدم:",
      fetchMessagesError: "فشل جلب الرسائل",
      loadMessagesError: "تعذر تحميل الرسائل",
      fetchPostsError: "فشل جلب المنشورات",
      loadPostsError: "تعذر تحميل المنشورات",
      fetchNotificationsError: "فشل جلب الإشعارات",
      loadNotificationsError: "تعذر تحميل الإشعارات",
      fetchUsersError: "فشل جلب مستخدمي الغرفة",
      loadUsersError: "تعذر تحميل مستخدمي الغرفة",
      sendMessageError: "فشل إرسال الرسالة",
      postFieldsRequired: "العنوان والمحتوى مطلوبان",
      createPostError: "تعذر إنشاء المنشور",
      postCreatedSuccess: "تم إنشاء المنشور بنجاح",
      roomNameRequired: "اسم الغرفة مطلوب",
      updateRoomError: "تعذر تحديث الغرفة",
      roomUpdatedSuccess: "تم تحديث الغرفة بنجاح",
      confirmDeleteTitle: "تأكيد الحذف",
      confirmDeleteMessage: "هل أنت متأكد أنك تريد حذف ?",
      delete: "حذف",
      deleteRoomError: "تعذر حذف الغرفة",
      roomDeletedSuccess: "تم حذف الغرفة بنجاح",
      markNotificationsError: "فشل تعليم الإشعارات كمقروءة",
      roomCodeCopied: "تم نسخ كود الغرفة إلى الحافظة",
      loadDataError: "خطأ في تحميل البيانات:",
      loadRoomDataError: "فشل تحميل بيانات الغرفة",
      roomNotFound: "الغرفة غير موجودة",
      userNotFound: "المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.",
      toggleLikeError: "فشل تغيير حالة الإعجاب",
      removeUserTitle: "إزالة المستخدم",
      removeUserMessage: "هل أنت متأكد أنك تريد إزالة من هذه الغرفة؟",
      remove: "إزالة",
      removeUserError: "تعذر إزالة المستخدم",
      userRemovedSuccess: "تم إزالة المستخدم من الغرفة",
      adminOnlyDelete: "فقط المديرون يمكنهم حذف المنشورات",
      adminDeleteTitle: "حذف إداري قسري",
      adminDeleteMessage: "هل أنت متأكد أنك تريد حذف المنشور نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.",
      deletePostError: "تعذر حذف المنشور",
      postDeletedSuccess: "تم حذف المنشور بنجاح",
      userNotAuthenticated: "المستخدم غير مصدق",
      deleteOwnPostsOnly: "يمكنك فقط حذف منشوراتك",
      deletePostTitle: "حذف المنشور",
      deletePostMessage: "هل أنت متأكد أنك تريد حذف ?",
      type: "النوع",
      public: "عام",
      private: "خاص",
      owner: "المالك",
      you: "أنت",
      user: "مستخدم",
      roomCode: "كود الغرفة",
      users: "المستخدمون",
      noUsers: "لا يوجد مستخدمون بعد",
      unknownUser: "مستخدم غير معروف",
      chat: "الدردشة",
      back: "رجوع",
      noMessages: "لا توجد رسائل بعد",
      posts: "المنشورات",
      noPosts: "لا توجد منشورات بعد",
      createPost: "إنشاء منشور جديد",
      postTitlePlaceholder: "عنوان المنشور",
      postContentPlaceholder: "محتوى المنشور",
      createPostButton: "إنشاء المنشور",
      messagePlaceholder: "اكتب رسالة...",
      by: "بواسطة",
      unknownAuthor: "مؤلف غير معروف",
      comment: "تعليق",
      error: "خطأ",
      success: "نجاح",
      cancel: "إلغاء",
      save: "حفظ",
      edit: "تعديل",
      copied: "تم النسخ"
    },
    "postDetails": {
      "loadingPost": "جارٍ تحميل المنشور...",
      "postNotFound": "المنشور غير موجود",
      "goBack": "العودة",
      "therapySession": "جلسة علاجية",
      "supportiveComments": "تعليقات داعمة",
      "shareYourThoughts": "شاركنا أفكارك...",
      "addComment": "إضافة تعليق",
      "loadingComments": "جارٍ تحميل التعليقات...",
      "noComments": "لا توجد تعليقات بعد",
      "beFirst": "كن أول من يشارك أفكاره",
      "reportComment": "الإبلاغ عن تعليق",
      "reportConfirm": "هل أنت متأكد أنك تريد الإبلاغ عن هذا التعليق لمحتوى غير لائق؟",
      "cancel": "إلغاء",
      "report": "الإبلاغ",
      "reported": "تم الإبلاغ",
      "commentAdded": "تم إضافة التعليق بنجاح",
      "commentReported": "تم الإبلاغ عن التعليق بنجاح",
      "commentRemoved": "تم حذف التعليق بسبب عدة تقارير",
      "reportError": "تعذر الإبلاغ عن التعليق. يرجى المحاولة مرة أخرى.",
      "likeError": "تعذر تغيير حالة الإعجاب على التعليق.",
      "commentError": "تعذر إضافة التعليق. يرجى المحاولة مرة أخرى.",
      "mustLogin": "يجب تسجيل الدخول لإضافة تعليق",
      "loadUserError": "خطأ في تحميل بيانات المستخدم",
      "fetchPostError": "فشل جلب المنشور",
      "loadPostError": "تعذر تحميل تفاصيل المنشور",
      "fetchCommentsError": "فشل جلب التعليقات",
      "likeCommentError": "فشل تغيير حالة الإعجاب",
      "unknownDate": "تاريخ غير معروف",
      "anonymous": "مجهول",
      "success": "نجاح",
      "error": "خطأ"
    }
    ,"time": {
    "justNow": "الآن",
    "minutesAgo": "منذ {{count}} دقيقة",
    "hoursAgo": "منذ {{count}} ساعة",
    "yesterday": "أمس",
    "daysAgo": "منذ {{count}} يوم",
    "unknown":"غير معروف"
  },
  "notifications": {
    "title": "الإشعارات",
    "noNotifications": "لا توجد إشعارات",
    "caughtUp": "لقد شاهدت كل شيء! ستظهر الإشعارات الجديدة هنا تلقائيًا.",
    "realTimeActive": "التحديثات الفورية نشطة",
    "offlineMode": "وضع عدم الاتصال - اسحب للتحديث",
    "notification": "إشعار",
    "notifications": "إشعارات",
    "unread": "غير مقروء",
    "markAll": "تعليم الكل كمقروء",
    "markAllTitle": "تعليم الكل كمقروء",
    "markAllMessage": "هل تريد تعليم {{count}} إشعار كمقروء؟",
    "refreshTitle": "اسحب لتحديث الإشعارات"
  },
  "common": {
    "error":"خطأ",
    "ok": "موافق",
    "cancel": "إلغاء"
  }
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

  // "time": {  jusNw"الآن",mnusAgoمنذ {{count}} دقيقةhurAgoمنذ{{count}}ساةyeserdayأم",dysgo": "منذ {{oun}}يوم  "offlineMode": "وضع عدم الا  "إشعارnoficaionsuredغيرمقوءmrkAllعمككمروءmakAllتعملككمقروءrereshT}};sti18n = new I18n(trans//Simplifylocale handlini18n.defaultLocale = //Stiiil caleco}setLocale(Localization.locale);xthis userThe user export default i18n;
