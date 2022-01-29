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

	sf::Image image;
	sf::Texture texture;
	std::unique_ptr<sf::Shader> mapVisShader;
};

