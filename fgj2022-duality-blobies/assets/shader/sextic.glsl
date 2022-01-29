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

/*float scene(vec3 p)
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
}*/

float scene(vec3 p)
{
	p = p * 0.03f * (1 + sin(time) * 0.01f);
	float x2 = p.x * p.x;
	float y2 = p.y * p.y;
	float z2 = p.z * p.z;
	float phi = (1 + sqrt(5)) / 2;
	float phi2 = phi * phi;
	float alpha = 0.4f + 0.1f * sin(time);
	float plane1 = phi2 * x2 - y2;
	float plane2 = phi2 * y2 - z2;
	float plane3 = phi2 * z2 - x2;
	float planes = plane1 * plane2 * plane3;
	float sextic = (alpha * (1 + 2 * phi) / 2);
	float sphere = x2 + y2 + z2 + 1;
	float result = planes - sextic; // * sphere;
	return abs(planes);
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
	float ao = calcAO(hit, normal);
	vec4 color = calcColor(pos, hit, normal);
	float dist = length(pos - hit) / 30;
	float fade = clamp(1 - dist, 0.1, 1);
	ao *= fade;
	return color * vec4(ao, ao, ao, 1);
}

void main()
{
	vec2 uv = gl_TexCoord[0].xy;

	vec3 pos = playerPos;
	vec3 forward = playerFacing;
	vec3 right = normalize(cross(vec3(0,1,0), forward));
	vec3 up = normalize(cross(right, forward));
	vec3 ray = normalize(right * (uv.x - 0.5) + up * (uv.y - 0.5) + forward);
	vec3 hit;
	march(pos, ray, hit);
	vec4 colorOut = color(pos, hit);
	gl_FragColor = colorOut;
}
