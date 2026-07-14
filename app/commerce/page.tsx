import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viviz Commerce — WhatsApp Sales Platform",
  description:
    "Turn your WhatsApp number into a 24/7 sales engine. AI bot, online storefront, order management, and CRM — all in one platform for small businesses in India.",
  openGraph: {
    title: "Viviz Commerce — Turn WhatsApp into Your Sales Engine",
    description:
      "24/7 AI WhatsApp bot, branded storefront, and full CRM for small businesses in India.",
  },
};

const chatScript = `
(function(){
  var MSGS=[
    {side:'out',text:'Hi \u{1F44B}',delay:600},
    {side:'in',text:'Hello! \u{1F44B} Welcome to <b>Merza Bodi</b> \u{1F96D}\\n\\nFresh tropical fruits from the hills of Bodinayakanur.\\n\\nWhat can we help you with today?',btns:['\u{1F6D2} Order Fruits','\u{1F4E6} My Orders','\u{1F4AC} Merza Team'],delay:1600},
    {side:'out',text:'\u{1F6D2} Order Fruits',delay:3600},
    {side:'in',text:'\u{1F96D} <b>Choose a Category</b>\\n\\nTap a category to browse:',btns:['\u{1F96D} Mangoes','\u{1F34C} Red Banana','\u{1F348} Jackfruit'],delay:4600},
    {side:'out',text:'\u{1F96D} Mangoes',delay:6200},
    {side:'in',text:'<b>Premium Mangoes</b> \u{1F96D}\\n\\n• Imam Pasand: ₹499/box\\n• Alphonso: ₹649/box\\n• Kasa Lattu: ₹399/box',btns:['Order Imam Pasand 1kg','\u{1F3E0} Main Menu'],delay:7200},
    {side:'out',text:'Order Imam Pasand 1kg',delay:9000},
    {side:'in',text:'✅ Great choice!\\n\\n<b>Imam Pasand Mango — 1kg (₹499)</b>\\n\\nPlease reply with your delivery address and preferred date. We\\'ll confirm shortly! \u{1F96D}',delay:9900},
  ];
  var body=document.getElementById('vc-chat');
  if(!body)return;
  var timers=[];
  function now(){return new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
  function makeMsg(m){
    var w=document.createElement('div');w.className='vcm vc-'+m.side;
    var b=document.createElement('div');b.className='vcb';b.innerHTML=m.text.replace(/\\n/g,'<br>');w.appendChild(b);
    if(m.btns){var bw=document.createElement('div');bw.className='vcbs';m.btns.forEach(function(t){var d=document.createElement('div');d.className='vcbt';d.textContent=t;bw.appendChild(d)});w.appendChild(bw)}
    var t=document.createElement('div');t.className='vct';t.textContent=now();w.appendChild(t);
    return w;
  }
  function run(){
    body.innerHTML='';timers.forEach(clearTimeout);timers.length=0;
    MSGS.forEach(function(m){
      var id=setTimeout(function(){
        var el=makeMsg(m);body.appendChild(el);
        requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add('vcshow')})});
        body.scrollTop=body.scrollHeight;
      },m.delay);timers.push(id);
    });
    timers.push(setTimeout(run,MSGS[MSGS.length-1].delay+5000));
  }
  run();
})();
`;

export default function CommercePage() {
  return (
    <>
      {/* Scoped styles — all under #vc to avoid Tailwind conflicts */}
      <style>{`
        #vc{--bg:#05111E;--bg2:#081828;--sf:#0C1F32;--sf2:#112438;--ln:rgba(255,255,255,0.07);--bd:rgba(18,214,138,0.15);--ink:#E8F4FF;--mu:#5F8EAA;--gn:#12D68A;--gs:rgba(18,214,138,0.10);--gg:rgba(18,214,138,0.22);--am:#F59D0B;--r:18px;--rl:26px;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;font-size:16px;line-height:1.6;overflow-x:hidden}
        @media(prefers-color-scheme:light){#vc{--bg:#ECF5FF;--bg2:#E0EEF9;--sf:#FFFFFF;--sf2:#F0F8FF;--ln:rgba(0,0,0,0.07);--bd:rgba(10,160,100,0.22);--ink:#071826;--mu:#3D6A80;--gn:#0BAA6E;--gs:rgba(11,170,110,0.09);--gg:rgba(11,170,110,0.18);--am:#C88000}}
        :root[data-theme="dark"] #vc{--bg:#05111E;--bg2:#081828;--sf:#0C1F32;--sf2:#112438;--ln:rgba(255,255,255,0.07);--bd:rgba(18,214,138,0.15);--ink:#E8F4FF;--mu:#5F8EAA;--gn:#12D68A;--gs:rgba(18,214,138,0.10);--gg:rgba(18,214,138,0.22);--am:#F59D0B}
        :root[data-theme="light"] #vc{--bg:#ECF5FF;--bg2:#E0EEF9;--sf:#FFFFFF;--sf2:#F0F8FF;--ln:rgba(0,0,0,0.07);--bd:rgba(10,160,100,0.22);--ink:#071826;--mu:#3D6A80;--gn:#0BAA6E;--gs:rgba(11,170,110,0.09);--gg:rgba(11,170,110,0.18);--am:#C88000}
        #vc *,#vc *::before,#vc *::after{box-sizing:border-box;margin:0;padding:0}
        #vc a{color:inherit;text-decoration:none}
        #vc h1{font-family:Georgia,Charter,serif;font-weight:700;font-size:clamp(2.2rem,5vw,3.6rem);letter-spacing:-0.025em;line-height:1.1;text-wrap:balance}
        #vc h2{font-family:Georgia,Charter,serif;font-weight:700;font-size:clamp(1.6rem,3.5vw,2.4rem);letter-spacing:-0.02em;line-height:1.15;text-wrap:balance}
        #vc h3{font-size:1rem;font-weight:700;line-height:1.35}
        #vc h4{font-size:0.9rem;font-weight:700}
        #vc .vcw{max-width:1120px;margin:0 auto;padding:0 24px}
        #vc .vcs{padding:88px 0}
        #vc .ey{font-size:0.7rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--gn)}
        #vc .ld{font-size:1.05rem;line-height:1.75;color:var(--mu)}

        /* hero */
        #vc .hero{padding:72px 0 64px;position:relative;overflow:hidden}
        #vc .hero::after{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 55% 80% at 88% 55%,var(--gg),transparent 68%)}
        #vc .hg{display:grid;grid-template-columns:1fr 420px;gap:56px;align-items:center;position:relative;z-index:1}
        #vc .hbadge{display:inline-flex;align-items:center;gap:8px;background:var(--gs);border:1px solid var(--bd);border-radius:50px;padding:5px 14px;margin-bottom:22px}
        #vc .hbadge svg{flex-shrink:0}
        #vc .hbadge span{font-size:0.73rem;font-weight:700;color:var(--gn);letter-spacing:0.04em}
        #vc .hero h1{margin-bottom:18px}
        #vc .hero h1 em{color:var(--gn);font-style:normal}
        #vc .hero .ld{max-width:46ch;margin-bottom:36px}
        #vc .hbtns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:44px}
        #vc .btng{background:var(--gn);color:#031420;font-weight:800;font-size:0.92rem;padding:14px 26px;border-radius:50px;transition:transform .2s,box-shadow .2s;display:inline-block}
        #vc .btng:hover{transform:translateY(-2px);box-shadow:0 14px 36px var(--gg)}
        #vc .btno{border:1.5px solid var(--bd);color:var(--ink);font-weight:600;font-size:0.92rem;padding:13px 22px;border-radius:50px;transition:background .18s;display:inline-block}
        #vc .btno:hover{background:var(--sf)}
        #vc .sr{display:flex;gap:32px;padding-top:36px;border-top:1px solid var(--ln)}
        #vc .sn{font-family:Georgia,serif;font-size:1.55rem;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
        #vc .sl{font-size:0.75rem;color:var(--mu);margin-top:2px}

        /* phone */
        #vc .ph{background:#141414;border-radius:46px;padding:10px;box-shadow:0 0 0 1px rgba(255,255,255,0.09),0 48px 96px rgba(0,0,0,.65),0 0 64px var(--gg);width:290px;margin:0 auto}
        #vc .phs{border-radius:38px;overflow:hidden;background:#0A1628;height:570px;display:flex;flex-direction:column}
        #vc .pst{background:#0A1628;padding:13px 20px 6px;display:flex;justify-content:space-between;font-size:10.5px;color:#aaa;flex-shrink:0}
        #vc .phd{background:#1F2C34;padding:10px 14px;display:flex;align-items:center;gap:11px;flex-shrink:0}
        #vc .pav{width:34px;height:34px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#12D68A,#088C56);display:flex;align-items:center;justify-content:center;font-size:15px}
        #vc .phn{font-size:12.5px;font-weight:600;color:#E8F0F4}
        #vc .phs2{font-size:10.5px;color:#72A0B0;margin-top:1px}
        #vc #vc-chat{flex:1;overflow:hidden;padding:10px 10px 4px;display:flex;flex-direction:column;gap:6px}
        #vc .vcm{opacity:0;transform:translateY(6px)}
        #vc .vcm.vcshow{animation:vcpop .32s ease forwards}
        @keyframes vcpop{to{opacity:1;transform:translateY(0)}}
        @media(prefers-reduced-motion:reduce){#vc .vcm{opacity:0;transform:none}#vc .vcm.vcshow{opacity:1;animation:none}}
        #vc .vc-in{align-self:flex-start;max-width:90%}
        #vc .vc-out{align-self:flex-end;max-width:78%}
        #vc .vc-in .vcb{background:#1F2C34;color:#E0ECF4;padding:7px 11px;border-radius:0 11px 11px 11px;font-size:11.5px;line-height:1.5}
        #vc .vc-out .vcb{background:#005C4B;color:#E0ECF4;padding:7px 11px;border-radius:11px 11px 0 11px;font-size:11.5px;line-height:1.5}
        #vc .vct{font-size:9.5px;color:#6A90A0;margin-top:2px}
        #vc .vc-out .vct{text-align:right}
        #vc .vcbs{display:flex;flex-direction:column;gap:3px;margin-top:4px}
        #vc .vcbt{background:rgba(18,214,138,0.09);border:1px solid rgba(18,214,138,0.22);color:#12D68A;font-size:11px;font-weight:600;padding:6px 10px;border-radius:7px;text-align:center}

        /* proof */
        #vc .proof{background:var(--gn);padding:18px 0}
        #vc .pr{display:flex;justify-content:center;gap:48px;flex-wrap:wrap}
        #vc .ps{text-align:center;color:#031420}
        #vc .pn{font-family:Georgia,serif;font-size:1.85rem;font-weight:700;font-variant-numeric:tabular-nums}
        #vc .pl{font-size:0.75rem;font-weight:600;opacity:.65;margin-top:1px}

        /* sections */
        #vc .bg2{background:var(--bg2)}
        #vc .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
        #vc .g3f{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:52px}
        #vc .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:44px}
        #vc .card{background:var(--sf);border:1px solid var(--ln);border-radius:var(--rl);padding:28px}
        #vc .cardb{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:28px;transition:transform .2s,box-shadow .22s}
        #vc .cardb:hover{transform:translateY(-4px);box-shadow:0 22px 50px rgba(0,0,0,.28)}
        #vc .ci{font-size:1.8rem;margin-bottom:14px}
        #vc .fi{width:46px;height:46px;border-radius:14px;background:var(--gs);display:flex;align-items:center;justify-content:center;font-size:21px;margin-bottom:16px}
        #vc .card h3,#vc .cardb h3{margin-bottom:8px}
        #vc .card p,#vc .cardb p{font-size:0.875rem;color:var(--mu);line-height:1.65}

        /* steps */
        #vc .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:52px;position:relative}
        #vc .steps::before{content:'';position:absolute;top:27px;left:calc(16.67% + 20px);right:calc(16.67% + 20px);height:1px;background:linear-gradient(90deg,var(--gn) 0%,transparent 50%,var(--gn) 100%);opacity:.25}
        #vc .step{padding:0 24px;text-align:center}
        #vc .stp{width:54px;height:54px;border-radius:50%;background:var(--sf);border:2px solid var(--bd);display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;font-size:1.25rem;color:var(--gn);margin:0 auto 18px;position:relative;z-index:1}
        #vc .step h3{margin-bottom:8px}
        #vc .step p{font-size:0.86rem;color:var(--mu);line-height:1.65}

        /* ind cards */
        #vc .ic{background:var(--sf);border:1px solid var(--ln);border-radius:var(--r);padding:22px 18px;text-align:center;transition:border-color .18s,background .18s}
        #vc .ic:hover{border-color:var(--bd);background:var(--gs)}
        #vc .ie{font-size:1.85rem;margin-bottom:10px}
        #vc .ic p{font-size:0.76rem;color:var(--mu);line-height:1.5;margin-top:4px}

        /* quote */
        #vc .qb{max-width:680px;margin:0 auto;text-align:center;border:1px solid var(--bd);border-radius:var(--rl);padding:48px 40px;background:var(--sf);position:relative}
        #vc .qm{font-family:Georgia,serif;font-size:5rem;line-height:.7;color:var(--gn);opacity:.35;position:absolute;top:20px;left:30px}
        #vc blockquote{font-family:Georgia,serif;font-size:1.2rem;line-height:1.6;color:var(--ink);margin-bottom:20px;font-style:italic}
        #vc .qa{font-size:0.82rem;color:var(--mu);font-weight:600}
        #vc .qa strong{color:var(--gn)}

        /* cta */
        #vc .ctab{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:80px 48px;text-align:center;position:relative;overflow:hidden}
        #vc .ctab::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 70% 70% at 50% 0%,var(--gg),transparent 68%)}
        #vc .ctab>*{position:relative;z-index:1}
        #vc .ctab h2{margin-bottom:14px}
        #vc .ctab .ld{max-width:50ch;margin:0 auto 36px}
        #vc .cbs{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
        #vc .btnwa{display:flex;align-items:center;gap:9px;background:#25D366;color:#031420;font-weight:800;font-size:0.92rem;padding:14px 24px;border-radius:50px;transition:transform .2s,box-shadow .2s}
        #vc .btnwa:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(37,211,102,.3)}
        #vc .btnml{border:1.5px solid var(--bd);color:var(--ink);font-weight:600;font-size:0.92rem;padding:13px 22px;border-radius:50px;transition:background .18s}
        #vc .btnml:hover{background:var(--sf2)}

        /* responsive */
        @media(max-width:960px){
          #vc .hg{grid-template-columns:1fr;gap:0}
          #vc .ph{display:none}
          #vc .g3f,#vc .g3{grid-template-columns:1fr 1fr}
          #vc .steps{grid-template-columns:1fr}
          #vc .steps::before{display:none}
          #vc .step{margin-bottom:28px;padding:0 16px}
          #vc .g4{grid-template-columns:1fr 1fr}
        }
        @media(max-width:600px){
          #vc .vcs{padding:64px 0}
          #vc .g3f,#vc .g3,#vc .g4{grid-template-columns:1fr}
          #vc .sr{flex-wrap:wrap;gap:20px}
          #vc .ctab{padding:48px 24px}
          #vc .pr{gap:24px}
        }
      `}</style>

      <div id="vc">
        {/* HERO */}
        <section className="hero">
          <div className="vcw hg">
            <div>
              <div className="hbadge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#12D68A">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp-First Commerce Platform</span>
              </div>
              <h1>
                Turn every WhatsApp message into a{" "}
                <em>confirmed sale</em>
              </h1>
              <p className="ld" style={{ marginTop: "18px", marginBottom: "36px" }}>
                Viviz Commerce gives small businesses a 24/7 AI sales assistant,
                a branded online store, and a full CRM — all powered by
                WhatsApp. No missed orders. No lost customers.
              </p>
              <div className="hbtns">
                <a href="#vc-contact" className="btng">Start Free Trial →</a>
                <a href="#vc-features" className="btno">See How It Works</a>
              </div>
              <div className="sr">
                <div>
                  <div className="sn">24/7</div>
                  <div className="sl">AI replies, even while you sleep</div>
                </div>
                <div>
                  <div className="sn">&lt;&nbsp;3&nbsp;min</div>
                  <div className="sl">Average time from message to order</div>
                </div>
                <div>
                  <div className="sn">₹0</div>
                  <div className="sl">Extra hardware or devices needed</div>
                </div>
              </div>
            </div>

            {/* Phone mockup */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div className="ph">
                <div className="phs">
                  <div className="pst">
                    <span style={{ fontWeight: 600 }}>10:46</span>
                    <span>▲▼ ⬛⬛⬛</span>
                  </div>
                  <div className="phd">
                    <div className="pav">🥭</div>
                    <div>
                      <div className="phn">Merza Bodi</div>
                      <div className="phs2">Powered by Viviz Commerce</div>
                    </div>
                  </div>
                  <div id="vc-chat"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF STRIP */}
        <div className="proof">
          <div className="vcw pr">
            <div className="ps"><div className="pn">400+</div><div className="pl">Messages handled daily</div></div>
            <div className="ps"><div className="pn">98%</div><div className="pl">Customer response rate</div></div>
            <div className="ps"><div className="pn">3×</div><div className="pl">Increase in repeat orders</div></div>
            <div className="ps"><div className="pn">40%</div><div className="pl">Fewer order mistakes</div></div>
          </div>
        </div>

        {/* PROBLEM */}
        <section className="vcs bg2">
          <div className="vcw">
            <p className="ey">The Problem</p>
            <h2 style={{ marginTop: "8px", maxWidth: "22ch" }}>
              Running a business on raw WhatsApp is exhausting
            </h2>
            <div className="g3">
              <div className="card">
                <div className="ci">😰</div>
                <h3>Orders fall through the cracks</h3>
                <p>Hundreds of messages a day. A customer orders, you forget to confirm, they get frustrated. One missed order is one lost customer — and one bad word-of-mouth.</p>
              </div>
              <div className="card">
                <div className="ci">🌙</div>
                <h3>You can&rsquo;t sell while you sleep</h3>
                <p>Customers message at midnight expecting an instant reply. You&rsquo;re unavailable. They move to the next seller. Competitors with automation never miss a sale — even at 3 AM.</p>
              </div>
              <div className="card">
                <div className="ci">🗂️</div>
                <h3>No record of anything</h3>
                <p>No order history. No customer database. No idea which products sell. You&rsquo;re guessing your stock every week and calling customers back to verify details they already sent.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="vcs" id="vc-features">
          <div className="vcw">
            <p className="ey">Platform Features</p>
            <h2 style={{ marginTop: "8px" }}>Everything your business needs in one system</h2>
            <p className="ld" style={{ marginTop: "14px", maxWidth: "50ch" }}>
              No separate apps. No spreadsheets. No missed chats. One platform connects your sales, orders, and customers.
            </p>
            <div className="g3f">
              <div className="cardb"><div className="fi">🤖</div><h3>AI WhatsApp Bot</h3><p>Your 24/7 sales assistant. Replies in Tamil or English, answers questions, takes orders, and escalates to a real person only when needed.</p></div>
              <div className="cardb"><div className="fi">👆</div><h3>Tap-to-Order Menus</h3><p>Interactive buttons let customers browse categories, view prices, and place an order with a single tap — no typing, no confusion.</p></div>
              <div className="cardb"><div className="fi">🛒</div><h3>Branded Online Storefront</h3><p>A mobile-first catalogue with cart and checkout under your business name. Share the link anywhere and start taking orders immediately.</p></div>
              <div className="cardb"><div className="fi">📦</div><h3>Order Management</h3><p>Every order — from WhatsApp or your website — lands in one dashboard. Update status, assign delivery, and print invoices in a single click.</p></div>
              <div className="cardb"><div className="fi">👥</div><h3>CRM &amp; Lead Tracking</h3><p>Know your customers by name. See full purchase history and conversations. Follow up at the right moment with the right offer.</p></div>
              <div className="cardb"><div className="fi">📊</div><h3>Revenue Reports &amp; PDFs</h3><p>Daily revenue, top products, delivery zone performance. Auto-generated PDF invoices and reports — no spreadsheets required.</p></div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="vcs bg2">
          <div className="vcw">
            <p className="ey">How It Works</p>
            <h2 style={{ marginTop: "8px" }}>Live in 48 hours, growing for years</h2>
            <p className="ld" style={{ marginTop: "14px", maxWidth: "46ch" }}>
              Viviz Technologies handles the full setup. You share your products; we handle the technology.
            </p>
            <div className="steps">
              <div className="step"><div className="stp">1</div><h3>We set up your system</h3><p>Share your product list, pricing, and delivery areas. We configure your AI bot, WhatsApp menus, and branded storefront in under 48 hours.</p></div>
              <div className="step"><div className="stp">2</div><h3>Customers order on WhatsApp</h3><p>Share your WhatsApp number. Customers say &ldquo;Hi&rdquo;, tap through your menu, and place orders — all without leaving WhatsApp.</p></div>
              <div className="step"><div className="stp">3</div><h3>You manage, deliver, grow</h3><p>Orders land in your dashboard automatically. Confirm, pack, and deliver with printed slips. Review top customers every morning.</p></div>
            </div>
          </div>
        </section>

        {/* INDUSTRIES */}
        <section className="vcs">
          <div className="vcw">
            <p className="ey">Who It&rsquo;s For</p>
            <h2 style={{ marginTop: "8px" }}>Built for businesses that sell on WhatsApp</h2>
            <div className="g4">
              <div className="ic"><div className="ie">🥭</div><h4>Fresh Produce &amp; Farms</h4><p>Seasonal fruits, vegetables, and farm-fresh produce with pre-order support.</p></div>
              <div className="ic"><div className="ie">🍱</div><h4>Home-based Food Sellers</h4><p>Tiffin services, cloud kitchens, and home bakers managing daily orders.</p></div>
              <div className="ic"><div className="ie">🛍️</div><h4>Local Retail &amp; Kirana</h4><p>Grocery stores and kirana shops ready to take digital orders.</p></div>
              <div className="ic"><div className="ie">🌾</div><h4>Agricultural Suppliers</h4><p>Wholesale distributors and cooperatives managing large-volume orders.</p></div>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section className="vcs bg2">
          <div className="vcw" style={{ textAlign: "center" }}>
            <p className="ey" style={{ marginBottom: "36px" }}>In the Field</p>
            <div className="qb">
              <div className="qm">&ldquo;</div>
              <blockquote>
                Before Viviz Commerce, I was losing at least 10 orders every week
                just because I couldn&rsquo;t reply fast enough. Now the bot
                handles everything at night and I wake up to confirmed orders with
                delivery addresses already entered.
              </blockquote>
              <p className="qa">
                — Fruit seller, Bodinayakanur, Tamil Nadu &nbsp;·&nbsp;{" "}
                <strong>Merza Bodi</strong>
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="vcs" id="vc-contact">
          <div className="vcw">
            <div className="ctab">
              <p className="ey" style={{ marginBottom: "14px" }}>Get Started Today</p>
              <h2>Ready to automate your sales?</h2>
              <p className="ld">
                Talk to Viviz Technologies. We&rsquo;ll walk you through the platform,
                tailor it to your business, and have you live on WhatsApp Commerce
                within the week.
              </p>
              <div className="cbs">
                <a
                  href="https://wa.me/919884365486?text=Hi%2C+I%27m+interested+in+Viviz+Commerce+for+my+business."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btnwa"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat with Us on WhatsApp
                </a>
                <a href="mailto:viviztechnologies@gmail.com" className="btnml">
                  viviztechnologies@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Chat animation script */}
        <script dangerouslySetInnerHTML={{ __html: chatScript }} />
      </div>
    </>
  );
}
