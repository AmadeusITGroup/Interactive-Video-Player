import * as mobilejs from 'ismobilejs';
/**
 * Helper function is running on mobile
 */
export function isMobile() {
  return mobilejs.phone;
}

/**
 * Helper function is running on iOS Device
 */
export function isiOSDevice(){
  return mobilejs.apple.device;
}

/**
 * Helper function is running on Android Device
 */
export function isAndroidDevice(){
  return mobilejs.android.device;
}

/**
 * Get the current orientation of the device
 */
export function getOrientation() {
  let orientation = 0;
  if(window.orientation) {
    orientation = window.orientation;
  } else if (window.screen && window.screen.orientation) {
    orientation = Math.abs(window.screen.orientation.angle);
  }
  return orientation;
}
