import { cn } from '../../utils/cn';
import { ArrowRight } from 'lucide-react';

function BentoGrid({ children, className, ...props }) {
  return (
    <div
      className={cn('grid w-full auto-rows-[20rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function BentoCard({ name, className, background, Icon, description, href = '#', cta = 'Learn more', ...props }) {
  return (
    <div
      key={name}
      className={cn(
        'group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl glass shadow-card dark:shadow-card-dark transition-all duration-300 hover:shadow-glow',
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100">
        {background}
      </div>

      <div className="relative z-10 p-6">
        <div className="pointer-events-none flex transform-gpu flex-col gap-2 transition-all duration-300 lg:group-hover:-translate-y-8">
          <Icon className="h-10 w-10 origin-left text-brand-cyan-fg transition-all duration-300 ease-in-out group-hover:scale-90" />
          <h3 className="font-head text-xl font-bold text-foreground">{name}</h3>
          <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 hidden w-full translate-y-8 flex-row items-center p-6 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
          <a href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary dark:text-brand-cyan-fg">
            {cta}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-foreground/5" />
    </div>
  );
}

export { BentoCard, BentoGrid };
export default BentoGrid;
