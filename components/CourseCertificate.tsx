"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthProvider'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Download, Share2, Award } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useToast } from '@/components/ui/use-toast'

interface CourseCertificateProps {
  courseId: string
}

export function CourseCertificate({ courseId }: CourseCertificateProps) {
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<any>(null)
  const [certificate, setCertificate] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const certificateRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCertificateData = async () => {
      if (!user) {
        setError('You must be logged in to view certificates')
        setLoading(false)
        return
      }

      try {
        // Fetch course data
        const courseDoc = await getDoc(doc(db, 'courses', courseId))
        if (!courseDoc.exists()) {
          setError('Course not found')
          setLoading(false)
          return
        }

        setCourse(courseDoc.data())

        // Fetch certificate data
        const certificates = await fetch(`/api/certificates?userId=${user.uid}&courseId=${courseId}`)
        const certificateData = await certificates.json()

        if (!certificateData || certificateData.length === 0) {
          setError('Certificate not found. You may not have completed this course yet.')
          setLoading(false)
          return
        }

        setCertificate({
          id: certificateData[0].id,
          ...certificateData[0],
          issuedAt: new Date(certificateData[0].issuedAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        })
      } catch (error) {
        console.error('Error fetching certificate:', error)
        setError('Failed to load certificate data')
      } finally {
        setLoading(false)
      }
    }

    fetchCertificateData()
  }, [courseId, user])

  const handleDownload = async () => {
    if (!certificateRef.current) return

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      })
      
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `${course?.title || 'Course'}_Certificate.png`
      link.click()
      
      toast({
        title: 'Certificate Downloaded',
        description: 'Your certificate has been downloaded successfully.',
      })
    } catch (error) {
      console.error('Error downloading certificate:', error)
      toast({
        title: 'Download Failed',
        description: 'Failed to download certificate. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleShare = async () => {
    if (!navigator.share || !certificateRef.current) {
      toast({
        title: 'Sharing Not Supported',
        description: 'Your browser does not support sharing. Please download and share manually.',
        variant: 'destructive'
      })
      return
    }

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      })
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob as Blob), 'image/png', 0.8)
      })
      
      await navigator.share({
        title: `Certificate of Completion: ${course?.title}`,
        text: 'I just completed a course on BlockLearn! Check out my certificate.',
        files: [new File([blob], 'certificate.png', { type: 'image/png' })]
      })
      
      toast({
        title: 'Certificate Shared',
        description: 'Your certificate has been shared successfully.',
      })
    } catch (error) {
      console.error('Error sharing certificate:', error)
      toast({
        title: 'Share Failed',
        description: 'Failed to share certificate. Please try again.',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading certificate...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Award className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
          Certificate Not Available
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-4">
          {error}
        </p>
        <Button variant="outline" asChild>
          <a href={`/course/${courseId}`}>Continue Learning</a>
        </Button>
      </div>
    )
  }

  if (!certificate || !course) {
    return <div>No certificate found</div>
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 max-w-3xl w-full">
        <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-900">
          <CardContent className="p-0">
            <div 
              ref={certificateRef} 
              className="relative p-12 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50"
            >
              {/* Certificate Border */}
              <div className="absolute inset-2 border-4 border-double border-blue-200 dark:border-blue-800 rounded-lg"></div>
              
              {/* Certificate Content */}
              <div className="relative text-center space-y-6 my-4">
                <div>
                  <div className="flex justify-center mb-2">
                    <Award className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Certificate of Completion
                  </h2>
                </div>
                
                <div>
                  <p className="text-slate-600 dark:text-slate-400">This certifies that</p>
                  <p className="text-2xl font-serif mt-2 text-slate-800 dark:text-slate-200">
                    {user?.displayName || 'Student'}
                  </p>
                </div>
                
                <div>
                  <p className="text-slate-600 dark:text-slate-400">has successfully completed the course</p>
                  <p className="text-xl font-bold mt-2 text-blue-600 dark:text-blue-400">
                    {course.title}
                  </p>
                </div>
                
                <div className="pt-4">
                  <p className="text-slate-600 dark:text-slate-400">Issued on</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {certificate.issuedAt}
                  </p>
                </div>
                
                <div className="pt-4 flex justify-center">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-500">Course Instructor</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {course.instructor?.name || 'BlockLearn Instructor'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-500">Certificate ID</p>
                      <p className="font-mono text-xs text-slate-800 dark:text-slate-200">
                        {certificate.id?.substring(0, 8) || 'CERT-ID'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Platform Logo */}
                <div className="absolute bottom-2 right-4">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    BlockLearn
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button 
          className="gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  )
}