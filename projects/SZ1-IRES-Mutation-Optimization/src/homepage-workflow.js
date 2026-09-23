(function(){
const root=document.getElementById('sz1-workflow'); if(!root)return;
const base='/projects/SZ1-IRES-Mutation-Optimization/';
const parseCSV=t=>{const lines=t.trim().split(/\r?\n/);const h=lines.shift().split(',');return lines.map(line=>{const v=[];let x='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"')q=!q;else if(c===','&&!q){v.push(x);x='';}else x+=c;}v.push(x);return Object.fromEntries(h.map((k,i)=>[k,v[i]??'']));});};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>Number.isFinite(Number(x))?Number(x).toFixed(1):'—';
function render(sum,train){
const n=sum.total_single_substitution_candidates||'—',len=sum.sequence_length||'—',labels=sum.experimental_variants||train.length||'—',paired=sum.pairing_state_changes||'—';
const min=sum.min_delta_mfe,max=sum.max_delta_mfe;
const best=train.reduce((a,b)=>Number(b.experimental_TE_WT100)>Number(a.experimental_TE_WT100)?b:a,train[0]||{});
root.innerHTML='<div class="workflow-head"><div><div class="meta">COMPUTATIONAL PIPELINE · DATA-DRIVEN VIEW</div><div class="workflow-title">From sequence input to mutation landscape</div></div><div class="workflow-status">LIVE FROM PROJECT DATA</div></div>'
+'<div class="workflow-canvas"><svg viewBox="0 0 1100 330" preserveAspectRatio="xMidYMid meet"><defs><marker id="wf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z"/></marker></defs>'
NaN
NaN
NaN
NaN
NaN
NaN
NaN
NaN
NaN
NaN
NaN
}
Promise.all([fetch(base+'results/mutation_landscape_summary.csv').then(r=>r.text()),fetch(base+'results/feature_dataset_training_9.csv').then(r=>r.text())]).then(([a,b])=>render(parseCSV(a)[0]||{},parseCSV(b))).catch(()=>{root.innerHTML='<div class="workflow-fallback">Computational workflow data could not be loaded.</div>';});
})();