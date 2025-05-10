import { Linking } from 'react-native';

export type FlowNode = {
  questionKey: string;
  answers: Record<string, keyof typeof onboardingFlow | 'RESOURCES'>;
  resourcesKey?: string;
};

export type AnswerKey = 
  | 'initial'
  | 'overwhelmed_q1' | 'overwhelmed_q2' | 'overwhelmed_q3' | 'overwhelmed_q4' | 'overwhelmed_q5' | 'overwhelmed_resources'
  | 'disconnected_q1' | 'disconnected_q2' | 'disconnected_q3' | 'disconnected_q4' | 'disconnected_q5' | 'disconnected_resources'
  | 'low_energy_q1' | 'low_energy_q2' | 'low_energy_q3' | 'low_energy_q4' | 'low_energy_q5' | 'low_energy_resources'
  | 'hopeless_q1' | 'hopeless_q2' | 'hopeless_q3' | 'hopeless_q4' | 'hopeless_q5' | 'crisis_resources';


export const onboardingFlow: Record<AnswerKey, FlowNode> = {
  initial: {
    questionKey: 'onboarding.questions.initial_mood',
    answers: {
      overwhelmed: 'overwhelmed_q1',
      disconnected: 'disconnected_q1',
      low_energy: 'low_energy_q1',
      hopeless: 'hopeless_q1'
    }
  },

  // Overwhelmed flow
  overwhelmed_q1: {
    questionKey: 'onboarding.questions.overwhelmed.q1',
    answers: { yes: 'overwhelmed_q2', no: 'overwhelmed_q2' }
  },
  overwhelmed_q2: {
    questionKey: 'onboarding.questions.overwhelmed.q2',
    answers: { yes: 'overwhelmed_q3', no: 'overwhelmed_q3' }
  },
  overwhelmed_q3: {
    questionKey: 'onboarding.questions.overwhelmed.q3',
    answers: { yes: 'overwhelmed_q4', no: 'overwhelmed_q4' }
  },
  overwhelmed_q4: {
    questionKey: 'onboarding.questions.overwhelmed.q4',
    answers: { yes: 'overwhelmed_q5', no: 'overwhelmed_q5' }
  },
  overwhelmed_q5: {
    questionKey: 'onboarding.questions.overwhelmed.q5',
    answers: { yes: 'overwhelmed_resources', no: 'overwhelmed_resources' }
  },
  overwhelmed_resources: {
    questionKey: '',
    resourcesKey: 'onboarding.resources.overwhelmed',
    answers: {}
  },

  // Disconnected flow
  disconnected_q1: {
    questionKey: 'onboarding.questions.disconnected.q1',
    answers: { yes: 'disconnected_q2', no: 'disconnected_q2' }
  },
  disconnected_q2: {
    questionKey: 'onboarding.questions.disconnected.q2',
    answers: { yes: 'disconnected_q3', no: 'disconnected_q3' }
  },
  disconnected_q3: {
    questionKey: 'onboarding.questions.disconnected.q3',
    answers: { yes: 'disconnected_q4', no: 'disconnected_q4' }
  },
  disconnected_q4: {
    questionKey: 'onboarding.questions.disconnected.q4',
    answers: { yes: 'disconnected_q5', no: 'disconnected_q5' }
  },
  disconnected_q5: {
    questionKey: 'onboarding.questions.disconnected.q5',
    answers: { yes: 'disconnected_resources', no: 'disconnected_resources' }
  },
  disconnected_resources: {
    questionKey: '',
    resourcesKey: 'onboarding.resources.disconnected',
    answers: {}
  },

  // Low energy flow
  low_energy_q1: {
    questionKey: 'onboarding.questions.low_energy.q1',
    answers: { yes: 'low_energy_q2', no: 'low_energy_q2' }
  },
  low_energy_q2: {
    questionKey: 'onboarding.questions.low_energy.q2',
    answers: { yes: 'low_energy_q3', no: 'low_energy_q3' }
  },
  low_energy_q3: {
    questionKey: 'onboarding.questions.low_energy.q3',
    answers: { yes: 'low_energy_q4', no: 'low_energy_q4' }
  },
  low_energy_q4: {
    questionKey: 'onboarding.questions.low_energy.q4',
    answers: { yes: 'low_energy_q5', no: 'low_energy_q5' }
  },
  low_energy_q5: {
    questionKey: 'onboarding.questions.low_energy.q5',
    answers: { yes: 'low_energy_resources', no: 'low_energy_resources' }
  },
  low_energy_resources: {
    questionKey: '',
    resourcesKey: 'onboarding.resources.low_energy',
    answers: {}
  },

  // Crisis flow
  hopeless_q1: {
    questionKey: 'onboarding.questions.hopeless.q1',
    answers: { yes: 'hopeless_q2', no: 'initial' }
  },
  hopeless_q2: {
    questionKey: 'onboarding.questions.hopeless.q2',
    answers: { yes: 'hopeless_q3', no: 'initial' }
  },
  hopeless_q3: {
    questionKey: 'onboarding.questions.hopeless.q3',
    answers: { yes: 'hopeless_q4', no: 'hopeless_q4' }
  },
  hopeless_q4: {
    questionKey: 'onboarding.questions.hopeless.q4',
    answers: { yes: 'hopeless_q5', no: 'hopeless_q5' }
  },
  hopeless_q5: {
    questionKey: 'onboarding.questions.hopeless.q5',
    answers: { yes: 'crisis_resources', no: 'crisis_resources' }
  },
  crisis_resources: {
    questionKey: 'onboarding.questions.crisis_resources',
    resourcesKey: 'onboarding.resources.hopeless',
    answers: {}
  }
};

export const handleEmergencyCall = () => {
  Linking.openURL('tel:08008880700');
};

export type ResourceKey = 
  'onboarding.resources.overwhelmed' |
  'onboarding.resources.disconnected' |
  'onboarding.resources.low_energy' |
  'onboarding.resources.hopeless';