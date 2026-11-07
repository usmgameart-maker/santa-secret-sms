(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SmsWorkshop=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const SAVE_KEY='think-grow.hello-santa.v1';
  const phases=['incoming','decode','gift-done','reply','reply-done','finish'];
  function shuffle(values,random=Math.random){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
  function encode(word,keys){
    const map={};keys.forEach(key=>Array.from(key.letters).forEach(letter=>map[letter]=key.digit));
    return Array.from(String(word).toUpperCase()).map(letter=>{if(/\s/.test(letter))return ' ';if(!map[letter])throw Error(`Нет буквы в раскладке: ${letter}`);return map[letter];}).join('');
  }
  class Workshop {
    constructor(content,storage,random=Math.random){
      this.content=content;this.storage=storage;this.random=random;this.persistent=false;this.restored=false;
      this.signature=JSON.stringify([content.letters,content.keys,content.stages,Object.entries(content.gifts).map(([key,value])=>[key,value.name])]);
      this.data=this.empty();
      try{const saved=JSON.parse(storage.getItem(SAVE_KEY));const valid=this.normalize(saved);if(valid){this.data=valid;this.restored=valid.started;}}catch{}
      try{storage.setItem(`${SAVE_KEY}.check`,'1');storage.removeItem(`${SAVE_KEY}.check`);this.persistent=true;}catch{}
    }
    empty(){return {version:1,sig:this.signature,started:false,index:0,phase:'incoming',results:[],replies:[],rejected:[],replyRejected:[],replyOptions:[],errorsNow:0,elapsedMs:0,order:shuffle(Object.keys(this.content.gifts),this.random),shelfPage:0,sound:true};}
    normalize(raw){
      if(!raw||raw.version!==1||raw.sig!==this.signature||typeof raw.started!=='boolean'||!phases.includes(raw.phase)||!Number.isInteger(raw.index)||raw.index<0||raw.index>15)return null;
      if(!Array.isArray(raw.results)||raw.results.length!==raw.index||raw.results.some(item=>!item||!Number.isSafeInteger(item.ms)||item.ms<0||!Number.isInteger(item.errors)||item.errors<0||item.errors>20))return null;
      if(!Array.isArray(raw.replies)||raw.replies.length>5||raw.replies.some((item,index)=>!item||item.code!==this.code(this.content.stages[index].replyGift)||!Number.isInteger(item.errors)||item.errors<0||item.errors>2))return null;
      const expected=raw.phase==='gift-done'?Math.floor((raw.index-1)/3):raw.phase==='reply'?raw.index/3-1:raw.phase==='reply-done'?raw.index/3:Math.floor(raw.index/3);
      if(expected!==raw.replies.length)return null;
      if((raw.phase==='incoming'||raw.phase==='decode')&&raw.index===15)return null;
      if(raw.phase==='gift-done'&&raw.index===0)return null;
      if((raw.phase==='reply'||raw.phase==='reply-done')&&(raw.index===0||raw.index%3))return null;
      if(raw.phase==='finish'&&(raw.index!==15||raw.replies.length!==5))return null;
      if(!raw.started&&(raw.index||raw.phase!=='incoming'))return null;
      const keys=Object.keys(this.content.gifts);
      if(!Array.isArray(raw.order)||raw.order.length!==keys.length||new Set(raw.order).size!==keys.length||raw.order.some(key=>!keys.includes(key)))return null;
      if(!Array.isArray(raw.rejected)||new Set(raw.rejected).size!==raw.rejected.length||raw.rejected.some(key=>!keys.includes(key))||raw.errorsNow!==raw.rejected.length)return null;
      const lastGift=['gift-done','reply','reply-done'].includes(raw.phase);
      const current=this.content.letters[Math.min(14,lastGift?raw.index-1:raw.index)];
      if(current&&raw.rejected.includes(current.gift))return null;
      if(!Number.isSafeInteger(raw.elapsedMs)||raw.elapsedMs<0||typeof raw.sound!=='boolean')return null;
      if(!Array.isArray(raw.replyRejected)||raw.replyRejected.length>2||new Set(raw.replyRejected).size!==raw.replyRejected.length)return null;
      if(!Array.isArray(raw.replyOptions))return null;
      if(!Number.isInteger(raw.shelfPage)||raw.shelfPage<0||raw.shelfPage>2)return null;
      if(raw.phase==='reply'||raw.phase==='reply-done'){
        const answer=this.code(this.content.stages[raw.index/3-1].replyGift);
        if(raw.replyOptions.length!==3||new Set(raw.replyOptions).size!==3||!raw.replyOptions.includes(answer)||raw.replyOptions.some(code=>typeof code!=='string'||!/^\d+$/.test(code)||code.length!==answer.length)||raw.replyRejected.some(code=>!raw.replyOptions.includes(code)||code===answer))return null;
      }
      return JSON.parse(JSON.stringify(raw));
    }
    save(){try{this.storage.setItem(SAVE_KEY,JSON.stringify(this.data));this.persistent=true;}catch{this.persistent=false;}}
    begin(){const sound=this.data.sound;this.data=this.empty();this.data.sound=sound;this.data.started=true;this.save();}
    code(key){return encode(this.content.gifts[key].name,this.content.keys);}
    letter(){return this.content.letters[this.data.phase==='gift-done'?this.data.index-1:Math.min(this.data.index,14)];}
    stage(){return Math.min(4,Math.max(0,Math.floor((this.data.phase==='gift-done'||this.data.phase==='reply'||this.data.phase==='reply-done'?this.data.index-1:this.data.index)/3)));}
    open(){if(this.data.phase!=='incoming'||!this.data.started)return false;this.data.phase='decode';this.data.errorsNow=0;this.data.rejected=[];this.data.elapsedMs=0;this.save();return true;}
    time(ms){if(this.data.phase==='decode'&&Number.isSafeInteger(ms)&&ms>=0){this.data.elapsedMs=ms;this.save();}}
    chooseGift(key){
      const d=this.data;if(d.phase!=='decode'||!this.content.gifts[key]||d.rejected.includes(key)||this.given().has(key))return {accepted:false};
      const letter=this.letter();
      if(key!==letter.gift){d.rejected.push(key);d.errorsNow++;this.save();return {accepted:true,correct:false};}
      d.results.push({ms:d.elapsedMs,errors:d.errorsNow});d.index++;d.phase='gift-done';this.save();return {accepted:true,correct:true};
    }
    given(){return new Set(this.content.letters.slice(0,this.data.index).map(letter=>letter.gift));}
    makeReply(){
      const correct=this.code(this.content.stages[this.data.index/3-1].replyGift);
      const variants=new Set([correct]);let position=0;
      while(variants.size<3){const index=position%correct.length;const digit=(Number(correct[index])+1+Math.floor(position/correct.length))%10;variants.add(correct.slice(0,index)+digit+correct.slice(index+1));position++;}
      this.data.replyOptions=shuffle([...variants],this.random);this.data.replyRejected=[];
    }
    chooseReply(code){
      const d=this.data;if(d.phase!=='reply'||!d.replyOptions.includes(code)||d.replyRejected.includes(code))return {accepted:false};
      const correct=this.code(this.content.stages[d.index/3-1].replyGift);
      if(code!==correct){d.replyRejected.push(code);this.save();return {accepted:true,correct:false};}
      d.replies.push({code,errors:d.replyRejected.length});d.phase='reply-done';this.save();return {accepted:true,correct:true};
    }
    next(){
      const d=this.data;
      if(d.phase==='gift-done'){
        if(d.index%3===0){d.phase='reply';this.makeReply();}else{d.phase='incoming';d.elapsedMs=0;d.errorsNow=0;d.rejected=[];}
      }else if(d.phase==='reply-done'){
        d.phase=d.index===15?'finish':'incoming';d.elapsedMs=0;d.errorsNow=0;d.rejected=[];
      }else return false;
      this.save();return true;
    }
    awards(){
      const d=this.data;let streak=0,best=0;d.results.forEach(result=>{streak=result.errors===0?streak+1:0;best=Math.max(best,streak);});
      return {first:d.index>=1,reply:d.replies.length>=1,streak:best>=5,half:d.index>=8,long:d.results.some((result,index)=>result.errors===0&&this.content.gifts[this.content.letters[index].gift].name.length>=10),clean:d.index===15&&d.replies.length===5&&d.results.every(result=>!result.errors)&&d.replies.every(result=>!result.errors),dispatch:d.replies.length===5,all:d.index===15&&d.replies.length===5};
    }
    setSound(enabled){this.data.sound=Boolean(enabled);this.save();}
    setShelfPage(page){if(!Number.isInteger(page)||page<0||page>2)return false;this.data.shelfPage=page;this.save();return true;}
  }
  return {Workshop,encode,shuffle,SAVE_KEY};
});
