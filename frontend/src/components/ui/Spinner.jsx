export default function Spinner({ fullScreen = false }) {
  return (
    <div className={`grid place-items-center ${fullScreen ? "min-h-screen" : "min-h-40"}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-mint/20 border-t-mint" />
    </div>
  );
}
