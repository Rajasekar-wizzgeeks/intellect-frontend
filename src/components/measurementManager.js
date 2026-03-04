// measurementManager.js
let isMeasuring = false;
let measurementQueue = [];

const measurementManager = {
  addToQueue: (componentId, measureFn) => {
    return new Promise((resolve) => {
      measurementQueue.push({ componentId, measureFn, resolve });
      processQueue();
    });
  },

  removeFromQueue: (componentId) => {
    measurementQueue = measurementQueue.filter(
      (item) => item.componentId !== componentId
    );
  },

  clearQueue: () => {
    measurementQueue = [];
    isMeasuring = false;
  },
};

const processQueue = async () => {
  if (isMeasuring || measurementQueue.length === 0) {
    return;
  }

  isMeasuring = true;
  const nextItem = measurementQueue.shift();

  try {
    await nextItem.measureFn();
  } catch (error) {
    console.error(`Measurement failed for ${nextItem.componentId}:`, error);
  } finally {
    isMeasuring = false;
    nextItem.resolve();
    // Process next item in queue
    setTimeout(processQueue, 50);
  }
};

export default measurementManager;
