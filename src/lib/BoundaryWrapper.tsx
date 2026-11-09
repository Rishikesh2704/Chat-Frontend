import type React from "react";
import { ErrorBoundary } from "react-error-boundary";

function fallbackComponent({ error, resetErrorBoundary }:{ error:any, resetErrorBoundary:any}) {
  return (
    <div>
      <pre>{error.message}</pre>
      <button onClick={() => resetErrorBoundary()}>Try Again!</button>
    </div>
  );
}

export default function BoundaryWrapper({ children }:{children:React.ReactNode}){
  return (
    <ErrorBoundary FallbackComponent={fallbackComponent}>
      {children}
    </ErrorBoundary>
  );
}
