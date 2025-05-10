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
        overwhelmed: 'Overwhelm Support:\n- Priority management tools\n- Mindfulness exercises\n- Stress reduction podcasts',
        disconnected: 'Connection Resources:\n- Social anxiety guides\n- Community support groups\n- Communication exercises',
        low_energy: 'Energy Boosters:\n- Sleep hygiene tips\n- Motivation strategies\n- Energy management plans',
        hopeless: `Crisis Support (Egypt):
- Mental Health Hotline: 0800 888 0700
- Hope Helpline: 0800 708 0700
- Emotional Support: 022 081 6831
- Immediate Counselor Matching`
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
        overwhelmed: 'دعم الإرهاق:\n- أدوات إدارة الأولويات\n- تمارين الوعي\n- بودكاست تخفيف التوتر',
        disconnected: 'موارد التواصل:\n- أدلة القلق الاجتماعي\n- مجموعات الدعم المجتمعي\n- تمارين التواصل',
        low_energy: 'معززات الطاقة:\n- نصائح نظافة النوم\n- استراتيجيات التحفيز\n- خطط إدارة الطاقة',
        hopeless: `الدعم الطارئ (مصر):
- الخط الساخن للصحة النفسية: ٠٨٠٠ ٨٨٨ ٠٧٠٠
- خط الأمل: ٠٨٠٠ ٧٠٨ ٠٧٠٠
- الدعم العاطفي: ٠٢٢ ٠٨١ ٦٨٣١
- مطابقة مع مستشار فوري`
      }
    }
  }
};

const i18n = new I18n(translations);

const normalizeLocale = (locale: string) => {
  if (locale.startsWith('ar')) return 'ar';
  if (locale.startsWith('en')) return 'en'; // Handle all English variants
  return 'en';
};

i18n.locale = normalizeLocale(Localization.locale);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
