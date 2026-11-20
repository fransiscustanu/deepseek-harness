window.__ModuleLoader__.load({id:`@deepseek-ai/dsh-client-ui-brand-official`,factory:require=>{var module={exports:{}};var exports=module.exports;Object.defineProperty(exports,Symbol.toStringTag,{value:`Module`});
// Code Harness brand, replacing the official whale artwork. It fills the same
// three slots: sidebar mark, sidebar name and the home hero mark. The home
// hero frame (the whale animation) is left empty.
const {jsx}=require(`react/jsx-runtime`);
const MARK=`url(data:image/png;base64,__MARK__) center/contain no-repeat`;
function CodeHarnessMark({size=24,className}){return jsx(`span`,{className,role:`img`,"aria-label":`Code Harness`,style:{display:`inline-block`,flex:`none`,width:size,height:size,backgroundColor:`currentColor`,WebkitMask:MARK,mask:MARK}})}
function CodeHarnessName(){return jsx(`span`,{style:{fontWeight:600,whiteSpace:`nowrap`},children:`Code Harness`})}
const inject=[`slots`];
function apply(ctx){
ctx.slots.inject(`conversation.hero.brand.mark`,()=>ctx.slots.register({name:`conversation.hero.brand.mark`},CodeHarnessMark));
ctx.slots.inject(`sidebar.brand.mark`,()=>ctx.slots.inject(`sidebar.brand.name`,function*(){yield ctx.slots.register({name:`sidebar.brand.mark`},CodeHarnessMark);yield ctx.slots.register({name:`sidebar.brand.name`},CodeHarnessName)}))}
exports.apply=apply;exports.inject=inject;return module.exports}});
