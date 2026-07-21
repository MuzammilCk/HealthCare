import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { buttonVariants } from '../components/ui';
import { Home } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground">
      <div className="aura-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <Reveal className="relative z-10 p-6 text-center">
        <p className="mb-4 font-head text-7xl font-extrabold text-aurora sm:text-8xl">404</p>
        <h1 className="mb-3 font-head text-3xl font-bold tracking-tight text-foreground">
          Page Not Found
        </h1>
        <p className="mb-8 text-muted-foreground">
          The page you are looking for doesn’t exist.
        </p>
        <Link to="/" className={buttonVariants({ size: 'lg' })}>
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </Reveal>
    </div>
  );
}
