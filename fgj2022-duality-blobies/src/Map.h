#pragma once

#include "Global.h"

struct Map
{
	Map();
	void draw();
	static void reset(Map*& self);

	std::vector<sf::Vector2f> grenadePoss;
	std::vector<sf::Vector2f> grenadeFacings;
	std::vector<sf::Clock> grenadeClocks;

	std::vector<sf::Vector2f> splosionPoss;
	std::vector<sf::Clock> splosionClocks;

	sf::Vector2f laserStart;
	sf::Vector2f laserEnd;
	sf::Clock laserClock;
	float laserScope = 1.0f;
	float currentlaserCooldownCurrent = 0.5f;

	std::vector<sf::Vector2f> enemyDeath;
	std::vector<sf::Clock> enemyDeathClock;

	std::vector<sf::Vector2f> enemyPoss;
	std::vector<sf::Vector2f> enemyBlobs;
	sf::Clock enemySpawnCounter;
	bool playerSpawningDone = false;

	sf::Vector2f playerPos = sf::Vector2f(0.5f, 0.5f);
	sf::Vector2f playerSpeed = sf::Vector2f(0.0f, 0.0f);
	float playerHealth = 1.0f;
	float playerShield = 1.0f;
	int score = 0;
	int combo = 0;
	bool menuOpen = false;
};

