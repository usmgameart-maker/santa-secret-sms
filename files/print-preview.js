'use strict';
// Cache screen styles before print media can activate different breakpoints.
// The SVG viewBox scales that layout as a single page without reflowing it.
(() => {
  let pending=0, cached=null;
  const app=document.getElementById('app');
  function remember(){
    if(window.matchMedia('print').matches)return;
    const styles=new Map();
    function visit(node){
      const computed=getComputedStyle(node);
      let css='';
      for(const property of computed)css+=`${property}:${computed.getPropertyValue(property)} !important;`;
      styles.set(node,css);
      if(computed.display!=='none')for(const child of node.children)visit(child);
    }
    visit(app);
    const bounds=app.getBoundingClientRect();
    cached={styles,width:bounds.width,height:bounds.height};
  }
  window.refreshPrintPreview=()=>{
    cancelAnimationFrame(pending);
    pending=requestAnimationFrame(remember);
  };
  window.addEventListener('resize',window.refreshPrintPreview);
  window.addEventListener('load',window.refreshPrintPreview);
  window.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='p')remember();
  });
  window.addEventListener('contextmenu',remember);
  document.addEventListener('load',event=>{
    if(event.target.tagName==='IMG')window.refreshPrintPreview();
  },true);
  document.fonts?.ready.then(window.refreshPrintPreview);
  window.refreshPrintPreview();
  window.addEventListener('beforeprint',()=>{
    if(document.getElementById('diploma-modal').open||!cached)return;
    document.getElementById('screen-print-preview')?.remove();
    const clone=app.cloneNode(true);
    function freeze(original,copy){
      copy.removeAttribute('id');
      copy.removeAttribute('autofocus');
      copy.style.cssText=cached.styles.get(original)||'display:none!important;';
      copy.style.setProperty('animation','none','important');
      copy.style.setProperty('transition','none','important');
      if(original.classList.contains('phone'))copy.style.setProperty('transform','none','important');
      if(original.tagName==='INPUT')copy.value=original.value;
      Array.from(original.children).forEach((child,index)=>freeze(child,copy.children[index]));
    }
    freeze(app,clone);
    clone.style.setProperty('margin','0','important');
    clone.style.setProperty('width',`${cached.width}px`,'important');
    clone.style.setProperty('height',`${cached.height}px`,'important');
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
    svg.id='screen-print-preview';
    svg.setAttribute('viewBox',`0 0 ${cached.width} ${cached.height}`);
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    const content=document.createElementNS(ns,'foreignObject');
    content.setAttribute('width',String(cached.width));
    content.setAttribute('height',String(cached.height));
    content.append(clone);svg.append(content);document.body.append(svg);
    document.body.classList.add('printing-screen-preview');
  });
  window.addEventListener('afterprint',()=>{
    document.getElementById('screen-print-preview')?.remove();
    document.body.classList.remove('printing-screen-preview');
    window.refreshPrintPreview();
  });
})();
