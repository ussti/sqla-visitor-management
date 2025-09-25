'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CompleteRegistration } from '@/lib/validation';

interface FormState extends Partial<CompleteRegistration> {
  currentStep: number;
  completedSteps: Set<number>;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof CompleteRegistration; value: any }
  | { type: 'UPDATE_MULTIPLE_FIELDS'; fields: Partial<CompleteRegistration> }
  | { type: 'SET_STEP'; step: number }
  | { type: 'COMPLETE_STEP'; step: number }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_FROM_STORAGE'; data: Partial<FormState> };

const initialState: FormState = {
  currentStep: 0,
  completedSteps: new Set(),
  isSubmitting: false,
  errors: {},
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    case 'UPDATE_MULTIPLE_FIELDS':
      return {
        ...state,
        ...action.fields,
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.step,
      };

    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.step]),
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error,
        },
      };

    case 'CLEAR_ERROR':
      const { [action.field]: _, ...restErrors } = state.errors;
      return {
        ...state,
        errors: restErrors,
      };

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {},
      };

    case 'RESET_FORM':
      localStorage.removeItem('visitor-registration-form');
      return initialState;

    case 'LOAD_FROM_STORAGE':
      return {
        ...state,
        ...action.data,
        completedSteps: new Set(action.data.completedSteps || []),
      };

    default:
      return state;
  }
}

interface FormContextType {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  updateField: (field: keyof CompleteRegistration, value: any) => void;
  updateMultipleFields: (fields: Partial<CompleteRegistration>) => void;
  setStep: (step: number) => void;
  completeStep: (step: number) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  resetForm: () => void;
  isStepCompleted: (step: number) => boolean;
  canProceedToStep: (step: number) => boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('visitor-registration-form');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        dispatch({ type: 'LOAD_FROM_STORAGE', data });
      } catch (error) {
        console.error('Failed to load form data from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    const { isSubmitting, errors, ...saveableState } = state;
    const dataToSave = {
      ...saveableState,
      completedSteps: Array.from(state.completedSteps),
    };
    localStorage.setItem('visitor-registration-form', JSON.stringify(dataToSave));
  }, [state]);

  const updateField = (field: keyof CompleteRegistration, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const updateMultipleFields = React.useCallback((fields: Partial<CompleteRegistration>) => {
    dispatch({ type: 'UPDATE_MULTIPLE_FIELDS', fields });
  }, []);

  const setStep = (step: number) => {
    dispatch({ type: 'SET_STEP', step });
  };

  const completeStep = (step: number) => {
    dispatch({ type: 'COMPLETE_STEP', step });
  };

  const setSubmitting = (isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', isSubmitting });
  };

  const setError = (field: string, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  };

  const clearError = (field: string) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  };

  const clearAllErrors = () => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  const isStepCompleted = (step: number) => {
    return state.completedSteps.has(step);
  };

  const canProceedToStep = (step: number) => {
    return step === 0 || isStepCompleted(step - 1);
  };

  return (
    <FormContext.Provider value={{
      state,
      dispatch,
      updateField,
      updateMultipleFields,
      setStep,
      completeStep,
      setSubmitting,
      setError,
      clearError,
      clearAllErrors,
      resetForm,
      isStepCompleted,
      canProceedToStep,
    }}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
}