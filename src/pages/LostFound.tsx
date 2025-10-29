import React from 'react';

// Embeds the standalone Missing app via iframe. Configure URL with VITE_MISSING_APP_URL.
// Default assumes the Missing web app runs on http://localhost:5173
const LostFound: React.FC = () => {
  const missingUrl = (import.meta as any).env?.VITE_MISSING_APP_URL ?? 'http://localhost:5174';

  // Prevent recursive embedding: if the configured missingUrl has the same origin
  // as the main app, embedding it will load the main app inside itself and
  // produce repeated navbars. In that case show a helpful message and an
  // optional 'Open in new tab' link instead of embedding.
  let sameOrigin = false
  try {
    const missingOrigin = new URL(missingUrl).origin
    sameOrigin = missingOrigin === window.location.origin
  } catch (e) {
    // ignore URL parse errors
  }

  if (sameOrigin) {
    return (
      <div className="w-full min-h-[calc(100vh-140px)] bg-gray-50 flex flex-col" style={{ minHeight: '600px' }}>
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              <span className="text-blue-600">Lost</span> & <span className="text-blue-600">Found</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Your Missing app appears to be hosted on the same origin as the main app. Embedding it will recurse and produce multiple navbars.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <strong>Warning:</strong> Detected that the Missing app URL ({missingUrl}) has the same origin as this app.
            This will cause recursive embedding and layout issues. Please run the Missing app on a different port (e.g. 5173) and set <code>VITE_MISSING_APP_URL</code> in the main app's <code>.env</code> to that URL.
          </div>

          <div className="mt-4 flex gap-2">
            <a className="btn" href={missingUrl} target="_blank" rel="noreferrer">Open Missing App in new tab</a>
            <button className="btn" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-50 flex flex-col" style={{ minHeight: '100vh' }}>
      {/* Page Header - match app style */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            <span className="text-blue-600">Lost</span> & <span className="text-blue-600">Found</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Report, search, and manage missing items and persons during the event.
          </p>
        </div>
      </div>

      <iframe
        title="Lost & Found App"
        src={missingUrl}
        className="w-full flex-1 min-h-0"
        style={{ border: 0, display: 'block', height: 'calc(100vh - 160px)' }}
      />
    </div>
  );
};

export default LostFound;
