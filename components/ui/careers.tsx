"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Briefcase, Users, Globe, Award } from "lucide-react"

export function CareersSection() {
  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Careers at SkillChain
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Join us in revolutionizing blockchain education
          </p>
        </div>

        <Card className="border-blue-100 dark:border-blue-900">
          <CardHeader>
            <CardTitle>Why Join SkillChain?</CardTitle>
            <CardDescription>
              Be part of a team that's shaping the future of blockchain education
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium">Remote-First Culture</h3>
                <p className="text-sm text-muted-foreground">Work from anywhere in the world with our distributed team</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Globe className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium">Global Impact</h3>
                <p className="text-sm text-muted-foreground">Help make blockchain education accessible worldwide</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Award className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium">Growth Opportunities</h3>
                <p className="text-sm text-muted-foreground">Continuous learning and career development support</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Briefcase className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium">Competitive Benefits</h3>
                <p className="text-sm text-muted-foreground">Comprehensive packages and token incentives</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
          <CardContent className="p-8">
            <div className="space-y-4 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">No Current Openings</h2>
              <p className="text-muted-foreground">
                While we don't have any internal positions available right now, check out blockchain opportunities on our jobs board.
              </p>
              <Button asChild className="mt-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                <Link href="/jobs" className="inline-flex items-center">
                  View Job Board
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-sm text-center text-muted-foreground">
          <p>
            Don't see what you're looking for? Email us at{" "}
            <a href="mailto:careers@skillchain.com" className="text-primary hover:underline">
              careers@skillchain.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}