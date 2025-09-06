import { useState, useEffect } from "react";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import { assessNetworkStatus, type NetworkStatus } from "~/lib/network-assess";

export async function loader() {
  return json({
    pageTitle: "Network Assessment",
    description: "Check your network connectivity and performance",
  });
}

function NetworkAssessmentClient() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to run network assessment
  const runNetworkAssessment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const status = await assessNetworkStatus();
      setNetworkStatus(status);
    } catch (err) {
      setError("Failed to assess network status. Please try again.");
      console.error("Network assessment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run assessment on initial load
  useEffect(() => {
    runNetworkAssessment();
  }, []);

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Network Status</h2>
      
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {networkStatus && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-32 font-medium">Connection:</div>
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${networkStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>{networkStatus.isConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 font-medium">Type:</div>
            <div>{networkStatus.connectionType}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 font-medium">Latency:</div>
            <div>
              {networkStatus.latencyMs > 0 
                ? `${networkStatus.latencyMs} ms` 
                : 'Not available'}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 font-medium">DNS Resolution:</div>
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${networkStatus.dnsResolution ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>{networkStatus.dnsResolution ? 'Working' : 'Failed'}</span>
            </div>
          </div>
          
          {networkStatus.bandwidth && (
            <div className="flex items-center">
              <div className="w-32 font-medium">Bandwidth:</div>
              <div>{networkStatus.bandwidth} Mbps</div>
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={runNetworkAssessment}
        disabled={isLoading}
        className="mt-6 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded"
      >
        {isLoading ? 'Assessing...' : 'Re-run Assessment'}
      </button>
    </div>
  );
}

export default function NetworkAssessment() {
  const { pageTitle, description } = useLoaderData<typeof loader>();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{pageTitle}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
      
      <ClientOnly fallback={<div>Loading network assessment tool...</div>}>
        {() => <NetworkAssessmentClient />}
      </ClientOnly>
    </div>
  );
}
