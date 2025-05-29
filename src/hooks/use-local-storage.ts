"use client"

import { useState, useCallback, useEffect } from "react" // useEffect 추가

// StudyPlan 타입 정의 (src/types/study-plan.ts 등에 있어야 함)
// 만약 없다면 임시로 여기에 정의하거나, 실제 경로에서 import 하세요.
interface StudyPlan {
  examName: string;
  studyStartDate: Date | string; // 저장/로드 시 문자열일 수 있음을 명시
  studyEndDate: Date | string;   // 저장/로드 시 문자열일 수 있음을 명시
  dailyStudyHours: number;
}


export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        let parsedItem = JSON.parse(item);

        // --- 날짜 필드 변환 로직 추가 ---
        if (key === 'studyPlan' && typeof parsedItem === 'object' && parsedItem !== null) {
          // parsedItem을 StudyPlan 타입으로 가정하고 Date 객체로 변환
          const plan = parsedItem as Partial<StudyPlan>; // 타입 단언
          if (plan.studyStartDate && typeof plan.studyStartDate === 'string') {
            plan.studyStartDate = new Date(plan.studyStartDate);
          }
          if (plan.studyEndDate && typeof plan.studyEndDate === 'string') {
            plan.studyEndDate = new Date(plan.studyEndDate);
          }
          parsedItem = plan; // 변환된 객체로 업데이트
        }
        // --- 날짜 필드 변환 로직 끝 ---
        return parsedItem as T; // 최종적으로 T 타입으로 단언
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
      (value: T | ((val: T) => T)) => {
        try {
          const valueToStore = value instanceof Function ? value(storedValue) : value;
          setStoredValue(valueToStore); // UI 상태 업데이트

          if (typeof window !== "undefined") {
            let itemToSave = valueToStore;
            // --- 날짜 필드 저장 시 문자열 변환 로직 추가 (선택적이지만 권장) ---
            // JSON.stringify가 Date 객체를 ISO 문자열로 자동 변환하지만,
            // 명시적으로 처리하면 로드 시 파싱 규칙과 일관성을 맞출 수 있습니다.
            if (key === 'studyPlan' && typeof valueToStore === 'object' && valueToStore !== null) {
              const planToSave = { ...valueToStore } as any; // 복사본 사용
              if (planToSave.studyStartDate instanceof Date) {
                planToSave.studyStartDate = planToSave.studyStartDate.toISOString();
              }
              if (planToSave.studyEndDate instanceof Date) {
                planToSave.studyEndDate = planToSave.studyEndDate.toISOString();
              }
              itemToSave = planToSave;
            }
            // --- 날짜 필드 저장 시 문자열 변환 로직 끝 ---
            window.localStorage.setItem(key, JSON.stringify(itemToSave));
          }
        } catch (error) {
          console.error(`Error setting localStorage key “${key}”:`, error);
        }
      },
      [key, storedValue], // storedValue를 의존성 배열에 추가하여 value가 함수일 때 최신 storedValue를 참조하도록 함
  );

  // 다른 탭/창에서 localStorage 변경 감지 (선택적이지만 좋은 기능)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          let parsedItem = JSON.parse(event.newValue);
          // --- 날짜 필드 변환 로직 추가 (동일하게 적용) ---
          if (key === 'studyPlan' && typeof parsedItem === 'object' && parsedItem !== null) {
            const plan = parsedItem as Partial<StudyPlan>;
            if (plan.studyStartDate && typeof plan.studyStartDate === 'string') {
              plan.studyStartDate = new Date(plan.studyStartDate);
            }
            if (plan.studyEndDate && typeof plan.studyEndDate === 'string') {
              plan.studyEndDate = new Date(plan.studyEndDate);
            }
            parsedItem = plan;
          }
          // --- 날짜 필드 변환 로직 끝 ---
          setStoredValue(parsedItem as T);
        } catch (error) {
          console.error("Error parsing localStorage item on storage event:", error);
        }
      } else if (event.key === key && event.newValue === null) {
        // 항목이 삭제된 경우 초기값으로 리셋
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]); // initialValue도 의존성에 추가

  return [storedValue, setValue] as const;
}
