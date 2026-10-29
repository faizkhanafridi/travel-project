import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';
import Button from '../components/Button';

export default function ComingSoonPage({ title = 'Coming soon' }) {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-primary-light text-primary">
          <Construction size={28} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">{title}</h1>
        <p className="mt-2 text-ink-600">
          This feature is being built and will be available soon.
        </p>
        <Link to="/" className="inline-block mt-6">
          <Button variant="outline">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}