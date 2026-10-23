import { expressions as original } from './baselineExpressions.js'
export const expressions=[...original.map(item=>item.id==='curious'?{...item,look:[.06,.035],eyes:[{rx:.105,ry:.115,angle:-.20},{rx:.13,ry:.225,angle:.13,y:.025}]}:item),
  {id:'sleepy',name:'困困',look:[0,-.035],closed:true,eyes:[{curve:-.055,stroke:.024,angle:-.07},{curve:-.055,stroke:.024,angle:.07}]},
  {id:'surprised',name:'惊讶',look:[0,.03],eyes:[{rx:.17,ry:.17},{rx:.17,ry:.17}]},
  {id:'playful',name:'眨眨眼',look:[.02,.01],eyes:[{rx:.115,ry:.185},{closed:true,angle:.10}]},
  {id:'focused',name:'认真',look:[0,0],eyes:[{rx:.15,ry:.038,angle:0},{rx:.15,ry:.038,angle:0}]},
  {id:'shy',name:'有点害羞',look:[0,-.015],closed:true,blush:1,eyes:[{kind:'chevron',span:.102,opening:.064,angle:-.08},{kind:'chevron',span:.102,opening:.064,angle:.08}]},
  {id:'dizzy',name:'晕乎乎',look:[0,0],closed:true,eyes:[{kind:'spiral',stroke:.019},{kind:'spiral',stroke:.019}]},
  {id:'angry',name:'气鼓鼓',look:[0,.01],anger:1,eyes:[{kind:'angry'},{kind:'angry'}]},
  {id:'struggle',name:'不想走',look:[0,-.005],closed:true,eyes:[{kind:'chevron',angle:.05},{kind:'chevron',angle:-.05}]},
]
export const idleExpressions=expressions.filter(item=>item.id!=='struggle')
export const expressionById=id=>expressions.find(item=>item.id===id)||expressions[0]
