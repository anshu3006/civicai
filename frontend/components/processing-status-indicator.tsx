interface ProcessingStatusIndicatorProps {
  message: string;
}

export function ProcessingStatusIndicator({ message }: ProcessingStatusIndicatorProps) {
  return (
    <div className="animate-processing-fade space-y-1 text-sm text-muted-foreground">
      <p>{message}</p>
    </div>
  );
}