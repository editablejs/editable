export const isServer = typeof window === 'undefined' || typeof navigator === 'undefined';

const userAgent = (
	isServer ? { userAgent: ''} : window.navigator
).userAgent.toLowerCase();
/**
 * 是否是 Edge 浏览器
 * Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134
 */
export const isEdge = /edge/i.test(userAgent);
/**
 * 是否是 Chrome 浏览器
 * Mozilla/5.0 (Macintosh Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36
 */

export const isChrome = !isEdge && /chrome/i.test(userAgent);
/**
 * 是否是 Firefox 浏览器
 * Mozilla/5.0 (Macintosh Intel Mac OS X 10.13 rv:62.0) Gecko/20100101 Firefox/62.0
 */
export const isFirefox = /firefox/i.test(userAgent);
/**
 * 是否是 Safari 浏览器
 * Mozilla/5.0 (Macintosh Intel Mac OS X 10_13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1 Safari/605.1.15
 */
export const isSafari = !isEdge && !isChrome && /safari/i.test(userAgent);
/**
 * 是否是 手机浏览器
 */
export const isMobile = /mobile/i.test(userAgent);
/**
 * 是否是iOS系统
 */

export const isIOS = /os [._\d]+ like mac os/i.test(userAgent);
/**
 * 是否是 安卓系统
 */
export const isAndroid = /android/i.test(userAgent);
/**
 * 是否是 Mac OS X 系统
 */
export const isMacos = !isIOS && /mac os x/i.test(userAgent);
/**
 * 是否是 Windows 系统
 */
export const isWindows = /windows\s*(?:nt)?\s*[._\d]+/i.test(userAgent);
