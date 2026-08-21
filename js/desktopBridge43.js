const KEY='kamil-os-desktop43-notify';
function canNotify(){return !!window.kamilDesktop43&&'Notification'in window&&Notification.permission==='granted'}
export function notifyDesktop43(title,body,{cooldown=21600000,key='default'}={}){if(!canNotify())return false;let map={};try{map=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}const last=Number(map[key]||0);if(Date.now()-last<cooldown)return false;map[key]=Date.now();try{localStorage.setItem(KEY,JSON.stringify(map));window.dispatchEvent(new CustomEvent('kamil:desktop-notify',{detail:{title,body}}));return true}catch{return false}}
export function desktopFeatures43(){return {desktop:!!window.kamilDesktop43,commandPalette:!!window.kamilDesktop43,tray:!!window.kamilDesktop43,nativeNotifications:canNotify()}}
