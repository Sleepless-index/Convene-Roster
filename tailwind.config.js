const h=(v)=>`hsl(var(--${v}))`, a=(v,al)=>`hsl(var(--${v}) / var(--${al}))`
export default {content:['./index.html','./src/**/*.{js,jsx}'],theme:{extend:{
 fontFamily:{sans:['"IBM Plex Sans"','system-ui','sans-serif']},
 colors:{bg:h('bg'),s1:h('surface'),s2:h('surface-2'),s3:h('surface-3'),s4:h('surface-4'),
  line:a('border','border-alpha'),linemid:a('border-mid','border-mid-alpha'),
  accent:h('accent'),accentdim:a('accent','accent-dim-alpha'),accentmid:a('accent','accent-mid-alpha'),accentline:a('accent','accent-border-alpha'),
  hi:h('text-hi'),mid:h('text-mid'),lo:h('text-lo')}}},plugins:[]}
