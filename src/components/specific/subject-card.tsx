"use client"

import { useState } from "react"
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

  const handleChange = (field: keyof Subject, value: string | number) => {
    onUpdate({
      ...subject,
      [field]: value,
    })
  }

  const toggleEdit = (field: string) => {
    setIsEditing({
      ...isEditing,
      [field]: !isEditing[field],
    })
  }

  return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
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
                        className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted"
                        onClick={() => toggleEdit("name")}
                    >
                      {subject.name || "과목명을 입력하세요"}
                    </div>
                )}
              </div>

              <div>
                <Label htmlFor={`totalLoad-${subject.id}`}>총 학습량</Label>
                <div className="flex gap-2">
                  {isEditing.totalLoad ? (
                      <Input
                          id={`totalLoad-${subject.id}`}
                          type="number"
                          value={subject.totalLoad}
                          onChange={(e) => handleChange("totalLoad", Number(e.target.value))}
                          onBlur={() => toggleEdit("totalLoad")}
                          autoFocus
                          className="flex-1"
                      />
                  ) : (
                      <div
                          className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted flex-1"
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
                          className="w-24"
                      />
                  ) : (
                      <div
                          className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted w-24"
                          onClick={() => toggleEdit("loadUnit")}
                      >
                        {subject.loadUnit}
                      </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor={`targetRounds-${subject.id}`} className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  목표 회독수
                </Label>
                {isEditing.targetRounds ? (
                    <Select
                        value={subject.targetRounds.toString()}
                        onValueChange={(value) => {
                          handleChange("targetRounds", Number(value))
                          toggleEdit("targetRounds")
                        }}
                    >
                      <SelectTrigger id={`targetRounds-${subject.id}`}>
                        <SelectValue placeholder="목표 회독수 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1회독</SelectItem>
                        <SelectItem value="2">2회독</SelectItem>
                        <SelectItem value="3">3회독</SelectItem>
                        <SelectItem value="4">4회독</SelectItem>
                        <SelectItem value="5">5회독</SelectItem>
                        <SelectItem value="6">6회독</SelectItem>
                        <SelectItem value="7">7회독</SelectItem>
                        <SelectItem value="8">8회독</SelectItem>
                        <SelectItem value="9">9회독</SelectItem>
                        <SelectItem value="10">10회독</SelectItem>
                      </SelectContent>
                    </Select>
                ) : (
                    <div
                        className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted flex items-center gap-1"
                        onClick={() => toggleEdit("targetRounds")}
                    >
                      <Target className="w-3 h-3 text-primary" />
                      <span className="font-medium text-primary">{subject.targetRounds}회독</span>
                    </div>
                )}
              </div>

              <div>
                <Label htmlFor={`priority-${subject.id}`}>우선순위</Label>
                {isEditing.priority ? (
                    <Select
                        value={subject.priority.toString()}
                        onValueChange={(value) => {
                          handleChange("priority", Number(value))
                          toggleEdit("priority")
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
                        className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted"
                        onClick={() => toggleEdit("priority")}
                    >
                      {subject.priority} {subject.priority === 5 ? "(높음)" : subject.priority === 1 ? "(낮음)" : ""}
                    </div>
                )}
              </div>

              <div>
                <Label htmlFor={`studySpeed-${subject.id}`}>페이지당 예상 소요 시간(분)</Label>
                {isEditing.studySpeedPerPage ? (
                    <Input
                        id={`studySpeed-${subject.id}`}
                        type="number"
                        value={subject.studySpeedPerPage}
                        onChange={(e) => handleChange("studySpeedPerPage", Number(e.target.value))}
                        onBlur={() => toggleEdit("studySpeedPerPage")}
                        autoFocus
                    />
                ) : (
                    <div
                        className="mt-1 p-2 border rounded-md cursor-pointer hover:bg-muted"
                        onClick={() => toggleEdit("studySpeedPerPage")}
                    >
                      {subject.studySpeedPerPage} 분
                    </div>
                )}
              </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(subject.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">삭제</span>
            </Button>
          </div>
        </CardContent>
      </Card>
  )
}
