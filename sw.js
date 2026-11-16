const C="mt-v7",A=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith("mt-v")&&x!=C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!="GET"||new URL(e.request.url).origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))))});
/* reminders: the page copies them into the "mt-data" cache; Chrome can wake this worker about once a day to check them */
const P=n=>String(n).padStart(2,"0"),T=()=>{const d=new Date();return d.getFullYear()+"-"+P(d.getMonth()+1)+"-"+P(d.getDate())};
const AD=(s,n)=>{const[y,m,d]=s.split("-").map(Number),x=new Date(y,m-1,d+n);return x.getFullYear()+"-"+P(x.getMonth()+1)+"-"+P(x.getDate())};
async function daily(){const c=await caches.open("mt-data"),r=await c.match("/__rem");if(!r)return;const st=await r.json(),t=T();let ch=0;st.sent=st.sent||{};
 for(const id in st.rem){const q=st.rem[id];if(!q.d||q.d.length!=10)continue;for(const o of q.off){const k=id+":"+o+":"+q.d;
  if(t>=AD(q.d,-o)&&t<=AD(q.d,2)&&!st.sent[k]){st.sent[k]=1;ch=1;await self.registration.showNotification(q.n,{body:o==0?"Out today! 🎬":o==1?"Comes out tomorrow":"Out in "+o+" days ("+q.d+")",tag:k,icon:"icon-192.png",badge:"icon-192.png"})}}}
 if(ch)await c.put("/__rem",new Response(JSON.stringify(st),{headers:{"content-type":"application/json"}}))}
self.addEventListener("periodicsync",e=>{if(e.tag=="mt-daily")e.waitUntil(daily())});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window"}).then(c=>c.length?c[0].focus():self.clients.openWindow("./")))});
