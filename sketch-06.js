const canvasSketch = require("canvas-sketch");
const createShader = require("canvas-sketch-util/shader");

// Setup our sketch
const settings = {
  dimensions: [512, 512],
  context: "webgl",
  animate: true,
};

// Your glsl code
const frag = `
  #define MAX_STEPS 100
  #define MAX_DIST 100.0
  #define SURF_DIST 0.01

  precision highp float;

  uniform float time;
  varying vec2 vUv;

  float dist(vec3 p){
    vec4 s = vec4(0, 1, 6, 1);

    // Sphere distance
    float sD = length(p - s.xyz) - s.w;

    // Plane distance
    float pD = p.y;

    float d = min(sD, pD);

    return d;
  }

  vec3 normal(vec3 p) {
    float d = dist(p);
    
    vec2 e = vec2(0.01, 0.0);

    vec3 n = d - vec3(
      dist(p-e.xyy),
      dist(p-e.yxy),
      dist(p-e.yyx)
    );

    return normalize(n);
  }

  float rayMarch(vec3 ro, vec3 rd){
    float dO = 0.0;

    for(int i =0; i < MAX_STEPS; i++ ){
      vec3 p = ro + rd * dO;
      float dS = dist(p);

      dO  += dS;
      if( dO > MAX_DIST || dS < SURF_DIST ) break;
    }

    return dO;
  }

  float light(vec3 p){

    // light 
    vec3 lP = vec3( 0, 5, 6 );    

    lP.xz += vec2(sin(time), cos(time)) * 10.0;

    vec3 l = normalize(lP - p);
    vec3 n = normal(p);

    float dif = clamp(dot(n, l), 0.0, 1.0);

    // Shadow
    
    float d = rayMarch(p+n*SURF_DIST*2.0, lP);
    if(d<length(lP-p)) dif *= 0.1;

    return dif;
  }


  void main () {
    vec2 p = ( 2.0 * vUv ) - 1.0;

    // Black background
    vec3 col = vec3(0);

    // Camera
    vec3 ro = vec3( 0, 1, 0 );
    vec3 rd = normalize(vec3(p.x, p.y, 1.0));

    float d = rayMarch(ro, rd);

    col = vec3(d);

    vec3 i = ro + rd * d;

    float dif = light(i);
    
    col = vec3(dif);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it. It will be rendered by regl.
  return createShader({
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      time: ({ time }) => time,
    },
  });
};

canvasSketch(sketch, settings);
