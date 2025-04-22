"use client"

import { useState } from "react"
import { Module, Lesson } from "@/types/course"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

interface BootcampCurriculumProps {
  modules: Module[]
}

export function BootcampCurriculum({ modules }: BootcampCurriculumProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  if (!modules?.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-slate-500">No curriculum content available yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {modules.map((module: Module) => (
        <Card key={module.id} className="overflow-hidden">
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900"
            onClick={() => toggleModule(module.id)}
          >
            <div>
              <h3 className="text-lg font-semibold text-left">{module.title}</h3>
              {module.description && (
                <p className="text-sm text-slate-500 text-left mt-1">{module.description}</p>
              )}
            </div>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                expandedModules.has(module.id) ? "rotate-180" : ""
              }`}
            />
          </Button>
          
          {expandedModules.has(module.id) && (
            <div className="p-4 border-t">
              {module.lessons?.length > 0 ? (
                <ul className="space-y-2">
                  {module.lessons.map((lesson: Lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        {lesson.duration && (
                          <p className="text-sm text-slate-500">Duration: {lesson.duration}</p>
                        )}
                      </div>
                      {lesson.type && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          {lesson.type}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-slate-500">No lessons available in this module.</p>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}