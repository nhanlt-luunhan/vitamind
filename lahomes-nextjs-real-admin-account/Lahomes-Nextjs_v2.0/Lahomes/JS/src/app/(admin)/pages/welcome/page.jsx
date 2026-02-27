import PageTitle from '@/components/PageTitle';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Welcome'
};
const WelcomePage = () => {
  return <>
      <PageTitle title="Welcome" subName="Pages" />
    </>;
};
export default WelcomePage;