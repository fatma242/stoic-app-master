import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: {
    onboarding: {
      welcome: 'Welcome to Stoic!',
      continue: 'Continue',
      back: 'Back',
      select_option: 'Please select an option:',
      moodOptions: {
        overwhelmed: 'I feel overwhelmed',
        disconnected: 'I feel disconnected',
        low_energy: 'I have low energy',
        hopeless: 'I feel hopeless about life'
      },
      questions: {
        initial_mood: 'How have you been feeling lately?',
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

    }
  },
  ar: {
    onboarding: {
      welcome: 'مرحبًا بك في تطبيق ستويك!',
      continue: 'استمر',
      back: 'رجوع',
      select_option: 'الرجاء اختيار خيار:',
      moodOptions: {
        overwhelmed: 'أشعر بالإرهاق',
        disconnected: 'أشعر بالانفصال',
        low_energy: 'أشعر بانخفاض الطاقة',
        hopeless: 'أشعر باليأس تجاه الحياة'
      },
      questions: {
        initial_mood: 'كيف تشعر في الفترة الأخيرة؟',
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
