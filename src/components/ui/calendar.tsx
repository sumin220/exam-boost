"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
// 애플리케이션 진입점(예: src/app/layout.tsx)에 'react-day-picker/dist/style.css' import를 유지해주세요.

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = DayPickerProps

function Calendar({
                      className,
                      classNames,
                      showOutsideDays = true,
                      // 요일 헤더를 숨기기 위한 새로운 prop (react-day-picker v8+)
                      // 또는 classNames를 통해 숨길 수도 있습니다.
                      // 여기서는 classNames를 활용하여 숨기는 방법을 사용합니다.
                      ...props
                  }: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    // 다크 모드에서 아이콘 색상을 흰색으로, 테두리 색상도 밝게 조정
                    "dark:text-white dark:hover:text-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                // --- 요일 헤더 숨김 처리 ---
                head: "hidden", // thead 요소를 숨김 (내부의 head_row, head_cell도 함께 숨겨짐)
                // 또는 head_row, head_cell에 직접 hidden 클래스를 적용할 수도 있습니다.
                // head_row: "flex w-full hidden",
                // head_cell: "hidden",
                // --- 요일 헤더 숨김 처리 끝 ---
                row: "flex w-full mt-2",
                cell: cn(
                    "h-9 w-9 text-center text-sm p-0 relative",
                    "focus-within:relative focus-within:z-20",
                    "[&:has([aria-selected].day-range-end)]:rounded-r-md",
                    "[&:has([aria-selected].day-outside)]:bg-accent/50",
                    "[&:has([aria-selected])]:bg-accent",
                    "first:[&:has([aria-selected])]:rounded-l-md",
                    "last:[&:has([aria-selected])]:rounded-r-md"
                ),
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                // IconLeft: () => <ChevronLeft className="h-4 w-4" />, // 아이콘은 그대로 사용
                // IconRight: () => <ChevronRight className="h-4 w-4" />, // 아이콘은 그대로 사용
            }}
            // react-day-picker v8+ 에서는 showWeekNumber, formatters.formatWeekdayName 등으로 요일 표시를 제어할 수 있으나,
            // shadcn-ui의 Calendar는 classNames를 통한 CSS 제어가 더 일반적입니다.
            // 요일 헤더를 완전히 숨기려면 a. thead 요소 자체를 숨기거나 (head: "hidden")
            //                            b. 모든 head_cell을 숨기거나
            //                            c. DayPicker prop 중 showWeekNumber=false (이건 주차 표시) 등과 함께
            //                               formatters.formatWeekdayName={() => ""} 와 같이 빈 문자열을 반환하게 할 수도 있지만,
            //                               구조는 남아있을 수 있습니다. classNames로 숨기는 것이 가장 확실합니다.
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
