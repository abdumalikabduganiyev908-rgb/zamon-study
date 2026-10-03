import {useEffect,type KeyboardEvent} from 'react';
export function answerEnter(event:KeyboardEvent<HTMLElement>){
 if(event.key!=='Enter'||event.shiftKey||event.ctrlKey||event.altKey||event.metaKey||event.repeat||event.nativeEvent.isComposing)return;
 const target=event.target as HTMLElement;
 if(target.closest('button,a,summary')||target.isContentEditable)return;
 if(target.matches('textarea,input')&&!target.matches('[data-answer-input]'))return;
 const primary=event.currentTarget.querySelector<HTMLButtonElement>('[data-answer-primary]');
 if(!primary||primary.disabled)return;
 event.preventDefault();primary.click();
}

export function useAnswerEnterBody(){useEffect(()=>{const onKey=(e:globalThis.KeyboardEvent)=>{if(e.target!==document.body||e.defaultPrevented)return;const root=document.querySelector<HTMLElement>('.practice,.journey');if(root)answerEnter({key:e.key,shiftKey:e.shiftKey,ctrlKey:e.ctrlKey,altKey:e.altKey,metaKey:e.metaKey,repeat:e.repeat,nativeEvent:e,target:e.target,currentTarget:root,preventDefault:()=>e.preventDefault()} as KeyboardEvent<HTMLElement>)};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[])}
