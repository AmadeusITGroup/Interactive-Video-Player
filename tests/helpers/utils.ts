export function waitsFor(fn:Function) {
  return new Promise((resolve, reject) => {
    var checkInterval = 50;
    var timeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    var startTime = Date.now();
    var intervalId = window.setInterval(() => {
      if (Date.now() > startTime + timeoutInterval) {
        window.clearInterval(intervalId);
        // Jasmine will handle the test timeout error
        reject()
      } else if (fn()) {
        window.clearInterval(intervalId);
        resolve();
      }
    }, checkInterval);
  });
}

export function waitsForElementToBeVisible(cssPath:string) {
  return waitsFor(() => {
    const elem = document.querySelector(cssPath) as HTMLElement;
    if(elem) {
      return elem.style.visibility !== 'hidden' && elem.style.opacity !== '0' && elem.style.display !== 'none';
    } else {
      return false;
    } 
  });
}

export function waitsForElementToBePresent(cssPath:string) {
  return waitsFor(() => document.querySelector(cssPath) !== null);
}

export enum BridgeEvent {
  OnCurrentTimeChanged = 'onCurrentTimeChanged',
  OnVideoPOIChanged = 'onVideoPOIChanged',
  OnVideoPOICfgChanged = 'onVideoPOICfgChanged',
  OnVideoPOIAdded = 'onVideoPOIAdded',
  OnVideoPOIRemoved = 'onVideoPOIRemoved',
  OnBridgeEvent = 'onBridgeEvent',
  OnVideoChanged = 'onVideoChanged',
  OnPlaceAdded = 'onPlaceAdded',
  OnPlayerInitialized = 'playerInitialized',
  OnPlayerFOVChanged = 'fovChanged',
  OnPlayerCurrentTimeChanged = 'currentTimeChanged'
}

export function dispatchEvent(eventName: BridgeEvent, eventDetails:any) {
  const event = new CustomEvent(eventName, {detail : eventDetails});
  window.dispatchEvent(event);
}