// Dates are interpreted in Asia/Tashkent. A month is a calendar month.
export function tashkentDate(now=new Date()){return new Date(now.getTime()+5*3600000).toISOString().slice(0,10)}
export function nextMonth(date){const [y,m,d]=date.slice(0,10).split('-').map(Number);const month=m===12?1:m+1,year=m===12?y+1:y;const last=new Date(Date.UTC(year,month,0)).getUTCDate();return `${year}-${String(month).padStart(2,'0')}-${String(Math.min(d,last)).padStart(2,'0')}`}
export function plusDays(date,n){const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
export function paymentState(billing,now=new Date()){
 if(!billing)return {status:'paid',paidAt:null,dueAt:null,unpaidAt:null,blockAt:null,blocked:false};
 const today=tashkentDate(now),due=billing.paidAt?nextMonth(billing.paidAt):null;
 const unpaidAt=billing.status==='unpaid'?billing.unpaidAt:(due&&today>=due?due:null);
 const blockAt=unpaidAt?plusDays(unpaidAt,7):null;
 return {status:unpaidAt?'unpaid':'paid',paidAt:billing.paidAt||null,dueAt:due,unpaidAt,blockAt,blocked:!!blockAt&&today>=blockAt};
}
