"use client"

import * as React from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react" // lucide-react에서 CalendarIcon으로 import하는 것이 일반적

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean // 이 prop은 PopoverTrigger의 Button에 전달됨
  className?: string
  // Calendar 컴포넌트에 전달할 disable 로직을 위한 prop 추가 (선택적)
  disabledDateMatcher?: (date: Date) => boolean
}

export function DatePicker({
                             date,
                             onDateChange,
                             placeholder = "날짜 선택",
                             disabled = false,
                             className,
                             disabledDateMatcher, // 새로운 prop
                           }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleDateSelect = React.useCallback(
      (selectedDate: Date | undefined) => {
        onDateChange?.(selectedDate) // 부모에게 선택된 날짜 전달
        setOpen(false) // Popover 닫기
      },
      [onDateChange],
  )

  // Popover의 open 상태를 직접 제어할 필요는 없을 수 있음.
  // onOpenChange만으로도 충분할 수 있지만, 현재 로직 유지.
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen)
  }, [])

  // 오늘 이전 날짜 비활성화 로직 (기본값)
  const defaultDisabledDateMatcher = (currentCalendarDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘의 시작 시간으로 설정
    return currentCalendarDate < today;
  };

  return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
              variant={"outline"} // 큰따옴표 사용
              className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  className,
              )}
              disabled={disabled} // PopoverTrigger 버튼의 비활성화
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: ko }) : placeholder}
            {/* "PPP"는 "yyyy년 MM월 dd일"과 유사한 로케일 기반 긴 날짜 형식입니다. 또는 기존 형식 유지 가능 */}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect} // 날짜 선택 시 호출될 핸들러
              // disabled prop은 날짜를 인자로 받는 함수 또는 Matcher 객체/배열을 받음
              disabled={disabledDateMatcher || defaultDisabledDateMatcher}
              initialFocus
          />
        </PopoverContent>
      </Popover>
  )
}
