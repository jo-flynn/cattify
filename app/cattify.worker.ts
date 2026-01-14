import { parentPort } from 'worker_threads';
import { cattifyJson, CattifyResult } from './cattify';

interface WorkerMessage {
  data: any;
  limit: number;
  requestId: string;
}

interface WorkerResponse {
  result: CattifyResult;
  requestId: string;
  error?: string;
}

// Listen for messages from the main thread
parentPort?.on('message', (message: WorkerMessage) => {
  try {
    const { data, limit, requestId } = message;
    const result = cattifyJson(data, limit);
    
    const response: WorkerResponse = {
      result,
      requestId,
    };
    
    parentPort?.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      result: {
        result: null,
        replacementsCount: 0,
        limitReached: false,
      },
      requestId: message.requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    
    parentPort?.postMessage(response);
  }
});
