import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const { courseId } = params
    const userId = session.user.id

    const enrollmentRef = doc(db, 'enrollments', `${userId}_${courseId}`)
    const enrollmentSnap = await getDoc(enrollmentRef)

    if (!enrollmentSnap.exists()) {
      return new Response(JSON.stringify({ enrolled: false }), {
        status: 200,
      })
    }

    const enrollmentData = enrollmentSnap.data()
    
    return new Response(JSON.stringify({
      enrolled: true,
      progress: enrollmentData.progress || {},
      status: enrollmentData.status || 'active'
    }), {
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch progress' }), {
      status: 500,
    })
  }
}