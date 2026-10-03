export const audioSpeeds=[.5,.55,.6,.65,.7,.8,.9,1,1.1,1.2] as const;
export function audioLevel(rate:number){return audioSpeeds.reduce((best,value,index)=>Math.abs(value-rate)<Math.abs(audioSpeeds[best]-rate)?index:best,0)+1}
export function playbackRate(rate:number){return Number.isFinite(rate)?Math.max(audioSpeeds[0],Math.min(audioSpeeds[9],rate)):.7}
