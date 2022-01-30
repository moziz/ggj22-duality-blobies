#pragma once

#include <SFML/Graphics/Texture.hpp>
#include <SFML/Graphics/Shader.hpp>
#include <memory>
#include "Global.h"

const sf::Vector2f mapSize(100, 100);
const sf::Vector2f topLeft = mapSize * -0.5f;
const float maxHealth = 1024;

enum class Item : sf::Uint8
{
	JewelS,
	JewelM,
	JewelL,
	Dynamite,
	AfrikanTahti,
};

enum class ItemState : sf::Uint8
{
	// muokatkaa/tehk‰‰ jotai n‰il lol, synkkaan n‰‰ t vesa
	OnWorld,
	Carried,
	Usable,
	Destructed
};



struct Treasure
{
	Item item;
	sf::Vector2f pos;
    float health = maxHealth;
	sf::Uint8 id;
};

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

	sf::Vector2f lazerStart;
	sf::Vector2f lazerEnd;
	sf::Clock lazerClock;
	float currentLazerCooldownCurrent = 0.5f;

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

