#version 120

uniform vec3 playerPos;
uniform vec3 playerFacing;
uniform int bulletCount;
uniform vec3[] bulletPosArray;
uniform vec3[] bulletFacingArray;
uniform float[] bulletTimeArray;
uniform float time;

const vec4 pParam = vec4( 17.0*17.0, 34.0, 1.0, 7.0);
const float pi = 3.141;
const float pi2 = pi * 2;

/*
// From noise from https://www.geeks3d.com/20110317/shader-library-simplex-noise-glsl-opengl/
float permute(float x0,vec3 p) { 
	float x1 = mod(x0 * p.y, p.x);
	return floor(  mod( (x1 + p.z) *x0, p.x ));
}
vec2 permute(vec2 x0,vec3 p) { 
	vec2 x1 = mod(x0 * p.y, p.x);
	return floor(  mod( (x1 + p.z) *x0, p.x ));
}
vec3 permute(vec3 x0,vec3 p) { 
	vec3 x1 = mod(x0 * p.y, p.x);
	return floor(  mod( (x1 + p.z) *x0, p.x ));
}
vec4 permute(vec4 x0,vec3 p) { 
	vec4 x1 = mod(x0 * p.y, p.x);
	return floor(  mod( (x1 + p.z) *x0, p.x ));
}

float simplexNoise2(vec2 v)
{
	const vec2 C = vec2(
		0.211324865405187134, // (3.0-sqrt(3.0))/6.;
		0.366025403784438597); // 0.5*(sqrt(3.0)-1.);
	const vec3 D = vec3( 0., 0.5, 2.0) * 3.14159265358979312;
	// First corner
	vec2 i  = floor(v + dot(v, C.yy) );
	vec2 x0 = v -   i + dot(i, C.xx);

	// Other corners
	vec2 i1  =  (x0.x > x0.y) ? vec2(1.,0.) : vec2(0.,1.) ;

	 //  x0 = x0 - 0. + 0. * C
	vec2 x1 = x0 - i1 + 1. * C.xx ;
	vec2 x2 = x0 - 1. + 2. * C.xx ;

	// Permutations
	i = mod(i, pParam.x);
	vec3 p = permute( permute( 
		i.y + vec3(0., i1.y, 1. ), pParam.xyz)
		+ i.x + vec3(0., i1.x, 1. ), pParam.xyz
	);

	#ifndef USE_CIRCLE
	// ( N points uniformly over a line, mapped onto a diamond.)
	vec3 x = fract(p / pParam.w) ;
	vec3 h = 0.5 - abs(x) ;

	vec3 sx = vec3(lessThan(x,D.xxx)) *2. -1.;
	vec3 sh = vec3(lessThan(h,D.xxx));

	vec3 a0 = x + sx*sh;
	vec2 p0 = vec2(a0.x,h.x);
	vec2 p1 = vec2(a0.y,h.y);
	vec2 p2 = vec2(a0.z,h.z);

	#ifdef NORMALISE_GRADIENTS
	p0 *= taylorInvSqrt(dot(p0,p0));
	p1 *= taylorInvSqrt(dot(p1,p1));
	p2 *= taylorInvSqrt(dot(p2,p2));
	#endif

	vec3 g = 2.0 * vec3( dot(p0, x0), dot(p1, x1), dot(p2, x2) );
	#else 
	// N points around a unit circle.
	vec3 phi = D.z * mod(p,pParam.w) /pParam.w ;
	vec4 a0 = sin(phi.xxyy+D.xyxy);
	vec2 a1 = sin(phi.zz  +D.xy);
	vec3 g = vec3( dot(a0.xy, x0), dot(a0.zw, x1), dot(a1.xy, x2) );
	#endif
	// mix
	vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.);
	m = m*m ;
	return 1.66666* 70.*dot(m*m, g);
}

float ball(vec3 pos, vec3 p0, float r)
{
	return length(pos - p0) - r;
}

float sdBox(vec3 pos, vec3 p0, vec3 b)
{
  vec3 d = abs(pos - p0) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) +
         length(max(d,0.0));
}

float udBox(vec3 pos, vec3 p0, vec3 b)
{
	return length(max(abs(pos - p0) - b, 0.0));
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r )
{
	vec3 pa = p - a, ba = b - a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return length( pa - ba*h ) - r;
}

float scene(vec3 p)
{
	float stuff = 100000.0;
	stuff = min(stuff, ball(p, vec3(-1, -1, 0), 2));
	stuff = min(stuff, ball(p, vec3(0, 1, 1), 3));
	stuff = min(stuff, sdBox(p, vec3(0, 3, 0), vec3(3, 0.1, 3)));
	stuff = min(stuff, udBox(p, vec3(0, -2, 0), vec3(3, 0.1, 3)));

	float bulletRadius = 0.1;
	float hole = 100000.0;
	hole = min(hole, sdBox(p, vec3(0, -2, -4), vec3(1, 6, 5)));
	hole = min(hole, sdBox(p, vec3(0, 1, 0), vec3(2, 0.3, 10)));
	hole = min(hole, ball(p, vec3(1.7 + cos(time), -0.5 + sin(time), 0.2 * sin(time * 0.1)), 2));

	#define BHOLE(i) \
	if (bulletCount > i) \
		hole = min(hole, sdCapsule(p, bulletPosArray[i], bulletPosArray[i] + bulletFacingArray[i] * bulletTimeArray[i], bulletRadius));

	#define BH(i) \
	BHOLE(i * 10 + 0); BHOLE(i * 10 +1); BHOLE(i * 10 +2); BHOLE(i * 10 +3);BHOLE(i * 10 +4); BHOLE(i * 10 +5); BHOLE(i * 10 +6); BHOLE(i * 10 +7); BHOLE(i * 10 +8);BHOLE(i * 10 +9);
	BH(0);
	BH(1);
	BH(2);
	BH(3);


	float holed = max(stuff, -hole);
	float bulleted = holed;
	
	#define BULLET(i) \
	if (bulletCount > i) \
		bulleted = min(bulleted, ball(p, (bulletPosArray[i] + bulletFacingArray[i] * bulletTimeArray[i]), bulletRadius));
		
	#define BB(i) \
	BULLET(i * 10 + 0); BULLET(i * 10 +1); BULLET(i * 10 +2); BULLET(i * 10 +3);BULLET(i * 10 +4); BULLET(i * 10 +5); BULLET(i * 10 +6); BULLET(i * 10 +7); BULLET(i * 10 +8);BULLET(i * 10 +9);

	BB(0);
	BB(1);
	BB(2);
	BB(3);

	return bulleted;
}


vec4 map_(vec3 p)
{
    vec3 w = p;
    float m = dot(w, w);
    vec4 trap = vec4(abs(w), m);
    float dz = 1.0;

    for (int i = 0; i < 8; ++i)
	{
        float m2 = m * m;
        float m4 = m2 * m2;
        dz = 8.0f * sqrt(m4 * m2 * m) * dz + 1.0;

        float x = w[0];
        float x2 = x * x;
        float x4 = x2 * x2;
        float y = w[1];
        float y2 = y * y;
        float y4 = y2 * y2;
        float z = w[2];
        float z2 = z * z;
        float z4 = z2 * z2;

        float k3 = x2 + z2;
        float k2 = 1.0f / sqrt(pow(k3, 7));
        float k1 = x4 + y4 + z4 - 6.0 * y2 * z2 - 6.0 * x2 * y2 + 2.0 * z2 * x2;
        float k4 = x2 - y2 + z2;

        float w0 = p[0] + 64.0 * x * y * z * (x2 - z2) * k4 * (x4 - 6.0 * x2 * z2 + z4) * k1 * k2;
        float w1 = p[1] + -16.0 * y2 * k3 * k4 * k4 + k1 * k1;
        float w2 = p[2] + -8.0 * y * k4 * (
                x4 * x4 - 28.0 * x4 * x2 * z2 + 70.0 * x4 * z4 - 28.0 * x2 * z2 * z4 + z4 * z4) * k1 * k2;
        w = vec3(w0, w1, w2);

        dz = 8.0f * pow(sqrt(m), 7.0f) * dz + 1.0f;
        float r = length(w);
        float b = 8.0 * acos(w[1] / r);
        float a = 8.0 * atan(w[0] / w[2]);
        w = p + (vec3(sin(b) * sin(a), cos(b), sin(b) * cos(a)) * pow(r, 8.0f));

        trap = min(trap, vec4(abs(w), m));

        m = dot(w, w);
        if (m > 256.0)
            break; // return vec4(vec3(0,0,0), ball(p, vec3(0,0,0), 0.2f));
	}
	
    vec3 color = vec3(m, trap[1], trap[2]); // #, trap[3])
    return vec4(color, 0.25 * log(m) * sqrt(m) / dz);
}

vec3 mb(vec3 p) {
	p.xyz = p.xzy;
	vec3 z = p;
	vec3 dz=vec3(0.0);
	float power = 8.0;
	float r, theta, phi;
	float dr = 1.0;
	
	float t0 = 1.0;
	for(int i = 0; i < 7; ++i) {
		r = length(z);
		if(r > 2.0) continue;
		theta = atan(z.y / z.x);
        #ifdef phase_shift_on
		phi = asin(z.z / r) + time*0.1;
        #else
        phi = asin(z.z / r);
        #endif
		
		dr = pow(r, power - 1.0) * dr * power + 1.0;
	
		r = pow(r, power);
		theta = theta * power;
		phi = phi * power;
		
		z = r * vec3(cos(theta)*cos(phi), sin(theta)*cos(phi), sin(phi)) + p;
		
		t0 = min(t0, r);
	}
	return vec3(0.5 * log(r) * r / dr, t0, 0.0);
}

vec2 is_sphere( in vec3 ro, in vec3 rd, in vec3 ce, float ra )
{
    vec3 oc = ro - ce;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;
    if( h<0.0 ) return vec2(-1.0); // no intersection
    h = sqrt( h );
    return vec2( -b-h, -b+h );
}

vec4 mandelbulb(vec3 rayDir)
{
	float px = 2.0f;
    vec2 dis = is_sphere(playerPos, rayDir, vec3(0.0, 0.0, 0.0), 1.25f);
    float near = max(dis[0], 0.0f);
    float far = min(dis[1], 10000.0f);
	
	int MAX_STEPS = 1000;
    float depth = near;
	vec3 trap = vec3(0,0,0);
	float dist = 0.0f;
    for (int i = 0; i < 10; ++i)
	{
        vec3 p = playerPos + (rayDir * depth);
        float th = 0.25 * px * depth;
        vec4 map_result = map_(p);
		dist = map_result.w;
		trap = map_result.xyz;
        if (depth > far * 0.1) // || dist < th)
            break;

        depth += dist;
        if (depth < far)
		{
            vec3 color = trap.xyz;
            return vec4(color, depth); //vec4(color, depth);
		}
	}

	return vec4(trap * clamp(depth, 0, 1), 0);
}

float scene(vec3 p)
{
	return mandelbulb(playerFacing).w;
}

void march(vec3 pos, vec3 ray, out vec3 hit)
{
	float dist = 0;
	float stepLength = 0;
	int stepCount = 0;
	do
	{
		dist += stepLength;
		++stepCount;

		vec3 p = pos + dist * ray;
		stepLength = scene(p);
	}
	while(dist < 20 && stepLength > 0.01f && stepCount < 100);
	
	vec3 p = pos + dist * ray;
	hit = p;
}

vec3 calcNormal( in vec3 p )
{
    const float eps = 0.0001;
    const vec2 h = vec2(eps,0);
    return normalize( vec3(scene(p+h.xyy) - scene(p-h.xyy),
                           scene(p+h.yxy) - scene(p-h.yxy),
                           scene(p+h.yyx) - scene(p-h.yyx) ) );
}

float calcAO(in vec3 p, in vec3 normal)
{
	const float s = 0.15;
	float v = 0;
	int div = 2;
	for	(int i = 1; i < 5; ++i, div *= 2)
	{
		float dist = s * i;
		vec3 pn = p + dist * normal;
		float fromPoint = dist / div;
		float occlusion = scene(pn) / div;
		v += fromPoint - occlusion;
	}
	return 1 - v;
}

vec4 calcColor(in vec3 p, in vec3 hit, in vec3 normal)
{
	float d = 3.1- log(length(p - hit));
	return vec4(-normal * clamp(d, 0, 1), 1);
}

vec4 color(vec3 pos, vec3 hit)
{
	vec3 normal = calcNormal(hit);
	float ao = clamp(calcAO(hit, normal), 0, 1) * 0.01f + 0.99f;
	vec4 color = vec4(map_(hit).xyz, 1.0f); // calcColor(pos, hit, normal);
	float dist = length(pos - hit) / 30;
	float fade = clamp(1 - dist, 0.1, 1);
	ao *= fade;
	return color * vec4(ao, ao, ao, 1);
}

void main()
{
	vec2 uv = gl_TexCoord[0].xy;

	vec3 pos = playerPos* 0.1f;
	vec3 forward = playerFacing;
	vec3 right = normalize(cross(vec3(0,1,0), forward));
	vec3 up = normalize(cross(right, forward));
	vec3 ray = normalize(right * (uv.x - 0.5) + up * (uv.y - 0.5) + forward);
	vec3 col = mandelbulb(ray).xyz;
	//vec3 hit;
	//march(pos, ray, hit);
	//vec4 colorOut = color(pos, hit);
	gl_FragColor = vec4(col, 1.0f);
}

//void main()
//{
//	vec2 uv = gl_TexCoord[0].xy;
//
//	vec3 pos = playerPos* 0.1f;
//	vec3 forward = playerFacing;
//	vec3 right = normalize(cross(vec3(0,1,0), forward));
//	vec3 up = normalize(cross(right, forward));
//	vec3 ray = normalize(right * (uv.x - 0.5) + up * (uv.y - 0.5) + forward);
//	vec3 hit;
//	march(pos, ray, hit);
//	vec4 colorOut = color(pos, hit);
//	gl_FragColor = colorOut;
//}
*/

// Created by evilryu
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.


// whether turn on the animation
#define phase_shift_on 

float stime, ctime;
 void ry(inout vec3 p, float a){  
 	float c,s;vec3 q=p;  
  	c = cos(a); s = sin(a);  
  	p.x = c * q.x + s * q.z;  
  	p.z = -s * q.x + c * q.z; 
 }  

float pixel_size = 0.0;

/* 

z = r*(sin(theta)cos(phi) + i cos(theta) + j sin(theta)sin(phi)

zn+1 = zn^8 +c

z^8 = r^8 * (sin(8*theta)*cos(8*phi) + i cos(8*theta) + j sin(8*theta)*sin(8*theta)

zn+1' = 8 * zn^7 * zn' + 1

*/

vec3 mb(vec3 p) {
	p.xyz = p.xzy;
	vec3 z = p;
	vec3 dz=vec3(0.0);
	float power = 8.0;
	float r, theta, phi;
	float dr = 1.0;
	
	float t0 = 1.0;
	for(int i = 0; i < 7; ++i) {
		r = length(z);
		if(r > 2.0)
			break;

		theta = atan(z.y / z.x);
        #ifdef phase_shift_on
		phi = asin(z.z / r) + time*0.03;
        #else
        phi = asin(z.z / r);
        #endif
		
		dr = pow(r, power - 1.0) * dr * power + 1.0;
	
		r = pow(r, power);
		theta = theta * power;
		phi = phi * power;
		
		z = r * vec3(cos(theta)*cos(phi), sin(theta)*cos(phi), sin(phi)) + p;
		
		t0 = min(t0, r);
	}
	return vec3(0.5 * log(r) * r / dr, t0, 0.0);
}

 vec3 scene(vec3 p){ 
	 ry(p, time*0.0);
     return mb(p); 
 } 


 float softshadow(vec3 ro, vec3 rd, float k ){ 
     float akuma=1.0,h=0.0; 
	 float t = 0.01;
     for(int i=0; i < 50; ++i){ 
         h=scene(ro+rd*t).x; 
         if(h<0.001)return 0.02; 
         akuma=min(akuma, k*h/t); 
 		 t+=clamp(h,0.01,2.0); 
     } 
     return akuma; 
 } 

vec3 nor( in vec3 pos )
{
    vec3 eps = vec3(0.001,0.0,0.0);
	return normalize( vec3(
           scene(pos+eps.xyy).x - scene(pos-eps.xyy).x,
           scene(pos+eps.yxy).x - scene(pos-eps.yxy).x,
           scene(pos+eps.yyx).x - scene(pos-eps.yyx).x ) );
}

vec3 intersect( in vec3 ro, in vec3 rd )
{
    float t = 1.0;
    float res_t = 0.0;
    float res_d = 1000.0;
    vec3 c, res_c;
    float max_error = 1000.0;
	float d = 1.0;
    float pd = 100.0;
    float os = 0.0;
    float step = 0.0;
    float error = 1000.0;
    
    for( int i=0; i<80; i++ )
    {
        if( error < pixel_size*0.5 || t > 20.0 )
        {
			break;
        }
        else{  // avoid broken shader on windows
        
            c = scene(ro + rd*t);
            d = c.x;

            if(d > os)
            {
                os = 0.4 * d*d/pd;
                step = d + os;
                pd = d;
            }
            else
            {
                step =-os; os = 0.0; pd = 100.0; d = 1.0;
            }

            error = d / t;

            if(error < max_error) 
            {
                max_error = error;
                res_t = t;
                res_c = c;
            }
        
            t += step;
        }

    }
	if( t>20.0/* || max_error > pixel_size*/ ) res_t=-1.0;
    return vec3(res_t, res_c.y, res_c.z);
}

 void main() 
 { 
	 pixel_size = 1.0f / 2000.0f;
	 
	vec2 uv = gl_TexCoord[0].xy;
	vec3 pos = playerPos* 0.1f;
	vec3 forward = playerFacing;
	vec3 right = normalize(cross(vec3(0,1,0), forward));
	vec3 up = normalize(cross(right, forward));
	vec3 rd = normalize(right * (uv.x - 0.5) + up * (uv.y - 0.5) + forward);
	vec3 ro = pos;

    vec3 sundir = normalize(vec3(0.1, 0.8, 0.6)); 
    vec3 sun = vec3(1.64, 1.27, 0.99); 
    vec3 skycolor = vec3(0.6, 1.5, 1.0); 

	vec3 bg = exp(uv.y-2.0)*vec3(0.4, 1.6, 1.0);

    float halo=clamp(dot(normalize(vec3(-ro.x, -ro.y, -ro.z)), rd), 0.0, 1.0); 
    vec3 col=bg+vec3(1.0,0.8,0.4)*pow(halo,17.0); 


    float t=0.0;
    vec3 p=ro; 
	 
	vec3 res = intersect(ro, rd);
	 if(res.x > 0.0){
		   p = ro + res.x * rd;
           vec3 n=nor(p); 
           float shadow = softshadow(p, sundir, 10.0 );

           float dif = max(0.0, dot(n, sundir)); 
           float sky = 0.6 + 0.4 * max(0.0, dot(n, vec3(0.0, 1.0, 0.0))); 
 		   float bac = max(0.3 + 0.7 * dot(vec3(-sundir.x, -1.0, -sundir.z), n), 0.0); 
           float spe = max(0.0, pow(clamp(dot(sundir, reflect(rd, n)), 0.0, 1.0), 10.0)); 

           vec3 lin = 4.5 * sun * dif * shadow; 
           lin += 0.8 * bac * sun; 
           lin += 0.6 * sky * skycolor*shadow; 
           lin += 3.0 * spe * shadow; 

		   res.y = pow(clamp(res.y, 0.0, 1.0), 0.55);
		   vec3 tc0 = 0.5 + 0.5 * sin(3.0 + 4.2 * res.y + vec3(0.0, 0.5, 1.0));
           col = lin *vec3(0.9, 0.8, 0.6) *  0.2 * tc0;
 		   col=mix(col,bg, 1.0-exp(-0.001*res.x*res.x)); 
    } 

    // post
    col=pow(clamp(col,0.0,1.0),vec3(0.45)); 
    col=col*0.6+0.4*col*col*(3.0-2.0*col);  // contrast
    col=mix(col, vec3(dot(col, vec3(0.33))), -0.5);  // satuation
	vec2 q = uv;
    col*=0.5+0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.7);  // vigneting
 	gl_FragColor = vec4(col.xyz, smoothstep(0.55, .76, 1.-res.x/5.)); 
 }
