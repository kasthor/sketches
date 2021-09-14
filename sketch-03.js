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
  precision highp float;

  uniform float time;
  varying vec2 vUv;

  float hash( float n )
  {
      return fract(sin(n)*43758.5453);
  }


  float noise( in vec2 x )
  {
      vec2 p = floor(x);
      vec2 f = fract(x);

      f = f*f*(3.0-2.0*f);

      float n = p.x + p.y*57.0;

      return mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                 mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y);
  }

  float fbm( vec2 p )
  {
    float f = 0.0;
    f += 0.5000 * noise(p); p *=2.02;
    f += 0.2500 * noise(p); p *=2.03;
    f += 0.1250 * noise(p); p *=2.01;
    f += 0.0625 * noise(p); p *=2.04;
    f /= 0.9357;

    return f;
  }


  void main () {
    vec2 q = gl_FragCoord.xy / vUv.xy;
    vec2 p = -1.0 + 2.0 * vUv.xy;
    vec3 col;
   
    float background = 1.0;
    float r = sqrt( dot( p, p) );
    float a = atan( p.y, p.x );

    if( r < 0.8 ) {
      col = vec3( 0.3, 0.3, 0.4 );

      float f = fbm( 5.0 * p);
      col = mix( col, vec3(0.46, 0.2, 0.0), f );

      f = 1.0 - smoothstep( 0.3, 0.5, r );
      col = mix( col, vec3(0.9, 0.6, 0.2), 0.9 * f);

      a += 0.05 * fbm( 20.0 * p );

      f = smoothstep( 0.3, 1.0, fbm( vec2( 7.0 * r, 20.0 * a ) ) );
      col = mix( col, vec3(1.0), f * 0.5);

      f = smoothstep( 0.8, 0.9, fbm( vec2( 3.0 * r, 15.0 * a ) ) );
      col = mix( col, vec3(0.0), f);

      f = smoothstep( 0.6, 0.8, r );
      col *= 1.0 - f;


      f = smoothstep( 0.2, 0.25, r );
      col *= f;

      f = 0.9 - smoothstep(0.0, 0.5, length( p - vec2(0.2, 0.2)));
      col += vec3(f);

    }

    gl_FragColor = vec4(col * background, 1.0);
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
