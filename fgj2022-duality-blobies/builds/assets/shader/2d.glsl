#version 120

uniform float time;
uniform float score;
uniform float combo;

uniform vec2 playerPos;
uniform float playerHealth;
//const float playerHealth = 1.0;
uniform float playerShield;
uniform bool playerBeingDamaged;

uniform vec2 aimDirection;
uniform vec2 lazer_start;
uniform vec2 lazer_end;
uniform float lazer_progress;
uniform float lazer_cooldown;


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

const vec4 pParam = vec4( 17.0*17.0, 34.0, 1.0, 7.0);
const float pi = 3.14159;
const float pi2 = pi * 2;

float s(float a, float b, float x)
{
	return a + (b - a) * smoothstep(-1, 1, sin(x));
}

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

	return vec4(0.2,1,0.3,resultHeight);
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
		float radius = 0.3 * radius_mult; \
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
	vec3 color = vec3(0.9,2.0,0) * smoothstep(0.3, 1.0, lazer_cooldown) + vec3(0,0,1.2);
	if (playerBeingDamaged)
	{
		color = vec3(0, 0.8, 3);
		color += vec3(1, -2, -2) * smoothstep(0,1,1-playerShield);
	}
	return vec4(color,height);
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
	float radius = 0.02 * s(1.0, 0.0, lazer_progress);
	float dist = length((a + d * t) - pos);
	float height = smoothstep(0.0, 0.8, 1 - dist / radius) * 1.2;
	return vec4(1,2,3,height);
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
		world = vec4(enemyWeight.xyz * blend + world.xyz * (1-blend), max(world.w, enemyWeight.w));
	}

	vec4 playerWeight = drawPlayer(pos);
	if (playerWeight.w > world.w)
	{
		float blend = smoothstep(world.w, world.w + 0.1, playerWeight.w);
		world = vec4(playerWeight.xyz * blend + world.xyz * (1-blend), playerWeight.w);
	}
	
	vec4 aimWeight = drawAim(pos);
	if (aimWeight.w > world.w)
	{
		float blend = smoothstep(world.w, world.w + 0.1, aimWeight.w);
		world = vec4(aimWeight.xyz * blend + world.xyz * (1-blend), aimWeight.w);
	}

	vec4 lazerWeight = drawLazer(pos);
	if (lazerWeight.w > world.w)
	{
		float blend = smoothstep(world.w, world.w + 0.1, lazerWeight.w);
		world = vec4(lazerWeight.xyz * blend + world.xyz * (1-blend), lazerWeight.w);
	}

	vec4 grenadeWeight = drawGrenades(pos);
	if (grenadeWeight.w > world.w)
	{
		float blend = smoothstep(world.w, world.w + 0.1, grenadeWeight.w);
		world = vec4(grenadeWeight.xyz * blend + world.xyz * (1-blend), grenadeWeight.w);
	}

	//world.w = 1;
	return world;
}


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
		phi = asin(z.z / r) + score*0.001 - time*0.01;
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
    
    for( int i=0; i < 80; i++ )
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

 vec4 bg(vec2 uv)
 { 
	pixel_size = 1.0f / 2000.0f;
	 
	vec3 pos = vec3(0.,2.5f,-0.02f) + (playerPos.xyy + aimDirection.xyy * 0.5 - vec3(0.75)) * 0.075;
	vec3 forward = vec3(0.,-1.0 - smoothstep(0, 20, float(combo)),.02);
	vec3 right = normalize(cross(vec3(0,1,0), forward));
	vec3 up = normalize(cross(right, forward));
	vec3 rd = normalize(right * (uv.x - 0.5) + up * (uv.y - 0.5) + forward);
	vec3 ro = pos;

    vec3 sundir = normalize(vec3(0.1, 0.8, 0.6)); 
    vec3 sun = vec3(1.64, 1.27, 0.99); 
    vec3 skycolor = vec3(0.6, 1.5, 0.1); 

	vec3 bg = exp(uv.y-2.0)*vec3(0.4, 1.6, 0.2);

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
           col = lin *vec3(0.9, 0.8, 0.1) *  0.2 * tc0;
 		   col=mix(col,bg, 1.0-exp(-0.001*res.x*res.x)); 
    } 

    // post
    col=pow(clamp(col,0.0,1.0),vec3(0.45)); 
    col=col*0.6+0.4*col*col*(3.0-2.0*col);  // contrast
    col=mix(col, vec3(dot(col, vec3(0.33))), -0.5);  // satuation
	//vec2 q = uv;
    //col*=0.5+0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.7);  // vigneting
 	return vec4(col.xyz, smoothstep(0.55, .76, 1.-res.x/5.)); 
 }


void main()
{
	vec2 uv = gl_TexCoord[0].xy;

	vec4 colorOut = scene(uv);
	colorOut.w *= 0.9;
	{
		vec4 bg_color = bg(uv);
		colorOut = colorOut * colorOut.w + bg_color * (1.0 - colorOut.w);
		colorOut.w = 1.0;
	}
	
	vec2 q = uv;
	colorOut.xyz*=vec3(1,0.3,0.1) + vec3(0,0.7,0.7)*smoothstep(0, 1.0, playerHealth);
    colorOut*=0.5+0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.7);  // vigneting
	gl_FragColor = colorOut;
}
