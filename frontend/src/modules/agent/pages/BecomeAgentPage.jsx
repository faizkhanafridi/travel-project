import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import { useAgentWizard } from '../hooks/useAgent';

// Entry page: routes the user to the wizard or already-submitted flow.
export default function BecomeAgentPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useAgentWizard();

  useEffect(() => {
    if (!isLoading) {
      navigate('/agent/apply', { replace: true });
    }
  }, [isLoading, navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <FullPageLoader label="Preparing application…" />
    </div>
  );
}