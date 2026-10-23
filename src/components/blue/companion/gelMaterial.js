import * as THREE from 'three'

// One optical recipe for all expressions. Standard physical transmission and
// Beer-Lambert volume absorption remain intact; only local thickness/pigment vary.
export function createGelMaterial(){
  const emotionUniforms={gelAnger:{value:0},gelBlush:{value:0}}
  const material=new THREE.MeshPhysicalMaterial({
    color:0xffffff,transmission:1,opacity:1,metalness:0,
    roughness:.095,ior:1.38,thickness:1.5,attenuationDistance:2,
    attenuationColor:0xa9deff,clearcoat:.14,clearcoatRoughness:.12,
    envMapIntensity:.9,toneMapped:false,
  })
  material.userData.emotionUniforms=emotionUniforms
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,emotionUniforms)
    shader.uniforms.gelViolet={value:new THREE.Color(0xb9a9fb)}
    shader.vertexShader='varying vec3 gelPosition;\n'+shader.vertexShader
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ngelPosition = position;')
    shader.fragmentShader='varying vec3 gelPosition;\nuniform vec3 gelViolet;\nuniform float gelAnger;\nuniform float gelBlush;\n'+shader.fragmentShader
    const transmission=THREE.ShaderChunk.transmission_fragment.replace(
      'vec3 v = normalize( cameraPosition - pos );',
      'vec3 v = isOrthographic ? inverseTransformDirection( vec3(0.0,0.0,1.0), viewMatrix ) : normalize( cameraPosition - pos );',
    ).replace(
      'material.attenuationColor = attenuationColor;',
      `vec3 gelView = isOrthographic ? vec3(0.0,0.0,1.0) : normalize(vViewPosition);
       float facing = clamp(abs(dot(gelView, normalize(normal))),0.0,1.0);
       material.thickness *= 0.18 + 0.82 * pow(facing,0.55);
       float lowerVolume = 1.0 - smoothstep(-0.95,0.35,gelPosition.y);
       float pigment = min(0.88,lowerVolume*0.72+pow(facing,4.0)*0.14);
       material.attenuationColor = mix(attenuationColor,gelViolet,pigment);
       float warmHead = smoothstep(-0.10,0.86,gelPosition.y)*gelAnger;
       material.attenuationColor = mix(material.attenuationColor,vec3(1.0,0.075,0.14),warmHead*0.94);
       float cheeks = exp(-pow((abs(gelPosition.x)-0.53)/0.18,2.0)-pow((gelPosition.y+0.14)/0.12,2.0));
       cheeks *= smoothstep(0.40,0.85,gelPosition.z)*gelBlush;
       material.attenuationColor = mix(material.attenuationColor,vec3(1.0,0.11,0.19),cheeks*0.94);`,
    )
    shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_fragment>',transmission)
  }
  material.customProgramCacheKey=()=> 'soft-blob-volume-gel-v3'
  return material
}
