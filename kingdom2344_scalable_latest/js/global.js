/* Kingdom 2344 — Global Royal Archive Cursor */
(function(){
  if(!window.matchMedia || !window.matchMedia("(pointer:fine)").matches) return;

  const dot=document.createElement("div");
  const ring=document.createElement("div");
  dot.className="k2344-cursor-dot";
  ring.className="k2344-cursor-ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let x=-100,y=-100,rx=-100,ry=-100,active=false;

  function move(e){
    x=e.clientX; y=e.clientY;
    if(!active){
      active=true;
      dot.style.opacity="1";
      ring.style.opacity="1";
    }
    dot.style.transform=`translate3d(${x}px,${y}px,0)`;
  }

  function animate(){
    rx+=(x-rx)*0.16;
    ry+=(y-ry)*0.16;
    ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(animate);
  }

  document.addEventListener("mousemove",move,{passive:true});
  document.addEventListener("mouseleave",()=>{
    dot.style.opacity="0";
    ring.style.opacity="0";
  });
  document.addEventListener("mouseenter",()=>{
    if(active){
      dot.style.opacity="1";
      ring.style.opacity="1";
    }
  });
  document.addEventListener("mousedown",()=>ring.classList.add("is-press"));
  document.addEventListener("mouseup",()=>ring.classList.remove("is-press"));

  function bindHover(){
    document.querySelectorAll(
      'a,button,input,select,textarea,[role="button"],.card,.ranking-card,.alliance-card,.nav-link'
    ).forEach(el=>{
      if(el.dataset.k2344CursorBound) return;
      el.dataset.k2344CursorBound="1";
      el.addEventListener("mouseenter",()=>ring.classList.add("is-hover"));
      el.addEventListener("mouseleave",()=>ring.classList.remove("is-hover"));
    });
  }

  bindHover();
  new MutationObserver(bindHover).observe(document.body,{childList:true,subtree:true});
  animate();
})();
