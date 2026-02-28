import { Metadata } from 'next'
import ResetPassword from './components/ResetPassword'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Reset Password' }

const ResetPasswordPage = () => {
  return <ResetPassword />
}

export default ResetPasswordPage
