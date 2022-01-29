#version 120

uniform vec2 playerPos;
uniform vec2 aimDirection;
uniform int bulletCount;
uniform vec3[] bulletPosArray;
uniform vec3[] bulletFacingArray;
uniform float[] bulletTimeArray;
uniform float time;

//const int enemy_max = 2;
//const vec2[] enemies = vec2[enemy_max]( vec2(0.2, 0.2), vec2(0.8, 0.8) );
uniform int enemies_count;
uniform vec2[] enemies;

//const int blobies_count= 2;
//const vec2[] blobies = vec2[blobies_count]( vec2(0.25, 0.2), vec2(0.77, 0.8) );
uniform int blobies_count;
uniform vec2[] blobies;

uniform int deaths_count;
uniform vec2[] deaths;
uniform float[] deaths_progress;

//const int splosions_count = 3;
//const vec2[] splosions = vec2[splosions_max]( vec2(0.255, 0.2), vec2(0.74, 0.8), vec2(0.2, 0.21) );
//const float[] splosions_progress = float[splosions_max](0.0f, 0.33f, 0.66f);
uniform int splosions_count;
uniform vec2[] splosions;
uniform float[] splosions_progress;

//const vec2[] grenades = vec2[grenades_max](vec2(0.4,0.4), vec2(0.6, 0.45));
uniform int grenades_count;
uniform vec2[] grenades;

uniform vec2 lazer_start;
uniform vec2 lazer_end;
uniform float lazer_progress;

const vec4 pParam = vec4( 17.0*17.0, 34.0, 1.0, 7.0);
const float pi = 3.141;
const float pi2 = pi * 2;

float s(float a, float b, float x)
{
	return a + (b - a) * smoothstep(-1, 1, sin(x));
}

/*
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
*/

#define REPEAT_10(X, i) \
	X(i * 10 + 0);\
	X(i * 10 + 1);\
	X(i * 10 + 2);\
	X(i * 10 + 3);\
	X(i * 10 + 4);\
	X(i * 10 + 5);\
	X(i * 10 + 6);\
	X(i * 10 + 7);\
	X(i * 10 + 8);\
	X(i * 10 + 9);\
	
#define REPEAT_40(X) \
	REPEAT_10(X, 0) \
	REPEAT_10(X, 1) \
	REPEAT_10(X, 2) \
	REPEAT_10(X, 3) \

vec4 drawBlobies(vec2 pos)
{
	float resultHeight = 0.0;

	#define BLOBIES(i) \
	if (i < blobies_count) \
	{ \
		vec2 obj = blobies[i]; \
		float radius = 0.1 + s(0.0, 0.03, mod(time, float(i) * 0.5) * s(.0, 1., float(i) + time * mod(float(i), 7.5))); \
		float dist = length(pos - obj); \
		float height = smoothstep(0.0, 0.3, 1 - dist / radius); \
		resultHeight = max(resultHeight, height); \
	} \
	
	REPEAT_40(BLOBIES);

	#define DEATHS(i) \
	if (i < deaths_count) \
	{ \
		vec2 obj = deaths[i]; \
		float radius = 0.1 + s(0.0, 0.03, mod(time, float(i) * 0.5) * s(.0, 1., float(i) + time * mod(float(i), 7.5))); \
		radius *= 1 - deaths_progress[i]; \
		float dist = length(pos - obj); \
		float height = smoothstep(0.0, 0.3, 1 - dist / radius); \
		resultHeight = max(resultHeight, height); \
	} \
	
	REPEAT_40(DEATHS);

	return vec4(0,1,0,resultHeight);
}

vec4 drawSplosions(vec2 pos)
{
	vec3 resultColor = vec3(0,0,0);
	float resultHeight = 0.0;
	
	#define SPLOSION(i) \
	if (i < splosions_count) \
	{ \
		vec2 obj = splosions[i]; \
		float progress = mod(splosions_progress[i], 1.0); \
		float depth_mult = 1 - progress; \
		float radius_mult = 1 -(1-progress)*(1-progress)*(1-progress)*(1-progress); \
		float radius = 0.1 * radius_mult; \
		float dist = length(pos - obj); \
		float height = smoothstep(0.0, 1.0, 1 - dist / radius) * depth_mult; \
		vec3 color = vec3(1, 1, 0) * (1 - progress); \
		resultHeight += height; \
		resultColor += color;  \
	} \
	
	REPEAT_40(SPLOSION);

	{
		vec2 obj = playerPos;
		float progress = 0.15 + s(0.8f, 1.2f, time * 5.);
		float depth_mult = 1 - progress;
		float radius_mult = 1 -(1-progress)*(1-progress)*(1-progress)*(1-progress);
		float radius = 0.1 * radius_mult;
		float dist = length(pos - obj);
		float height = smoothstep(0.0, 0.3, 1 - dist / radius) * depth_mult;
		resultHeight += height;
		vec3 color = vec3(1, 1, 0) * (1 - progress);
		resultColor += color;
	}

	return vec4(normalize(resultColor),resultHeight);
}

vec4 drawEnemies(vec2 pos)
{
	float resultHeight = 0.0;
	
	#define ENEMY(i) \
	if (i < enemies_count) \
	{ \
		vec2 obj = enemies[i]; \
		float radius = 0.01; \
		float dist = length(pos - obj); \
		float height = smoothstep(0.0, 1.0, 1 - dist / radius); \
		resultHeight = max(resultHeight, height); \
	} \
	
	REPEAT_40(ENEMY);

	return vec4(1,0,0,resultHeight);
}

vec4 drawPlayer(vec2 pos)
{
	vec2 obj = playerPos.xy;
	float radius = 0.03;
	float dist = length(pos - obj);
	float height = smoothstep(0.0, 0.3, 1 - dist / radius);
	return vec4(0,0,1,height);
}

vec4 drawAim(vec2 pos)
{
	vec2 obj = aimDirection;
	float radius = 0.013;
	float dist = length(pos - obj);
	float height = smoothstep(0.0, 0.3, 1 - dist / radius) * 1.2;
	return vec4(0.8,0.8,0.1,height);
}

vec4 drawLazer(vec2 pos)
{
	vec2 a = lazer_start;
	vec2 d = lazer_end - lazer_start;
	float t = ((pos.x - a.x) * d.x + (pos.y - a.y) * d.y) / (d.x * d.x + d.y * d.y);
	float radius = 0.013 * s(1.0, 0.0, lazer_progress);
	float dist = length((a + d * t) - pos);
	float height = smoothstep(0.0, 0.3, 1 - dist / radius) * 1.2;
	return vec4(1,1,1,height);
}

vec4 drawGrenades(vec2 pos)
{
	float resultHeight = 0.0;

	#define GRENADE(i) \
	if (i < grenades_count) \
	{ \
		vec2 obj = grenades[i]; \
		float radius = 0.02; \
		float dist = length(pos - obj); \
		float height = smoothstep(0.0, 0.9, 1 - dist / radius); \
		resultHeight = max(resultHeight, height); \
	} \
	
	REPEAT_40(GRENADE);

	return vec4(0.4,0.9,0.7,resultHeight);
}

vec4 scene(vec2 pos)
{
	vec4 blobWeight = drawBlobies(pos);
	vec4 world = blobWeight;
	float base = s(0.05, 0.3, s(0, 1, pos.x * s(5, 9, time * 2.) + time * 4) + s(0, 1, pos.y * s(5.1, 9.4, time*2.5) + time * 3.5) + time*1.4);
	world.w = max(world.w, base);

	vec4 splosionWeight = drawSplosions(pos);
	{
		float mult = splosionWeight.w;
		world.w -= mult;
		world.xyz *= world.w;
		world.xyz += splosionWeight.xyz * mult;
	}

	vec4 enemyWeight = drawEnemies(pos);
	if (enemyWeight.w > 0)
	{
		float blend = smoothstep(world.w, world.w + .4, enemyWeight.w);
		world = vec4(enemyWeight.xyz * blend + world.xyz * (1-blend), enemyWeight.w);
	}

	vec4 playerWeight = drawPlayer(pos);
	{
		float blend = smoothstep(world.w, world.w + 0.1, playerWeight.w);
		world = vec4(playerWeight.xyz * blend + world.xyz * (1-blend), playerWeight.w);
	}
	
	vec4 aimWeight = drawAim(pos);
	{
		float blend = smoothstep(world.w, world.w + 0.1, aimWeight.w);
		world = vec4(aimWeight.xyz * blend + world.xyz * (1-blend), aimWeight.w);
	}

	vec4 lazerWeight = drawLazer(pos);
	{
		float blend = smoothstep(world.w, world.w + 0.1, lazerWeight.w);
		world = vec4(lazerWeight.xyz * blend + world.xyz * (1-blend), lazerWeight.w);
	}

	vec4 grenadeWeight = drawGrenades(pos);
	{
		float blend = smoothstep(world.w, world.w + 0.1, grenadeWeight.w);
		world = vec4(grenadeWeight.xyz * blend + world.xyz * (1-blend), grenadeWeight.w);
	}

	world.w = 1;
	return world;
}

void main()
{
	vec2 uv = gl_TexCoord[0].xy;

	vec4 colorOut = scene(uv);
	gl_FragColor = colorOut;
}
