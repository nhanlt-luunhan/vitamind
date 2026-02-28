import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import TransactionData from './components/TransactionData'
export const dynamic = 'force-dynamic'


export const metadata: Metadata = { title: 'Transactions' }

const TransactionsPage = () => {
  return (
    <>
      <PageTitle title="Transactions" subName="Real Estate" />
      <TransactionData />
    </>
  )
}

export default TransactionsPage
