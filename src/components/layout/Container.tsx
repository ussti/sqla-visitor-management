interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`min-h-screen bg-black text-white flex items-center justify-center p-6 ${className}`}>
      <div className="w-full max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
}