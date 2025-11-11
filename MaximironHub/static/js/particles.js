(function(){
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const particles = [];
  const PTR = {x: -9999, y: -9999};

  function rand(min,max){return Math.random()*(max-min)+min;}
  function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e)=>{ PTR.x=e.clientX; PTR.y=e.clientY; });
  window.addEventListener('touchmove', (e)=>{ if(e.touches[0]){ PTR.x=e.touches[0].clientX; PTR.y=e.touches[0].clientY; }},{passive:true});
  window.addEventListener('touchend', ()=>{ PTR.x=-9999; PTR.y=-9999; });

  for(let i=0;i<220;i++){
    particles.push({x:rand(0,w),y:rand(0,h),vx:rand(-0.2,0.2),vy:rand(-0.2,0.2),r:rand(0.6,1.6),alpha:rand(0.03,0.12)});
  }

  function tick(){
    ctx.clearRect(0,0,w,h);
    // draw connections and particles
    for(let p of particles){
      // move slowly
      p.x += p.vx; p.y += p.vy;
      // attract to pointer lightly
      const dx = PTR.x - p.x; const dy = PTR.y - p.y;
      const d2 = dx*dx+dy*dy;
      if(d2 < 36000 && PTR.x>-9000){
        const f = 0.00002 * (220 - Math.sqrt(d2)); // stronger pull
        p.vx += dx * f; p.vy += dy * f;
      }
      // wrap around
      if(p.x < -20) p.x = w+20; if(p.x > w+20) p.x = -20;
      if(p.y < -20) p.y = h+20; if(p.y > h+20) p.y = -20;
    }
    // draw lines
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a=particles[i], b=particles[j];
        const dx=a.x-b.x, dy=a.y-b.y, d2=dx*dx+dy*dy;
        if(d2<14000){
          const alpha = 0.22*(1 - d2/14000);
          ctx.strokeStyle = `rgba(34,198,255,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    // draw particles
    for(let p of particles){
      ctx.fillStyle = `rgba(15,230,230,${p.alpha})`;
      ctx.shadowColor='rgba(34,198,255,0.18)';
      let spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy); ctx.shadowBlur = 6 + spd*80; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
})();
window.addEventListener('click', e=>{
  particles.forEach(p=>{
    let dx=p.x-e.clientX, dy=p.y-e.clientY;
    let d=Math.max(12, Math.sqrt(dx*dx+dy*dy));
    p.vx += (dx/d)*3;
    p.vy += (dy/d)*3;
  });
});
