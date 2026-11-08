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
  let paused = reducedMotion.matches, active = true, phase = 0, last = 0;
  const pauseButton = $('#motion-toggle');
  function syncMotion() { pauseButton.textContent = paused ? 'Play animation' : 'Pause animation'; pauseButton.setAttribute('aria-pressed',paused); }
  syncMotion(); pauseButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reducedMotion.addEventListener('change', e => { paused = e.matches; syncMotion(); });
  canvas.setAttribute('aria-label','ATHENA PMFR conceptual cutaway: fuel salt heats in the lower core, rises through the central riser, then flows downward through the helical-coil heat exchangers surrounding the outer downcomers before returning to the core. Helium bubbles rise to the upper separator and off-gas system.');
  new IntersectionObserver(entries => { active = entries[0].isIntersecting; }).observe(canvas);
  function line(points,color,width=1) {ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));ctx.stroke();}
  function text(str,x,y,size=10,color='#83a8ba',align='left') {ctx.font=`${size}px Lato,Arial,sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(str,x,y);}
  function rect(x,y,w,h,r,fill,stroke) {ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
  // PMFR layout follows the lab's reactor-design-pmfr-1.png. Streamlines are
  // illustrative: central upflow, cooling through the coils in the downcomers.
  const pmfrDowncomerOffset = 77, pmfrCoilTop = 153, pmfrCoilBottom = 311;
  // Cache arc-length samples so particles move continuously through every bend.
  function pmfrLoop(side, lane) {
    const cx = 320 + lane * 5, outer = 320 + side * (pmfrDowncomerOffset + lane * 5);
    const segments = [
      [[cx,414],[cx,340],[cx,202],[cx,131]],
      [[cx,131],[cx,105],[outer,105],[outer,143]],
      [[outer,143],[outer,205],[outer,334],[outer,394]],
      [[outer,394],[outer,429],[cx,446],[cx,414]],
    ];
    const points = []; let length = 0;
    segments.forEach(segment => {
      for (let i = 0; i <= 48; i++) {
        const t = i / 48, s = 1 - t;
        const x = s*s*s*segment[0][0] + 3*s*s*t*segment[1][0] + 3*s*t*t*segment[2][0] + t*t*t*segment[3][0];
        const y = s*s*s*segment[0][1] + 3*s*s*t*segment[1][1] + 3*s*t*t*segment[2][1] + t*t*t*segment[3][1];
        const previous = points[points.length - 1];
        if (previous) length += Math.hypot(x - previous.x, y - previous.y);
        points.push({x,y,length});
      }
    });
    return {points, length, side, lane};
  }
  const pmfrLoops = [-1,1].flatMap(side => [-1,0,1].map(lane => pmfrLoop(side,lane)));
  function flowPoint(loop, progress) {
    const distance = ((progress % 1 + 1) % 1) * loop.length;
    let lo = 0, hi = loop.points.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (loop.points[mid].length < distance) lo = mid + 1; else hi = mid; }
    const b = loop.points[lo], a = loop.points[Math.max(0,lo - 1)];
    const t = (distance - a.length) / (b.length - a.length || 1);
    return [a.x + (b.x - a.x)*t, a.y + (b.y - a.y)*t];
  }
  function arrow(x,y,direction,color) {
    line([[x-5,y-direction*5],[x,y+direction*3],[x+5,y-direction*5]],color,1.5);
  }
  function drawPMFRHeatExchangers(front) {
    for(const side of [-1,1]) {
      // The downflow and coil bank share a centerline, so all return streams
      // pass through the exchanger envelope instead of bypassing it outside.
      const center=320+side*pmfrDowncomerOffset;
      if(!front)rect(center-18,pmfrCoilTop,36,pmfrCoilBottom-pmfrCoilTop,8,'#122e3770','#80c2c124');
      const coil=ctx.createLinearGradient(center-17,0,center+17,0);
      coil.addColorStop(0,'#8a784e');coil.addColorStop(.35,'#e5c991');coil.addColorStop(1,'#9eab87');
      for(let turn=0;turn<13;turn++) {
        ctx.beginPath();
        for(let step=0;step<=24;step++) {
          const angle=(turn*2+(front?0:1)+step/24)*Math.PI;
          const x=center+17*Math.cos(angle), y=155+angle/(2*Math.PI)*11.5+4*Math.sin(angle);
          step?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }
        ctx.strokeStyle=front?coil:'#709d9b60';ctx.lineWidth=front?2.6:1.7;ctx.stroke();
      }
      if(front) {
        line([[center-11,155],[center-11,101],[center-4,101],[center-4,57]],'#74d9d7a6',2);
        line([[center+11,307],[center+11,98],[center+4,98],[center+4,57]],'#cba97b66',1.5);
      }
    }
  }
  function drawPMFR() {
    const hot = '#f2ad78', cold = '#65d8d4', gold = '#d9bc7e';
    // Metal containment and the reactor vessel, shown as a transparent cutaway.
    const metal = ctx.createLinearGradient(205,0,435,0);
    metal.addColorStop(0,'#8bb6c51c'); metal.addColorStop(.3,'#4568750c');
    metal.addColorStop(.75,'#6e9ba10b'); metal.addColorStop(1,'#a3c8ce25');
    rect(205,57,230,396,[27,27,19,19],metal,'#9cbfc766');
    rect(219,87,202,351,[13,13,20,20],'#102c38a6','#93bec84d');
    line([[205,81],[435,81]],'#a4c7cc66',2);
    line([[210,446],[198,466],[442,466],[430,446]],'#7a9eaf55');
    line([[190,473],[450,473]],'#86b3c32e');
    // Inert salt around the primary vessel.
    rect(210,99,7,325,3,'#74a9ab19'); rect(423,99,7,325,3,'#74a9ab19');
    text('INERT SALT',427,278,7,'#739ba7','center');
    ctx.save();
    ctx.beginPath(); ctx.roundRect(222,95,196,340,18); ctx.clip();
    const salt = ctx.createLinearGradient(0,117,0,424);
    salt.addColorStop(0,'#ecaa7422'); salt.addColorStop(.5,'#69c8c00d'); salt.addColorStop(1,'#65d8d41a');
    ctx.fillStyle=salt; ctx.fillRect(222,95,196,340);
    // Lower liquid-fuel core tapers into a long central riser.
    const coreGlow=ctx.createRadialGradient(320,388,5,320,388,73);
    coreGlow.addColorStop(0,'#f5a26742');coreGlow.addColorStop(1,'#f5a26700');
    ctx.fillStyle=coreGlow;ctx.fillRect(240,313,160,125);
    const coreFill=ctx.createLinearGradient(0,351,0,422);
    coreFill.addColorStop(0,'#f7b37c30');coreFill.addColorStop(1,'#d37e4914');
    ctx.beginPath();ctx.moveTo(301,145);ctx.lineTo(301,332);ctx.lineTo(280,354);
    ctx.lineTo(280,418);ctx.quadraticCurveTo(320,432,360,418);
    ctx.lineTo(360,354);ctx.lineTo(339,332);ctx.lineTo(339,145);
    ctx.fillStyle=coreFill;ctx.fill();ctx.strokeStyle='#efb48585';ctx.lineWidth=1.2;ctx.stroke();
    // Perforated inlet distributor below the core, rather than solid fuel rods.
    line([[284,416],[356,416]],'#c2bec599',2);
    for(let x=289;x<356;x+=10)rect(x,414,3,4,1,'#17313c');
    for(const x of [267,365]){
      rect(x,358,8,58,3,'#1e3542','#9db1bc69');
      rect(x+2,363,3,45,1,gold+'a6');
    }
    // Rear coil turns sit behind the descending fuel salt; front turns are
    // drawn afterward to show the flow passing through each helical bank.
    drawPMFRHeatExchangers(false);
    // Both return paths join the same liquid-fuel core at the bottom.
    for (const loop of pmfrLoops) {
      line(loop.points.map(p => [p.x,p.y]),'#99c5c122',.8);
      for(let i=0;i<29;i++) {
        const [x,y]=flowPoint(loop,i/29+phase*.78+loop.lane*.009);
        const cooling=Math.abs(x-320)>42 ? Math.max(0,Math.min(1,(y-pmfrCoilTop)/(pmfrCoilBottom-pmfrCoilTop))) : (y>402 ? .5 : 0);
        const rgb=[242,173,120].map((v,j)=>Math.round(v+([101,216,212][j]-v)*cooling));
        ctx.beginPath();ctx.arc(x,y,loop.lane===0?1.8:1.2,0,Math.PI*2);
        ctx.fillStyle=`rgba(${rgb.join(',')},${loop.lane===0?.85:.42})`;ctx.fill();
      }
    }
    drawPMFRHeatExchangers(true);
    // Helium bubbles rise from the sparger through the core and central riser.
    for(let i=0;i<20;i++) {
      const k=(i/20+phase*1.65)%1, y=420-k*305;
      const x=320+Math.sin(i*9.7+k*7)*(y>350?17:10);
      ctx.beginPath();ctx.arc(x,y,1.6+(i%3)*.55,0,Math.PI*2);
      ctx.strokeStyle='#b3efefb3';ctx.lineWidth=.85;ctx.stroke();
    }
    ctx.restore();
    arrow(320,227,-1,hot);arrow(320,287,-1,hot);
    arrow(320-pmfrDowncomerOffset,252,1,cold);arrow(320+pmfrDowncomerOffset,342,1,cold);
    // Separator and off-gas piping at the top of the vessel.
    rect(294,93,52,17,5,'#2c5554','#84c7ba88');
    for(const x of [235,387])rect(x,65,18,29,4,'#326759b3','#79bba566');
    line([[320,94],[320,43],[447,43]],'#8bceba99',1.7);
    for(let i=0;i<5;i++){
      const k=(i/5+phase*1.5)%1;
      const x=k<.3?320:320+(k-.3)/.7*118, y=k<.3?91-k/.3*48:43;
      ctx.beginPath();ctx.arc(x,y,1.8,0,Math.PI*2);ctx.fillStyle='#a8e5d6b3';ctx.fill();
    }
    text('OFF-GAS SYSTEM',457,46,9,'#9ed0c6');
    // Two secondary-side connections, with no external primary pump or loop.
    line([[320-pmfrDowncomerOffset-4,57],[320-pmfrDowncomerOffset-4,28],[294,28]],'#74d9d78c',1.5);
    line([[320+pmfrDowncomerOffset+4,57],[320+pmfrDowncomerOffset+4,28],[346,28]],'#cba97b8c',1.5);
    text('SECONDARY SYSTEM',320,18,8,'#9fbdc9','center');
    line([[320,439],[320,458],[126,458]],'#9ce0dd8c',1.6);
    line([[297,425],[343,425]],'#a7e8e4b3',1.7);
    line([[320,439],[320,425]],'#a7e8e4b3',1.7);
    // Callouts stay outside the vessel to keep the cutaway legible.
    line([[205,81],[173,65],[81,65]],'#86aabc66');
    text('METAL CONTAINMENT',64,55,9,'#97b4c3');
    line([[294,101],[170,101],[155,113]],'#84c7ba66');
    text('GAS SEPARATOR',64,128,9,'#97c5bf');
    line([[301,225],[174,225],[159,213]],'#d7b18e66');
    text('CENTRAL RISER',64,195,10,'#d0c3b1');text('Heated fuel salt rises',64,210,8,'#8ba4b2');
    line([[280,383],[164,383],[150,369]],'#d7b18e66');
    text('LIQUID-FUEL CORE',64,348,10,'#e3bf9e');text('Heat generation',64,363,8,'#8ba4b2');
    text('He INJECTION',64,449,9,'#a5dcd7');
    line([[320+pmfrDowncomerOffset+17,200],[462,200],[477,184]],'#d9bc7e88');
    text('HELICAL-COIL',455,157,10,'#dbc59f');text('HEAT EXCHANGER',455,171,10,'#dbc59f');
    text('Heat to secondary salt',455,186,8,'#8ba4b2');
    line([[398,348],[458,348],[473,335]],'#65d8d477');
    text('DOWNCOMER',461,311,10,'#a7d7d7');text('Downflow through coil bank',461,326,8,'#8ba4b2');
    text('PMFR',320,494,13,'#c1d8df','center');
    text('PASSIVE MOLTEN SALT FAST REACTOR',320,510,8,'#749bad','center');
  }
  function draw(time) {
    if (active) {
      const delta=Math.min(time-last||16,50);if(!paused)phase+=delta*.000025;last=time;
      const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.round(box.width*dpr),h=Math.round(box.height*dpr);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      ctx.setTransform(w/640,0,0,h/530,0,0);ctx.clearRect(0,0,640,530);
      const glow=ctx.createRadialGradient(330,268,10,330,268,240);glow.addColorStop(0,'#1a758022');glow.addColorStop(1,'#1a758000');ctx.fillStyle=glow;ctx.fillRect(0,0,640,530);
      for(let x=60;x<590;x+=24)for(let y=25;y<500;y+=24){ctx.fillStyle='#8bc6d011';ctx.fillRect(x,y,1,1)}
      ctx.setLineDash([4,7]);line([[324,40],[324,475]],'#8ac3d516');line([[70,270],[580,270]],'#8ac3d516');ctx.setLineDash([]);
      drawPMFR();
    } else last=time;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
