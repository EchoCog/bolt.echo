/**
 * Network Assessment Utility
 *
 * A lightweight utility for assessing basic network status from the browser/runtime.
 * Inspired by delta-echo's NetworkManager for bolt.echo integration.
 */

// Define the return type for network assessment
export interface NetworkStatus {
  isConnected: boolean;
  connectionType: string;
  latencyMs: number;
  dnsResolution: boolean;
  bandwidth?: number; // Optional bandwidth in Mbps
}

// Test endpoints for network assessment
const TEST_ENDPOINTS = ['https://cloudflare.com/cdn-cgi/trace', 'https://example.com', 'https://httpbin.org/get'];

// Small resource for bandwidth estimation (adjust size as needed)
const BANDWIDTH_TEST_URL = 'https://httpbin.org/bytes/100000';

/**
 * Assesses the current network status
 * @returns Promise resolving to NetworkStatus object
 */
export async function assessNetworkStatus(): Promise<NetworkStatus> {
  // Default status (pessimistic)
  const status: NetworkStatus = {
    isConnected: false,
    connectionType: 'unknown',
    latencyMs: -1,
    dnsResolution: false,
  };

  try {
    // Check if navigator is available (browser environment)
    if (typeof navigator !== 'undefined') {
      // Get connection type if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;

        if (connection) {
          status.connectionType = connection.effectiveType || connection.type || 'unknown';
        }
      }

      // Check if online property is available
      if ('onLine' in navigator) {
        status.isConnected = navigator.onLine;

        // If browser reports offline, return early
        if (!status.isConnected) {
          return status;
        }
      }
    }

    // Test actual connectivity by pinging endpoints
    const latencies: number[] = [];
    let successfulFetches = 0;

    // Test multiple endpoints with timeout
    await Promise.all(
      TEST_ENDPOINTS.map(async (endpoint) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const startTime = performance.now();
          const response = await fetch(endpoint, {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
            headers: { 'Cache-Control': 'no-cache' },
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const endTime = performance.now();
            const latency = endTime - startTime;
            latencies.push(latency);
            successfulFetches++;
          }
        } catch (error) {
          // Ignore individual fetch errors
        }
      }),
    );

    // Update status based on fetch results
    if (successfulFetches > 0) {
      status.isConnected = true;
      status.dnsResolution = true;

      // Calculate average latency
      status.latencyMs = Math.round(latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length);

      // Estimate bandwidth if we've confirmed connection
      try {
        status.bandwidth = await estimateBandwidth();
      } catch (error) {
        // Bandwidth estimation is optional, so we can ignore errors
      }
    }

    return status;
  } catch (error) {
    console.error('Network assessment error:', error);
    return status;
  }
}

/**
 * Estimates bandwidth by downloading a small resource and measuring time
 * @returns Promise resolving to bandwidth in Mbps
 */
async function estimateBandwidth(): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const startTime = performance.now();
  const response = await fetch(BANDWIDTH_TEST_URL, {
    method: 'GET',
    cache: 'no-store',
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error('Bandwidth test failed');
  }

  // Get the response as array buffer to ensure full download
  const data = await response.arrayBuffer();
  const endTime = performance.now();

  /*
   * Calculate bandwidth in Mbps
   * Formula: (size in bits) / (time in seconds) / 1,000,000
   */
  const downloadTimeMs = endTime - startTime;
  const downloadTimeSec = downloadTimeMs / 1000;
  const dataSizeBits = data.byteLength * 8;
  const bandwidthMbps = dataSizeBits / downloadTimeSec / 1000000;

  return Math.round(bandwidthMbps * 100) / 100; // Round to 2 decimal places
}

/**
 * Simple check if the network is currently available
 * @returns boolean indicating if network appears to be available
 */
export function isNetworkAvailable(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}
