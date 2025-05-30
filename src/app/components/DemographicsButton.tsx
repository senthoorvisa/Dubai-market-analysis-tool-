'use client';

interface DemographicsButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function DemographicsButton({ children, className }: DemographicsButtonProps) {
  const handleClick = () => {
    document.getElementById('demographics-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button 
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
} 