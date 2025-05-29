"use client"

import { useState, useEffect } from "react" // useEffect 추가 (선택적)
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Subject } from "@/types/study-plan"
import { Trash2, Target } from "lucide-react"

interface SubjectCardProps {
  subject: Subject
  onUpdate: (subject: Subject) => void
  onDelete: (id: string) => void
}

export default function SubjectCard({ subject, onUpdate, onDelete }: SubjectCardProps) {
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({
    name: false,
    totalLoad: false,
    loadUnit: false,
    priority: false,
    studySpeedPerPage: false,
    targetRounds: false,
  })

  // totalLoad 편집 시 사용할 임시 문자열 상태
  const [editingTotalLoad, setEditingTotalLoad] = useState<string>("")

  const handleChange = (field: keyof Subject, value: string | number) => {
    onUpdate({
      ...subject,
      [field]: value,
    })
  }

  const toggleEdit = (field: string) => {
    setIsEditing((prev) => {
      const newState = { ...prev, [field]: !prev[field] }
      // "totalLoad" 필드의 편집 모드로 진입할 때, subject.totalLoad가 0이거나 초기값이면 빈 문자열로 설정
      if (field === "totalLoad" && newState.totalLoad) {
        setEditingTotalLoad(subject.totalLoad === 0 || subject.totalLoad === undefined ? "" : String(subject.totalLoad))
      }
      // 편집 모드를 빠져나갈 때, 만약 입력값이 비어있으면 0으로 처리 (또는 다른 기본값)
      if (field === "totalLoad" && !newState.totalLoad) {
        const newTotalLoad = editingTotalLoad === "" ? 0 : Number(editingTotalLoad)
        if (subject.totalLoad !== newTotalLoad) { // 실제 값이 변경되었을 때만 onUpdate 호출
          handleChange("totalLoad", newTotalLoad)
        }
      }
      return newState
    })
  }

  // totalLoad 입력 필드 값 변경 시 임시 상태 업데이트
  const handleTotalLoadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTotalLoad(e.target.value)
  }

  return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start"> {/* items-start 추가 */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {/* 과목명 */}
              <div>
                <Label htmlFor={`name-${subject.id}`}>과목명</Label>
                {isEditing.name ? (
                    <Input
                        id={`name-${subject.id}`}
                        value={subject.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        onBlur={() => toggleEdit("name")}
                        autoFocus
                    />
                ) : (
                    <div
                        className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted min-h-[40px] flex items-center" // min-h, flex, items-center 추가
                        onClick={() => toggleEdit("name")}
                    >
                      {subject.name || <span className="text-muted-foreground">과목명을 입력하세요</span>}
                    </div>
                )}
              </div>

              {/* 총 학습량 */}
              <div>
                <Label htmlFor={`totalLoad-${subject.id}`}>총 학습량</Label>
                <div className="flex gap-2">
                  {isEditing.totalLoad ? (
                      <Input
                          id={`totalLoad-${subject.id}`}
                          type="number" // 실제 입력은 숫자로 받되, 표시는 문자열 상태로
                          value={editingTotalLoad} // 임시 문자열 상태 사용
                          onChange={handleTotalLoadInputChange} // 임시 상태 업데이트
                          onBlur={() => toggleEdit("totalLoad")} // onBlur 시 실제 숫자로 변환하여 저장
                          autoFocus
                          placeholder="숫자 입력"
                          className="flex-1"
                      />
                  ) : (
                      <div
                          className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted flex-1 min-h-[40px] flex items-center" // min-h, flex, items-center 추가
                          onClick={() => toggleEdit("totalLoad")}
                      >
                        {subject.totalLoad}
                      </div>
                  )}

                  {isEditing.loadUnit ? (
                      <Input
                          id={`loadUnit-${subject.id}`}
                          value={subject.loadUnit}
                          onChange={(e) => handleChange("loadUnit", e.target.value)}
                          onBlur={() => toggleEdit("loadUnit")}
                          autoFocus
                          placeholder="단위 (예: 페이지)"
                          className="w-28" // 너비 약간 조정
                      />
                  ) : (
                      <div
                          className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted w-28 min-h-[40px] flex items-center" // min-h, flex, items-center 추가
                          onClick={() => toggleEdit("loadUnit")}
                      >
                        {subject.loadUnit || <span className="text-muted-foreground">단위</span>}
                      </div>
                  )}
                </div>
              </div>

              {/* 목표 회독수 */}
              <div>
                <Label htmlFor={`targetRounds-${subject.id}`} className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  목표 회독수
                </Label>
                {isEditing.targetRounds ? (
                    <Select
                        value={String(subject.targetRounds ?? 1)} // subject.targetRounds가 undefined일 경우 기본값으로 1 설정
                        onValueChange={(value) => {
                          handleChange("targetRounds", Number(value))
                          // toggleEdit("targetRounds") // Select는 onBlur가 없으므로, 값이 변경되면 바로 편집 모드 해제
                        }}
                        onOpenChange={(open) => { // Select가 닫힐 때 편집 모드 해제
                          if (!open && isEditing.targetRounds) {
                            toggleEdit("targetRounds");
                          }
                        }}
                    >
                      <SelectTrigger id={`targetRounds-${subject.id}`}>
                        <SelectValue placeholder="목표 회독수 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(10)].map((_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}회독</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                ) : (
                    <div
                        className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted flex items-center gap-1 min-h-[40px]" // min-h 추가
                        onClick={() => toggleEdit("targetRounds")}
                    >
                      <Target className="w-3 h-3 text-primary" />
                      <span className="font-medium text-primary">{(subject.targetRounds ?? 1)}회독</span> {/* 기본값 1회독 표시 */}
                    </div>
                )}
              </div>

              {/* 우선순위 */}
              <div>
                <Label htmlFor={`priority-${subject.id}`}>우선순위</Label>
                {isEditing.priority ? (
                    <Select
                        value={String(subject.priority ?? 3)} // subject.priority가 undefined일 경우 기본값으로 3 설정
                        onValueChange={(value) => {
                          handleChange("priority", Number(value))
                          // toggleEdit("priority")
                        }}
                        onOpenChange={(open) => {
                          if (!open && isEditing.priority) {
                            toggleEdit("priority");
                          }
                        }}
                    >
                      <SelectTrigger id={`priority-${subject.id}`}>
                        <SelectValue placeholder="우선순위 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 (낮음)</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3 (보통)</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5 (높음)</SelectItem>
                      </SelectContent>
                    </Select>
                ) : (
                    <div
                        className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted min-h-[40px] flex items-center" // min-h, flex, items-center 추가
                        onClick={() => toggleEdit("priority")}
                    >
                      {(subject.priority ?? 3)} {/* 기본값 3 표시 */}
                      {subject.priority === 5 ? " (높음)" : subject.priority === 1 ? " (낮음)" : ""}
                    </div>
                )}
              </div>

              {/* 페이지당 예상 소요 시간(분) */}
              <div>
                <Label htmlFor={`studySpeed-${subject.id}`}>페이지당 예상 소요 시간(분)</Label>
                {isEditing.studySpeedPerPage ? (
                    <Input
                        id={`studySpeed-${subject.id}`}
                        type="number"
                        value={subject.studySpeedPerPage ?? 10} // subject.studySpeedPerPage가 undefined일 경우 기본값 10
                        onChange={(e) => handleChange("studySpeedPerPage", Number(e.target.value))}
                        onBlur={() => toggleEdit("studySpeedPerPage")}
                        autoFocus
                    />
                ) : (
                    <div
                        className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted min-h-[40px] flex items-center" // min-h, flex, items-center 추가
                        onClick={() => toggleEdit("studySpeedPerPage")}
                    >
                      {(subject.studySpeedPerPage ?? 10)} 분 {/* 기본값 10분 표시 */}
                    </div>
                )}
              </div>

            </div> {/* grid end */}

            {/* 삭제 버튼은 grid 바깥으로 */}
            <div className="ml-4"> {/* ml-4로 간격 추가 */}
              <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 mt-1" // mt-1로 Label과 유사한 위치로
                  onClick={() => onDelete(subject.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">삭제</span>
              </Button>
            </div>
          </div> {/* flex justify-between end */}
        </CardContent>
      </Card>
  )
}
