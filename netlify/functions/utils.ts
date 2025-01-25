import { faker } from "@faker-js/faker";
import { InvestigationState, Patient, PatientPhase, PatientsQueue, Status, TriageCategory } from "../../types/patient";

export const refreshData = (patients: Patient[]) => {
  patients.sort((a, b) => {
    if (a.triageCategory !== b.triageCategory) {
      return a.triageCategory - b.triageCategory;
    }

    return a.arrivalTime.getTime() - b.arrivalTime.getTime();
  });

  for (let i = 0; i < patients.length; i++) {
    patients[i].queuePosition = {
      global: i + 1,
      category: patients.filter(patient => patient.triageCategory === patients[i].triageCategory).indexOf(patients[i]) + 1
    };
  }

  const queue: PatientsQueue = {
    waitingCount: patients.length,
    longestWaitTime: Math.ceil(patients.reduce((max, patient) => Math.max(max, (new Date().getTime() - patient.arrivalTime.getTime()) / 60000), 0)),
    categoryBreakdown: {
      [TriageCategory.RESUSCITATION]: patients.filter(patient => patient.triageCategory === TriageCategory.RESUSCITATION).length,
      [TriageCategory.EMERGENT]: patients.filter(patient => patient.triageCategory === TriageCategory.EMERGENT).length,
      [TriageCategory.URGENT]: patients.filter(patient => patient.triageCategory === TriageCategory.URGENT).length,
      [TriageCategory.LESS_URGENT]: patients.filter(patient => patient.triageCategory === TriageCategory.LESS_URGENT).length,
      [TriageCategory.NON_URGENT]: patients.filter(patient => patient.triageCategory === TriageCategory.NON_URGENT).length,
    },
    averageWaitTimes: {
      [TriageCategory.RESUSCITATION]: Math.ceil(patients.reduce((sum, patient) => sum + (patient.triageCategory === TriageCategory.RESUSCITATION ? (new Date().getTime() - patient.arrivalTime.getTime()) / 60000 : 0), 0) / patients.filter(patient => patient.triageCategory === TriageCategory.RESUSCITATION).length),
      [TriageCategory.EMERGENT]: Math.ceil(patients.reduce((sum, patient) => sum + (patient.triageCategory === TriageCategory.EMERGENT ? (new Date().getTime() - patient.arrivalTime.getTime()) / 60000 : 0), 0) / patients.filter(patient => patient.triageCategory === TriageCategory.EMERGENT).length),
      [TriageCategory.URGENT]: Math.ceil(patients.reduce((sum, patient) => sum + (patient.triageCategory === TriageCategory.URGENT ? (new Date().getTime() - patient.arrivalTime.getTime()) / 60000 : 0), 0) / patients.filter(patient => patient.triageCategory === TriageCategory.URGENT).length),
      [TriageCategory.LESS_URGENT]: Math.ceil(patients.reduce((sum, patient) => sum + (patient.triageCategory === TriageCategory.LESS_URGENT ? (new Date().getTime() - patient.arrivalTime.getTime()) / 60000 : 0), 0) / patients.filter(patient => patient.triageCategory === TriageCategory.LESS_URGENT).length),
      [TriageCategory.NON_URGENT]: Math.ceil(patients.reduce((sum, patient) => sum + (patient.triageCategory === TriageCategory.NON_URGENT ? (new Date().getTime() - patient.arrivalTime.getTime()) / 60000 : 0), 0) / patients.filter(patient => patient.triageCategory === TriageCategory.NON_URGENT).length),
    },
    patients,
  };
  return queue;
}
const generateMockTriageCategory = () => {
  const roll = Math.random() * 100;
  if (roll < 10) return TriageCategory.RESUSCITATION;
  if (roll < 16) return TriageCategory.EMERGENT;
  if (roll < 61) return TriageCategory.URGENT;
  if (roll < 91) return TriageCategory.LESS_URGENT;
  return TriageCategory.NON_URGENT;
};

const generateMockArrivalTime = (triageCategory) => {
  const waitRanges = {
    [TriageCategory.RESUSCITATION]: [0, 5],
    [TriageCategory.EMERGENT]: [15, 30],
    [TriageCategory.URGENT]: [30, 120],
    [TriageCategory.LESS_URGENT]: [60, 240],
    [TriageCategory.NON_URGENT]: [120, 360]
  };
  const [min, max] = waitRanges[triageCategory];
  const minutesAgo = Math.floor(Math.random() * (max - min + 1)) + min;
  const arrivalTime = new Date();
  arrivalTime.setMinutes(arrivalTime.getMinutes() - minutesAgo);
  return arrivalTime;
};

const generateMockPatientStatus = () => {
  const phases = Object.values(PatientPhase);
  const phase = phases[Math.floor(Math.random() * phases.length)];
  
  const status: Status = { current_phase: phase };

  if (phase === PatientPhase.REGISTERED || phase === PatientPhase.TRIAGED) {
    return status;
  }

  if (phase === PatientPhase.INVESTIGATIONS_PENDING) {
    const states = [InvestigationState.ORDERED, InvestigationState.PENDING];
    status.investigations = {
      labs: states[Math.floor(Math.random() * states.length)],
      imaging: states[Math.floor(Math.random() * states.length)]
    };
  } else {
    status.investigations = {
      labs: InvestigationState.REPORTED,
      imaging: InvestigationState.REPORTED
    };
  }

  return status;
};

export const generateMockPatients = (count): PatientsQueue => {
  const patients: Patient[] = [];
  for (let i = 0; i < count; i++) {
    const triageCategory = generateMockTriageCategory();
    const arrivalTime = generateMockArrivalTime(triageCategory);

    const patientCreated: Patient = {
      id: 'anon' + i,
      name: faker.person.fullName(),
      birthDate: faker.date.birthdate(),
      arrivalTime: arrivalTime,
      status: generateMockPatientStatus(),
      triageCategory: triageCategory,
    };
    patients.push(patientCreated);
  }

  patients.sort((a, b) => {
    if (a.triageCategory !== b.triageCategory) {
      return a.triageCategory - b.triageCategory;
    }

    return a.arrivalTime.getTime() - b.arrivalTime.getTime();
  });

  for (let i = 0; i < patients.length; i++) {
    patients[i].queuePosition = {
      global: i + 1,
      category: patients.filter(patient => patient.triageCategory === patients[i].triageCategory).indexOf(patients[i]) + 1
    };
  }

  const queue: PatientsQueue = {
    waitingCount: patients.length,
    longestWaitTime: Math.ceil(patients.reduce((max, patient) => Math.max(max, (new Date().getTime() - patient.arrivalTime.getTime()) / 60000), 0)),
    categoryBreakdown: {
      [TriageCategory.RESUSCITATION]: patients.filter(patient => patient.triageCategory === TriageCategory.RESUSCITATION).length,
      [TriageCategory.EMERGENT]: patients.filter(patient => patient.triageCategory === TriageCategory.EMERGENT).length,
      [TriageCategory.URGENT]: patients.filter(patient => patient.triageCategory === TriageCategory.URGENT).length,
      [TriageCategory.LESS_URGENT]: patients.filter(patient => patient.triageCategory === TriageCategory.LESS_URGENT).length,
      [TriageCategory.NON_URGENT]: patients.filter(patient => patient.triageCategory === TriageCategory.NON_URGENT).length,
    },
    averageWaitTimes: {
      [TriageCategory.RESUSCITATION]: Math.ceil(patients.reduce((sum, patient) => sum + (patient.triageCategory === TriageCategory.RESUSCITATION ? (new Date().getTime() - patient.arrivalTime.getTime()) / 60000 : 0), 0) / patients.filter(patient => patient.triageCategory === TriageCategory.RESUSCITATION).length),
      [TriageCategory.EMERGENT]: Math.ceil(patients.reduce((sum, patient) => sum + (patient.triageCategory === TriageCategory.EMERGENT ? (new Date().getTime() - patient.arrivalTime.getTime()) / 60000 : 0), 0) / patients.filter(patient => patient.triageCategory === TriageCategory.EMERGENT).length),
      [TriageCategory.URGENT]: Math.ceil(patients.reduce((sum, patient) => sum + (patient.triageCategory === TriageCategory.URGENT ? (new Date().getTime() - patient.arrivalTime.getTime()) / 60000 : 0), 0) / patients.filter(patient => patient.triageCategory === TriageCategory.URGENT).length),
      [TriageCategory.LESS_URGENT]: Math.ceil(patients.reduce((sum, patient) => sum + (patient.triageCategory === TriageCategory.LESS_URGENT ? (new Date().getTime() - patient.arrivalTime.getTime()) / 60000 : 0), 0) / patients.filter(patient => patient.triageCategory === TriageCategory.LESS_URGENT).length),
      [TriageCategory.NON_URGENT]: Math.ceil(patients.reduce((sum, patient) => sum + (patient.triageCategory === TriageCategory.NON_URGENT ? (new Date().getTime() - patient.arrivalTime.getTime()) / 60000 : 0), 0) / patients.filter(patient => patient.triageCategory === TriageCategory.NON_URGENT).length),
    },
    patients,
  };
  
  return queue;
}