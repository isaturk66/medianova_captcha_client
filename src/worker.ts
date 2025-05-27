import { solveChallenge } from './helpers';
import type { Solution } from './types';

let controller: AbortController | undefined = undefined;

onmessage = async (message) => {
  const { type, payload, start, max } = message.data;
  let result: ReturnType<typeof solveChallenge> | Awaited<Solution> | null = null;
  if (type === 'abort') {
    controller?.abort();
    controller = undefined;
  } else if (type === 'work') {
   
      const { algorithm, challenge, salt } = payload || {};
      result = solveChallenge(challenge, salt, algorithm, max, start);
    
    controller = result.controller;
    result.promise.then((solution) => {
      self.postMessage(solution ? { ...solution, worker: true } : solution);
    });
  }
};

export {};
