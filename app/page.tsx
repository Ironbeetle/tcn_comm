import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

export default async function HomePage() {
  const session = await getServerSession()
  
  // If user is logged in, redirect based on role
  if (session?.user) {
    const role = session.user.role
    
    if (role === 'ADMIN' || role === 'CHIEF_COUNCIL') {
      redirect('/Admin_Home')
    } else {
      redirect('/Staff_Home')
    }
  }
  
  // If not logged in, redirect to login
  redirect('/login')
}
