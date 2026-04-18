import{r as oe,g as ke}from"./react-gH-7aFTg.js";function ge(e,t){for(var s=0;s<t.length;s++){const n=t[s];if(typeof n!="string"&&!Array.isArray(n)){for(const r in n)if(r!=="default"&&!(r in e)){const i=Object.getOwnPropertyDescriptor(n,r);i&&Object.defineProperty(e,r,i.get?i:{enumerable:!0,get:()=>n[r]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}var D={exports:{}},N={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var W;function be(){if(W)return N;W=1;var e=Symbol.for("react.transitional.element"),t=Symbol.for("react.fragment");function s(n,r,i){var u=null;if(i!==void 0&&(u=""+i),r.key!==void 0&&(u=""+r.key),"key"in r){i={};for(var a in r)a!=="key"&&(i[a]=r[a])}else i=r;return r=i.ref,{$$typeof:e,type:n,key:u,ref:r!==void 0?r:null,props:i}}return N.Fragment=t,N.jsx=s,N.jsxs=s,N}var B;function Me(){return B||(B=1,D.exports=be()),D.exports}var we=Me(),g=oe();const xe=ke(g),Is=ge({__proto__:null,default:xe},[g]);var T={exports:{}},H={};/**
 * @license React
 * use-sync-external-store-with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Z;function _e(){if(Z)return H;Z=1;var e=oe();function t(c,h){return c===h&&(c!==0||1/c===1/h)||c!==c&&h!==h}var s=typeof Object.is=="function"?Object.is:t,n=e.useSyncExternalStore,r=e.useRef,i=e.useEffect,u=e.useMemo,a=e.useDebugValue;return H.useSyncExternalStoreWithSelector=function(c,h,l,p,v){var k=r(null);if(k.current===null){var f={hasValue:!1,value:null};k.current=f}else f=k.current;k=u(function(){function d(x){if(!m){if(m=!0,b=x,x=p(x),v!==void 0&&f.hasValue){var O=f.value;if(v(O,x))return _=O}return _=x}if(O=_,s(b,x))return O;var G=p(x);return v!==void 0&&v(O,G)?(b=x,O):(b=x,_=G)}var m=!1,b,_,C=l===void 0?null:l;return[function(){return d(h())},C===null?void 0:function(){return d(C())}]},[h,l,p,v]);var y=n(c,k[0],k[1]);return i(function(){f.hasValue=!0,f.value=y},[y]),a(y),y},H}var J;function Se(){return J||(J=1,T.exports=_e()),T.exports}var Ce=Se();function Oe(e){e()}function Pe(){let e=null,t=null;return{clear(){e=null,t=null},notify(){Oe(()=>{let s=e;for(;s;)s.callback(),s=s.next})},get(){const s=[];let n=e;for(;n;)s.push(n),n=n.next;return s},subscribe(s){let n=!0;const r=t={callback:s,next:null,prev:t};return r.prev?r.prev.next=r:e=r,function(){!n||e===null||(n=!1,r.next?r.next.prev=r.prev:t=r.prev,r.prev?r.prev.next=r.next:e=r.next)}}}}var Y={notify(){},get:()=>[]};function Ne(e,t){let s,n=Y,r=0,i=!1;function u(y){l();const d=n.subscribe(y);let m=!1;return()=>{m||(m=!0,d(),p())}}function a(){n.notify()}function c(){f.onStateChange&&f.onStateChange()}function h(){return i}function l(){r++,s||(s=e.subscribe(c),n=Pe())}function p(){r--,s&&r===0&&(s(),s=void 0,n.clear(),n=Y)}function v(){i||(i=!0,l())}function k(){i&&(i=!1,p())}const f={addNestedSub:u,notifyNestedSubs:a,handleChangeWrapper:c,isSubscribed:h,trySubscribe:v,tryUnsubscribe:k,getListeners:()=>n};return f}var Ee=()=>typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",je=Ee(),qe=()=>typeof navigator<"u"&&navigator.product==="ReactNative",Re=qe(),$e=()=>je||Re?g.useLayoutEffect:g.useEffect,Ae=$e(),Fe=Symbol.for("react-redux-context"),De=typeof globalThis<"u"?globalThis:{};function Te(){if(!g.createContext)return{};const e=De[Fe]??=new Map;let t=e.get(g.createContext);return t||(t=g.createContext(null),e.set(g.createContext,t)),t}var P=Te();function He(e){const{children:t,context:s,serverState:n,store:r}=e,i=g.useMemo(()=>{const c=Ne(r);return{store:r,subscription:c,getServerState:n?()=>n:void 0}},[r,n]),u=g.useMemo(()=>r.getState(),[r]);Ae(()=>{const{subscription:c}=i;return c.onStateChange=c.notifyNestedSubs,c.trySubscribe(),u!==r.getState()&&c.notifyNestedSubs(),()=>{c.tryUnsubscribe(),c.onStateChange=void 0}},[i,u]);const a=s||P;return g.createElement(a.Provider,{value:i},t)}var zs=He;function z(e=P){return function(){return g.useContext(e)}}var ce=z();function ue(e=P){const t=e===P?ce:z(e),s=()=>{const{store:n}=t();return n};return Object.assign(s,{withTypes:()=>s}),s}var Le=ue();function Qe(e=P){const t=e===P?Le:ue(e),s=()=>t().dispatch;return Object.assign(s,{withTypes:()=>s}),s}var Vs=Qe(),Ue=(e,t)=>e===t;function Ie(e=P){const t=e===P?ce:z(e),s=(n,r={})=>{const{equalityFn:i=Ue}=typeof r=="function"?{equalityFn:r}:r,u=t(),{store:a,subscription:c,getServerState:h}=u;g.useRef(!0);const l=g.useCallback({[n.name](v){return n(v)}}[n.name],[n]),p=Ce.useSyncExternalStoreWithSelector(c.addNestedSub,a.getState,h||a.getState,l,i);return g.useDebugValue(p),p};return Object.assign(s,{withTypes:()=>s}),s}var Ks=Ie();function M(e){return`Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `}var ze=typeof Symbol=="function"&&Symbol.observable||"@@observable",X=ze,L=()=>Math.random().toString(36).substring(7).split("").join("."),Ve={INIT:`@@redux/INIT${L()}`,REPLACE:`@@redux/REPLACE${L()}`,PROBE_UNKNOWN_ACTION:()=>`@@redux/PROBE_UNKNOWN_ACTION${L()}`},R=Ve;function he(e){if(typeof e!="object"||e===null)return!1;let t=e;for(;Object.getPrototypeOf(t)!==null;)t=Object.getPrototypeOf(t);return Object.getPrototypeOf(e)===t||Object.getPrototypeOf(e)===null}function Ke(e,t,s){if(typeof e!="function")throw new Error(M(2));if(typeof t=="function"&&typeof s=="function"||typeof s=="function"&&typeof arguments[3]=="function")throw new Error(M(0));if(typeof t=="function"&&typeof s>"u"&&(s=t,t=void 0),typeof s<"u"){if(typeof s!="function")throw new Error(M(1));return s(Ke)(e,t)}let n=e,r=t,i=new Map,u=i,a=0,c=!1;function h(){u===i&&(u=new Map,i.forEach((d,m)=>{u.set(m,d)}))}function l(){if(c)throw new Error(M(3));return r}function p(d){if(typeof d!="function")throw new Error(M(4));if(c)throw new Error(M(5));let m=!0;h();const b=a++;return u.set(b,d),function(){if(m){if(c)throw new Error(M(6));m=!1,h(),u.delete(b),i=null}}}function v(d){if(!he(d))throw new Error(M(7));if(typeof d.type>"u")throw new Error(M(8));if(typeof d.type!="string")throw new Error(M(17));if(c)throw new Error(M(9));try{c=!0,r=n(r,d)}finally{c=!1}return(i=u).forEach(b=>{b()}),d}function k(d){if(typeof d!="function")throw new Error(M(10));n=d,v({type:R.REPLACE})}function f(){const d=p;return{subscribe(m){if(typeof m!="object"||m===null)throw new Error(M(11));function b(){const C=m;C.next&&C.next(l())}return b(),{unsubscribe:d(b)}},[X](){return this}}}return v({type:R.INIT}),{dispatch:v,subscribe:p,getState:l,replaceReducer:k,[X]:f}}function Ge(e){Object.keys(e).forEach(t=>{const s=e[t];if(typeof s(void 0,{type:R.INIT})>"u")throw new Error(M(12));if(typeof s(void 0,{type:R.PROBE_UNKNOWN_ACTION()})>"u")throw new Error(M(13))})}function Gs(e){const t=Object.keys(e),s={};for(let i=0;i<t.length;i++){const u=t[i];typeof e[u]=="function"&&(s[u]=e[u])}const n=Object.keys(s);let r;try{Ge(s)}catch(i){r=i}return function(u={},a){if(r)throw r;let c=!1;const h={};for(let l=0;l<n.length;l++){const p=n[l],v=s[p],k=u[p],f=v(k,a);if(typeof f>"u")throw a&&a.type,new Error(M(14));h[p]=f,c=c||f!==k}return c=c||n.length!==Object.keys(u).length,c?h:u}}function We(...e){return e.length===0?t=>t:e.length===1?e[0]:e.reduce((t,s)=>(...n)=>t(s(...n)))}function Ws(...e){return t=>(s,n)=>{const r=t(s,n);let i=()=>{throw new Error(M(15))};const u={getState:r.getState,dispatch:(c,...h)=>i(c,...h)},a=e.map(c=>c(u));return i=We(...a)(r.dispatch),{...r,dispatch:i}}}function Bs(e){return he(e)&&"type"in e&&typeof e.type=="string"}var A=class{constructor(){this.listeners=new Set,this.subscribe=this.subscribe.bind(this)}subscribe(e){return this.listeners.add(e),this.onSubscribe(),()=>{this.listeners.delete(e),this.onUnsubscribe()}}hasListeners(){return this.listeners.size>0}onSubscribe(){}onUnsubscribe(){}},F=typeof window>"u"||"Deno"in globalThis;function S(){}function Be(e,t){return typeof e=="function"?e(t):e}function Ze(e){return typeof e=="number"&&e>=0&&e!==1/0}function Je(e,t){return Math.max(e+(t||0)-Date.now(),0)}function Q(e,t){return typeof e=="function"?e(t):e}function Ye(e,t){return typeof e=="function"?e(t):e}function ee(e,t){const{type:s="all",exact:n,fetchStatus:r,predicate:i,queryKey:u,stale:a}=e;if(u){if(n){if(t.queryHash!==V(u,t.options))return!1}else if(!j(t.queryKey,u))return!1}if(s!=="all"){const c=t.isActive();if(s==="active"&&!c||s==="inactive"&&c)return!1}return!(typeof a=="boolean"&&t.isStale()!==a||r&&r!==t.state.fetchStatus||i&&!i(t))}function te(e,t){const{exact:s,status:n,predicate:r,mutationKey:i}=e;if(i){if(!t.options.mutationKey)return!1;if(s){if(E(t.options.mutationKey)!==E(i))return!1}else if(!j(t.options.mutationKey,i))return!1}return!(n&&t.state.status!==n||r&&!r(t))}function V(e,t){return(t?.queryKeyHashFn||E)(e)}function E(e){return JSON.stringify(e,(t,s)=>U(s)?Object.keys(s).sort().reduce((n,r)=>(n[r]=s[r],n),{}):s)}function j(e,t){return e===t?!0:typeof e!=typeof t?!1:e&&t&&typeof e=="object"&&typeof t=="object"?Object.keys(t).every(s=>j(e[s],t[s])):!1}var Xe=Object.prototype.hasOwnProperty;function le(e,t){if(e===t)return e;const s=se(e)&&se(t);if(!s&&!(U(e)&&U(t)))return t;const r=(s?e:Object.keys(e)).length,i=s?t:Object.keys(t),u=i.length,a=s?new Array(u):{};let c=0;for(let h=0;h<u;h++){const l=s?h:i[h],p=e[l],v=t[l];if(p===v){a[l]=p,(s?h<r:Xe.call(e,l))&&c++;continue}if(p===null||v===null||typeof p!="object"||typeof v!="object"){a[l]=v;continue}const k=le(p,v);a[l]=k,k===p&&c++}return r===u&&c===r?e:a}function se(e){return Array.isArray(e)&&e.length===Object.keys(e).length}function U(e){if(!ne(e))return!1;const t=e.constructor;if(t===void 0)return!0;const s=t.prototype;return!(!ne(s)||!s.hasOwnProperty("isPrototypeOf")||Object.getPrototypeOf(e)!==Object.prototype)}function ne(e){return Object.prototype.toString.call(e)==="[object Object]"}function et(e){return new Promise(t=>{setTimeout(t,e)})}function tt(e,t,s){return typeof s.structuralSharing=="function"?s.structuralSharing(e,t):s.structuralSharing!==!1?le(e,t):t}function st(e,t,s=0){const n=[...e,t];return s&&n.length>s?n.slice(1):n}function nt(e,t,s=0){const n=[t,...e];return s&&n.length>s?n.slice(0,-1):n}var K=Symbol();function de(e,t){return!e.queryFn&&t?.initialPromise?()=>t.initialPromise:!e.queryFn||e.queryFn===K?()=>Promise.reject(new Error(`Missing queryFn: '${e.queryHash}'`)):e.queryFn}var rt=class extends A{#e;#t;#s;constructor(){super(),this.#s=e=>{if(!F&&window.addEventListener){const t=()=>e();return window.addEventListener("visibilitychange",t,!1),()=>{window.removeEventListener("visibilitychange",t)}}}}onSubscribe(){this.#t||this.setEventListener(this.#s)}onUnsubscribe(){this.hasListeners()||(this.#t?.(),this.#t=void 0)}setEventListener(e){this.#s=e,this.#t?.(),this.#t=e(t=>{typeof t=="boolean"?this.setFocused(t):this.onFocus()})}setFocused(e){this.#e!==e&&(this.#e=e,this.onFocus())}onFocus(){const e=this.isFocused();this.listeners.forEach(t=>{t(e)})}isFocused(){return typeof this.#e=="boolean"?this.#e:globalThis.document?.visibilityState!=="hidden"}},fe=new rt,it=class extends A{#e=!0;#t;#s;constructor(){super(),this.#s=e=>{if(!F&&window.addEventListener){const t=()=>e(!0),s=()=>e(!1);return window.addEventListener("online",t,!1),window.addEventListener("offline",s,!1),()=>{window.removeEventListener("online",t),window.removeEventListener("offline",s)}}}}onSubscribe(){this.#t||this.setEventListener(this.#s)}onUnsubscribe(){this.hasListeners()||(this.#t?.(),this.#t=void 0)}setEventListener(e){this.#s=e,this.#t?.(),this.#t=e(this.setOnline.bind(this))}setOnline(e){this.#e!==e&&(this.#e=e,this.listeners.forEach(s=>{s(e)}))}isOnline(){return this.#e}},$=new it;function at(){let e,t;const s=new Promise((r,i)=>{e=r,t=i});s.status="pending",s.catch(()=>{});function n(r){Object.assign(s,r),delete s.resolve,delete s.reject}return s.resolve=r=>{n({status:"fulfilled",value:r}),e(r)},s.reject=r=>{n({status:"rejected",reason:r}),t(r)},s}function ot(e){return Math.min(1e3*2**e,3e4)}function ye(e){return(e??"online")==="online"?$.isOnline():!0}var I=class extends Error{constructor(e){super("CancelledError"),this.revert=e?.revert,this.silent=e?.silent}};function pe(e){let t=!1,s=0,n;const r=at(),i=()=>r.status!=="pending",u=y=>{if(!i()){const d=new I(y);v(d),e.onCancel?.(d)}},a=()=>{t=!0},c=()=>{t=!1},h=()=>fe.isFocused()&&(e.networkMode==="always"||$.isOnline())&&e.canRun(),l=()=>ye(e.networkMode)&&e.canRun(),p=y=>{i()||(n?.(),r.resolve(y))},v=y=>{i()||(n?.(),r.reject(y))},k=()=>new Promise(y=>{n=d=>{(i()||h())&&y(d)},e.onPause?.()}).then(()=>{n=void 0,i()||e.onContinue?.()}),f=()=>{if(i())return;let y;const d=s===0?e.initialPromise:void 0;try{y=d??e.fn()}catch(m){y=Promise.reject(m)}Promise.resolve(y).then(p).catch(m=>{if(i())return;const b=e.retry??(F?0:3),_=e.retryDelay??ot,C=typeof _=="function"?_(s,m):_,x=b===!0||typeof b=="number"&&s<b||typeof b=="function"&&b(s,m);if(t||!x){v(m);return}s++,e.onFail?.(s,m),et(C).then(()=>h()?void 0:k()).then(()=>{t?v(m):f()})})};return{promise:r,status:()=>r.status,cancel:u,continue:()=>(n?.(),r),cancelRetry:a,continueRetry:c,canStart:l,start:()=>(l()?f():k().then(f),r)}}var ct=e=>setTimeout(e,0);function ut(){let e=[],t=0,s=a=>{a()},n=a=>{a()},r=ct;const i=a=>{t?e.push(a):r(()=>{s(a)})},u=()=>{const a=e;e=[],a.length&&r(()=>{n(()=>{a.forEach(c=>{s(c)})})})};return{batch:a=>{let c;t++;try{c=a()}finally{t--,t||u()}return c},batchCalls:a=>(...c)=>{i(()=>{a(...c)})},schedule:i,setNotifyFunction:a=>{s=a},setBatchNotifyFunction:a=>{n=a},setScheduler:a=>{r=a}}}var w=ut(),ve=class{#e;destroy(){this.clearGcTimeout()}scheduleGc(){this.clearGcTimeout(),Ze(this.gcTime)&&(this.#e=setTimeout(()=>{this.optionalRemove()},this.gcTime))}updateGcTime(e){this.gcTime=Math.max(this.gcTime||0,e??(F?1/0:300*1e3))}clearGcTimeout(){this.#e&&(clearTimeout(this.#e),this.#e=void 0)}},ht=class extends ve{#e;#t;#s;#r;#n;#a;#o;constructor(e){super(),this.#o=!1,this.#a=e.defaultOptions,this.setOptions(e.options),this.observers=[],this.#r=e.client,this.#s=this.#r.getQueryCache(),this.queryKey=e.queryKey,this.queryHash=e.queryHash,this.#e=dt(this.options),this.state=e.state??this.#e,this.scheduleGc()}get meta(){return this.options.meta}get promise(){return this.#n?.promise}setOptions(e){this.options={...this.#a,...e},this.updateGcTime(this.options.gcTime)}optionalRemove(){!this.observers.length&&this.state.fetchStatus==="idle"&&this.#s.remove(this)}setData(e,t){const s=tt(this.state.data,e,this.options);return this.#i({data:s,type:"success",dataUpdatedAt:t?.updatedAt,manual:t?.manual}),s}setState(e,t){this.#i({type:"setState",state:e,setStateOptions:t})}cancel(e){const t=this.#n?.promise;return this.#n?.cancel(e),t?t.then(S).catch(S):Promise.resolve()}destroy(){super.destroy(),this.cancel({silent:!0})}reset(){this.destroy(),this.setState(this.#e)}isActive(){return this.observers.some(e=>Ye(e.options.enabled,this)!==!1)}isDisabled(){return this.getObserversCount()>0?!this.isActive():this.options.queryFn===K||this.state.dataUpdateCount+this.state.errorUpdateCount===0}isStatic(){return this.getObserversCount()>0?this.observers.some(e=>Q(e.options.staleTime,this)==="static"):!1}isStale(){return this.getObserversCount()>0?this.observers.some(e=>e.getCurrentResult().isStale):this.state.data===void 0||this.state.isInvalidated}isStaleByTime(e=0){return this.state.data===void 0?!0:e==="static"?!1:this.state.isInvalidated?!0:!Je(this.state.dataUpdatedAt,e)}onFocus(){this.observers.find(t=>t.shouldFetchOnWindowFocus())?.refetch({cancelRefetch:!1}),this.#n?.continue()}onOnline(){this.observers.find(t=>t.shouldFetchOnReconnect())?.refetch({cancelRefetch:!1}),this.#n?.continue()}addObserver(e){this.observers.includes(e)||(this.observers.push(e),this.clearGcTimeout(),this.#s.notify({type:"observerAdded",query:this,observer:e}))}removeObserver(e){this.observers.includes(e)&&(this.observers=this.observers.filter(t=>t!==e),this.observers.length||(this.#n&&(this.#o?this.#n.cancel({revert:!0}):this.#n.cancelRetry()),this.scheduleGc()),this.#s.notify({type:"observerRemoved",query:this,observer:e}))}getObserversCount(){return this.observers.length}invalidate(){this.state.isInvalidated||this.#i({type:"invalidate"})}async fetch(e,t){if(this.state.fetchStatus!=="idle"&&this.#n?.status()!=="rejected"){if(this.state.data!==void 0&&t?.cancelRefetch)this.cancel({silent:!0});else if(this.#n)return this.#n.continueRetry(),this.#n.promise}if(e&&this.setOptions(e),!this.options.queryFn){const a=this.observers.find(c=>c.options.queryFn);a&&this.setOptions(a.options)}const s=new AbortController,n=a=>{Object.defineProperty(a,"signal",{enumerable:!0,get:()=>(this.#o=!0,s.signal)})},r=()=>{const a=de(this.options,t),h=(()=>{const l={client:this.#r,queryKey:this.queryKey,meta:this.meta};return n(l),l})();return this.#o=!1,this.options.persister?this.options.persister(a,h,this):a(h)},u=(()=>{const a={fetchOptions:t,options:this.options,queryKey:this.queryKey,client:this.#r,state:this.state,fetchFn:r};return n(a),a})();this.options.behavior?.onFetch(u,this),this.#t=this.state,(this.state.fetchStatus==="idle"||this.state.fetchMeta!==u.fetchOptions?.meta)&&this.#i({type:"fetch",meta:u.fetchOptions?.meta}),this.#n=pe({initialPromise:t?.initialPromise,fn:u.fetchFn,onCancel:a=>{a instanceof I&&a.revert&&this.setState({...this.#t,fetchStatus:"idle"}),s.abort()},onFail:(a,c)=>{this.#i({type:"failed",failureCount:a,error:c})},onPause:()=>{this.#i({type:"pause"})},onContinue:()=>{this.#i({type:"continue"})},retry:u.options.retry,retryDelay:u.options.retryDelay,networkMode:u.options.networkMode,canRun:()=>!0});try{const a=await this.#n.start();if(a===void 0)throw new Error(`${this.queryHash} data is undefined`);return this.setData(a),this.#s.config.onSuccess?.(a,this),this.#s.config.onSettled?.(a,this.state.error,this),a}catch(a){if(a instanceof I){if(a.silent)return this.#n.promise;if(a.revert){if(this.state.data===void 0)throw a;return this.state.data}}throw this.#i({type:"error",error:a}),this.#s.config.onError?.(a,this),this.#s.config.onSettled?.(this.state.data,a,this),a}finally{this.scheduleGc()}}#i(e){const t=s=>{switch(e.type){case"failed":return{...s,fetchFailureCount:e.failureCount,fetchFailureReason:e.error};case"pause":return{...s,fetchStatus:"paused"};case"continue":return{...s,fetchStatus:"fetching"};case"fetch":return{...s,...lt(s.data,this.options),fetchMeta:e.meta??null};case"success":const n={...s,data:e.data,dataUpdateCount:s.dataUpdateCount+1,dataUpdatedAt:e.dataUpdatedAt??Date.now(),error:null,isInvalidated:!1,status:"success",...!e.manual&&{fetchStatus:"idle",fetchFailureCount:0,fetchFailureReason:null}};return this.#t=e.manual?n:void 0,n;case"error":const r=e.error;return{...s,error:r,errorUpdateCount:s.errorUpdateCount+1,errorUpdatedAt:Date.now(),fetchFailureCount:s.fetchFailureCount+1,fetchFailureReason:r,fetchStatus:"idle",status:"error"};case"invalidate":return{...s,isInvalidated:!0};case"setState":return{...s,...e.state}}};this.state=t(this.state),w.batch(()=>{this.observers.forEach(s=>{s.onQueryUpdate()}),this.#s.notify({query:this,type:"updated",action:e})})}};function lt(e,t){return{fetchFailureCount:0,fetchFailureReason:null,fetchStatus:ye(t.networkMode)?"fetching":"paused",...e===void 0&&{error:null,status:"pending"}}}function dt(e){const t=typeof e.initialData=="function"?e.initialData():e.initialData,s=t!==void 0,n=s?typeof e.initialDataUpdatedAt=="function"?e.initialDataUpdatedAt():e.initialDataUpdatedAt:0;return{data:t,dataUpdateCount:0,dataUpdatedAt:s?n??Date.now():0,error:null,errorUpdateCount:0,errorUpdatedAt:0,fetchFailureCount:0,fetchFailureReason:null,fetchMeta:null,isInvalidated:!1,status:s?"success":"pending",fetchStatus:"idle"}}var ft=class extends A{constructor(e={}){super(),this.config=e,this.#e=new Map}#e;build(e,t,s){const n=t.queryKey,r=t.queryHash??V(n,t);let i=this.get(r);return i||(i=new ht({client:e,queryKey:n,queryHash:r,options:e.defaultQueryOptions(t),state:s,defaultOptions:e.getQueryDefaults(n)}),this.add(i)),i}add(e){this.#e.has(e.queryHash)||(this.#e.set(e.queryHash,e),this.notify({type:"added",query:e}))}remove(e){const t=this.#e.get(e.queryHash);t&&(e.destroy(),t===e&&this.#e.delete(e.queryHash),this.notify({type:"removed",query:e}))}clear(){w.batch(()=>{this.getAll().forEach(e=>{this.remove(e)})})}get(e){return this.#e.get(e)}getAll(){return[...this.#e.values()]}find(e){const t={exact:!0,...e};return this.getAll().find(s=>ee(t,s))}findAll(e={}){const t=this.getAll();return Object.keys(e).length>0?t.filter(s=>ee(e,s)):t}notify(e){w.batch(()=>{this.listeners.forEach(t=>{t(e)})})}onFocus(){w.batch(()=>{this.getAll().forEach(e=>{e.onFocus()})})}onOnline(){w.batch(()=>{this.getAll().forEach(e=>{e.onOnline()})})}},yt=class extends ve{#e;#t;#s;constructor(e){super(),this.mutationId=e.mutationId,this.#t=e.mutationCache,this.#e=[],this.state=e.state||pt(),this.setOptions(e.options),this.scheduleGc()}setOptions(e){this.options=e,this.updateGcTime(this.options.gcTime)}get meta(){return this.options.meta}addObserver(e){this.#e.includes(e)||(this.#e.push(e),this.clearGcTimeout(),this.#t.notify({type:"observerAdded",mutation:this,observer:e}))}removeObserver(e){this.#e=this.#e.filter(t=>t!==e),this.scheduleGc(),this.#t.notify({type:"observerRemoved",mutation:this,observer:e})}optionalRemove(){this.#e.length||(this.state.status==="pending"?this.scheduleGc():this.#t.remove(this))}continue(){return this.#s?.continue()??this.execute(this.state.variables)}async execute(e){const t=()=>{this.#r({type:"continue"})};this.#s=pe({fn:()=>this.options.mutationFn?this.options.mutationFn(e):Promise.reject(new Error("No mutationFn found")),onFail:(r,i)=>{this.#r({type:"failed",failureCount:r,error:i})},onPause:()=>{this.#r({type:"pause"})},onContinue:t,retry:this.options.retry??0,retryDelay:this.options.retryDelay,networkMode:this.options.networkMode,canRun:()=>this.#t.canRun(this)});const s=this.state.status==="pending",n=!this.#s.canStart();try{if(s)t();else{this.#r({type:"pending",variables:e,isPaused:n}),await this.#t.config.onMutate?.(e,this);const i=await this.options.onMutate?.(e);i!==this.state.context&&this.#r({type:"pending",context:i,variables:e,isPaused:n})}const r=await this.#s.start();return await this.#t.config.onSuccess?.(r,e,this.state.context,this),await this.options.onSuccess?.(r,e,this.state.context),await this.#t.config.onSettled?.(r,null,this.state.variables,this.state.context,this),await this.options.onSettled?.(r,null,e,this.state.context),this.#r({type:"success",data:r}),r}catch(r){try{throw await this.#t.config.onError?.(r,e,this.state.context,this),await this.options.onError?.(r,e,this.state.context),await this.#t.config.onSettled?.(void 0,r,this.state.variables,this.state.context,this),await this.options.onSettled?.(void 0,r,e,this.state.context),r}finally{this.#r({type:"error",error:r})}}finally{this.#t.runNext(this)}}#r(e){const t=s=>{switch(e.type){case"failed":return{...s,failureCount:e.failureCount,failureReason:e.error};case"pause":return{...s,isPaused:!0};case"continue":return{...s,isPaused:!1};case"pending":return{...s,context:e.context,data:void 0,failureCount:0,failureReason:null,error:null,isPaused:e.isPaused,status:"pending",variables:e.variables,submittedAt:Date.now()};case"success":return{...s,data:e.data,failureCount:0,failureReason:null,error:null,status:"success",isPaused:!1};case"error":return{...s,data:void 0,error:e.error,failureCount:s.failureCount+1,failureReason:e.error,isPaused:!1,status:"error"}}};this.state=t(this.state),w.batch(()=>{this.#e.forEach(s=>{s.onMutationUpdate(e)}),this.#t.notify({mutation:this,type:"updated",action:e})})}};function pt(){return{context:void 0,data:void 0,error:null,failureCount:0,failureReason:null,isPaused:!1,status:"idle",variables:void 0,submittedAt:0}}var vt=class extends A{constructor(e={}){super(),this.config=e,this.#e=new Set,this.#t=new Map,this.#s=0}#e;#t;#s;build(e,t,s){const n=new yt({mutationCache:this,mutationId:++this.#s,options:e.defaultMutationOptions(t),state:s});return this.add(n),n}add(e){this.#e.add(e);const t=q(e);if(typeof t=="string"){const s=this.#t.get(t);s?s.push(e):this.#t.set(t,[e])}this.notify({type:"added",mutation:e})}remove(e){if(this.#e.delete(e)){const t=q(e);if(typeof t=="string"){const s=this.#t.get(t);if(s)if(s.length>1){const n=s.indexOf(e);n!==-1&&s.splice(n,1)}else s[0]===e&&this.#t.delete(t)}}this.notify({type:"removed",mutation:e})}canRun(e){const t=q(e);if(typeof t=="string"){const n=this.#t.get(t)?.find(r=>r.state.status==="pending");return!n||n===e}else return!0}runNext(e){const t=q(e);return typeof t=="string"?this.#t.get(t)?.find(n=>n!==e&&n.state.isPaused)?.continue()??Promise.resolve():Promise.resolve()}clear(){w.batch(()=>{this.#e.forEach(e=>{this.notify({type:"removed",mutation:e})}),this.#e.clear(),this.#t.clear()})}getAll(){return Array.from(this.#e)}find(e){const t={exact:!0,...e};return this.getAll().find(s=>te(t,s))}findAll(e={}){return this.getAll().filter(t=>te(e,t))}notify(e){w.batch(()=>{this.listeners.forEach(t=>{t(e)})})}resumePausedMutations(){const e=this.getAll().filter(t=>t.state.isPaused);return w.batch(()=>Promise.all(e.map(t=>t.continue().catch(S))))}};function q(e){return e.options.scope?.id}function re(e){return{onFetch:(t,s)=>{const n=t.options,r=t.fetchOptions?.meta?.fetchMore?.direction,i=t.state.data?.pages||[],u=t.state.data?.pageParams||[];let a={pages:[],pageParams:[]},c=0;const h=async()=>{let l=!1;const p=f=>{Object.defineProperty(f,"signal",{enumerable:!0,get:()=>(t.signal.aborted?l=!0:t.signal.addEventListener("abort",()=>{l=!0}),t.signal)})},v=de(t.options,t.fetchOptions),k=async(f,y,d)=>{if(l)return Promise.reject();if(y==null&&f.pages.length)return Promise.resolve(f);const b=(()=>{const O={client:t.client,queryKey:t.queryKey,pageParam:y,direction:d?"backward":"forward",meta:t.options.meta};return p(O),O})(),_=await v(b),{maxPages:C}=t.options,x=d?nt:st;return{pages:x(f.pages,_,C),pageParams:x(f.pageParams,y,C)}};if(r&&i.length){const f=r==="backward",y=f?mt:ie,d={pages:i,pageParams:u},m=y(n,d);a=await k(d,m,f)}else{const f=e??i.length;do{const y=c===0?u[0]??n.initialPageParam:ie(n,a);if(c>0&&y==null)break;a=await k(a,y),c++}while(c<f)}return a};t.options.persister?t.fetchFn=()=>t.options.persister?.(h,{client:t.client,queryKey:t.queryKey,meta:t.options.meta,signal:t.signal},s):t.fetchFn=h}}}function ie(e,{pages:t,pageParams:s}){const n=t.length-1;return t.length>0?e.getNextPageParam(t[n],t,s[n],s):void 0}function mt(e,{pages:t,pageParams:s}){return t.length>0?e.getPreviousPageParam?.(t[0],t,s[0],s):void 0}var Zs=class{#e;#t;#s;#r;#n;#a;#o;#i;constructor(e={}){this.#e=e.queryCache||new ft,this.#t=e.mutationCache||new vt,this.#s=e.defaultOptions||{},this.#r=new Map,this.#n=new Map,this.#a=0}mount(){this.#a++,this.#a===1&&(this.#o=fe.subscribe(async e=>{e&&(await this.resumePausedMutations(),this.#e.onFocus())}),this.#i=$.subscribe(async e=>{e&&(await this.resumePausedMutations(),this.#e.onOnline())}))}unmount(){this.#a--,this.#a===0&&(this.#o?.(),this.#o=void 0,this.#i?.(),this.#i=void 0)}isFetching(e){return this.#e.findAll({...e,fetchStatus:"fetching"}).length}isMutating(e){return this.#t.findAll({...e,status:"pending"}).length}getQueryData(e){const t=this.defaultQueryOptions({queryKey:e});return this.#e.get(t.queryHash)?.state.data}ensureQueryData(e){const t=this.defaultQueryOptions(e),s=this.#e.build(this,t),n=s.state.data;return n===void 0?this.fetchQuery(e):(e.revalidateIfStale&&s.isStaleByTime(Q(t.staleTime,s))&&this.prefetchQuery(t),Promise.resolve(n))}getQueriesData(e){return this.#e.findAll(e).map(({queryKey:t,state:s})=>{const n=s.data;return[t,n]})}setQueryData(e,t,s){const n=this.defaultQueryOptions({queryKey:e}),i=this.#e.get(n.queryHash)?.state.data,u=Be(t,i);if(u!==void 0)return this.#e.build(this,n).setData(u,{...s,manual:!0})}setQueriesData(e,t,s){return w.batch(()=>this.#e.findAll(e).map(({queryKey:n})=>[n,this.setQueryData(n,t,s)]))}getQueryState(e){const t=this.defaultQueryOptions({queryKey:e});return this.#e.get(t.queryHash)?.state}removeQueries(e){const t=this.#e;w.batch(()=>{t.findAll(e).forEach(s=>{t.remove(s)})})}resetQueries(e,t){const s=this.#e;return w.batch(()=>(s.findAll(e).forEach(n=>{n.reset()}),this.refetchQueries({type:"active",...e},t)))}cancelQueries(e,t={}){const s={revert:!0,...t},n=w.batch(()=>this.#e.findAll(e).map(r=>r.cancel(s)));return Promise.all(n).then(S).catch(S)}invalidateQueries(e,t={}){return w.batch(()=>(this.#e.findAll(e).forEach(s=>{s.invalidate()}),e?.refetchType==="none"?Promise.resolve():this.refetchQueries({...e,type:e?.refetchType??e?.type??"active"},t)))}refetchQueries(e,t={}){const s={...t,cancelRefetch:t.cancelRefetch??!0},n=w.batch(()=>this.#e.findAll(e).filter(r=>!r.isDisabled()&&!r.isStatic()).map(r=>{let i=r.fetch(void 0,s);return s.throwOnError||(i=i.catch(S)),r.state.fetchStatus==="paused"?Promise.resolve():i}));return Promise.all(n).then(S)}fetchQuery(e){const t=this.defaultQueryOptions(e);t.retry===void 0&&(t.retry=!1);const s=this.#e.build(this,t);return s.isStaleByTime(Q(t.staleTime,s))?s.fetch(t):Promise.resolve(s.state.data)}prefetchQuery(e){return this.fetchQuery(e).then(S).catch(S)}fetchInfiniteQuery(e){return e.behavior=re(e.pages),this.fetchQuery(e)}prefetchInfiniteQuery(e){return this.fetchInfiniteQuery(e).then(S).catch(S)}ensureInfiniteQueryData(e){return e.behavior=re(e.pages),this.ensureQueryData(e)}resumePausedMutations(){return $.isOnline()?this.#t.resumePausedMutations():Promise.resolve()}getQueryCache(){return this.#e}getMutationCache(){return this.#t}getDefaultOptions(){return this.#s}setDefaultOptions(e){this.#s=e}setQueryDefaults(e,t){this.#r.set(E(e),{queryKey:e,defaultOptions:t})}getQueryDefaults(e){const t=[...this.#r.values()],s={};return t.forEach(n=>{j(e,n.queryKey)&&Object.assign(s,n.defaultOptions)}),s}setMutationDefaults(e,t){this.#n.set(E(e),{mutationKey:e,defaultOptions:t})}getMutationDefaults(e){const t=[...this.#n.values()],s={};return t.forEach(n=>{j(e,n.mutationKey)&&Object.assign(s,n.defaultOptions)}),s}defaultQueryOptions(e){if(e._defaulted)return e;const t={...this.#s.queries,...this.getQueryDefaults(e.queryKey),...e,_defaulted:!0};return t.queryHash||(t.queryHash=V(t.queryKey,t)),t.refetchOnReconnect===void 0&&(t.refetchOnReconnect=t.networkMode!=="always"),t.throwOnError===void 0&&(t.throwOnError=!!t.suspense),!t.networkMode&&t.persister&&(t.networkMode="offlineFirst"),t.queryFn===K&&(t.enabled=!1),t}defaultMutationOptions(e){return e?._defaulted?e:{...this.#s.mutations,...e?.mutationKey&&this.getMutationDefaults(e.mutationKey),...e,_defaulted:!0}}clear(){this.#e.clear(),this.#t.clear()}},kt=g.createContext(void 0),Js=({client:e,children:t})=>(g.useEffect(()=>(e.mount(),()=>{e.unmount()}),[e]),we.jsx(kt.Provider,{value:e,children:t}));/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gt=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),bt=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,s,n)=>n?n.toUpperCase():s.toLowerCase()),ae=e=>{const t=bt(e);return t.charAt(0).toUpperCase()+t.slice(1)},me=(...e)=>e.filter((t,s,n)=>!!t&&t.trim()!==""&&n.indexOf(t)===s).join(" ").trim(),Mt=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var wt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt=g.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:s=2,absoluteStrokeWidth:n,className:r="",children:i,iconNode:u,...a},c)=>g.createElement("svg",{ref:c,...wt,width:t,height:t,stroke:e,strokeWidth:n?Number(s)*24/Number(t):s,className:me("lucide",r),...!i&&!Mt(a)&&{"aria-hidden":"true"},...a},[...u.map(([h,l])=>g.createElement(h,l)),...Array.isArray(i)?i:[i]]));/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=(e,t)=>{const s=g.forwardRef(({className:n,...r},i)=>g.createElement(xt,{ref:i,iconNode:t,className:me(`lucide-${gt(ae(e))}`,`lucide-${e}`,n),...r}));return s.displayName=ae(e),s};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]],Ys=o("activity",_t);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const St=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],Xs=o("arrow-left",St);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct=[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]],en=o("briefcase",Ct);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ot=[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]],tn=o("building-2",Ot);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pt=[["path",{d:"M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8",key:"1w3rig"}],["path",{d:"M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1",key:"n2jgmb"}],["path",{d:"M2 21h20",key:"1nyx9w"}],["path",{d:"M7 8v3",key:"1qtyvj"}],["path",{d:"M12 8v3",key:"hwp4zt"}],["path",{d:"M17 8v3",key:"1i6e5u"}],["path",{d:"M7 4h.01",key:"1bh4kh"}],["path",{d:"M12 4h.01",key:"1ujb9j"}],["path",{d:"M17 4h.01",key:"1upcoc"}]],sn=o("cake",Pt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nt=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m9 16 2 2 4-4",key:"19s6y9"}]],nn=o("calendar-check",Nt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]],rn=o("calendar-days",Et);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt=[["path",{d:"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",key:"18u6gg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]],an=o("camera",jt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qt=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],on=o("calendar",qt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rt=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],cn=o("check",Rt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $t=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],un=o("chevron-down",$t);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],hn=o("chevron-left",At);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ft=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],ln=o("chevron-right",Ft);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dt=[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]],dn=o("chevron-up",Dt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],fn=o("circle-alert",Tt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ht=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],yn=o("circle-check-big",Ht);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lt=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],pn=o("circle-check",Lt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qt=[["path",{d:"M18 20a6 6 0 0 0-12 0",key:"1qehca"}],["circle",{cx:"12",cy:"10",r:"4",key:"1h16sb"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],vn=o("circle-user-round",Qt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ut=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],mn=o("circle",Ut);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const It=[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]],kn=o("clipboard-list",It);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zt=[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],gn=o("clock",zt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vt=[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]],bn=o("credit-card",Vt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kt=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],Mn=o("download",Kt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gt=[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]],wn=o("ellipsis",Gt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wt=[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],xn=o("eye-off",Wt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bt=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],_n=o("eye",Bt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zt=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]],Sn=o("file-spreadsheet",Zt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jt=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],Cn=o("file-text",Jt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yt=[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]],On=o("funnel",Yt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xt=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]],Pn=o("globe",Xt);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const es=[["line",{x1:"4",x2:"20",y1:"9",y2:"9",key:"4lhtct"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15",key:"vyu0kd"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21",key:"1ggp8o"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21",key:"weycgp"}]],Nn=o("hash",es);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ts=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]],En=o("house",ts);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ss=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],jn=o("info",ss);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ns=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],qn=o("layout-dashboard",ns);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rs=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],Rn=o("loader-circle",rs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const is=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]],$n=o("lock",is);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const as=[["path",{d:"m10 17 5-5-5-5",key:"1bsop3"}],["path",{d:"M15 12H3",key:"6jk70r"}],["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}]],An=o("log-in",as);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const os=[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]],Fn=o("log-out",os);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cs=[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]],Dn=o("mail",cs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const us=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],Tn=o("map-pin",us);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hs=[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]],Hn=o("message-square",hs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ls=[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],Ln=o("moon",ls);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ds=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M9 3v18",key:"fh3hqa"}]],Qn=o("panel-left",ds);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fs=[["path",{d:"M5.8 11.3 2 22l10.7-3.79",key:"gwxi1d"}],["path",{d:"M4 3h.01",key:"1vcuye"}],["path",{d:"M22 8h.01",key:"1mrtc2"}],["path",{d:"M15 2h.01",key:"1cjtqr"}],["path",{d:"M22 20h.01",key:"1mrys2"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10",key:"hbicv8"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17",key:"1i94pl"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7",key:"1cofks"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z",key:"4kbmks"}]],Un=o("party-popper",fs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ys=[["path",{d:"M13 21h8",key:"1jsn5i"}],["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]],In=o("pen-line",ys);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ps=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]],zn=o("pen",ps);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vs=[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]],Vn=o("phone",vs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ms=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],Kn=o("plus",ms);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ks=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],Gn=o("rotate-ccw",ks);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gs=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]],Wn=o("save",gs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bs=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],Bn=o("search",bs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ms=[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]],Zn=o("send",Ms);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ws=[["path",{d:"M14 17H5",key:"gfn3mx"}],["path",{d:"M19 7h-9",key:"6i9tg"}],["circle",{cx:"17",cy:"17",r:"3",key:"18b49y"}],["circle",{cx:"7",cy:"7",r:"3",key:"dfmy0x"}]],Jn=o("settings-2",ws);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xs=[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],Yn=o("settings",xs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _s=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]],Xn=o("shield-alert",_s);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ss=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],er=o("shield-check",Ss);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cs=[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]],tr=o("sparkles",Cs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Os=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],sr=o("square-pen",Os);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ps=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],nr=o("sun",Ps);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ns=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]],rr=o("target",Ns);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Es=[["path",{d:"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",key:"qn84l0"}],["path",{d:"M13 5v2",key:"dyzc3o"}],["path",{d:"M13 17v2",key:"1ont0d"}],["path",{d:"M13 11v2",key:"1wjjxi"}]],ir=o("ticket",Es);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const js=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],ar=o("trash-2",js);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qs=[["path",{d:"M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4",key:"foxbe7"}],["path",{d:"M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3",key:"18arnh"}],["path",{d:"M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35",key:"ywahnh"}],["path",{d:"M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14",key:"ft0feo"}]],or=o("tree-palm",qs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rs=[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]],cr=o("trending-up",Rs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $s=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],ur=o("upload",$s);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const As=[["path",{d:"m16 11 2 2 4-4",key:"9rsbq5"}],["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],hr=o("user-check",As);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fs=[["path",{d:"M10 15H6a4 4 0 0 0-4 4v2",key:"1nfge6"}],["path",{d:"m14.305 16.53.923-.382",key:"1itpsq"}],["path",{d:"m15.228 13.852-.923-.383",key:"eplpkm"}],["path",{d:"m16.852 12.228-.383-.923",key:"13v3q0"}],["path",{d:"m16.852 17.772-.383.924",key:"1i8mnm"}],["path",{d:"m19.148 12.228.383-.923",key:"1q8j1v"}],["path",{d:"m19.53 18.696-.382-.924",key:"vk1qj3"}],["path",{d:"m20.772 13.852.924-.383",key:"n880s0"}],["path",{d:"m20.772 16.148.924.383",key:"1g6xey"}],["circle",{cx:"18",cy:"15",r:"3",key:"gjjjvw"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],lr=o("user-cog",Fs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ds=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]],dr=o("user-plus",Ds);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ts=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"17",x2:"22",y1:"8",y2:"13",key:"3nzzx3"}],["line",{x1:"22",x2:"17",y1:"8",y2:"13",key:"1swrse"}]],fr=o("user-x",Ts);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hs=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],yr=o("user",Hs);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ls=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],pr=o("users",Ls);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qs=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],vr=o("x",Qs);export{lr as $,ar as A,tn as B,kn as C,wn as D,xn as E,Xs as F,Pn as G,Wn as H,sr as I,Dn as J,pn as K,An as L,Ln as M,fn as N,an as O,zs as P,Zs as Q,xe as R,Yn as S,ir as T,dr as U,ur as V,Ys as W,vr as X,en as Y,vn as Z,$n as _,he as a,er as a0,hr as a1,fr as a2,cn as a3,mn as a4,zn as a5,Sn as a6,On as a7,Mn as a8,yn as a9,hn as aa,Cn as ab,cr as ac,sn as ad,tr as ae,rn as af,Jn as ag,nn as ah,Hn as ai,or as aj,Gn as ak,Xn as al,Vn as am,Nn as an,rr as ao,Tn as ap,Zn as aq,Un as ar,En as as,jn as at,un as au,dn as av,In as aw,Ws as b,Gs as c,We as d,Ke as e,Is as f,Ks as g,Js as h,Bs as i,we as j,_n as k,Qn as l,qn as m,pr as n,gn as o,on as p,bn as q,g as r,yr as s,ln as t,Vs as u,Fn as v,nr as w,Rn as x,Kn as y,Bn as z};
