/* Safe Chart wrapper: skip when canvas is absent on this page */
(function(){
  if (window.__chartWrapped) return;
  window.__chartWrapped = true;
  var Native = window.Chart;
  function Wrapped(ctx, cfg){
    if (!ctx) return { destroy:function(){}, update:function(){}, resize:function(){} };
    return new Native(ctx, cfg);
  }
  Wrapped.prototype = Native.prototype;
  for (var k in Native){ if (Object.prototype.hasOwnProperty.call(Native,k)){ try{ Wrapped[k]=Native[k]; }catch(e){} } }
  window.Chart = Wrapped;
})();

function __initAllCharts(){
(function(){
  /*
    COLOR SYSTEM
    C1 (OPC)  → yellow:  #C9A800 (single)
    Raw clays → dark red: light #A32D2D · mid #7C1F1F · dark #501313
    K1 series → green:   light #97C459 · mid #3B6D11 · dark #173404
    K4 series → orange:  light #FAC775 · mid #BA7517 · dark #633806
    K5 series → blue:    light #85B7EB · mid #185FA5 · dark #042C53
  */
  const colorMap = {
    'C1-1': '#C9A800', 'C1-2': '#C9A800', 'C1-3': '#C9A800',
    'K10':  '#A32D2D', 'K40':  '#7C1F1F', 'K50':  '#501313',
    'K16':  '#97C459', 'K17':  '#3B6D11', 'K18':  '#173404',
    'K46':  '#FAC775', 'K47':  '#BA7517', 'K48':  '#633806',
    'K56':  '#85B7EB', 'K57':  '#185FA5', 'K58':  '#042C53'
  };

  const dashMap = {
    'C1-1':[],'C1-2':[5,3],'C1-3':[2,2],
    'K10':[],'K40':[5,3],'K50':[2,2],
    'K16':[],'K17':[5,3],'K18':[2,2],
    'K46':[],'K47':[5,3],'K48':[2,2],
    'K56':[],'K57':[5,3],'K58':[2,2]
  };

  /* ---- SULFATE DATA ---- */
  const saDays = [0,7,14,21,28,35,42,49,56];
  const saData = {
    'C1-1': [0.0000,0.0017,0.0031,0.0039,0.0048,null,null,null,null],
    'C1-2': [0.0000,0.0017,0.0031,0.0040,0.0049,null,null,null,null],
    'C1-3': [0.0000,0.0019,0.0033,0.0041,0.0051,null,null,null,null],
    'K16':  [0.0000,0.0014,0.0016,0.0031,0.0020,0.0029,0.0028,0.0034,null],
    'K17':  [0.0000,0.0016,0.0019,0.0034,0.0019,0.0029,0.0028,0.0032,null],
    'K18':  [0.0000,0.0023,0.0020,0.0027,0.0019,0.0027,0.0025,0.0030,null],
    'K46':  [0.0000,0.0017,0.0026,0.0033,0.0031,0.0044,0.0045,0.0048,null],
    'K47':  [0.0000,0.0012,0.0023,0.0030,0.0028,0.0039,0.0040,0.0048,null],
    'K48':  [0.0000,0.0011,0.0021,0.0028,0.0023,0.0033,0.0032,0.0036,null],
    'K56':  [0.0000,0.0008,0.0023,0.0024,0.0022,0.0034,0.0036,0.0003,null],
    'K57':  [0.0000,0.0010,0.0014,0.0019,0.0014,0.0025,0.0025,0.0031,null],
    'K58':  [0.0000,0.0004,0.0023,0.0018,0.0014,0.0026,0.0025,0.0029,null],
    'K10':  [0.0000,0.0036,0.0062,0.0102,0.0149,0.0229,null,null,null],
    'K40':  [0.0000,0.0032,0.0059,0.0095,0.0129,0.0183,null,null,null],
    'K50':  [0.0000,0.0042,0.0072,0.0119,0.0157,0.0265,null,null,null]
  };

  const saBaseOptions = (yMax) => ({
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'nearest', intersect: false },
    plugins: {
      legend: { display: true, position: 'top',
        labels: { font: { size: 11, family: '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif' }, boxWidth: 14, padding: 8, color: '#6b5440' } },
      tooltip: {
        backgroundColor: '#fffdf8', titleColor: '#3d2a1a', bodyColor: '#3d2a1a',
        borderColor: 'rgba(61,42,26,0.2)', borderWidth: 1, padding: 10,
        callbacks: {
          title: (i) => 'Day ' + i[0].label,
          label: (c) => c.dataset.label + ': ' + (c.parsed.y === null ? 'n/a' : (c.parsed.y*100).toFixed(2)+'%')
        }
      }
    },
    scales: {
      x: { title:{display:true,text:'Days in sulfate solution',color:'#6b5440',font:{size:11}}, ticks:{color:'#9a8770',font:{size:10}}, grid:{color:'rgba(61,42,26,0.06)'} },
      y: { title:{display:true,text:'Mass change (%)',color:'#6b5440',font:{size:11}}, min:-0.005, max:yMax,
           ticks:{color:'#9a8770',font:{size:10},callback:(v)=>(v*100).toFixed(1)+'%'}, grid:{color:'rgba(61,42,26,0.06)'} }
    }
  });

  const saSeriesFor = (name) => ({
    label: name,
    data: saData[name],
    borderColor: colorMap[name],
    backgroundColor: colorMap[name],
    borderWidth: 2,
    borderDash: dashMap[name] || [],
    pointRadius: 3, pointHoverRadius: 5,
    tension: 0.15, spanGaps: false
  });

  new Chart(document.getElementById('sa-all'), {
    type: 'line',
    data: { labels: saDays, datasets: Object.keys(saData).map(saSeriesFor) },
    options: (function(){ const o=saBaseOptions(undefined); o.plugins.legend.position='right'; o.plugins.legend.labels.boxWidth=12; o.plugins.legend.labels.padding=5; return o; })()
  });

  [
    ['sa-c1',  ['C1-1','C1-2','C1-3'], 0.025],
    ['sa-k1',  ['K16','K17','K18'],    0.025],
    ['sa-k4',  ['K46','K47','K48'],    0.025],
    ['sa-k5',  ['K56','K57','K58'],    0.025],
    ['sa-raw', ['K10','K40','K50'],    0.030]
  ].forEach(([cid,samples,yMax]) => {
    new Chart(document.getElementById(cid), {
      type: 'line',
      data: { labels: saDays, datasets: samples.map(saSeriesFor) },
      options: saBaseOptions(yMax)
    });
  });

  /* ---- WATER ABSORPTION DATA ---- */
  const waLabels = ['C1','K10','K40','K50','K16','K17','K18','K46','K47','K48','K56','K57','K58'];
  const waColors = [
    '#C9A800',
    '#A32D2D','#7C1F1F','#501313',
    '#97C459','#3B6D11','#173404',
    '#FAC775','#BA7517','#633806',
    '#85B7EB','#185FA5','#042C53'
  ];
  const wa28 = [5.30,11.14,12.54,12.78,5.83,5.87,6.64,7.10,6.72,7.30,5.17,4.87,5.12];
  const wa90 = [null, 6.50, 7.40, 7.47,4.34,4.34,4.42,5.24,4.83,4.75,5.04,4.84,4.81];

  const waBaseOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fffdf8', titleColor: '#3d2a1a', bodyColor: '#3d2a1a',
        borderColor: 'rgba(61,42,26,0.2)', borderWidth: 1, padding: 10,
        callbacks: { label: (c) => c.dataset.label+': '+(c.parsed.y!==null?c.parsed.y.toFixed(2)+'%':'pending') }
      }
    },
    scales: {
      x: { ticks:{color:'#9a8770',font:{size:10},autoSkip:false,maxRotation:0}, grid:{color:'rgba(61,42,26,0.06)'} },
      y: { title:{display:true,text:'Absorption (%)',color:'#6b5440',font:{size:11}}, min:0, max:15,
           ticks:{color:'#9a8770',font:{size:10},callback:(v)=>v.toFixed(0)+'%'}, grid:{color:'rgba(61,42,26,0.06)'} }
    }
  };

  new Chart(document.getElementById('wa-all'), {
    type: 'bar',
    data: {
      labels: waLabels,
      datasets: [
        { label:'28 days', data:wa28, backgroundColor:waColors, borderColor:waColors, borderWidth:1, borderRadius:3 },
        { label:'90 days', data:wa90, backgroundColor:waColors.map(c=>c+'88'), borderColor:waColors, borderWidth:1, borderRadius:3 }
      ]
    },
    options: { ...waBaseOpts, plugins: { ...waBaseOpts.plugins,
      legend:{ display:true, position:'top', labels:{font:{size:11},boxWidth:14,padding:10,color:'#6b5440'} } } }
  });

  [
    ['wa-raw', ['K10','K40','K50'], [11.14,12.54,12.78], [6.50,7.40,7.47]],
    ['wa-k1',  ['K16','K17','K18'], [5.83,5.87,6.64],   [4.34,4.34,4.42]],
    ['wa-k4',  ['K46','K47','K48'], [7.10,6.72,7.30],   [5.24,4.83,4.75]],
    ['wa-k5',  ['K56','K57','K58'], [5.17,4.87,5.12],   [5.04,4.84,4.81]]
  ].forEach(([cid,labels,d28,d90]) => {
    const cols = labels.map(l => colorMap[l]);
    new Chart(document.getElementById(cid), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label:'28 days', data:d28, backgroundColor:cols, borderColor:cols, borderWidth:1, borderRadius:3 },
          { label:'90 days', data:d90, backgroundColor:cols.map(c=>c+'88'), borderColor:cols, borderWidth:1, borderRadius:3 }
        ]
      },
      options: { ...waBaseOpts, plugins: { ...waBaseOpts.plugins,
        legend:{display:true,position:'top',labels:{font:{size:10},boxWidth:12,padding:8,color:'#6b5440'}} },
        scales: { ...waBaseOpts.scales, y:{ ...waBaseOpts.scales.y, max:14 } } }
    });
  });

})();


  /* ---- CAPILLARY SORPTIVITY DATA ---- */

  (function(){
    const capColorMap = {
      'C1':'#C9A800','C2':'#C9A800',
      'K10':'#A32D2D','K40':'#7C1F1F','K50':'#501313',
      'K16':'#97C459','K17':'#3B6D11','K18':'#173404',
      'K46':'#FAC775','K47':'#BA7517','K48':'#633806',
      'K56':'#85B7EB','K57':'#185FA5','K58':'#042C53'
    };

    const capData = [
      { group:'OPC',  sample:'C2',  d28:0.00182, d90:null,    change:null },
      { group:'OPC',  sample:'C1',  d28:0.00148, d90:null,    change:null },
      { group:'Raw',  sample:'K10', d28:0.00343, d90:0.00132, change:-62  },
      { group:'Raw',  sample:'K40', d28:0.00355, d90:0.00164, change:-54  },
      { group:'Raw',  sample:'K50', d28:0.00381, d90:0.00167, change:-56  },
      { group:'K1',   sample:'K16', d28:0.00186, d90:0.00071, change:-62  },
      { group:'K1',   sample:'K17', d28:0.00145, d90:0.00073, change:-50  },
      { group:'K1',   sample:'K18', d28:0.00154, d90:0.00076, change:-51  },
      { group:'K4',   sample:'K46', d28:0.00172, d90:0.00092, change:-47  },
      { group:'K4',   sample:'K47', d28:0.00150, d90:0.00078, change:-48  },
      { group:'K4',   sample:'K48', d28:0.00172, d90:0.00097, change:-44  },
      { group:'K5',   sample:'K56', d28:0.00138, d90:0.00075, change:-46  },
      { group:'K5',   sample:'K57', d28:0.00114, d90:0.00080, change:-30  },
      { group:'K5',   sample:'K58', d28:0.00133, d90:0.00081, change:-39  },
    ];

    const capOpts = (max) => ({
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'#fffdf8',titleColor:'#3d2a1a',bodyColor:'#3d2a1a',
          borderColor:'rgba(61,42,26,0.2)',borderWidth:1,padding:10,
          callbacks:{ label:(c)=>c.dataset.label+': '+(c.parsed.y!==null?c.parsed.y.toFixed(5):'pending') }
        }
      },
      scales:{
        x:{ticks:{color:'#9a8770',font:{size:10},autoSkip:false,maxRotation:0},grid:{color:'rgba(61,42,26,0.06)'}},
        y:{
          title:{display:true,text:'mm / min⁰·⁵',color:'#6b5440',font:{size:11}},
          min:0, max:max||0.0045,
          ticks:{color:'#9a8770',font:{size:10},callback:(v)=>v.toFixed(4)},
          grid:{color:'rgba(61,42,26,0.06)'}
        }
      }
    });

    /* All calcined samples overview */
    const calcined = capData.filter(d => d.d90 !== null);
    const calLabels = calcined.map(d=>d.sample);
    const calCols   = calcined.map(d=>capColorMap[d.sample]);
    new Chart(document.getElementById('cap-all'),{
      type:'bar',
      data:{
        labels:calLabels,
        datasets:[
          {label:'28 days',data:calcined.map(d=>d.d28),backgroundColor:calCols.map(c=>c+'55'),borderColor:calCols,borderWidth:1.5,borderRadius:3},
          {label:'90 days',data:calcined.map(d=>d.d90),backgroundColor:calCols,borderColor:calCols,borderWidth:1,borderRadius:3}
        ]
      },
      options:{...capOpts(0.0045),plugins:{...capOpts().plugins,
        legend:{display:true,position:'top',labels:{font:{size:11},boxWidth:14,padding:10,color:'#6b5440'}}}}
    });

    /* % change horizontal bar */
    const withChange = capData.filter(d=>d.change!==null);
    const chgCols = withChange.map(d=>capColorMap[d.sample]);
    new Chart(document.getElementById('cap-change'),{
      type:'bar',
      data:{
        labels:withChange.map(d=>d.sample),
        datasets:[{
          label:'Change 28→90 days (%)',
          data:withChange.map(d=>d.change),
          backgroundColor:chgCols,
          borderColor:chgCols,
          borderWidth:1, borderRadius:3
        }]
      },
      options:{
        indexAxis:'y',
        responsive:true, maintainAspectRatio:false,
        plugins:{
          legend:{display:false},
          tooltip:{
            backgroundColor:'#fffdf8',titleColor:'#3d2a1a',bodyColor:'#3d2a1a',
            borderColor:'rgba(61,42,26,0.2)',borderWidth:1,padding:10,
            callbacks:{label:(c)=>c.dataset.label+': '+c.parsed.x+'%'}
          }
        },
        scales:{
          x:{
            title:{display:true,text:'% change (28→90 days)',color:'#6b5440',font:{size:11}},
            max:0, min:-70,
            ticks:{color:'#9a8770',font:{size:10},callback:(v)=>v+'%'},
            grid:{color:'rgba(61,42,26,0.06)'}
          },
          y:{ticks:{color:'#9a8770',font:{size:10}},grid:{color:'rgba(61,42,26,0.06)'}}
        }
      }
    });

    /* Per-group mini charts */
    [
      ['cap-raw',['K10','K40','K50']],
      ['cap-k1', ['K16','K17','K18']],
      ['cap-k4', ['K46','K47','K48']],
      ['cap-k5', ['K56','K57','K58']]
    ].forEach(([cid,samples])=>{
      const rows = samples.map(s=>capData.find(d=>d.sample===s));
      const cols = samples.map(s=>capColorMap[s]);
      new Chart(document.getElementById(cid),{
        type:'bar',
        data:{
          labels:samples,
          datasets:[
            {label:'28 days',data:rows.map(r=>r.d28),backgroundColor:cols.map(c=>c+'55'),borderColor:cols,borderWidth:1.5,borderRadius:3},
            {label:'90 days',data:rows.map(r=>r.d90),backgroundColor:cols,borderColor:cols,borderWidth:1,borderRadius:3}
          ]
        },
        options:{...capOpts(0.0045),plugins:{...capOpts().plugins,
          legend:{display:true,position:'top',labels:{font:{size:10},boxWidth:12,padding:8,color:'#6b5440'}}},
          scales:{...capOpts().scales,y:{...capOpts().scales.y,max:0.0045}}}
      });
    });

    /* Data table */
    const tbody = document.getElementById('cap-tbody');
    if(tbody){
    const groupLabels = {OPC:'OPC reference',Raw:'Raw clay blends',K1:'K1 series',K4:'K4 series',K5:'K5 series'};
    const groupColors = {OPC:'#C9A800',Raw:'#A32D2D',K1:'#3B6D11',K4:'#BA7517',K5:'#185FA5'};
    let lastGroup='';
    capData.forEach(row=>{
      if(row.group!==lastGroup){
        const hr=document.createElement('tr');
        hr.innerHTML=`<td colspan="4" style="background:${groupColors[row.group]}18;border-left:3px solid ${groupColors[row.group]};padding:6px 12px;font-size:11px;font-weight:500;color:${groupColors[row.group]};letter-spacing:0.05em;">${groupLabels[row.group]}</td>`;
        tbody.appendChild(hr);
        lastGroup=row.group;
      }
      const tr=document.createElement('tr');
      const chgHtml=row.change!==null
        ?`<span style="color:${groupColors[row.group]};font-weight:500;">${row.change}%</span>`
        :`<span style="color:#9a8770;font-style:italic;">—</span>`;
      tr.innerHTML=`
        <td style="padding:9px 12px;font-weight:500;">${row.sample}</td>
        <td style="padding:9px 12px;text-align:right;font-family:monospace;">${row.d28.toFixed(5)}</td>
        <td style="padding:9px 12px;text-align:right;font-family:monospace;">${row.d90!==null?row.d90.toFixed(5):'<span style=\'color:#9a8770;font-style:italic;\'>pending</span>'}</td>
        <td style="padding:9px 12px;text-align:right;">${chgHtml}</td>`;
      tbody.appendChild(tr);
    });
  }
  })();

  /* ================================================================
     COMPRESSIVE / FLEXURAL TABLES + COMPRESSIVE & FLEXURAL SAI BARS
  ================================================================ */


  (function(){
    const ages = [2, 7, 28, 90];

    const CM = {
      'C1':'#C9A800','C2':'#C9A800',
      'K10':'#A32D2D','K40':'#7C1F1F','K50':'#501313',
      'K16':'#97C459','K17':'#3B6D11','K18':'#173404',
      'K46':'#FAC775','K47':'#BA7517','K48':'#633806',
      'K56':'#85B7EB','K57':'#185FA5','K58':'#042C53'
    };

    const fc = {
      'C1': [24.2, 40.1, 47.7, 52.9],
      'C2': [26.3, 42.8, 49.0, 52.7],
      'K10':[14.4, 23.1, 30.4, 35.2],
      'K16':[15.8, 31.2, 44.8, 49.0],
      'K17':[16.0, 32.9, 44.0, 48.8],
      'K18':[14.2, 27.7, 37.7, 55.6],
      'K40':[11.8, 20.7, 26.1, 30.3],
      'K46':[13.4, 27.2, 37.9, 42.0],
      'K47':[14.1, 28.0, 38.3, 46.9],
      'K48':[13.3, 25.8, 36.9, 48.1],
      'K50':[11.3, 19.5, 24.5, 28.5],
      'K56':[13.3, 27.1, 40.7, 47.8],
      'K57':[13.3, 30.0, 42.0, 47.6],
      'K58':[13.1, 26.4, 40.3, 49.9]
    };
    const fl = {
      'C1': [5.1, 7.9, 9.6, 10.1],
      'C2': [5.6, 7.4, 9.1,  9.2],
      'K10':[4.3, 5.9, 7.3,  6.0],
      'K16':[4.1, 7.0, 9.2,  7.6],
      'K17':[4.2, 6.7, 9.0,  7.5],
      'K18':[3.4, 6.2, 8.0,  8.1],
      'K40':[3.4, 5.4, 6.6,  6.0],
      'K46':[3.3, 5.9, 8.2,  6.9],
      'K47':[3.5, 6.1, 7.9,  7.3],
      'K48':[3.2, 5.8, 7.9,  7.6],
      'K50':[3.3, 5.4, 6.5,  6.2],
      'K56':[4.1, 6.1, 8.0,  6.7],
      'K57':[4.0, 6.0, 8.4,  7.4],
      'K58':[3.9, 6.2, 8.2,  7.7]
    };
    const wc = {
      'C1':0.48,'C2':0.48,
      'K10':0.60,'K16':0.54,'K17':0.53,'K18':0.53,
      'K40':0.63,'K46':0.56,'K47':0.55,'K48':0.55,
      'K50':0.64,'K56':0.57,'K57':0.55,'K58':0.55
    };

    const tableOrder = [
      ['K1', ['K10','K16','K17','K18']],
      ['K4', ['K40','K46','K47','K48']],
      ['K5', ['K50','K56','K57','K58']],
      ['OPC',['C1','C2']]
    ];
    const groupColors = {K1:'#3B6D11',K4:'#BA7517',K5:'#185FA5',OPC:'#C9A800'};

    function buildTable(tbodyId, dataObj, includeWC){
      const tb = document.getElementById(tbodyId);
      if(!tb) return;
      tableOrder.forEach(([gname, samples])=>{
        samples.forEach((s,idx)=>{
          const tr = document.createElement('tr');
          const idCell = idx===0 ? '<td style="font-weight:500;color:'+groupColors[gname]+';">'+gname+'</td>' : '<td></td>';
          const vals = dataObj[s].map(v=>'<td style="text-align:right;font-family:monospace;">'+v.toFixed(1)+'</td>').join('');
          const wcCell = includeWC ? '<td style="text-align:right;font-family:monospace;color:var(--text-secondary);">'+wc[s].toFixed(2)+'</td>' : '';
          tr.innerHTML = idCell + '<td style="font-weight:500;"><span style="color:'+CM[s]+';">'+s+'</span></td>' + vals + wcCell;
          tb.appendChild(tr);
        });
      });
    }

    buildTable('fc-tbody', fc, true);
    buildTable('fl-tbody', fl, false);

    const saiKeys = ['K10','K16','K17','K18','K40','K46','K47','K48','K50','K56','K57','K58'];

    function computeSAI(dataObj){
      const out = {};
      saiKeys.forEach(k=>{ out[k] = dataObj[k].map((v,i)=>Math.round(v / dataObj['C1'][i] * 100)); });
      return out;
    }
    const saiFc = computeSAI(fc);
    const saiFl = computeSAI(fl);

    function saiChart(canvasId, saiObj){
      const ageFills = [0.30, 0.50, 0.75, 1.0];
      const toHexA = (hex,a)=> hex + Math.round(a*255).toString(16).padStart(2,'0');
      const datasets = ages.map((age,ai)=>({
        label: age + ' d',
        data: saiKeys.map(k=>saiObj[k][ai]),
        backgroundColor: saiKeys.map(k=>toHexA(CM[k], ageFills[ai])),
        borderColor: saiKeys.map(k=>CM[k]),
        borderWidth: 1,
        borderRadius: 2,
        categoryPercentage: 0.8,
        barPercentage: 0.92,
        order: 2
      }));
      datasets.push({
        type:'line',
        label:'75% threshold',
        data: saiKeys.map(()=>75),
        borderColor:'#A32D2D',
        backgroundColor:'transparent',
        borderWidth:2.5,
        borderDash:[8,4],
        pointRadius:0,
        tension:0,
        order: 1
      });
      new Chart(document.getElementById(canvasId),{
        type:'bar',
        data:{labels:saiKeys, datasets},
        options:{
          responsive:true, maintainAspectRatio:false,
          plugins:{
            legend:{display:true,position:'top',labels:{font:{size:11},boxWidth:14,padding:8,color:'#6b5440'}},
            tooltip:{backgroundColor:'#fffdf8',titleColor:'#3d2a1a',bodyColor:'#3d2a1a',
              borderColor:'rgba(61,42,26,0.2)',borderWidth:1,padding:10,
              callbacks:{label:(c)=>c.dataset.label+': '+c.parsed.y+'%'}}
          },
          scales:{
            x:{ticks:{color:'#9a8770',font:{size:10},autoSkip:false,maxRotation:0},grid:{color:'rgba(61,42,26,0.06)'}},
            y:{title:{display:true,text:'SAI (%)',color:'#6b5440',font:{size:11}},min:0,max:120,
               ticks:{color:'#9a8770',font:{size:10},callback:(v)=>v+'%'},grid:{color:'rgba(61,42,26,0.06)'}}
          }
        }
      });
    }

    saiChart('sai-fc', saiFc);
    saiChart('sai-fl', saiFl);
  })();
}


/* ---- Collapsible sections: each <section> header toggles its body ---- */
(function(){
  function shortLabel(text){
    // strip caret + trim, cut at em-dash / en-dash for a concise label
    var t = text.replace('\u25B8','').trim();
    var cut = t.split(/\s[\u2014\u2013]\s/)[0];
    return cut.trim();
  }

  function buildSubnav(sections){
    if(!sections.length) return;
    var bar = document.createElement('div');
    bar.className = 'subnav';
    sections.forEach(function(sec){
      var h2 = sec.querySelector('h2');
      if(!h2) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'subnav-btn';
      btn.textContent = shortLabel(h2.textContent);
      btn.addEventListener('click', function(){
        sec.classList.add('open');
        sec.scrollIntoView({behavior:'smooth', block:'start'});
      });
      bar.appendChild(btn);
    });
    var header = document.querySelector('header');
    if(header && header.parentNode){
      header.parentNode.insertBefore(bar, header.nextSibling);
    }
  }

  function setup(){
    var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
    buildSubnav(sections);
    sections.forEach(function(sec){
      var h2 = sec.querySelector('h2');
      if(!h2) return;
      // wrap everything after the h2 into a .section-body container
      var body = document.createElement('div');
      body.className = 'section-body';
      var node = h2.nextSibling;
      while(node){
        var next = node.nextSibling;
        body.appendChild(node);
        node = next;
      }
      sec.appendChild(body);

      // make the h2 a button
      h2.classList.add('section-toggle');
      h2.setAttribute('role','button');
      h2.setAttribute('tabindex','0');
      var caret = document.createElement('span');
      caret.className = 'caret';
      caret.textContent = '▸';
      h2.appendChild(caret);

      // default: open
      sec.classList.add('open');

      function toggle(){
        sec.classList.toggle('open');
      }
      h2.addEventListener('click', toggle);
      h2.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
      });
    });
  }

  function start(){
    setup();
    // build charts AFTER sections are open so canvases have dimensions
    if (typeof __initAllCharts === 'function'){
      try { __initAllCharts(); } catch(e){ console.error(e); }
    }
    // when a section is reopened, charts already exist & resize automatically
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/* ---- Ensure "Performance index" nav link exists on every page ---- */
(function(){
  function injectNav(){
    var nav = document.querySelector('header nav');
    if(!nav) return;
    if(!nav.querySelector('a[href="pps.html"]')){
      var link = document.createElement('a');
      link.href = 'pps.html';
      link.textContent = 'Performance index';
      var conf = nav.querySelector('a[href="conferences.html"]');
      if(conf){ nav.insertBefore(link, conf); } else { nav.appendChild(link); }
    }
    if(location.pathname.split('/').pop() === 'pps.html'){
      nav.querySelectorAll('a').forEach(function(a){ a.classList.remove('active'); });
      var ppsLink = nav.querySelector('a[href="pps.html"]');
      if(ppsLink){ ppsLink.classList.add('active'); }
    }
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectNav);
  } else {
    injectNav();
  }
})();
