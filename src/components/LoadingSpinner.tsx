export function LoadingSpinner() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
    </div>
  );
}
