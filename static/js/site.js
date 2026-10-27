'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const base = document.documentElement.dataset.base || '';
const mobileToggle = $('.mobile-toggle');
mobileToggle.addEventListener('click', () => {
  const expanded = mobileToggle.getAttribute('aria-expanded') !== 'true';
  mobileToggle.setAttribute('aria-expanded', expanded);
  mobileToggle.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  $('.main-navigation').classList.toggle('mobile-open', expanded);
});
const closeSubmenus = () => $$('.nav-item.is-open').forEach(el => {
  el.classList.remove('is-open'); $('.nav-toggle', el)?.setAttribute('aria-expanded', 'false');
});
$$('.nav-toggle').forEach(button => button.addEventListener('click', () => {
  const item = button.closest('.nav-item'), open = !item.classList.contains('is-open');
  closeSubmenus(); item.classList.toggle('is-open', open); button.setAttribute('aria-expanded', open);
}));
document.addEventListener('click', e => { if (!e.target.closest('.nav-item')) closeSubmenus(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSubmenus(); if (mobileToggle.getAttribute('aria-expanded') === 'true') mobileToggle.click(); }
});
$$('dialog').forEach(dialog => {
  $('.dialog-close', dialog)?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { const r = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close(); });
});
$('.sitemap-button').addEventListener('click', () => $('.sitemap-dialog').showModal());

// Generated search index is loaded only when needed. Output uses textContent.
let searchIndex, searchRequest, searchRevision = 0;
const searchDialog = $('.search-dialog'), searchInput = $('#search-input'), searchResults = $('.search-results');
async function getIndex() {
  if (searchIndex) return searchIndex;
  if (!searchRequest) searchRequest = fetch(base + '/search-index.json').then(r => {
    if (!r.ok) throw new Error('Search index unavailable'); return r.json();
  }).then(data => searchIndex = data).catch(error => { searchRequest = null; throw error; });
  return searchRequest;
}
$('.search-button').addEventListener('click', () => { searchDialog.showModal(); searchInput.focus(); });
searchInput.addEventListener('input', async () => {
  const revision = ++searchRevision, query = searchInput.value.trim().toLocaleLowerCase();
  const message = text => { const p = document.createElement('p'); p.textContent = text; searchResults.replaceChildren(p); };
  if (!query) { message('Search across the laboratory website.'); return; }
  message('Searching…');
  try {
    const data = await getIndex(); if (revision !== searchRevision) return;
    const terms = query.split(/\s+/);
    const hits = data.filter(item => terms.every(term => (item.title + ' ' + item.text).toLocaleLowerCase().includes(term))).sort((a,b) => Number(b.title.toLowerCase().includes(query)) - Number(a.title.toLowerCase().includes(query)));
    message(hits.length ? hits.length + ' matching pages' : 'No matching pages. Try a name, research topic or year.');
    hits.slice(0,20).forEach(item => {
      const link = document.createElement('a'); link.className = 'search-result'; link.href = base + item.route;
      const title = document.createElement('h3'); title.textContent = item.title + ' ↗';
      const excerpt = document.createElement('p'), normalized = item.text.replace(/\s+/g,' ');
      const pos = Math.max(0, normalized.toLocaleLowerCase().indexOf(terms[0]) - 65);
      excerpt.textContent = (pos ? '…' : '') + normalized.slice(pos,pos+190) + '…';
      link.append(title,excerpt); searchResults.append(link);
    });
  } catch { if (revision === searchRevision) message('Search could not load. Please reload the page or use the site map.'); }
});

const years = $$('.pub-year');
years.forEach((year,i) => {
  const badge = document.createElement('span'); badge.className = 'year-count'; badge.textContent = $$('li',year).length + ' papers'; $('h2',year).append(badge); year.open = i === 0;
});
$('#expand-years')?.addEventListener('click', () => {
  const expand = years.some(y => !y.open && !y.hidden);
  years.filter(y => !y.hidden).forEach(y => y.open = expand);
  $('#expand-years').textContent = expand ? 'Collapse all years' : 'Expand all years';
});
const filter = $('#content-filter');
if (filter) {
  const items = years.length ? $$('.pub-year li') : $$('.person,.alumnus');
  const applyFilter = () => {
    const terms = filter.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean); let count = 0;
    items.forEach(item => {
      const text = (item.textContent + (item.closest('.pub-year')?.id.replace('y','') || '')).toLocaleLowerCase();
      item.hidden = !terms.every(term => text.includes(term)); if (!item.hidden) count++;
    });
    years.forEach((year,i) => { year.hidden = $$('li',year).every(item => item.hidden); year.open = terms.length ? !year.hidden : i === 0; });
    $$('.people-group').forEach(group => group.hidden = $$('.person,.alumnus',group).every(item => item.hidden));
    $('#filter-count').textContent = count + ' ' + (years.length ? 'papers' : 'people'); $('#filter-empty').hidden = count !== 0;
    if ($('#expand-years')) $('#expand-years').textContent = years.some(y => !y.open && !y.hidden) ? 'Expand all years' : 'Collapse all years';
  };
  filter.addEventListener('input',applyFilter); applyFilter();
}
$$('.gallery-open').forEach(button => button.addEventListener('click', () => {
  const dialog = $('.image-dialog'); $('img',dialog).src = button.dataset.image; $('img',dialog).alt = button.dataset.caption; $('p',dialog).textContent = button.dataset.caption; dialog.showModal();
}));

// Original conceptual illustration; not calculated reactor or safety data.
const canvas = $('#reactor-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d'), reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let mode = 'smr', paused = reducedMotion.matches, active = true, phase = 0, last = 0;
  const pauseButton = $('#motion-toggle');
  function syncMotion() { pauseButton.textContent = paused ? 'Play animation' : 'Pause animation'; pauseButton.setAttribute('aria-pressed',paused); }
  syncMotion(); pauseButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reducedMotion.addEventListener('change', e => { paused = e.matches; syncMotion(); });
  $$('[data-reactor]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.reactor; $$('[data-reactor]').forEach(b => b.setAttribute('aria-pressed',b === button));
    $('#reactor-description').textContent = mode === 'smr' ? 'SMR · Passive heat removal by natural circulation' : 'MSR · Helium-bubble lift enhances fuel-salt circulation';
    canvas.setAttribute('aria-label',mode === 'smr' ? 'Illustrative SMR loop: core heating and passive heat removal.' : 'Illustrative MSR loop: helium injection enhances fuel-salt circulation through the core and heat exchanger.');
  }));
  new IntersectionObserver(entries => { active = entries[0].isIntersecting; }).observe(canvas);
  function line(points,color,width=1) {ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));ctx.stroke();}
  function text(str,x,y,size=10,color='#83a8ba',align='left') {ctx.font=`${size}px Lato,Arial,sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(str,x,y);}
  function rect(x,y,w,h,r,fill,stroke) {ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
  function draw(time) {
    if (active) {
      const delta=Math.min(time-last||16,50);if(!paused)phase+=delta*.000025;last=time;
      const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.round(box.width*dpr),h=Math.round(box.height*dpr);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      ctx.setTransform(w/640,0,0,h/530,0,0);ctx.clearRect(0,0,640,530);
      const glow=ctx.createRadialGradient(330,268,10,330,268,240);glow.addColorStop(0,'#1a758022');glow.addColorStop(1,'#1a758000');ctx.fillStyle=glow;ctx.fillRect(0,0,640,530);
      for(let x=60;x<590;x+=24)for(let y=25;y<500;y+=24){ctx.fillStyle='#8bc6d011';ctx.fillRect(x,y,1,1)}
      ctx.setLineDash([4,7]);line([[324,40],[324,475]],'#8ac3d516');line([[70,270],[580,270]],'#8ac3d516');ctx.setLineDash([]);
      rect(170,59,288,394,130,'#39647608','#89b5c12c');rect(192,81,244,350,106,'#2c53611b','#8eb9c652');
      line([[195,410],[180,460],[448,460],[432,410]],'#739aaa43');line([[172,468],[457,468]],'#93b8c82b');
      const hot=mode==='smr'?'#eaa276':'#eda66d';
      const path=u=>{const t=(u%1)*Math.PI*2;return[321-58*Math.sin(t),267+137*Math.cos(t),t]};
      // Circulation paths trace a continuous loop around the heat source and sink.
      for(let strand=-3;strand<=3;strand++){
        ctx.beginPath();for(let j=0;j<=120;j++){const[x,y]=path(j/120);j?ctx.lineTo(x+strand*4,y):ctx.moveTo(x+strand*4,y)}ctx.strokeStyle='#6c9eaf27';ctx.lineWidth=.7;ctx.stroke();
        for(let j=0;j<25;j++){
          const[x,y,t]=path((j/25+phase+strand*.013)%1);ctx.beginPath();ctx.arc(x+strand*4,y,1.1+(strand===0?.5:0),0,Math.PI*2);ctx.fillStyle=Math.sin(t)>0?hot:'#59cfd2';ctx.globalAlpha=.25+.5*(1-Math.abs(strand)/5);ctx.fill();ctx.globalAlpha=1;
        }
      }
      const coreGlow=ctx.createRadialGradient(265,327,5,265,327,90);coreGlow.addColorStop(0,'#eaa06e25');coreGlow.addColorStop(1,'#eaa06e00');ctx.fillStyle=coreGlow;ctx.fillRect(165,227,200,200);
      rect(241,282,48,91,10,'#172f3b',hot+'99');
      for(let i=0;i<5;i++){const grad=ctx.createLinearGradient(0,285,0,370);grad.addColorStop(0,'#f1b07144');grad.addColorStop(.65,hot);grad.addColorStop(1,'#f1b07144');rect(248+i*8,292,3,70,1,grad)}
      rect(354,175,48,104,9,'#12333e','#5ed7d399');for(let j=0;j<7;j++)line([[361,184+j*12],[394,191+j*12]],'#63d5d4b3',1.3);
      line([[402,190],[493,190],[493,105]],'#63d5d459',2);line([[402,260],[523,260],[523,105]],'#63d5d43a',2);rect(474,72,68,32,5,'#24505b55','#61c2cd66');for(let i=0;i<8;i++)line([[480+i*8,78],[480+i*8,96]],'#6ac7cd40');
      if(mode==='msr'){
        line([[206,393],[265,393],[265,367]],'#6cceca70',1.5);
        for(let i=0;i<11;i++){const k=(i/11+phase*2)%1;ctx.beginPath();ctx.arc(265+Math.sin(i*12)*8,370-k*85,1.5+(i%3)*.4,0,Math.PI*2);ctx.strokeStyle='#88e7e7b0';ctx.lineWidth=.8;ctx.stroke()}
        text('He INJECTION',115,407,9,'#7ed3d4');
      }
      line([[240,323],[145,323],[123,309]],'#bda89266');text(mode==='smr'?'REACTOR CORE':'FUEL-SALT CORE',65,299,10,'#c7d5de');text('Heat generation',65,315,8,'#819daa');
      line([[403,227],[464,227],[478,214]],'#69b4bd66');text('HEAT EXCHANGER',465,292,9,'#b0d5dd');text('PASSIVE HEAT SINK',508,57,9,'#96bfcc','center');
      text('HOT LEG',229,218,8,'#c89b7b','right');text('COLD LEG',414,345,8,'#6ab7c4');line([[194,96],[144,72],[94,72]],'#86aabc52');text('CONTAINMENT',64,62,8,'#6d98ac');text(mode==='smr'?'SMALL MODULAR REACTOR':'MOLTEN SALT REACTOR',321,493,9,'#749bad','center');
      line([[254,245],[265,231],[276,245]],hot+'99',1.3);line([[366,313],[377,327],[388,313]],'#57c9cd99',1.3);
    } else last=time;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
