import PageTitle from '@/components/PageTitle';
import AgentDetails from './components/AgentDetails';
import AgentsDetailsBanner from './components/AgentsDetailsBannner';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Agent Overview'
};
const AgentsDetailsPage = () => {
  return <>
      <PageTitle subName="Real Estate" title="Agent Overview" />
      <AgentsDetailsBanner />
      <AgentDetails />
    </>;
};
export default AgentsDetailsPage;