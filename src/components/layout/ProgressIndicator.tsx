interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels = []
}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-300">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-300">
          {Math.round(progress)}% Complete
        </span>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-white h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {stepLabels.length > 0 && (
        <div className="flex justify-between mt-2">
          {stepLabels.map((label, index) => (
            <span
              key={index}
              className={`text-xs ${
                index < currentStep ? 'text-white' : 'text-gray-500'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}