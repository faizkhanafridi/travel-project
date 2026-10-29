import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="text-center">
        <p className="text-6xl font-black text-primary">404</p>
        <h1 className="mt-2 text-xl font-semibold text-ink-900">
          We couldn&apos;t find that page
        </h1>
        <Link to="/" className="inline-block mt-6">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}