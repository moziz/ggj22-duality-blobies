#include "Map.h"

#include <cmath>
#include "Resources.h"
#include <SFML/Window/Keyboard.hpp>
#include <random>
#include <assert.h>
#include <iostream>
#include <SFML/Graphics.hpp>
#include <SFML/System/Clock.hpp>

extern float g_deltaTime;

Map::Map()
{
	bool success = image.loadFromFile(Resources::getResources().mapName);
	assert(success);

	success = texture.loadFromImage(image);
	assert(success);

	mapVisShader = Resources::getResources().getShader(ShaderResourceName::mapVis);
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


void Map::draw()
{
	const bool hotloading = true;
	if (hotloading)
	{
		bool success = mapVisShader->loadFromFile(
			//Resources::getResourcePath("assets/shader/mapvis.frag.glsl"),
			//Resources::getResourcePath("assets/shader/lelu_sdf.glsl"),
			//Resources::getResourcePath("assets/shader/fps_sdf.glsl"),
			//Resources::getResourcePath("assets/shader/doom_sdf.glsl"),
			//Resources::getResourcePath("assets/shader/sextic.glsl"),
			//Resources::getResourcePath("assets/shader/mandelbulb.glsl"),
			Resources::getResourcePath("assets/shader/2d.glsl"),
			sf::Shader::Type::Fragment
		);

		if (!success)
		{
			render(&texture, nullptr, -0.5f, -0.5f, 1, 1);
			return;
		}
	}

	sf::Vector2i windowSizeI(g_window->getSize().x, g_window->getSize().y);
	sf::Vector2f windowSize(float(windowSizeI.x), float(windowSizeI.y));
	sf::Vector2i windowCenter = windowSizeI / 2;
	sf::Vector2i mousePixelPos = sf::Mouse::getPosition(*g_window);
	sf::Vector2i mouseDiff = mousePixelPos - windowCenter;
	sf::Vector2f mouseDelta(mouseDiff.x / windowSize.x * 2, mouseDiff.y / windowSize.y * 2);
	sf::Vector2f mousePos(mousePixelPos.x / windowSize.x, mousePixelPos.y / windowSize.y);

	//auto worldToScreen = [windowSize](sf::Vector2f pos)
	//{
	//};

	auto screenToWorld = [=](sf::Vector2f pos)
	{
		return sf::Vector2f((mousePixelPos.x - windowCenter.x) / windowSize.y + 0.5f, mousePixelPos.y / windowSize.y);
	};

	sf::Vector2f aimPos = screenToWorld(mousePos);

	//sf::Vector2f relMouseDelta(mouseDelta.x / windowSize.x, mouseDelta.y / windowSize.y);

	if (g_window->hasFocus())
	{
		g_window->setMouseCursorVisible(false);
	}
		
	static bool resetMouseOnce = true;
	if (resetMouseOnce || !g_window->hasFocus())
	{
		resetMouseOnce = false;
		mouseDelta = sf::Vector2f(0, 0);
	}

	static sf::Vector2f playerPos(0.5f, 0.5f);
	static sf::Vector2f playerRotation;
	playerRotation.x += mouseDelta.x * 0.3f;
	playerRotation.y += mouseDelta.y * 0.3f;
	if (playerRotation.y > 0.5f)
		playerRotation.y = 0.5f;
	if (playerRotation.y < -0.5f)
		playerRotation.y = -0.5f;

	auto length3 = [](sf::Vector3f a) -> float
	{
		return sqrtf(a.x * a.x + a.y * a.y + a.z * a.z);
	};

	const float pi = 3.14159f;
	sf::Vector3f playerFacing;
	playerFacing.x = sin(playerRotation.x * pi);
	playerFacing.y = -sin(playerRotation.y * pi);
	playerFacing.z = cos(playerRotation.x * pi);
	playerFacing /= length3(playerFacing);

	float xInput = 0, yInput = 0, zInput = 0;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Left) || sf::Keyboard::isKeyPressed(sf::Keyboard::A))
		++xInput;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Right) || sf::Keyboard::isKeyPressed(sf::Keyboard::D))
		--xInput;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Up) || sf::Keyboard::isKeyPressed(sf::Keyboard::W))
		++yInput;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Down) || sf::Keyboard::isKeyPressed(sf::Keyboard::S))
		--yInput;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::Space))
		++zInput;
	if (sf::Keyboard::isKeyPressed(sf::Keyboard::LControl) || sf::Keyboard::isKeyPressed(sf::Keyboard::RControl))
		--zInput;

	if (g_window->hasFocus())
	{
		sf::Vector2f xMovement = sf::Vector2f(-1.0f, 0.0f) * xInput;
		sf::Vector2f yMovement = sf::Vector2f(0.0f, -1.0f) * yInput;
		playerPos += (yMovement + xMovement) * 0.01f * g_deltaTime * 60.0f;;
	}

	static std::vector<sf::Vector2f> enemyDeath;
	static std::vector<sf::Clock> enemyDeathClock;

	static std::vector<sf::Vector2f> enemyPoss;
	static std::vector<sf::Vector2f> enemyBlobs;
	static sf::Clock enemySpawnCounter;
	if (enemySpawnCounter.getElapsedTime().asSeconds() > 1.0f && enemyPoss.size() < 40)
	{
		enemySpawnCounter.restart();
		float r = std::rand() / float(RAND_MAX) * 3.14f * 2.0f;
		enemyPoss.push_back(sf::Vector2f(std::sinf(r), std::cosf(r)) * 0.75f + sf::Vector2f(0.5f, 0.5f));
		float rx = std::rand() / float(RAND_MAX) - 0.5f;
		float ry = std::rand() / float(RAND_MAX) - 0.5f;
		enemyBlobs.push_back(enemyPoss.back() + sf::Vector2f(rx, ry) * 0.1f);
	}

	for (int i = 0; i < enemyPoss.size(); ++i)
	{
		sf::Vector2f dir = playerPos - enemyBlobs[i];
		dir = dir / length(dir);
		enemyPoss[i] += dir * 0.001f;
		enemyBlobs[i] += dir * 0.001f;
	}

	static std::vector<sf::Vector2f> grenadePoss;
	static std::vector<sf::Vector2f> grenadeFacings;
	static std::vector<sf::Clock> grenadeClocks;

	static std::vector<sf::Vector2f> splosionPoss;
	static std::vector<sf::Clock> splosionClocks;

	static sf::Vector2f lazerStart;
	static sf::Vector2f lazerEnd;
	static sf::Clock lazerClock;
	const float lazerCooldown = 0.0f;
	const float lazerDuration = 0.4f;
	const float lazerLength = 0.3f;
	const float lazerWidth = 0.013f;

	{
		static bool wasPressed = false;
		if (!sf::Mouse::isButtonPressed(sf::Mouse::Left))
		{
			wasPressed = false;
		}
		else if (g_window->hasFocus() && !wasPressed && sf::Mouse::isButtonPressed(sf::Mouse::Left))
		{
			static volatile float grenadeFlightSpeed = 0.01f;

			wasPressed = true;
			sf::Vector2f grenadeDirection = aimPos - playerPos;
			grenadePoss.emplace_back(playerPos.x, playerPos.y);
			grenadeFacings.push_back(grenadeDirection / length(grenadeDirection) * grenadeFlightSpeed);
			grenadeClocks.emplace_back();
		}
	}

	if (lazerClock.getElapsedTime().asSeconds() > lazerCooldown)
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

			for (int i = 0; i < enemyPoss.size(); i++)
			{
				float dist = distanceFromLine(lazerStart, lazerEnd, enemyPoss[i]);
				if (dist < lazerWidth)
				{
					enemyDeath.push_back(enemyBlobs[i]);
					enemyDeathClock.emplace_back();

					enemyPoss.erase(enemyPoss.begin() + i);
					enemyBlobs.erase(enemyBlobs.begin() + i);
					--i;
				}
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

	sf::Time grenadeFlightDuration = sf::seconds(0.5f);

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

	float lazerProgress = lazerClock.getElapsedTime() / sf::seconds(lazerDuration);
	if (lazerProgress >= 0.0 && lazerProgress <= 1.0)
	{
		mapVisShader->setUniform("lazer_start", lazerStart);
		mapVisShader->setUniform("lazer_end", lazerEnd);
		mapVisShader->setUniform("lazer_progress", lazerClock.getElapsedTime() / sf::seconds(lazerDuration));
	}

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

	static sf::Clock t;
	mapVisShader->setUniform("time", t.getElapsedTime().asSeconds());

	render(&texture, mapVisShader.get(), -0.5f, -0.5f, 1, 1);
}
