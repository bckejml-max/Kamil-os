export const OS50_FAST_BOOT_DELAY_MS=300;
export function scheduleOs50FastBoot(load){return setTimeout(()=>Promise.resolve(load('./os50Ui.js')).catch(error=>console.warn('[os50-fast-boot]',error)),OS50_FAST_BOOT_DELAY_MS)}
