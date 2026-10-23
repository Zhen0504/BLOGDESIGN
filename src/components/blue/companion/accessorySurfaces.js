import * as THREE from 'three'
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js'
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js'
import {characterShape,frontPoint} from './shapes.js'

export const skin=(x,y,lift=.045)=>new THREE.Vector3(x,y,frontPoint(x,y,characterShape)[2]+lift)
export function material(color,{roughness=.45,metalness=0,sheen=.45,clearcoat=.12}={}){
  // Full opacity in the transparent queue avoids duplicate accessories in the
  // gel's transmission buffer. These are soft satin/porcelain, not glass.
  return new THREE.MeshPhysicalMaterial({color,roughness,metalness,sheen,sheenColor:new THREE.Color(color),sheenRoughness:.65,clearcoat,clearcoatRoughness:.3,envMapIntensity:.65,transparent:true,opacity:1,depthWrite:true})
}
export function add(group,name,geometry,mat,position=[0,0,0],scale=[1,1,1]){
  const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(...position);mesh.scale.set(...scale);group.add(mesh);return mesh
}
export function line(group,name,points,radius,mat,{closed=false,segments=closed?64:28,sides=8}={}){
  return add(group,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,closed),segments,radius,sides,closed),mat)
}
export function roundedBox(w,h,d,r=.02){
  return compact(new RoundedBoxGeometry(w,h,d,3,r))
}
export function compact(source){
  // No texture maps are used: share duplicated triangle vertices instead of
  // paying the non-indexed rounded-box cost on every skin-deformation frame.
  source.deleteAttribute('uv')
  const geometry=mergeVertices(source,1e-5);source.dispose();return geometry
}

// A thin closed sheet with sampled folds, not flattened primitive spheres.
export function sheet(fn,{u=24,v=12,thickness=.008,facing=[0,0,1],flip=false,closedU=false,form='cloth-sheet'}={}){
  const vertices=[],indices=[],row=v+1,count=(u+1)*row
  for(let i=0;i<=u;i++)for(let j=0;j<=v;j++)vertices.push(...fn(i/u,j/v))
  for(let i=0;i<u;i++)for(let j=0;j<v;j++){const a=i*row+j;indices.push(a,a+row,a+1,a+row,a+row+1,a+1)}
  const base=new THREE.BufferGeometry();base.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));base.setIndex(indices);base.computeVertexNormals()
  if(facing){
    const normal=new THREE.Vector3(),n=base.attributes.normal
    for(let i=0;i<n.count;i++)normal.add(new THREE.Vector3().fromBufferAttribute(n,i))
    flip=normal.dot(new THREE.Vector3(...facing))<0
  }
  if(flip){for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];base.setIndex(indices);base.computeVertexNormals()}
  const normals=base.attributes.normal
  if(closedU)for(let j=0;j<=v;j++){
    const average=new THREE.Vector3().fromBufferAttribute(normals,j).add(new THREE.Vector3().fromBufferAttribute(normals,u*row+j)).normalize()
    normals.setXYZ(j,average.x,average.y,average.z);normals.setXYZ(u*row+j,average.x,average.y,average.z)
  }
  const positions=[],triangles=[]
  for(const side of [1,-1])for(let i=0;i<count;i++)positions.push(vertices[i*3]+normals.getX(i)*thickness*.5*side,vertices[i*3+1]+normals.getY(i)*thickness*.5*side,vertices[i*3+2]+normals.getZ(i)*thickness*.5*side)
  for(let i=0;i<indices.length;i+=3){const [a,b,c]=indices.slice(i,i+3);triangles.push(a,b,c,c+count,b+count,a+count)}
  const edge=(a,b)=>triangles.push(a,b,a+count,b,b+count,a+count)
  for(let i=0;i<u;i++){edge(i*row,(i+1)*row);edge((i+1)*row+v,i*row+v)}
  if(!closedU)for(let j=0;j<v;j++){edge(j+1,j);edge(u*row+j,u*row+j+1)}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(triangles);geometry.computeVertexNormals();geometry.userData.accessoryForm=form;base.dispose();return geometry
}
export function softenedShape(points,amount=.16){
  const shape=new THREE.Shape()
  for(let i=0;i<points.length;i++){
    const previous=points[(i-1+points.length)%points.length],current=points[i],next=points[(i+1)%points.length]
    const start=new THREE.Vector2().lerpVectors(current,previous,amount),end=new THREE.Vector2().lerpVectors(current,next,amount)
    if(i)shape.lineTo(start.x,start.y);else shape.moveTo(start.x,start.y)
    shape.quadraticCurveTo(current.x,current.y,end.x,end.y)
  }
  shape.closePath();return shape
}
