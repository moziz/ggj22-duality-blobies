#include "Map.h"

#include <cmath>
#include <SFML/Window/Keyboard.hpp>
#include <random>
#include <assert.h>
#include <SFML/Graphics.hpp>
#include <SFML/System/Clock.hpp>

#ifdef TARGET_OS_MAC
#include "ResourcePath.hpp"
#else
std::string resourcePath(void)
{
	return "";
}
#endif

extern float g_deltaTime;

static bool initialized = false;
static sf::Texture* texture = nullptr;
static sf::Shader* mapVisShader = nullptr;
extern sf::Clock timeFromStart;

static std::string getResourcePath(const char* assetPath)
{
	return resourcePath() + assetPath;
}


Map::Map()
{
	if (!initialized)
	{
		initialized = true;

		texture = new sf::Texture();
		bool success = texture->create(1, 1);
		assert(success);

		mapVisShader = new sf::Shader();
		mapVisShader->loadFromFile(
			getResourcePath("assets/shader/2d.glsl"),
			sf::Shader::Type::Fragment
		);
	}
}

static float length(sf::Vector2f a)
{
	return sqrtf(a.x * a.x + a.y * a.y);
};

static float distanceFromLine(sf::Vector2f a, sf::Vector2f b, sf::Vector2f pos)
{
	sf::Vector2f d = b - a;
	float t = ((pos.x - a.x) * d.x + (pos.y - a.y) * d.y) / (d.x * d.x + d.y * d.y);
	float dist = length((a + d * t) - pos);
	return dist;
}

static void render(const sf::Texture* texture, const sf::Shader* shader, float x, float y, float w, float h)
{
	assert(texture);

	sf::RenderStates states = sf::RenderStates::Default;
	states.texture = texture;
	if (shader)
		states.shader = shader;

	sf::Vertex vertices[4] = {};
	{
		sf::Vector2f pos(x * g_resolution.y + g_resolution.x * 0.5f, y * g_resolution.y + 0.5f * g_resolution.y);
		sf::Vector2f size(w * g_resolution.y, h * g_resolution.y);

		float left = pos.x;
		float right = pos.x + size.x;
		float top = pos.y;
		float bottom = pos.y + size.y;
		vertices[0].position = sf::Vector2f(left, top);
		vertices[1].position = sf::Vector2f(left, bottom);
		vertices[2].position = sf::Vector2f(right, top);
		vertices[3].position = sf::Vector2f(right, bottom);
	}

	{
		sf::Color color = sf::Color::White;
		vertices[0].color = color;
		vertices[1].color = color;
		vertices[2].color = color;
		vertices[3].color = color;
	}

	{
		sf::Vector2u textureSize = texture->getSize();
		float left = 0.0f * textureSize.x;
		float right = (0.0f + 1.0f) * textureSize.x;
		float top = 0.0f * textureSize.y;
		float bottom = (0.0f + 1.0f) * textureSize.y;
		vertices[0].texCoords = sf::Vector2f(left, top);
		vertices[1].texCoords = sf::Vector2f(left, bottom);
		vertices[2].texCoords = sf::Vector2f(right, top);
		vertices[3].texCoords = sf::Vector2f(right, bottom);
	}

	g_window->draw(vertices, 4, sf::TriangleStrip, states);
}


void Map::reset(Map*& self)
{
	sf::Vector2f playerPos = self->playerPos;
	std::vector<sf::Vector2f> deaths;
	
	std::vector<sf::Clock> deathClocks;
	deaths.swap(self->enemyDeath);
	deathClocks.swap(self->enemyDeathClock);

	deaths.insert(deaths.end(), self->enemyBlobs.begin(), self->enemyBlobs.end());
	deathClocks.resize(deaths.size());

	delete self;
	self = new Map();

	self->playerPos = playerPos;
	self->enemyDeath.swap(deaths);
	self->enemyDeathClock.swap(deathClocks);
}

void Map::draw()
{
	const bool hotloading = true;
	if (hotloading)
	{
		bool success = mapVisShader->loadFromFile(
			getResourcePath("assets/shader/2d.glsl"),
			sf::Shader::Type::Fragment
		);

		if (!success)
		{
			render(texture, nullptr, -0.5f, -0.5f, 1, 1);
			return;
		}
	}

	sf::Vector2i windowSizeI(g_window->getSize().x, g_window->getSize().y);
	sf::Vector2f windowSize(float(windowSizeI.x), float(windowSizeI.y));
	sf::Vector2i windowCenter = windowSizeI / 2;
	sf::Vector2i mousePixelPos = sf::Mouse::getPosition(*g_window);
	sf::Vector2f mousePos(mousePixelPos.x / windowSize.x, mousePixelPos.y / windowSize.y);

	auto screenToWorld = [=](sf::Vector2f pos)
	{
		return sf::Vector2f((mousePixelPos.x - windowCenter.x) / windowSize.y + 0.5f, mousePixelPos.y / windowSize.y);
	};

	sf::Vector2f aimPos = screenToWorld(mousePos);

	if (g_window->hasFocus())
	{
		g_window->setMouseCursorVisible(false);
	}

	bool playerBeingDamaged = false;
	const float healthDamageDuration = 2.0f;
	const float shieldDamageDuration = 0.5f;
	const float shieldRecoveryDuration = 2.0f;
	const float healthRegenDuration = 10.0f;
	const float pi = 3.14159f;

	float xInput = 0, yInput = 0, zInput = 0;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Left) || sf::Keyboard::isKeyPressed(sf::Keyboard::A))
		++xInput;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Right) || sf::Keyboard::isKeyPressed(sf::Keyboard::D))
		--xInput;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Up) || sf::Keyboard::isKeyPressed(sf::Keyboard::W))
		++yInput;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Down) || sf::Keyboard::isKeyPressed(sf::Keyboard::S))
		--yInput;

	static bool screenShake = false;

	{
		static bool wasPressed = false;
		if (wasPressed && !sf::Keyboard::isKeyPressed(sf::Keyboard::H))
		{
			wasPressed = false;
		}

		if (!wasPressed && sf::Keyboard::isKeyPressed(sf::Keyboard::H))
		{
			wasPressed = true;
			screenShake = !screenShake;
		}
	}

	{
		static bool wasPressed = false;
		if (wasPressed && !sf::Keyboard::isKeyPressed(sf::Keyboard::P))
		{
			wasPressed = false;
		}

		if (!wasPressed && sf::Keyboard::isKeyPressed(sf::Keyboard::P))
		{
			wasPressed = true;
			menuOpen = !menuOpen;
		}
	}

	if (!playerSpawningDone)
	{
		sf::Vector2f target(0.5f, 0.5f);
		playerPos = lerpVector2f(playerPos, target, 4.0f * g_deltaTime);
		if (length(playerPos - target) < 0.01f)
			playerSpawningDone = true;
	}

	
	if (playerSpawningDone)
	{
		sf::Vector2f xMovement = sf::Vector2f(-1.0f, 0.0f) * xInput;
		sf::Vector2f yMovement = sf::Vector2f(0.0f, -1.0f) * yInput;
		sf::Vector2f acc;
		if (g_window->hasFocus())
		{
			acc = (yMovement + xMovement);
			float speed = length(acc);
			if (speed > 1.0)
				acc /= speed;
		}

		playerSpeed = lerpVector2f(playerSpeed, acc, fminf(1.0f, 10.0f * fminf(0.033f, g_deltaTime)));
		playerPos += playerSpeed * 0.01f * fminf(0.033f, g_deltaTime) * 60.0f;
	}

	float spawnDelay = 1.01f - fmaxf(0.0f, fminf(1.0f, score / 10000.0f));

	const float enemyDamageRadius = 0.1f;
	if (enemySpawnCounter.getElapsedTime().asSeconds() > spawnDelay && enemyPoss.size() < 40)
	{
		enemySpawnCounter.restart();
		float r = std::rand() / float(RAND_MAX) * pi * 2.0f;
		enemyPoss.push_back(sf::Vector2f(sinf(r), cosf(r)) * 0.75f + sf::Vector2f(0.5f, 0.5f));
		float rx = std::rand() / float(RAND_MAX) - 0.5f;
		float ry = std::rand() / float(RAND_MAX) - 0.5f;
		enemyBlobs.push_back(enemyPoss.back() + sf::Vector2f(rx, ry) * 0.1f);
	}

	float enemySpeed = 1.0f + score / 10000.0f;

	for (int i = 0; i < enemyPoss.size(); ++i)
	{
		sf::Vector2f dir = playerPos - enemyBlobs[i];
		dir = dir / length(dir);
		dir = dir * 0.001f * 60.0f * g_deltaTime * enemySpeed;
		enemyPoss[i] += dir;
		enemyBlobs[i] += dir;

		if (length(playerPos - enemyBlobs[i]) < enemyDamageRadius)
		{
			playerBeingDamaged = true;
			if (playerShield > 0)
			{
				playerShield -= g_deltaTime / shieldDamageDuration;
			}

			if (playerShield <= 0)
			{
				playerShield = 0;
				playerHealth -= g_deltaTime / healthDamageDuration;
			}
		}
	}

	if (playerPos.x < 0 || playerPos.y < 0 || playerPos.x > 1 || playerPos.y > 1)
	{
		// Player out of bounds
		playerBeingDamaged = true;
		if (playerShield > 0)
		{
			playerShield -= g_deltaTime / shieldDamageDuration;
		}

		if (playerShield <= 0)
		{
			playerShield = 0;
			playerHealth -= g_deltaTime / healthDamageDuration;
		}
	}


	if (!playerBeingDamaged && playerShield >= 1 && playerHealth < 1)
	{
		playerHealth = fminf(1.0f, playerHealth + g_deltaTime / healthRegenDuration);
	}

	if (!playerBeingDamaged && playerShield < 1)
	{
		playerShield = fminf(1.0f, playerShield + g_deltaTime / shieldRecoveryDuration);
	}

	const float lazerCooldown = 0.5f;
	const float lazerMissedCooldown = 2.0f;
	const float lazerDuration = 0.51f;
	const float lazerLength = 0.3f;
	const float lazerWidth = 0.02f;

	{
		static bool wasPressed = false;
		if (!sf::Mouse::isButtonPressed(sf::Mouse::Left))
		{
			wasPressed = false;
		}
		else if (g_window->hasFocus() && !wasPressed && sf::Mouse::isButtonPressed(sf::Mouse::Left))
		{
			const float grenadeFlightSpeed = 0.01f;

			wasPressed = true;
			sf::Vector2f grenadeDirection = aimPos - playerPos;
			grenadePoss.emplace_back(playerPos.x, playerPos.y);
			grenadeFacings.push_back(grenadeDirection / length(grenadeDirection) * grenadeFlightSpeed);
			grenadeClocks.emplace_back();
		}
	}

	if (lazerClock.getElapsedTime().asSeconds() > currentLazerCooldownCurrent)
	{
		static bool wasPressed = false;
		if (!sf::Mouse::isButtonPressed(sf::Mouse::Right))
		{
			wasPressed = false;
		}
		else if (g_window->hasFocus() && !wasPressed && sf::Mouse::isButtonPressed(sf::Mouse::Right))
		{
			wasPressed = true;

			lazerClock.restart();

			sf::Vector2f lazerDirection = playerPos - aimPos;
			lazerStart = playerPos;
			lazerEnd = playerPos + lazerDirection / length(lazerDirection) * lazerLength;

			int hitCount = 0;

			for (int i = 0; i < enemyPoss.size(); i++)
			{
				float dist = distanceFromLine(lazerStart, lazerEnd, enemyPoss[i]);
				if (dist < lazerWidth)
				{
					enemyDeath.push_back(enemyBlobs[i]);
					enemyDeathClock.emplace_back();

					splosionPoss.push_back(enemyPoss[i]);
					splosionClocks.emplace_back();

					enemyPoss.erase(enemyPoss.begin() + i);
					enemyBlobs.erase(enemyBlobs.begin() + i);
					--i;

					hitCount += 1;
				}
			}

			if (hitCount == 0)
			{
				combo = 0;
				currentLazerCooldownCurrent = lazerMissedCooldown;
			}
			else
			{
				score += combo * hitCount;
				combo += hitCount;
				currentLazerCooldownCurrent = lazerCooldown;
			}
		}
	}

	const sf::Time enemyDeathDuration = sf::seconds(1.0f);
	std::vector<float> enemyDeathProgress;
	for (int i = 0; i < enemyDeath.size(); ++i)
	{
		if (enemyDeathClock[i].getElapsedTime() > enemyDeathDuration)
		{
			enemyDeath.erase(enemyDeath.begin() + i);
			enemyDeathClock.erase(enemyDeathClock.begin() + i);
			--i;
			continue;
		}

		enemyDeathProgress.push_back(enemyDeathClock[i].getElapsedTime() / enemyDeathDuration);
	}

	sf::Time grenadeFlightDuration = sf::seconds(0.3f);

	for (int i = 0; i < grenadePoss.size(); ++i)
	{
		if (grenadeClocks[i].getElapsedTime() > grenadeFlightDuration)
		{
			splosionPoss.push_back(grenadePoss[i]);
			splosionClocks.emplace_back();

			grenadePoss.erase(grenadePoss.begin() + i);
			grenadeFacings.erase(grenadeFacings.begin() + i);
			grenadeClocks.erase(grenadeClocks.begin() + i);
			--i;

			continue;
		}

		grenadePoss[i] += grenadeFacings[i] * g_deltaTime * 60.0f;
	}
		
	sf::Time splosionDuration = sf::seconds(4.0f);

	std::vector<float> splosionTimes;
	for (int i = 0; i < splosionPoss.size(); ++i)
	{
		if (splosionClocks[i].getElapsedTime() > splosionDuration)
		{
			splosionPoss.erase(splosionPoss.begin() + i);
			splosionClocks.erase(splosionClocks.begin() + i);
			--i;
			continue;
		}

		splosionTimes.push_back(splosionClocks[i].getElapsedTime() / splosionDuration);
	}

	mapVisShader->setUniform("playerPos", playerPos);
	mapVisShader->setUniform("aimDirection", aimPos);

	mapVisShader->setUniform("playerHealth", playerHealth);
	mapVisShader->setUniform("playerShield", playerShield);
	mapVisShader->setUniform("playerBeingDamaged", playerBeingDamaged);

	float lazerProgress = lazerClock.getElapsedTime() / sf::seconds(lazerDuration);
	float lazerCooldownProgress = lazerClock.getElapsedTime() / sf::seconds(currentLazerCooldownCurrent);
	if (lazerProgress >= 0.0 && lazerProgress <= 1.0)
	{
		mapVisShader->setUniform("lazer_start", lazerStart);
		mapVisShader->setUniform("lazer_end", lazerEnd);
		mapVisShader->setUniform("lazer_progress", lazerProgress);
	}
	mapVisShader->setUniform("lazer_cooldown", lazerCooldownProgress);

	if (grenadePoss.size() > 0)
	{
		mapVisShader->setUniform("grenades_count", int(grenadePoss.size()));
		mapVisShader->setUniformArray("grenades", grenadePoss.data(), grenadePoss.size());
	}

	if (splosionPoss.size() > 0)
	{
		mapVisShader->setUniform("splosions_count", int(splosionPoss.size()));
		mapVisShader->setUniformArray("splosions", splosionPoss.data(), splosionPoss.size());
		mapVisShader->setUniformArray("splosions_progress", splosionTimes.data(), splosionTimes.size());
	}

	if (enemyPoss.size() > 0)
	{
		mapVisShader->setUniform("enemies_count", int(enemyPoss.size()));
		mapVisShader->setUniformArray("enemies", enemyPoss.data(), enemyPoss.size());
	}

	if (enemyBlobs.size() > 0)
	{
		mapVisShader->setUniform("blobies_count", int(enemyBlobs.size()));
		mapVisShader->setUniformArray("blobies", enemyBlobs.data(), enemyBlobs.size());
	}

	if (enemyDeathProgress.size() > 0)
	{
		mapVisShader->setUniform("deaths_count", int(enemyDeath.size()));
		mapVisShader->setUniformArray("deaths", enemyDeath.data(), enemyDeath.size());
		mapVisShader->setUniformArray("deaths_progress", enemyDeathProgress.data(), enemyDeathProgress.size());
	}

	mapVisShader->setUniform("time", timeFromStart.getElapsedTime().asSeconds());

	static float scoreBlend = 0.0f;
	static float comboBlend = 0.0f;

	auto lerp = [](float a, float b)
	{
		float r = a + (b - a) * (1.0f * g_deltaTime);
		r = fmaxf(fminf(a, b), fminf(r, fmaxf(a, b)));
		return r;
	};

	scoreBlend = lerp(scoreBlend, float(score));
	comboBlend = lerp(comboBlend, float(combo));

	mapVisShader->setUniform("score", scoreBlend);
	mapVisShader->setUniform("combo", comboBlend);

	{
		sf::Vector2f s = sf::Vector2f(1, 1) * fmaxf(windowSize.x / windowSize.y, 1.0f);

		sf::Vector2f p = s * -0.5f;

		if (screenShake)
		{
			auto smoothstep = [](float a, float b, float t)
			{
				float f = (t - a) / (b - a);
				return fminf(1.0, fmaxf(0.0, f));
			};

			auto normalize = [](sf::Vector2f v)
			{
				return v / fmaxf(0.0001f, length(v));
			};

			p += normalize(lazerEnd - lazerStart) * smoothstep(0.3f, 0.0f, lazerClock.getElapsedTime().asSeconds()) * 0.006f;


			for (int i = 0; i < grenadePoss.size(); ++i)
			{
				p += normalize(-grenadeFacings[i]) * smoothstep(0.3f, 0.0f, grenadeClocks[i].getElapsedTime().asSeconds()) * 0.001f;
			}
		}

		render(texture, mapVisShader, p.x, p.y, s.x, s.y);
	}
}

/*
// TODO:
 * kranaatti nollaa/vähentää komboa?
*/