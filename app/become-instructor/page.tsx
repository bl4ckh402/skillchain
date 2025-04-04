"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Footer } from "@/components/footer"
import { CheckCircle2, ChevronRight, Clock, FileText, GraduationCap, Info, X, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInstructorApplication } from "@/context/InstructorApllicationContext"
import { useAuth } from "@/context/AuthProvider"
import { toast } from "@/components/ui/use-toast"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function BecomeInstructorPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { 
    checkEligibility, 
    submitApplication, 
    isEligibilityLoading, 
    isEligible, 
    hasCompletedRequiredCourse 
  } = useInstructorApplication()
  
  const [step, setStep] = useState(1)
  const [eligibilityChecked, setEligibilityChecked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCourse, setIsLoadingCourse] = useState(true)
  const [requiredCourse, setRequiredCourse] = useState({
    id: "",
    title: "Loading...",
    instructor: "Loading...",
    modules: 0,
    lessons: 0,
    duration: "Loading...",
    image: "/placeholder.svg"
  })
  
  const [formData, setFormData] = useState({
    fullName: "",
    expertise: "",
    experience: "",
    experienceLevel: "",
    linkedinProfile: "",
    githubProfile: "",
    portfolioUrl: "",
    teachingExperience: "",
    courseIdeas: "",
    motivation: "",
    timeCommitment: "",
    agreedToTerms: false,
    isInstructorApplication: true,
  })

  // Fetch the first course ever posted (for eligibility check)
  useEffect(() => {
    const fetchFirstCourse = async () => {
      try {
        setIsLoadingCourse(true)
        const coursesQuery = query(
          collection(db, "courses"),
          orderBy("createdAt"),
          limit(1)
        )
        
        const coursesSnapshot = await getDocs(coursesQuery)
        
        if (!coursesSnapshot.empty) {
          const courseDoc = coursesSnapshot.docs[0]
          const courseData = {
            id: courseDoc.id,
            ...courseDoc.data()
          }
          
          // Set the required course with actual data
          setRequiredCourse({
            id: courseDoc.id,
            title: courseData.title || "",
            instructor: courseData.instructor?.name || "",
            modules: courseData.modules?.length || 0,
            lessons: courseData.totalLessons || 0,
            duration: courseData.duration || "",
            image: courseData.thumbnail || "/placeholder.svg"
          })
        }
      } catch (error) {
        console.error("Error fetching first course:", error)
        toast({
          title: "Error",
          description: "Failed to load eligibility information. Please refresh the page.",
          variant: "destructive"
        })
      } finally {
        setIsLoadingCourse(false)
      }
    }
    
    fetchFirstCourse()
  }, [])

  useEffect(() => {
    // If the user is not logged in, redirect to login page
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply to become an instructor.",
        variant: "destructive"
      })
      router.push("/login?redirect=/become-instructor")
    }
  }, [user, router])

  const handleCheckEligibility = async () => {
    setEligibilityChecked(true)
    const eligible = await checkEligibility()
    
    if (eligible) {
      toast({
        title: "Eligible!",
        description: `You've completed the ${requiredCourse.title} course and are eligible to apply.`,
      })
    } else if (hasCompletedRequiredCourse === false) {
      toast({
        title: "Not Eligible",
        description: `You need to complete the ${requiredCourse.title} course before applying.`,
        variant: "destructive"
      })
    }
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: any) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleRadioChange = (name: any, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const applicationId = await submitApplication(formData)
      
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      })
      
      // Redirect to success page
      router.push("/become-instructor/success")
    } catch (error: any) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit your application. Please try again.",
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Become an Instructor</h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Share your blockchain knowledge with our community and earn while teaching others
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">Step {step} of 3</div>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {step === 1 ? "Eligibility Check" : step === 2 ? "Application Form" : "Review & Submit"}
                </div>
              </div>
              <Progress value={step * 33.33} className="h-2" />
            </div>

            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Check</CardTitle>
                  <CardDescription>Before applying, please ensure you meet our basic requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      To become an instructor, you must have completed our foundational course: {requiredCourse.title}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Required Course</h3>
                    {isLoadingCourse ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
                        <span>Loading course information...</span>
                      </div>
                    ) : (
                      <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
                        <div className="flex flex-col sm:flex-row">
                          <div className="w-full sm:w-1/3">
                            <div className="aspect-video w-full h-full overflow-hidden">
                              <img
                                src={requiredCourse.image || "/placeholder.svg"}
                                alt={requiredCourse.title}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </div>
                          <div className="flex-1 p-4">
                            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                              {requiredCourse.title}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                              Instructor: {requiredCourse.instructor}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span>{requiredCourse.modules} modules</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-teal-500" />
                                <span>{requiredCourse.duration}</span>
                              </div>
                            </div>
                            {!eligibilityChecked ? (
                              <Button onClick={handleCheckEligibility} className="w-full sm:w-auto">
                                {isEligibilityLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                  </>
                                ) : (
                                  "Check Eligibility"
                                )}
                              </Button>
                            ) : isEligible ? (
                              <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>Eligible!</AlertTitle>
                                <AlertDescription>
                                  You've completed the required course and are eligible to apply.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <Alert className="bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
                                <X className="h-4 w-4" />
                                <AlertTitle>Not Eligible</AlertTitle>
                                <AlertDescription>
                                  You need to complete the {requiredCourse.title} course before applying.
                                  <div className="mt-2">
                                    <Link href={`/course/${requiredCourse.id}`}>
                                      <Button variant="outline" size="sm">
                                        Enroll in Course
                                      </Button>
                                    </Link>
                                  </div>
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Other Requirements</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Expertise in blockchain technology</p>
                          <p className="text-sm text-muted-foreground">
                            You should have practical experience or deep knowledge in at least one blockchain area
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Commitment to quality education</p>
                          <p className="text-sm text-muted-foreground">
                            You should be willing to create high-quality, up-to-date content
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Regular availability</p>
                          <p className="text-sm text-muted-foreground">
                            You should be able to respond to student questions and update course materials
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href="/">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button onClick={nextStep} disabled={!isEligible}>
                    Continue Application
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Form</CardTitle>
                  <CardDescription>Tell us about your expertise and what you'd like to teach</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="personal">Personal Info</TabsTrigger>
                      <TabsTrigger value="expertise">Expertise</TabsTrigger>
                      <TabsTrigger value="teaching">Teaching Plan</TabsTrigger>
                    </TabsList>
                    <TabsContent value="personal" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedinProfile">LinkedIn Profile (Optional)</Label>
                        <Input
                          id="linkedinProfile"
                          name="linkedinProfile"
                          value={formData.linkedinProfile}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="githubProfile">GitHub Profile (Optional)</Label>
                        <Input
                          id="githubProfile"
                          name="githubProfile"
                          value={formData.githubProfile}
                          onChange={handleInputChange}
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="portfolioUrl">Portfolio or Personal Website (Optional)</Label>
                        <Input
                          id="portfolioUrl"
                          name="portfolioUrl"
                          value={formData.portfolioUrl}
                          onChange={handleInputChange}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="expertise" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="expertise">Areas of Expertise</Label>
                        <Textarea
                          id="expertise"
                          name="expertise"
                          value={formData.expertise}
                          onChange={handleInputChange}
                          placeholder="Describe your areas of expertise in blockchain technology"
                          rows={4}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          Examples: Smart Contract Development, DeFi, NFTs, Blockchain Architecture, etc.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Professional Experience</Label>
                        <Textarea
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          placeholder="Describe your professional experience related to blockchain"
                          rows={4}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <RadioGroup
                          defaultValue={formData.experienceLevel}
                          onValueChange={(value) => handleRadioChange("experienceLevel", value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="beginner" id="beginner" />
                            <Label htmlFor="beginner">Beginner (1-2 years)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="intermediate" id="intermediate" />
                            <Label htmlFor="intermediate">Intermediate (3-5 years)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="advanced" id="advanced" />
                            <Label htmlFor="advanced">Advanced (5+ years)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </TabsContent>
                    <TabsContent value="teaching" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="teachingExperience">Teaching Experience (Optional)</Label>
                        <Textarea
                          id="teachingExperience"
                          name="teachingExperience"
                          value={formData.teachingExperience}
                          onChange={handleInputChange}
                          placeholder="Describe any previous teaching or mentoring experience"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="courseIdeas">Course Ideas</Label>
                        <Textarea
                          id="courseIdeas"
                          name="courseIdeas"
                          value={formData.courseIdeas}
                          onChange={handleInputChange}
                          placeholder="What courses would you like to create? Provide brief descriptions."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="motivation">Motivation</Label>
                        <Textarea
                          id="motivation"
                          name="motivation"
                          value={formData.motivation}
                          onChange={handleInputChange}
                          placeholder="Why do you want to become an instructor on our platform?"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time Commitment</Label>
                        <RadioGroup
                          defaultValue={formData.timeCommitment}
                          onValueChange={(value) => handleRadioChange("timeCommitment", value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="part-time" id="part-time" />
                            <Label htmlFor="part-time">Part-time (5-10 hours/week)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="full-time" id="full-time" />
                            <Label htmlFor="full-time">Full-time (10+ hours/week)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={
                      !formData.fullName || 
                      !formData.expertise || 
                      !formData.experience || 
                      !formData.experienceLevel || 
                      !formData.courseIdeas || 
                      !formData.motivation || 
                      !formData.timeCommitment
                    }
                  >
                    Review Application
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>Please review your application before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium">{formData.fullName || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">LinkedIn Profile</p>
                          <p className="font-medium">{formData.linkedinProfile || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">GitHub Profile</p>
                          <p className="font-medium">{formData.githubProfile || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Portfolio/Website</p>
                          <p className="font-medium">{formData.portfolioUrl || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Expertise & Experience</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Areas of Expertise</p>
                          <p className="font-medium">{formData.expertise || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Professional Experience</p>
                          <p className="font-medium">{formData.experience || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Experience Level</p>
                          <p className="font-medium">{formData.experienceLevel || "Not selected"}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Teaching Plan</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Teaching Experience</p>
                          <p className="font-medium">{formData.teachingExperience || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Course Ideas</p>
                          <p className="font-medium">{formData.courseIdeas || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Motivation</p>
                          <p className="font-medium">{formData.motivation || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Time Commitment</p>
                          <p className="font-medium">{formData.timeCommitment || "Not selected"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-4">
                    <Checkbox
                      id="agreedToTerms"
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, agreedToTerms: checked === true }))
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="agreedToTerms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the instructor terms and conditions
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        By submitting this application, I confirm that all information provided is accurate and
                        complete.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.agreedToTerms || isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}