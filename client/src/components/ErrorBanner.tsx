export default function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="banner" role="alert">
            <span>{message}</span>
            {onRetry && <button onClick={onRetry}>Try again</button>}
        </div>
    );
}