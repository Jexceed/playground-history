// Original, deliberately schematic learning graphics. No historical facsimiles.
import { createHash } from 'node:crypto';
export const escapeXml = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const line=(x1,y1,x2,y2,extra='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" ${extra}/>`;
const rect=(x,y,w,h,fill='#ecd5a5',rx=5)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const circle=(x,y,r,fill='#f2c66d')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const path=(d,fill='none')=>`<path d="${d}" fill="${fill}"/>`;
const group=(body,x=0,y=0,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;
const arrow=(x1,y,x2)=>line(x1,y,x2,y)+path(`M${x2-7} ${y-6}l7 6-7 6`);
const person=()=>circle(50,22,12,'#eeb48f')+path('M28 84V60Q28 41 50 41Q72 41 72 60V84Z','#72b9b0')+path('M30 57L13 70M70 57L87 70');
const people=()=>group(person(),-5,8,.68)+group(person(),39,8,.68);
const paper=()=>rect(22,12,57,76,'#fffaf0')+path('M33 32H67M33 44H64M33 56H67M33 68H58');
const house=()=>path('M10 45L50 14L90 45Z','#d48e72')+rect(21,45,58,43,'#f5dfa9')+rect(42,59,16,29,'#43847e',1);
const boat=()=>path('M10 65H90L76 85H26Z','#b8835d')+line(49,13,49,64)+path('M53 16L84 55H53Z','#f4d69c')+path('M7 91Q18 85 28 91T50 91T72 91T94 91');
const water=()=>path('M5 27Q17 17 29 27T53 27T77 27T99 27M5 50Q17 40 29 50T53 50T77 50T99 50M5 73Q17 63 29 73T53 73T77 73T99 73');
const wall=()=>rect(9,35,82,51,'#c9b7a0',1)+path('M9 35V20H24V35H39V20H54V35H69V20H84V35H91M10 53H90M10 70H90M28 35V52M66 35V52M43 53V70M24 71V85M68 71V85');
const ruler=(ticks=5)=>rect(8,36,84,28,'#f4d080',2)+Array.from({length:ticks+1},(_,i)=>line(8+i*84/ticks,37,8+i*84/ticks,i%2?47:54)).join('');
const book=()=>path('M50 22Q30 12 10 22V81Q30 71 50 81Q70 71 90 81V22Q70 12 50 22Z','#fff4d6')+line(50,22,50,81)+path('M20 34L39 33M20 46L39 45M61 33L80 34M61 45L80 46M20 58L39 57M61 57L80 58');
const brush=()=>path('M27 67L62 10L73 17L38 75Z','#d8a461')+path('M27 67Q10 72 16 94Q24 88 38 75Z','#49736e');
const moon=()=>circle(50,50,34,'#f2cc72');
const roof=()=>path('M4 56Q29 52 50 19Q71 52 96 56L87 66H13Z','#d3a548')+path('M17 53L32 58M32 37L44 58M50 22V59M68 37L56 58M83 53L68 58')+rect(20,66,60,22,'#bd6f55',1);
const deer=()=>path('M18 60Q26 39 54 44L73 34L69 23L84 23L91 36L76 51L72 72H29Z','#d7a567')+path('M29 68L24 91M62 69L62 91M18 61L7 50M77 24L73 10M74 17L64 11M83 25L89 8M87 17L98 13')+circle(83,32,1.6,'#244f4b');
const camel=()=>path('M11 61Q20 22 34 43Q44 19 60 44L74 50L78 23L93 20L94 34L85 38L85 67H21Z','#d7a56d')+path('M24 63L20 91M68 66L74 91M12 59L5 43')+circle(89,27,1.4,'#244f4b');
const types=(wood=false)=>Array.from({length:6},(_,i)=>{let x=8+i%3*30,y=13+Math.floor(i/3)*40;return rect(x,y,24,32,wood?'#bf9872':'#dbbaa4',2)+path(`M${x+7} ${y+10}h10m-5-4v17m-5-6h10`)}).join('');
const polygon=(n)=>Array.from({length:n},(_,i)=>[50+34*Math.cos(i*2*Math.PI/n-Math.PI/2),50+34*Math.sin(i*2*Math.PI/n-Math.PI/2)].map(x=>x.toFixed(2)).join(',')).join(' ');
const poly=(n)=>circle(50,50,38,'#f8eed2')+`<polygon points="${polygon(n)}" fill="#88beb2"/>`;
const compass=()=>circle(50,50,39,'#d2e8e1')+path('M50 13L62 50L50 87L38 50Z','#cc8667')+line(50,13,50,87)+circle(50,50,5,'#fffaf0');
const grain=()=>path('M50 91V20M50 62L25 48M50 48L74 35M50 77L24 64')+path('M48 31Q25 34 28 14Q49 11 48 31M53 47Q74 53 79 30Q55 22 53 47M44 60Q25 66 18 43Q41 39 44 60M51 76Q69 77 78 54Q56 49 51 76','#ddbb64');
const map=()=>path('M10 22L35 13L63 24L90 14V79L64 89L35 77L10 89Z','#d3e5d7')+path('M35 13V77M63 24V89')+path('M19 67Q38 24 52 60T83 33');
const icons={
 ruler:()=>ruler(), equal:()=>group(ruler(3),0,-16)+group(ruler(3),0,24), unequal:()=>group(ruler(3),0,-16)+group(ruler(3),0,35,.66),
 coin:()=>circle(50,50,37,'#c5ad64')+rect(37,37,26,26,'#fffaf0',1),squarecoin:()=>rect(13,13,74,74,'#c5ad64',2)+circle(50,50,14,'#fffaf0'),
 weight:()=>path('M26 82L34 37H66L76 82Z','#859d91')+circle(50,29,11,'#fffaf0'),cup:()=>path('M23 23H77L69 84H31Z','#dcb786')+path('M77 31Q103 27 85 59H73'),
 cloth:()=>path('M15 26Q40 9 62 25T91 25L81 79Q63 93 44 77T6 77Z','#82b9bb')+path('M31 28L23 70M45 32L38 71M61 31L56 78'),silk:()=>icons.cloth(),
 paint:()=>path('M16 65Q-1 25 44 12Q84 4 92 42Q91 71 65 82Q53 78 50 64Q36 61 31 74Z','#eac3a1')+circle(26,35,6,'#75b5a8')+circle(49,23,6,'#e4b650')+circle(73,35,6,'#ce896e'),
 tablet:()=>rect(23,8,54,84,'#c5ba9d',12)+path('M35 30H65M35 43H65M35 56H65M35 69H57'),book,paper,letter:()=>rect(9,24,82,56,'#f7e7c4')+path('M10 27L50 59L90 27M10 79L38 51M90 79L62 51'),
 wall,gate:()=>wall()+path('M38 85V60A12 12 0 0 1 24 0V85Z','#fffaf0'),tower:()=>rect(21,34,58,54,'#d6a78b',1)+roof(),road:()=>path('M18 93Q47 52 28 6H72Q51 51 82 93Z','#e1c997')+path('M51 85L47 65M48 45L49 28'),
 gap:()=>group(wall(),0,18,.42)+group(wall(),58,18,.42)+path('M44 60H56','none'), join:()=>group(wall(),0,18,.42)+group(wall(),58,18,.42)+rect(42,32,16,23,'#81bca9',1),stack:()=>group(wall(),0,18,.42)+group(wall(),58,18,.42)+rect(4,23,34,9,'#81bca9',1),
 tools:()=>path('M19 16L34 18L46 36L39 44L25 35Z','#7d9f9c')+path('M39 40L79 85L88 76L46 35Z','#d5aa75')+path('M72 13L61 35L22 81L15 74L52 28L54 12L62 18L64 8Z','#9bbdb5'),
 rain:()=>icons.cloud()+path('M26 72L19 89M50 73L43 90M74 73L67 90'),cloud:()=>path('M23 66C-3 66 1 36 22 38C18 5 65 3 69 31C99 26 108 68 76 68Z','#d4e7e5'),
 house,home:house,village:()=>group(house(),-2,29,.52)+group(house(),46,4,.55)+group(grain(),44,53,.46),land:()=>path('M5 80Q29 43 52 75Q77 47 97 80')+path('M5 92H96'),
 person,people,uniform:()=>group(person(),-2,10,.48)+group(person(),28,10,.48)+group(person(),58,10,.48),
 speech:()=>path('M13 15H87V65H43L21 84V65H13Z','#d6e8df')+path('M27 31H73M27 45H58'),ear:()=>path('M31 70C-1 6 93-5 82 53C80 72 59 66 58 83C48 102 25 89 31 70M45 61C32 46 36 28 53 26C77 25 67 48 56 50C47 48 44 51 45 61'),
 eye:()=>path('M4 50Q48-5 96 50Q50 103 4 50Z','#fffaf0')+circle(50,50,17,'#6eaaa0'),
 exchange:()=>group(person(),-3,25,.42)+group(person(),62,25,.42)+arrow(37,36,65)+arrow(65,70,36),oneway:()=>group(person(),-3,25,.42)+group(person(),62,25,.42)+arrow(37,50,65),
 network:()=>path('M15 15L50 50L88 16M50 50L85 86M50 50L15 85')+[circle(15,15,8),circle(88,16,8),circle(85,86,8),circle(15,85,8),circle(50,50,11,'#75b5a5')].join(''),
 broken:()=>path('M15 15L35 35M65 35L88 16M65 65L85 86M35 65L15 85')+[circle(15,15,8),circle(88,16,8),circle(85,86,8),circle(15,85,8)].join(''),
 canalbroken:()=>path('M6 31H39M62 31H95M6 47H39M62 47H95')+path('M43 22L48 14M55 22L59 14')+group(boat(),4,40,.48),
 canaljoined:()=>path('M6 31H95M6 47H95')+group(boat(),29,39,.48),
 map,boat,sail:boat,water,field:()=>rect(4,13,92,76,'#b8d2a0',1)+path('M4 40H96M4 65H96M31 13V89M63 13V89')+group(grain(),27,24,.48),
 irrigate:()=>group(icons.field(),50,39,.48)+path('M8 8V62Q8 75 26 75H50','none')+path('M8 8V62Q8 75 26 75H50','none')+arrow(27,75,57),
 brokenwater:()=>group(icons.field(),52,39,.46)+path('M9 8V56Q9 66 24 66H35')+path('M44 67L39 73M44 77L39 83'),
 grain,basket:()=>path('M15 38H85L75 85H25Z','#d4aa73')+path('M29 38Q28 6 50 8Q71 6 72 38M31 44V80M50 42V83M68 43V80M20 57H81M23 72H77'),
 cart:()=>rect(10,23,70,48,'#dfbd83')+path('M80 52H95M26 24V68M47 24V68M68 24V68')+circle(23,80,9,'#79a79b')+circle(69,80,9,'#79a79b'),
 horse:()=>path('M14 62Q17 42 46 44L65 49L63 22L76 10L91 25L83 37L76 36L79 63H27Z','#bf9370')+path('M25 64L20 91M64 65L69 91M16 55L5 38')+circle(79,25,1.5,'#244f4b'),
 camel,camelband:()=>group(camel(),0,24,.95)+rect(20,40,43,9,'#78a999',1)+group(person(),15,4,.3)+group(person(),34,4,.3)+group(icons.music(),47,12,.3),
 bag:()=>path('M33 20H67L62 36Q98 66 79 87H20Q2 65 39 36Z','#ddb986')+path('M33 36H67'),
 bamboo:()=>Array.from({length:6},(_,i)=>rect(9+i*14,12,10,76,'#d4bf86',2)).join('')+path('M6 28H94M6 73H94'),fiber:()=>path('M9 72Q40 10 85 35M14 86Q48 24 93 49M7 59Q32 12 66 12M21 94Q46 47 94 65'),
 thread:()=>rect(25,11,50,78,'#dfb978')+path('M25 25H75M25 36H75M25 47H75M25 58H75M25 69H75M72 63Q101 61 86 86'),
 box:()=>rect(14,24,72,60,'#d7ac7e')+path('M14 40H86M43 24V40M56 24V40'),
 clock:()=>circle(50,50,36,'#f1dcad')+path('M50 25V51L69 63'),timeline:()=>arrow(5,57,94)+[circle(15,57,6),circle(49,57,6),circle(82,57,6)].join(''),dot:()=>circle(50,50,13,'#ce896e'),
 parallel:()=>rect(5,29,25,46,'#d3b082')+rect(37,29,25,46,'#83b4ac')+rect(69,29,25,46,'#e0bd63'),hierarchy:()=>rect(34,5,32,23,'#83b4ac')+path('M50 28V45M17 62V45H83V62')+rect(5,62,24,28)+rect(38,62,24,28)+rect(71,62,24,28),
 polygon:()=>poly(6),hexagon:()=>poly(6),dodecagon:()=>poly(12),approx:()=>group(poly(6),-2,21,.51)+group(poly(12),49,21,.51),circle:()=>circle(50,50,37,'#98c7b7'),
 moon,crescent:()=>path('M68 13C15-1 1 70 46 86Q76 97 89 66Q38 89 39 38Q40 21 68 13Z','#f2cc72'),
 moonlight:()=>group(moon(),57,0,.4)+path('M62 27L15 83L93 83Z','#f3e5b6')+path('M12 89H96'),frost:()=>path('M9 77L91 77M19 48L34 63M34 48L19 63M54 40L71 57M71 40L54 57M45 76V92M37 84H53'),
 fire:()=>path('M44 5Q90 39 82 71Q70 105 28 89Q1 72 22 43Q23 65 34 56Q45 46 44 5Z','#cf8764'),
 lookup:()=>path('M20 91V64Q20 44 41 44Q63 44 63 64V91Z','#79b5a9')+`<g transform="rotate(-32 44 30)">${circle(44,30,15,'#e8b48e')}${path('M56 25L66 34L57 37')}${circle(54,27,2,'#355e58')}</g>`+group(moon(),68,0,.29),
 lookdown:()=>path('M20 91V64Q20 44 41 44Q63 44 63 64V91Z','#79b5a9')+`<g transform="rotate(38 44 30)">${circle(44,30,15,'#e8b48e')}${path('M56 25L66 34L57 37')}${circle(54,27,2,'#355e58')}</g>`+group(house(),68,65,.28),
 twomoon:()=>group(moon(),35,-3,.35)+group(house(),-2,52,.43)+group(house(),60,52,.43)+path('M23 52L39 32M76 52L61 32'),
 mergecity:()=>group(house(),12,30,.55)+group(house(),42,30,.55)+group(moon(),31,-2,.37),
 heart:()=>path('M50 86C41 77 6 54 10 29C13 5 43 7 50 29C57 7 87 5 90 29C94 54 59 77 50 86Z','#d99683'),
 scroll:()=>rect(15,14,70,71,'#fae9c9',2)+circle(16,15,8,'#d0a976')+circle(84,85,8,'#d0a976')+path('M31 32H69M31 44H69M31 56H69M31 68H56'),
 brush,stamp:()=>rect(24,63,52,22,'#d28771',2)+path('M35 63V37Q35 13 50 13Q65 13 65 37V63Z','#b08e71'),
 draft:()=>paper()+path('M32 45L69 55M35 54L66 42M47 65L53 59L60 65')+path('M38 72H68'),cleantext:paper,blank:()=>rect(22,12,57,76,'#fffaf0'),
 music:()=>path('M35 71V24L79 13V61')+path('M35 24L79 13V29L35 40Z','#79afa5')+circle(23,75,13,'#d7ac66')+circle(67,66,13,'#d7ac66'),musicpose:()=>person()+group(icons.music(),49,40,.47),sound:()=>path('M9 36H25L49 16V84L25 65H9Z','#90b9ae')+path('M63 29Q88 50 63 73M75 13Q115 49 75 89'),
 market:()=>house()+path('M8 47H92M16 36V54M31 29V52M49 18V51M67 29V53M84 40V54'),stackbooks:()=>group(book(),0,17)+group(book(),0,-7),
 block:()=>rect(7,10,86,80,'#bfa184',2)+Array.from({length:6},(_,i)=>path(`M${21+i%3*28} ${29+Math.floor(i/3)*32}h12m-6-5v19`)).join(''),types:()=>types(),woodtypes:()=>types(true),
 tileswrong:()=>rect(5,32,27,35,'#d9bba1')+rect(36,32,27,35,'#d9bba1')+rect(67,32,27,35,'#d9bba1')+circle(18,49,8,'#ecd17b')+circle(49,49,8,'#ecd17b')+circle(80,49,8,'#ecd17b')+path('M38 76H60'),
 tileschange:()=>rect(5,42,27,35,'#d9bba1')+rect(36,5,27,35,'#d9bba1')+rect(67,42,27,35,'#d9bba1')+circle(18,59,8,'#ecd17b')+group(icons.crescent(),38,8,.23)+circle(80,59,8,'#ecd17b')+path('M49 46V68M42 61L49 68L56 61'),
 ink:()=>rect(14,50,68,35,'#5f7770',8)+group(brush(),32,-5,.6),sequence:()=>icons.timeline(),
 monkey:()=>circle(24,43,13,'#b99676')+circle(76,43,13,'#b99676')+circle(50,48,34,'#b99676')+path('M24 50Q27 20 50 41Q75 20 77 50Q77 81 50 82Q23 81 24 50Z','#eed1a3')+circle(39,49,3,'#325955')+circle(62,49,3,'#325955')+path('M41 65Q50 72 60 65')+path('M20 24Q52 8 83 26'),
 deer,rescue:()=>group(deer(),0,5,.7)+group(person(),56,39,.45)+group(water(),0,70,.95),promise:()=>group(person(),0,12,.75)+group(icons.speech(),53,0,.4),
 lotus:()=>path('M7 63Q25 86 50 62Q75 86 95 63Q75 39 50 60Q28 38 7 63Z','#8ab99b')+path('M50 64Q12 38 32 18Q47 24 50 41Q53 24 69 18Q89 39 50 64Z','#d8a397'),
 mountain:()=>path('M3 88L36 17L61 64L78 30L98 88Z','#a9bca0')+path('M25 40L35 47L43 34'),rock:()=>path('M9 75L25 38L61 18L88 50L93 83L39 90Z','#b1b8aa'),
 compass,depth:()=>group(water(),0,65,.95)+path('M50 8V87M38 20H52M38 38H52M38 55H52M38 72H52')+path('M42 79L50 87L58 79'),wind:()=>path('M4 29H70Q99 28 80 10M7 50H91M4 71H63Q96 74 74 94'),
 post:()=>house()+group(icons.horse(),41,49,.5),sign:()=>rect(11,20,78,33,'#decba4',2)+line(50,54,50,91)+arrow(23,37,77),
 roof,leader:()=>path('M9 71Q39 76 62 58L73 42L87 40L96 48L84 53Q84 85 48 86L12 87Z','#d9b76a')+path('M48 73Q39 47 20 51L9 43Q12 69 48 73')+group(person(),31,6,.48),beast:()=>group(deer(),4,20,.88),
 roofrow:()=>path('M3 86H98')+group(icons.leader(),-2,27,.3)+Array.from({length:10},(_,i)=>group(icons.beast(),24+i*7.4,61,.105)).join(''),
 bridge:()=>path('M3 82Q50-1 97 82H80Q50 26 20 82Z','#c7aa81')+path('M10 59L18 69M24 40L33 53M44 29L48 48M65 33L61 50M81 46L72 59'),bridgeboat:()=>group(icons.bridge(),0,-1)+group(boat(),24,49,.55),
 rabbit:()=>path('M30 45Q7-4 30 4Q48 14 43 40M57 40Q56-2 76 6Q91 17 72 49','#ede2bf')+circle(50,65,31,'#ede2bf')+circle(39,60,2.5,'#305852')+circle(64,60,2.5,'#305852')+path('M46 73L51 76L56 73'),
 temple:()=>rect(20,44,60,44,'#e2d1b1',1)+path('M8 44L28 29V17H71V29L92 44Z','#c58b74')+rect(41,61,19,27,'#779d97',1),
 camera:()=>rect(7,29,86,55,'#8fa8a0')+rect(23,15,27,16,'#8fa8a0')+circle(54,55,20,'#f7eacb'),
 paperfold:()=>path('M8 49L88 9L57 91L43 61Z','#c9dfd9')+path('M43 61L88 9M57 91L42 72L43 61'),
 flag:()=>line(23,10,23,94)+path('M23 13Q51 3 81 18V57Q48 43 23 55Z','#cb8f72'),
 closed:()=>icons.gate()+path('M36 53L64 82M64 53L36 82'),
 machine:()=>rect(4,55,43,31,'#88a69a',2)+rect(19,17,15,39,'#d4af80',1)+circle(71,65,26,'#dfc189')+circle(71,65,6,'#fffaf0')+path('M71 39V91M45 65H97M52 47L90 83M90 47L52 83')
};
export function iconMarkup(name){if(!icons[name]) throw new Error(`Unknown study icon: ${name}`); return `<g fill="none" stroke="#355e58" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${icons[name]()}</g>`;}
export function visualId(scene,compact=false){return `study-${createHash('sha256').update(JSON.stringify({scene,compact,rendererVersion:2})).digest('hex').slice(0,16)}`;}
function lines(text,max){const c=[...text];const out=[];for(let i=0;i<c.length;i+=max)out.push(c.slice(i,i+max).join(''));return out;}
export function renderVisual(scene,compact=false){
 if(scene.items.length===1&&scene.items[0].icon==='roofrow'){
  const w=compact?420:900,h=compact?242:430;const k=w/900;
  const row=`<g transform="scale(${k})"><path d="M25 277L870 277" stroke="#cba368" stroke-width="20"/>${group(iconMarkup('leader'),30,100,1.25)}${Array.from({length:10},(_,i)=>group(iconMarkup('beast'),180+i*65,185,.62)).join('')}<text x="100" y="322" text-anchor="middle" font-size="28">领队</text><text x="510" y="322" text-anchor="middle" font-size="28">后面十只走兽</text></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="sans-serif" fill="#355e58"><title>领队加十只走兽的排列示意</title><rect width="${w}" height="${h}" fill="#fffaf0"/>${row}</svg>`;
 }
 const w=compact?420:900,h=compact?242:430,n=scene.items.length,gap=compact?12:30,pad=compact?14:30,cw=(w-pad*2-gap*(n-1))/n,iy=compact?24:32,sz=Math.min(cw-12,compact?118:210);
 const labelSize=compact?18:29;
 const cards=scene.items.map((item,i)=>{
  const x=pad+i*(cw+gap);const parts=lines(item.label,Math.max(4,Math.floor((cw-12)/labelSize)));
  const labelY=iy+sz+(compact?26:46);
  return `${rect(x,compact?9:14,cw,h-(compact?18:38),i%2?'#edf4ee':'#f5ecd8',compact?17:24)}${group(iconMarkup(item.icon),x+(cw-sz)/2,iy,sz/100)}<text x="${x+cw/2}" y="${labelY}" text-anchor="middle" font-size="${labelSize}" fill="#274d47" font-weight="650">${parts.map((s,j)=>`<tspan x="${x+cw/2}" dy="${j?labelSize*1.3:0}">${escapeXml(s)}</tspan>`).join('')}</text>${i<n-1&&scene.kind!=='comparison'?`<g stroke="#739d91" fill="none" stroke-width="3">${arrow(x+cw+3,h*.47,x+cw+gap-3)}</g>`:''}`;
 }).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" font-family="sans-serif"><title>${escapeXml(scene.items.map(x=>x.label).join('，'))}</title><rect width="${w}" height="${h}" fill="#fffaf0"/>${cards}</svg>`;
}
