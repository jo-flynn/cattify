import { parentPort } from 'worker_threads';
import { cattifyJson } from './cattify';

// Store the message callback
let messageCallback: ((message: any) => void) | null = null;

// Mock worker_threads module
jest.mock('worker_threads', () => {
  const mockPostMessage = jest.fn();
  const mockOn = jest.fn((event: string, callback: (message: any) => void) => {
    if (event === 'message') {
      messageCallback = callback;
    }
  });

  return {
    parentPort: {
      on: mockOn,
      postMessage: mockPostMessage,
    },
  };
});

// Import the worker file to trigger the message listener setup
import './cattify.worker';

describe('cattify.worker', () => {
  const mockParentPort = parentPort as any;
  const mockPostMessage = mockParentPort.postMessage as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Message handling', () => {
    it('should process message and send response with requestId', () => {
      const message = {
        data: { pet: 'dog' },
        limit: 10,
        requestId: 'test-request-1',
      };

      if (!messageCallback) {
        throw new Error('Message callback not set');
      }
      messageCallback(message);

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      const response = mockPostMessage.mock.calls[0][0];
      
      // Verify response structure and requestId preservation
      expect(response).toHaveProperty('result');
      expect(response).toHaveProperty('requestId', 'test-request-1');
      expect(response.error).toBeUndefined();
      // Verify cattifyJson was called with correct parameters
      expect(response.result).toEqual(cattifyJson(message.data, message.limit));
    });

    it('should preserve requestId in response', () => {
      const message = {
        data: { test: 'data' },
        limit: 5,
        requestId: 'unique-id-123',
      };

      if (!messageCallback) {
        throw new Error('Message callback not set');
      }
      messageCallback(message);

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      const response = mockPostMessage.mock.calls[0][0];
      
      expect(response.requestId).toBe('unique-id-123');
    });
  });

  describe('Error handling', () => {
    it('should catch errors and send error response with requestId', () => {
      jest.spyOn(require('./cattify'), 'cattifyJson').mockImplementation(() => {
        throw new Error('Test error');
      });

      const message = {
        data: { pet: 'dog' },
        limit: 10,
        requestId: 'test-request-error-1',
      };

      if (!messageCallback) {
        throw new Error('Message callback not set');
      }
      messageCallback(message);

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      const response = mockPostMessage.mock.calls[0][0];
      
      expect(response).toEqual({
        result: {
          result: null,
          replacementsCount: 0,
          limitReached: false,
        },
        requestId: 'test-request-error-1',
        error: 'Test error',
      });

      jest.restoreAllMocks();
    });

    it('should handle non-Error exceptions', () => {
      jest.spyOn(require('./cattify'), 'cattifyJson').mockImplementation(() => {
        throw 'String error';
      });

      const message = {
        data: { pet: 'dog' },
        limit: 10,
        requestId: 'test-request-error-2',
      };

      if (!messageCallback) {
        throw new Error('Message callback not set');
      }
      messageCallback(message);

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      const response = mockPostMessage.mock.calls[0][0];
      
      expect(response.error).toBe('Unknown error');
      expect(response.requestId).toBe('test-request-error-2');
      expect(response.result).toEqual({
        result: null,
        replacementsCount: 0,
        limitReached: false,
      });

      jest.restoreAllMocks();
    });
  });
});
