import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id
    const courseId = searchParams.get('courseId')

    if (userId !== session.user.id && !session.user.isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    let certificatesQuery = query(
      collection(db, 'certificates'),
      where('userId', '==', userId)
    )

    if (courseId) {
      certificatesQuery = query(
        certificatesQuery,
        where('courseId', '==', courseId)
      )
    }

    const certificatesSnap = await getDocs(certificatesQuery)
    const certificates = certificatesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      issuedAt: doc.data().issuedAt?.toDate?.() || null
    }))

    return new Response(JSON.stringify(certificates), {
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch certificates' }), {
      status: 500,
    })
  }
}