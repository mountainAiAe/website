/* Mountain AI: 3D mountain background, scroll reveal and card tilt for every page. */
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function ready(f){document.readyState!=='loading'?f():document.addEventListener('DOMContentLoaded',f)}
ready(function(){
 // reveal on scroll
 if(!reduce&&'IntersectionObserver' in window){
  var els=document.querySelectorAll('.card,section h2,.steps li,details,.links a,.res>div,.w>h2,.w>p.lead');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var el=e.target;el.classList.add('in');io.unobserve(el);setTimeout(function(){el.classList.remove('rv','in');el.style.transitionDelay=''},1100)}})},{rootMargin:'0px 0px -8% 0px'});
  [].forEach.call(els,function(el,i){var r=el.getBoundingClientRect();if(r.top<innerHeight)return;el.classList.add('rv');el.style.transitionDelay=(i%4)*70+'ms';io.observe(el)});
 }
 // gentle 3D tilt on cards (pointer devices only)
 if(!reduce&&matchMedia('(hover:hover)').matches){
  [].forEach.call(document.querySelectorAll('.card'),function(c){
   c.addEventListener('pointermove',function(e){var b=c.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;c.style.transform='perspective(900px) rotateY('+(x*6)+'deg) rotateX('+(-y*6)+'deg) translateY(-3px)'});
   c.addEventListener('pointerleave',function(){c.style.transform=''});
  });
 }
 // 3D terrain
 if(!window.THREE)return;
 var c=document.createElement('canvas');c.id='mbg';c.setAttribute('aria-hidden','true');document.body.insertBefore(c,document.body.firstChild);
 var r;try{r=new THREE.WebGLRenderer({canvas:c,antialias:true,alpha:true})}catch(e){c.remove();return}
 r.setPixelRatio(Math.min(devicePixelRatio,1.5));
 var scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x2b2350,0.02);
 var cam=new THREE.PerspectiveCamera(50,1,0.1,400);cam.position.set(0,18,62);
 function h2(x,y){var s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s)}
 function noise(x,y){var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  var a=h2(xi,yi),b=h2(xi+1,yi),c2=h2(xi,yi+1),d=h2(xi+1,yi+1);return a+(b-a)*u+(c2-a)*v+(a-b-c2+d)*u*v}
 function fbm(x,y){var t=0,a=1,f=1,n=0;for(var o=0;o<5;o++){t+=a*noise(x*f,y*f);n+=a;a*=.5;f*=2.03}return t/n}
 var seedX=(location.pathname.length*13)%40;
 function height(x,z){var d=Math.sqrt(x*x+(z+10)*(z+10));var ridge=1-Math.abs(fbm(x*.035+7+seedX,z*.035+3)*2-1);
  return Math.pow(ridge,2.2)*22*Math.max(0,1-d/90)+fbm(x*.08,z*.08)*5-4}
 var W=150,S=window.innerWidth<700?80:120,g=new THREE.PlaneGeometry(W,W,S,S);g.rotateX(-Math.PI/2);
 var p=g.attributes.position,cols=[],cLow=new THREE.Color(0x1d2540),cMid=new THREE.Color(0x5a4a6e),cHigh=new THREE.Color(0xc9a27e),cSnow=new THREE.Color(0xf3e3d0),tmp=new THREE.Color();
 for(var k=0;k<p.count;k++){var x=p.getX(k),z=p.getZ(k),y=height(x,z);p.setY(k,y);var t=(y+4)/26;
  if(t<.35)tmp.copy(cLow).lerp(cMid,t/.35);else if(t<.75)tmp.copy(cMid).lerp(cHigh,(t-.35)/.4);else tmp.copy(cHigh).lerp(cSnow,Math.min(1,(t-.75)/.25));cols.push(tmp.r,tmp.g,tmp.b)}
 g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();
 scene.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:.05})));
 scene.add(new THREE.HemisphereLight(0x8f7cc8,0x10131f,.55));
 var sun=new THREE.DirectionalLight(0xffb36b,1.6);sun.position.set(-60,22,-40);scene.add(sun);
 var rim=new THREE.DirectionalLight(0x6fd6e8,.35);rim.position.set(50,30,40);scene.add(rim);
 var sunMesh=new THREE.Mesh(new THREE.CircleGeometry(9,48),new THREE.MeshBasicMaterial({color:0xffc890,transparent:true,opacity:.85,fog:false}));sunMesh.position.set(-38,12,-120);scene.add(sunMesh);
 var cv=document.createElement('canvas');cv.width=cv.height=64;var cx=cv.getContext('2d'),gr=cx.createRadialGradient(32,32,0,32,32,32);
 gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(160,240,250,.8)');gr.addColorStop(1,'rgba(111,214,232,0)');cx.fillStyle=gr;cx.fillRect(0,0,64,64);
 var N=reduce?0:(innerWidth<700?110:200),pg=new THREE.BufferGeometry(),pp=new Float32Array(N*3),seeds=[];
 for(var n=0;n<N;n++)seeds.push({a:Math.random()*Math.PI*2,r:20+Math.random()*50,s:.15+Math.random()*.35,t:Math.random()});
 pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
 scene.add(new THREE.Points(pg,new THREE.PointsMaterial({map:new THREE.CanvasTexture(cv),color:0x8fe8f5,size:1.3,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})));
 var beacon=new THREE.PointLight(0x6fd6e8,2.2,40),peakY=height(0,-10)+2;beacon.position.set(0,peakY,-10);scene.add(beacon);
 function size(){var w=innerWidth,h=innerHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
 size();addEventListener('resize',size);
 var mx=0,my=0;addEventListener('pointermove',function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
 var t0=performance.now(),far=innerWidth<700?84:62;
 function frame(now){requestAnimationFrame(frame);if(document.hidden)return;var t=(now-t0)/1000;
  var sc=Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight));
  cam.position.x+=((Math.sin(t*.05)*8+mx*10)-cam.position.x)*.03;
  cam.position.y+=((18+sc*14-my*6)-cam.position.y)*.03;
  cam.position.z+=((far-sc*18)-cam.position.z)*.03;cam.lookAt(0,5-sc*4,-10);
  for(var n=0;n<N;n++){var s=seeds[n];s.t+=s.s*.006;if(s.t>1){s.t=0;s.a=Math.random()*Math.PI*2;s.r=20+Math.random()*50}
   var rr=s.r*(1-s.t),x=Math.cos(s.a+s.t*1.2)*rr,z=-10+Math.sin(s.a+s.t*1.2)*rr;pp[n*3]=x;pp[n*3+1]=height(x,z)+.8+s.t*2;pp[n*3+2]=z}
  pg.attributes.position.needsUpdate=true;beacon.intensity=1.8+Math.sin(t*2)*.6;r.render(scene,cam)}
 if(reduce)r.render(scene,cam);else requestAnimationFrame(frame);
});
})();
