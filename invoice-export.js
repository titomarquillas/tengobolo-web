// Amounts preserve legacy documents; explicit non-IVA taxes stay out of IVA303.
export function invoiceAmounts(x){const sign=x.document_kind==='credit'?-1:1,base=sign*Number(x.base_eur),irpf=sign*Math.round(Number(x.base_eur)*Number(x.irpf_pct))/100;
 if(!x.tax_code){const iva=sign*Math.round(Number(x.base_eur)*Number(x.iva_pct))/100;return{base,iva,irpf,localTax:0,total:Math.round((base+iva-irpf)*100)/100,taxCode:'IVA',taxRate:x.iva_pct,taxAmount:iva,taxTreatment:'legacy',reporting:'legacy_review'};}
 if(!Number.isSafeInteger(Number(x.total_cents))||!Number.isSafeInteger(Number(x.tax_amount_cents))||Number(x.total_cents)!==Math.round(Number(x.base_eur)*100)+Number(x.tax_amount_cents))throw Error('Desglose fiscal incompleto: revisa el documento antes de exportar.');
 const tax=sign*Number(x.tax_amount_cents)/100;return{base,iva:x.tax_code==='IVA'?tax:0,irpf,localTax:x.tax_code==='IVA'?0:tax,total:sign*Number(x.total_cents)/100,taxCode:x.tax_code,taxRate:x.tax_rate_pct,taxAmount:tax,taxTreatment:x.tax_treatment,reporting:x.tax_reporting};
}
export function fiscalTotals(rows){return rows.filter(x=>x.status!=='void').reduce((a,x)=>{const m=invoiceAmounts(x);for(const k of['base','iva','irpf','localTax','total'])a[k]=Math.round((a[k]+m[k])*100)/100;return a;},{base:0,iva:0,irpf:0,localTax:0,total:0});}
