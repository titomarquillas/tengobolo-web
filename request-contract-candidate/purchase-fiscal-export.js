// Unified read model only. Never turn local-tax documents into IVA0/exempt or
// net a credit by changing its original paid_at. Keep original document dates.
export function purchaseFiscalRows({advances=[],credits=[],renewals=[]}){
 const rows=[];
 for(const d of advances)rows.push({id:d.id,number:d.fiscalIdentifier,kind:'advance',html:d.html,buyer:d.buyer,requestId:d.requestId,date:d.issuedAt,taxAccrualAt:d.taxAccrualAt,original:null,baseCents:d.baseCents,taxCents:d.taxCents,totalCents:d.totalCents,taxCode:d.taxCode,taxRatePct:d.taxRatePct,taxTreatment:d.taxTreatment,taxReporting:d.taxReporting,jurisdiction:d.jurisdiction});
 for(const d of credits)rows.push({id:d.id,number:d.number,kind:'credit',html:d.html,buyer:d.buyer,requestId:d.requestId,date:d.issuedAt,taxAccrualAt:d.modificationAt,original:d.originalFiscalIdentifier,baseCents:d.baseCents,taxCents:d.taxCents,totalCents:d.totalCents,taxCode:d.taxCode,taxRatePct:d.taxRatePct,taxTreatment:d.taxTreatment,taxReporting:d.taxReporting,jurisdiction:d.jurisdiction});
 for(const d of renewals)rows.push({...d,kind:'renewal'});
 for(const r of rows)if(!r.id||!r.number||!['IVA','IGIC','IPSI'].includes(r.taxCode)||!Number.isSafeInteger(r.baseCents)||!Number.isSafeInteger(r.taxCents)||!Number.isSafeInteger(r.totalCents)||r.baseCents+r.taxCents!==r.totalCents||!Number.isFinite(Date.parse(r.taxAccrualAt)))throw Error('Documento fiscal no verificable para exportar.');
 return rows;
}
export function purchaseFiscalTotals(rows){return rows.reduce((a,r)=>{a.baseCents+=r.baseCents;a.totalCents+=r.totalCents;a[r.taxCode]+=r.taxCents;return a;},{baseCents:0,totalCents:0,IVA:0,IGIC:0,IPSI:0});}

// Compatibility shape for existing monthly admin totals/CSV/PDF. Credit amounts
// are converted to absolute storage with kind credit, so legacy display applies
// the sign exactly once. Original accrual date remains separately available.
export function purchaseRowsForLegacyExport(rows){return rows.map(r=>({id:r.id,number:r.number,document_html:r.html,issued_at:r.date.slice(0,10),tax_accrual_at:r.taxAccrualAt,document_kind:r.kind==='credit'?'credit':'invoice',base_eur:Math.abs(r.baseCents)/100,iva_pct:r.taxCode==='IVA'?r.taxRatePct||0:0,irpf_pct:0,tax_code:r.taxCode,tax_rate_pct:r.taxRatePct,tax_amount_cents:Math.abs(r.taxCents),total_cents:Math.abs(r.totalCents),tax_treatment:r.taxTreatment,tax_reporting:r.taxReporting,status:'issued',client_name:r.buyer?.name||'',concept:r.kind==='advance'?'Anticipo':r.kind==='credit'?'Rectificación de '+r.original:'Renovación',source:'purchase_request',original_fiscal_identifier:r.original}));}
