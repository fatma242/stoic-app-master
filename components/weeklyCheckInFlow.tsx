export type WeeklyMood =
  | 'stress'
  | 'anxiety'
  | 'depression'
  | 'normal';

export type WeeklyFlowNode = {
  questionKey: string;
  answers: Record<string, keyof typeof weeklyCheckInFlow | 'RESOURCES'>;
  resourcesKey?: string;
};

export type WeeklyFlowKey =
  | 'initial'
  | 'stress_q1' | 'stress_q2' | 'stress_q3' | 'stress_q4' | 'stress_q5' | 'stress_resources'
  | 'anxiety_q1' | 'anxiety_q2' | 'anxiety_q3' | 'anxiety_q4' | 'anxiety_q5' | 'anxiety_resources'
  | 'depression_q1' | 'depression_q2' | 'depression_q3' | 'depression_q4' | 'depression_q5' | 'depression_resources'
  | 'normal_q1' | 'normal_q2' | 'normal_q3' | 'normal_q4' | 'normal_q5' | 'normal_resources';

export const weeklyCheckInFlow: Record<WeeklyFlowKey, WeeklyFlowNode> = {
  initial: {
    questionKey: 'weeklyCheckIn.questions.initial',
    answers: {
      "Just checking in": 'normal_q1', 
      "Fear": 'stress_q1',
      "Worry": 'anxiety_q1',
      "Sadness": 'depression_q1',
    }
  },

  // Stress Flow
  stress_q1: {
    questionKey: 'weeklyCheckIn.questions.stress.q1',
    answers: { yes: 'stress_q2', no: 'stress_q2', sometimes: 'stress_q2' }
  },
  stress_q2: {
    questionKey: 'weeklyCheckIn.questions.stress.q2',
    answers: { yes: 'stress_q3', no: 'stress_q3', sometimes: 'stress_q3' }
  },
  stress_q3: {
    questionKey: 'weeklyCheckIn.questions.stress.q3',
    answers: { yes: 'stress_q4', no: 'stress_q4', sometimes: 'stress_q4' }
  },
  stress_q4: {
    questionKey: 'weeklyCheckIn.questions.stress.q4',
    answers: { yes: 'stress_q5', no: 'stress_q5', sometimes: 'stress_q5' }
  },
  stress_q5: {
    questionKey: 'weeklyCheckIn.questions.stress.q5',
    answers: { yes: 'stress_resources', no: 'stress_resources', sometimes: 'stress_resources' }
  },
  stress_resources: {
    questionKey: '',
    resourcesKey: 'weeklyCheckIn.resources.stress',
    answers: {
      yes: 'initial',
      no: 'initial',
      sometimes: 'initial'
    }
  },

  // Anxiety Flow
  anxiety_q1: {
    questionKey: 'weeklyCheckIn.questions.anxiety.q1',
    answers: { yes: 'anxiety_q2', no: 'anxiety_q2', sometimes: 'anxiety_q2' }
  },
  anxiety_q2: {
    questionKey: 'weeklyCheckIn.questions.anxiety.q2',
    answers: { yes: 'anxiety_q3', no: 'anxiety_q3', sometimes: 'anxiety_q3' }
  },
  anxiety_q3: {
    questionKey: 'weeklyCheckIn.questions.anxiety.q3',
    answers: { yes: 'anxiety_q4', no: 'anxiety_q4', sometimes: 'anxiety_q4' }
  },
  anxiety_q4: {
    questionKey: 'weeklyCheckIn.questions.anxiety.q4',
    answers: { yes: 'anxiety_q5', no: 'anxiety_q5', sometimes: 'anxiety_q5' }
  },
  anxiety_q5: {
    questionKey: 'weeklyCheckIn.questions.anxiety.q5',
    answers: { yes: 'anxiety_resources', no: 'anxiety_resources', sometimes: 'anxiety_resources' }
  },
  anxiety_resources: {
    questionKey: '',
    resourcesKey: 'weeklyCheckIn.resources.anxiety',
    answers: {
      yes: 'initial',
      no: 'initial',
      sometimes: 'initial'
    }
  },

  // Depression Flow
  depression_q1: {
    questionKey: 'weeklyCheckIn.questions.depression.q1',
    answers: { yes: 'depression_q2', no: 'depression_q2', sometimes: 'depression_q2' }
  },
  depression_q2: {
    questionKey: 'weeklyCheckIn.questions.depression.q2',
    answers: { yes: 'depression_q3', no: 'depression_q3', sometimes: 'depression_q3' }
  },
  depression_q3: {
    questionKey: 'weeklyCheckIn.questions.depression.q3',
    answers: { yes: 'depression_q4', no: 'depression_q4', sometimes: 'depression_q4' }
  },
  depression_q4: {
    questionKey: 'weeklyCheckIn.questions.depression.q4',
    answers: { yes: 'depression_q5', no: 'depression_q5', sometimes: 'depression_q5' }
  },
  depression_q5: {
    questionKey: 'weeklyCheckIn.questions.depression.q5',
    answers: { yes: 'depression_resources', no: 'depression_resources', sometimes: 'depression_resources' }
  },
  depression_resources: {
    questionKey: '',
    resourcesKey: 'weeklyCheckIn.resources.depression',
    answers: {
      yes: 'initial',
      no: 'initial',
      sometimes: 'initial'
    }
  },

  // Normal Flow
  normal_q1: {
    questionKey: 'weeklyCheckIn.questions.normal.q1',
    answers: { yes: 'normal_q2', no: 'normal_q2', sometimes: 'normal_q2' }
  },
  normal_q2: {
    questionKey: 'weeklyCheckIn.questions.normal.q2',
    answers: { yes: 'normal_q3', no: 'normal_q3', sometimes: 'normal_q3' }
  },
  normal_q3: {
    questionKey: 'weeklyCheckIn.questions.normal.q3',
    answers: { yes: 'normal_q4', no: 'normal_q4', sometimes: 'normal_q4' }
  },
  normal_q4: {
    questionKey: 'weeklyCheckIn.questions.normal.q4',
    answers: { yes: 'normal_q5', no: 'normal_q5', sometimes: 'normal_q5' }
  },
  normal_q5: {
    questionKey: 'weeklyCheckIn.questions.normal.q5',
    answers: { yes: 'normal_resources', no: 'normal_resources', sometimes: 'normal_resources' }
  },
  normal_resources: {
    questionKey: '',
    resourcesKey: 'weeklyCheckIn.resources.normal',
    answers: {
        yes: "initial",
        no: "initial",
        sometimes: "initial"
    }
  }
};
