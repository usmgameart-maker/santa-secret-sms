'use strict';
const $=id=>document.getElementById(id);
const content={gifts:window.GIFTS,letters:window.LETTERS,keys:window.PHONE_KEYS,stages:window.STAGES};
let localStore;try{localStore=window.localStorage;}catch{localStore=null;}
const game=new SmsWorkshop.Workshop(content,localStore);
let currentView='home',timerId=null,timerOrigin=null,toastTimer=null,finishPage=0;
const earned=()=>Object.keys(game.awards()).filter(key=>game.awards()[key]);
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function make(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
function giftImage(key){return `files/img/${GIFTS[key].img}`;}
function format(ms){const seconds=Math.round(ms/1000);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
function elapsed(){return game.data.elapsedMs+(timerOrigin===null?0:Math.max(0,Date.now()-timerOrigin));}
function stopTimer(){if(timerOrigin!==null){const ms=elapsed();timerOrigin=null;game.time(ms);}if(timerId!==null)clearInterval(timerId);timerId=null;}
function startTimer(){if(game.data.phase!=='decode'||document.hidden||timerOrigin!==null)return;timerOrigin=Date.now();timerId=setInterval(()=>{$('timer').textContent=format(elapsed());},250);}
let audio=null;
function incomingAlert(){
  const device=$('incoming-phone');
  device.style.animation='none';void device.offsetWidth;
  device.style.animation='sms-arrive .6s ease';
  if(!game.data.sound)return;
  try{
    audio=audio||new(window.AudioContext||window.webkitAudioContext)();
    audio.resume?.()?.catch?.(()=>{});
    const start=audio.currentTime;
    // The two triangle tones from the original incoming-SMS effect.
    [{f:900,at:0,d:.06},{f:700,at:.07,d:.08}].forEach(note=>{
      const oscillator=audio.createOscillator(),gain=audio.createGain(),at=start+note.at;
      oscillator.type='triangle';oscillator.frequency.setValueAtTime(note.f,at);
      gain.gain.setValueAtTime(.0001,at);
      gain.gain.exponentialRampToValueAtTime(.06,at+.02);
      gain.gain.exponentialRampToValueAtTime(.0001,at+note.d);
      oscillator.connect(gain);gain.connect(audio.destination);
      oscillator.start(at);oscillator.stop(at+note.d+.03);
    });
  }catch{}
}
function sound(correct=true){if(!game.data.sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume?.();[correct?660:260,correct?880:210].forEach((frequency,index)=>{const oscillator=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+index*.1;oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.08,at+.015);gain.gain.exponentialRampToValueAtTime(.0001,at+.16);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(at);oscillator.stop(at+.18);});}catch{}}
function status(){
  $('save-status').textContent=game.persistent?'Прогресс сохраняется в этом браузере':'Сохранение недоступно — прогресс только до обновления страницы';
  $('sound-button').textContent=game.data.sound?'♫':'♪';$('sound-button').setAttribute('aria-pressed',String(game.data.sound));$('sound-button').setAttribute('aria-label',game.data.sound?'Выключить звук':'Включить звук');
  $('gift-count').textContent=`${game.data.index} / 15`;$('award-count').textContent=`${earned().length} / 8`;$('timer').textContent=format(elapsed());
  const progress=$('stage-progress');progress.replaceChildren();
  STAGES.forEach((stage,index)=>{const node=make('li',index<game.data.replies.length?'done':index===game.stage()?'current':'');node.append(make('b','',index<game.data.replies.length?'✓':index+1),make('span','',stage.short));node.setAttribute('aria-label',`Этап ${index+1}: ${stage.title}. ${index<game.data.replies.length?'Завершён':index===game.stage()?'Текущий':'Впереди'}`);if(index===game.stage())node.setAttribute('aria-current','step');progress.append(node);});
}
function show(name){const changed=currentView!==name;currentView=name;$('app').dataset.view=name;document.querySelectorAll('.screen').forEach(node=>node.hidden=node.id!==`${name}-screen`);$('gamebar').hidden=name==='home'||name==='finish';status();if(changed)$(`${name}-title`)?.focus({preventScroll:true});window.refreshPrintPreview?.();}
function hasProgress(){return game.data.started&&(game.data.index>0||game.data.phase!=='incoming');}
function home(){stopTimer();const progress=hasProgress();$('continue-button').hidden=!progress;$('continue-button').textContent=game.data.phase==='finish'?'Посмотреть итоги →':`Продолжить · ${game.data.index} / 15 →`;$('start-button').textContent=progress?'Начать заново':'Начать';$('start-button').className=`button ${progress?'secondary':'primary'}`;show('home');}
function phone(id,options){
  const code=options.code?`<div class="phone-code">${esc(options.code)}</div>`:`<div class="phone-envelope" aria-hidden="true">✉<span>1</span></div>`;
  $(id).innerHTML=`<div class="phone-speaker" aria-hidden="true"></div><div class="phone-display"><div class="phone-status"><span>ДЕД МОРОЗ</span><span aria-hidden="true">▮▮▮ ▰</span></div><div class="phone-heading">${esc(options.heading)}</div>${code}<div class="phone-caption">${esc(options.caption||'')}</div></div><div class="phone-nav" aria-hidden="true"><span>●</span><span>▣</span><span>↩</span></div><div class="phone-keypad" aria-label="Ключ к шифру">${PHONE_KEYS.map(key=>`<div class="phone-key"><b>${key.digit}</b><span>${key.letters}</span></div>`).join('')}</div>`;
}
function incoming(){const letter=game.letter();$('incoming-stage').textContent=`ЭТАП ${game.stage()+1} · ${STAGES[game.stage()].title.toLocaleUpperCase('ru')}`;$('incoming-position').textContent=`Желание ${game.data.index+1} из 15`;$('incoming-title').textContent=`Новое SMS от ${letter.from}!`;$('incoming-message').textContent='В сообщении спрятано название подарка. Поможешь прочитать желание?';phone('incoming-phone',{heading:`От: ${letter.name}`,caption:'Новое сообщение'});show('incoming');incomingAlert();}
function workshop(){
  const letter=game.letter(),done=game.data.phase==='gift-done';
  $('workshop-stage').textContent=`ЭТАП ${game.stage()+1} · ${STAGES[game.stage()].title.toLocaleUpperCase('ru')}`;$('workshop-title').textContent=`Что хочет ${letter.name}?`;$('wish-position').textContent=`SMS ${done?game.data.index:game.data.index+1} / 15`;
  phone('workshop-phone',{heading:`SMS от ${letter.from}`,code:game.code(letter.gift),caption:done?GIFTS[letter.gift].name.toLocaleUpperCase('ru'):'Одна цифра — одна буква'});
  const grid=$('gifts');grid.replaceChildren();const given=game.given();
  game.data.order.forEach((key,index)=>{const packed=given.has(key),rejected=game.data.rejected.includes(key),correct=done&&key===letter.gift;const card=make('button',`gift${Math.floor(index/7)!==game.data.shelfPage?' off-page':''}${packed?' packed':''}${rejected?' rejected':''}${correct?' correct':''}`);card.type='button';card.dataset.gift=key;card.disabled=done||packed||rejected;card.setAttribute('aria-label',`${GIFTS[key].name}${packed?', уже упакован':rejected?', этот подарок не подходит':''}`);const image=make('img');image.src=giftImage(key);image.alt='';const art=make('span','gift-art');art.append(image);card.append(art,make('span','gift-name',GIFTS[key].name));if(packed)card.append(make('span','packed-mark','✓'));grid.append(card);});
  const pager=$('gift-pager');pager.replaceChildren(make('span','','Полка'));for(let page=0;page<3;page++){const control=make('button',page===game.data.shelfPage?'selected':'',page+1);control.type='button';control.dataset.shelfPage=page;control.setAttribute('aria-label',`Полка ${page+1} из 3`);control.setAttribute('aria-pressed',String(page===game.data.shelfPage));pager.append(control);}
  $('gift-feedback').className=`feedback-bar${done?' success':game.data.errorsNow?' retry':''}`;
  $('gift-feedback-title').textContent=done?`${letter.name} получит ${GIFTS[letter.gift].acc}!`:game.data.errorsNow?'Пока не тот подарок. Попробуй ещё!':'Какое желание зашифровано?';
  $('gift-feedback-text').textContent=done?`Время: ${format(game.data.elapsedMs)} · ${game.data.errorsNow?`ошибок: ${game.data.errorsNow}`:'с первой попытки'}`:game.data.errorsNow?'Сверь каждую цифру с буквами на клавишах.':'Найди подходящее слово среди подарков.';
  $('gift-next').hidden=!done;$('gift-next').textContent=game.data.index%3===0?'К ответному SMS →':'Следующее SMS →';show('workshop');if(!done)startTimer();
}
function reply(){
  const stage=STAGES[game.stage()],done=game.data.phase==='reply-done',gift=GIFTS[stage.replyGift];
  $('reply-stage').textContent=`ЭТАП ${game.stage()+1} · ТРИ ПОДАРКА СОБРАНЫ`;$('reply-position').textContent=`Ответное SMS ${game.stage()+1} / 5`;
  phone('reply-phone',{heading:'Ответ Деду Морозу',code:done?game.code(stage.replyGift):'•••',caption:done?'Сообщение отправлено':'Выбери код справа'});
  $('reply-image').src=giftImage(stage.replyGift);$('reply-image').alt=gift.name;$('reply-word').textContent=gift.name.toLocaleUpperCase('ru');
  const choices=$('reply-choices');choices.replaceChildren();game.data.replyOptions.forEach((code,index)=>{const rejected=game.data.replyRejected.includes(code),correct=done&&code===game.code(stage.replyGift);const choice=make('button',`reply-choice${rejected?' rejected':''}${correct?' correct':''}`);choice.type='button';choice.dataset.code=code;choice.disabled=done||rejected;choice.append(make('span','option-number',rejected?'×':correct?'✓':index+1),make('strong','',code));choices.append(choice);});
  $('reply-feedback').textContent=done?'Ответ отправлен! Дед Мороз на связи.':game.data.replyRejected.length?'Этот код не подходит. Проверь буквы по порядку.':'Сначала найди клавишу первой буквы, затем переходи к следующей.';$('reply-feedback').className=`reply-feedback${done?' success':game.data.replyRejected.length?' retry':''}`;
  $('reply-next').hidden=!done;$('reply-next').textContent=game.data.index===15?'Посмотреть итоги →':'Следующий этап →';show('reply');
}
function drawAwards(id){const box=$(id);box.replaceChildren();const awards=game.awards();GAME_RULES.awards.forEach(award=>{const item=make('div',`award${awards[award.id]?' earned':''}`),copy=make('div');copy.append(make('strong','',award.name),make('p','',award.desc));item.append(make('span','award-icon',award.icon),copy);item.title=`${award.name}: ${award.desc}${awards[award.id]?' — получена':' — впереди'}`;box.append(item);});}
function drawFinishGifts(){const box=$('finish-gifts');box.replaceChildren();LETTERS.slice(finishPage*3,finishPage*3+3).forEach((letter,offset)=>{const index=finishPage*3+offset,item=make('div','finish-gift'),image=make('img');image.src=giftImage(letter.gift);image.alt=GIFTS[letter.gift].name;item.append(image,make('strong','',letter.name),make('small','',`${GIFTS[letter.gift].name} · ${format(game.data.results[index].ms)}`));box.append(item);});const pages=$('finish-pages');pages.replaceChildren();STAGES.forEach((stage,index)=>{const page=make('button',index===finishPage?'selected':'',index+1);page.type='button';page.dataset.page=index;page.setAttribute('aria-label',`Подарки этапа ${index+1}: ${stage.title}`);page.setAttribute('aria-pressed',String(index===finishPage));pages.append(page);});}
function finish(){
  const totalMs=game.data.results.reduce((sum,result)=>sum+result.ms,0),errors=game.data.results.reduce((sum,result)=>sum+result.errors,0)+game.data.replies.reduce((sum,result)=>sum+result.errors,0),stats=$('finish-stats');stats.replaceChildren();
  [[15,'подарков собрано'],[5,'ответных SMS'],[format(totalMs),'время расшифровки'],[errors,'ошибок за всю игру']].forEach(([value,label])=>{const stat=make('div');stat.append(make('strong','',value),make('span','',label));stats.append(stat);});drawAwards('finish-awards');drawFinishGifts();show('finish');
}
function paint(){switch(game.data.phase){case'incoming':incoming();break;case'decode':case'gift-done':workshop();break;case'reply':case'reply-done':reply();break;case'finish':finish();break;}}
function announce(before){const added=earned().filter(key=>!before.includes(key));if(!added.length)return;const names=added.map(id=>GAME_RULES.awards.find(award=>award.id===id).name);$('toast').textContent=`✦ ${names.join(' · ')}`;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').hidden=true;},3200);}
function action(fn){const before=earned();fn();paint();announce(before);status();}
function newGame(){if(hasProgress()&&!window.confirm('Начать заново? Прогресс этой версии, подарки и награды будут сброшены.'))return;stopTimer();finishPage=0;game.begin();paint();}
function guide(){stopTimer();const frame=$('guide-frame');if(!frame.getAttribute('src'))frame.setAttribute('src',frame.getAttribute('data-src'));$('guide-modal').showModal();}
function closeGuide(){$('guide-modal').close();if(currentView==='workshop')startTimer();}
$('start-button').addEventListener('click',newGame);$('restart-button').addEventListener('click',newGame);$('continue-button').addEventListener('click',paint);$('home-button').addEventListener('click',home);
$('open-button').addEventListener('click',()=>action(()=>{game.open();sound();}));
$('gifts').addEventListener('click',event=>{const target=event.target.closest('button[data-gift]');if(!target||target.disabled)return;stopTimer();action(()=>{const result=game.chooseGift(target.dataset.gift);if(result.accepted)sound(result.correct);});});
$('gift-pager').addEventListener('click',event=>{const target=event.target.closest('button[data-shelf-page]');if(!target)return;stopTimer();if(game.setShelfPage(Number(target.dataset.shelfPage)))workshop();});
$('reply-choices').addEventListener('click',event=>{const target=event.target.closest('button[data-code]');if(!target||target.disabled)return;action(()=>{const result=game.chooseReply(target.dataset.code);if(result.accepted)sound(result.correct);});});
['gift-next','reply-next'].forEach(id=>$(id).addEventListener('click',()=>action(()=>game.next())));
$('sound-button').addEventListener('click',()=>{game.setSound(!game.data.sound);status();if(game.data.sound)sound();});
['guide-button','finish-guide'].forEach(id=>$(id).addEventListener('click',guide));$('guide-close').addEventListener('click',closeGuide);$('guide-modal').addEventListener('close',()=>{if(currentView==='workshop')startTimer();});
$('awards-button').addEventListener('click',()=>{stopTimer();drawAwards('all-awards');$('awards-modal').showModal();});$('awards-close').addEventListener('click',()=>{$('awards-modal').close();});$('awards-modal').addEventListener('close',()=>{if(currentView==='workshop')startTimer();});
function syncDiplomaName(){const name=$('diploma-name').value?.trim()||'';$('diploma-print-name').textContent=name;$('diploma-print-name').className='diploma-print-name'+(name?'':' is-empty');}
$('diploma-name').addEventListener('input',syncDiplomaName);window.addEventListener('beforeprint',syncDiplomaName);
$('diploma-button').addEventListener('click',()=>{$('diploma-modal').showModal();});$('diploma-close').addEventListener('click',()=>{$('diploma-modal').close();});$('print-button').addEventListener('click',()=>{syncDiplomaName();$('diploma-name').blur();window.print();});
$('finish-pages').addEventListener('click',event=>{const target=event.target.closest('button[data-page]');if(target){finishPage=Number(target.dataset.page);drawFinishGifts();}});
function finishTab(panel){$('finish-content').dataset.panel=panel;$('awards-tab').setAttribute('aria-selected',String(panel==='awards'));$('gifts-tab').setAttribute('aria-selected',String(panel==='gifts'));}
$('awards-tab').addEventListener('click',()=>finishTab('awards'));$('gifts-tab').addEventListener('click',()=>finishTab('gifts'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTimer();else if(currentView==='workshop')startTimer();});window.addEventListener('pagehide',stopTimer);
home();
