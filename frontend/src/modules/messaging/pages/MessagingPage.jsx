import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { useConversations } from '../hooks/useMessaging';

export default function MessagingPage() {
  const [searchParams] = useSearchParams();
  const initialUuid = searchParams.get('c') || null;
  const [activeUuid, setActiveUuid] = useState(initialUuid);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useConversations(search);
  const conversations = data?.data || [];

  // Keep activeUuid in sync with the URL query param.
  useEffect(() => {
    const fromUrl = searchParams.get('c') || null;
    if (fromUrl !== activeUuid) setActiveUuid(fromUrl);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6">
        <div className="bg-white sm:rounded-2xl sm:border sm:border-slate-200 overflow-hidden h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)] flex">
          <div
            className={`w-full md:w-80 md:flex-shrink-0 flex-col ${
              activeUuid ? 'hidden md:flex' : 'flex'
            }`}
          >
            <ConversationList
              conversations={conversations}
              isLoading={isLoading}
              activeUuid={activeUuid}
              onSelect={setActiveUuid}
              search={search}
              onSearchChange={setSearch}
            />
          </div>
          <div
            className={`flex-1 flex-col min-w-0 ${
              activeUuid ? 'flex' : 'hidden md:flex'
            }`}
          >
            <ChatWindow uuid={activeUuid} onBack={() => setActiveUuid(null)} />
          </div>
        </div>
      </main>
    </div>
  );
}