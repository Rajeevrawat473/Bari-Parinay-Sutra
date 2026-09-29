const {createClient}=supabase;
const sb=createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function ageFromDob(d){if(!d)return "";const x=new Date(d),n=new Date();let a=n.getFullYear()-x.getFullYear();if(n.getMonth()<x.getMonth()||(n.getMonth()===x.getMonth()&&n.getDate()<x.getDate()))a--;return a}
async function searchProfiles(filters={}){
 let q=sb.from("profiles").select("id,full_name,gender,dob,education,occupation,state,district,tehsil,about,photo_url").eq("status","approved");
 if(filters.gender)q=q.eq("gender",filters.gender); if(filters.state)q=q.ilike("state",`%${filters.state}%`);
 if(filters.district)q=q.ilike("district",`%${filters.district}%`); if(filters.tehsil)q=q.ilike("tehsil",`%${filters.tehsil}%`);
 if(filters.minAge)q=q.lte("dob",new Date(new Date().setFullYear(new Date().getFullYear()-Number(filters.minAge))).toISOString().slice(0,10));
 if(filters.maxAge)q=q.gte("dob",new Date(new Date().setFullYear(new Date().getFullYear()-Number(filters.maxAge)-1)).toISOString().slice(0,10));
 const {data,error}=await q.order("created_at",{ascending:false}).limit(60); if(error)throw error;
 const box=$("#results");$("#resultCount").textContent=`${data?.length||0} प्रोफाइल`;
 if(!data?.length){box.innerHTML='<div class="empty">इस खोज के अनुसार कोई approved profile नहीं मिली।</div>';return}
 box.innerHTML=data.map(p=>`<article class="profile-card">${p.photo_url?`<img src="${esc(p.photo_url)}" alt="Profile">`:`<div style="height:230px;display:grid;place-items:center;font-size:70px;background:#f4e8ef;color:#9b4e7d">♡</div>`}<div class="profile-body"><span class="badge">${p.gender==="male"?"लड़का":"लड़की"}</span><span class="badge">${ageFromDob(p.dob)} वर्ष</span><h3>${esc(p.full_name)}</h3><p>📍 ${esc(p.state)}, ${esc(p.district)}, ${esc(p.tehsil)}</p><p>🎓 ${esc(p.education||"—")} &nbsp; 💼 ${esc(p.occupation||"—")}</p><p>${esc(p.about||"")}</p></div></article>`).join("");
}
$("#searchForm").addEventListener("submit",e=>{e.preventDefault();searchProfiles({gender:$("#sGender").value,state:$("#sState").value,district:$("#sDistrict").value,tehsil:$("#sTehsil").value,minAge:$("#sMinAge").value,maxAge:$("#sMaxAge").value}).catch(err=>alert(err.message))});
$("#resetSearch").onclick=()=>{$("#searchForm").reset();$("#results").innerHTML='<div class="empty">खोज शुरू करने के लिए ऊपर जानकारी भरें।</div>';$("#resultCount").textContent="0 प्रोफाइल"};
$("#registerForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target),msg=$("#registerMsg");msg.textContent="प्रोफाइल बनाई जा रही है…";
try{const email=f.get("email"),password=f.get("password");const {data,error}=await sb.auth.signUp({email,password});if(error)throw error;if(!data.user)throw new Error("Registration पूरा नहीं हुआ।");
const {error:pe}=await sb.from("profiles").insert({user_id:data.user.id,full_name:f.get("full_name"),gender:f.get("gender"),dob:f.get("dob"),education:f.get("education"),occupation:f.get("occupation"),state:f.get("state"),district:f.get("district"),tehsil:f.get("tehsil"),email,phone:f.get("phone"),photo_url:f.get("photo_url"),about:f.get("about"),status:"pending"});if(pe)throw pe;
msg.textContent="Registration सफल है। आपकी profile Admin approval के बाद search में दिखाई देगी।";e.target.reset()}catch(err){msg.textContent="त्रुटि: "+err.message}});
