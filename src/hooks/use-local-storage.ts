"use client"

import { useState, useCallback } from "react"

// Utility function to convert date strings back to Date objects
function reviveDates(key: string, value: any): any {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value)
  }
  return value
}

// Utility function to handle specific data types
function processStoredData<T>(key: string, data: T): T {
  if (key === "studyPlan" && data && typeof data === "object") {
    const studyPlan = data as any
    return {
      ...studyPlan,
      studyStartDate: new Date(studyPlan.studyStartDate),
      studyEndDate: new Date(studyPlan.studyEndDate),
    } as T
  }
  return data
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item, reviveDates)
        return processStoredData(key, parsed)
      }
      return initialValue
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
      (value: T | ((val: T) => T)) => {
        try {
          // Allow value to be a function so we have same API as useState
          const valueToStore = value instanceof Function ? value(storedValue) : value
          // Save state
          setStoredValue(valueToStore)
          // Save to local storage
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
          }
        } catch (error) {
          // A more advanced implementation would handle the error case
          console.log(error)
        }
      },
      [key, storedValue],
  )

  return [storedValue, setValue] as const
}
