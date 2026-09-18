const API_KEY="f4d45c1e632747a3891161657261409";
const BASE_URL="https://api.weatherapi.com/v1/forecast.json";
const $=id=>document.getElementById(id);
let weatherData=null,useCelsius=true;

function emoji(code,day=true){
 if(code===1000)return day?"☀️":"🌙";
 if([1003,1006].includes(code))return day?"🌤️":"☁️";
 if(code===1009)return"☁️";
 if([1030,1135,1147].includes(code))return"🌫️";
 if([1063,1150,1153,1180,1183,1186,1189,1192,1195,1240,1243,1246].includes(code))return"🌧️";
 if([1087,1273,1276,1279,1282].includes(code))return"⛈️";
 if([1066,1114,1117,1204,1207,1210,1213,1216,1219,1222,1225,1255,1258].includes(code))return"🌨️";
 return"🌤️";
}
function hour(t){return new Date(t.replace(" ","T")).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});}
function temp(c,f){return useCelsius?`${Math.round(c)}°`:`${Math.round(f)}°`;}
function setLoading(v){$("searchBtn").disabled=v;$("searchBtn").textContent=v?"...":"Search";}
function render(){
 const c=weatherData.current,l=weatherData.location;
 $("locationName").textContent=`${l.name}, ${l.country}`;
 $("updatedText").textContent=`Updated ${hour(l.localtime)} • ${l.region||"Local forecast"}`;
 $("currentIcon").textContent=emoji(c.condition.code,c.is_day);
 $("temperature").textContent=Math.round(useCelsius?c.temp_c:c.temp_f);
 $("condition").textContent=c.condition.text;
 $("feelsLike").textContent=temp(c.feelslike_c,c.feelslike_f);
 $("humidity").textContent=`${c.humidity}%`;
 $("wind").textContent=useCelsius?`${Math.round(c.wind_kph)} km/h`:`${Math.round(c.wind_mph)} mph`;
 $("visibility").textContent=useCelsius?`${c.vis_km} km`:`${c.vis_miles} mi`;
 $("unitBtn").textContent=useCelsius?"°C":"°F";
 renderHourly();renderDaily();
}
function renderHourly(){
 const days=weatherData.forecast.forecastday,now=new Date(weatherData.location.localtime.replace(" ","T"));
 const hours=[...days[0].hour,...(days[1]?.hour||[])].filter(x=>new Date(x.time.replace(" ","T"))>=now).slice(0,8);
 $("hourlyList").innerHTML=hours.map((x,i)=>`<article class="hour-card ${i===0?"active":""}"><div class="time">${i===0?"NOW":hour(x.time)}</div><div class="icon">${emoji(x.condition.code,x.is_day)}</div><div class="temp">${temp(x.temp_c,x.temp_f)}</div></article>`).join("");
 $("todayLabel").textContent=new Date(weatherData.location.localtime.replace(" ","T")).toLocaleDateString([],{weekday:"long",month:"short",day:"numeric"});
}
function renderDaily(){
 $("dailyList").innerHTML=weatherData.forecast.forecastday.map((d,i)=>{const name=i===0?"Today":new Date(d.date+"T12:00:00").toLocaleDateString([],{weekday:"long"});return `<article class="day-card"><div><div class="day-name">${name}</div><div class="day-date">${d.date}</div></div><div class="day-icon">${emoji(d.day.condition.code,true)}</div><div class="day-condition">${d.day.condition.text}</div><div class="day-temp">${temp(d.day.maxtemp_c,d.day.maxtemp_f)} <span>${temp(d.day.mintemp_c,d.day.mintemp_f)}</span></div></article>`}).join("");
}
async function fetchWeather(city){
 if(!city.trim())return $("errorMessage").textContent="Please enter a city or location.";
 if(API_KEY==="YOUR_WEATHERAPI_KEY")return $("errorMessage").textContent="Add your WeatherAPI key in script.js.";
 setLoading(true);$("errorMessage").textContent="";
 try{
  const r=await fetch(`${BASE_URL}?key=${encodeURIComponent(API_KEY)}&q=${encodeURIComponent(city)}&days=7&aqi=no&alerts=no`);
  const d=await r.json();if(!r.ok)throw new Error(d.error?.message||"Unable to fetch weather data.");
  weatherData=d;render();
 }catch(e){$("errorMessage").textContent=e.message||"Something went wrong."}
 finally{setLoading(false)}
}
$("searchBtn").addEventListener("click",()=>fetchWeather($("cityInput").value));
$("cityInput").addEventListener("keydown",e=>{if(e.key==="Enter")fetchWeather($("cityInput").value)});
$("unitBtn").addEventListener("click",()=>{if(weatherData){useCelsius=!useCelsius;render()}});
fetchWeather("New Delhi");