#include "Game.h"

#include "GuiRendering.h"
#include "GuiRenderingState.h"
#include "SfmlGuiRendering.h"
#include "GuiRenderInfo.h"
#include "Mankka.h"
#include "Resources.h"
#include <algorithm>
#include <cmath>
#include <SFML/Window/Mouse.hpp>
#include "Map.h"

std::string g_currentTextInput;
sf::Vector2f g_resolution{ 1280,720 };
sf::Clock syncClock;
sf::Clock timeFromStart;
sf::Time syncCycle = sf::seconds(0.1f);
bool Game::showDebugText = false;

Game::Game()
{
}

void Game::update(sf::Time elapsedTime)
{
}

static void encodeAnsi(sf::Uint32 codepoint, std::back_insert_iterator<std::string> output, char replacement = '?', const std::locale &locale = std::locale())
{
    // NOTE: Copied from SFML/System/Utf.inl Utf<32>::encodeAnsi to avoid template errors
    
    // On Windows, gcc's standard library (glibc++) has almost
    // no support for Unicode stuff. As a consequence, in this
    // context we can only use the default locale and ignore
    // the one passed as parameter.

#if defined(SFML_SYSTEM_WINDOWS) &&                       /* if Windows ... */                          \
    (defined(__GLIBCPP__) || defined (__GLIBCXX__)) &&     /* ... and standard library is glibc++ ... */ \
    !(defined(__SGI_STL_PORT) || defined(_STLPORT_VERSION)) /* ... and STLPort is not used on top of it */

    (void)locale; // to avoid warnings

    char character = 0;
    if (wctomb(&character, static_cast<wchar_t>(codepoint)) >= 0)
        *output++ = character;
    else if (replacement)
        *output++ = replacement;

    return output;

#else

    // Get the facet of the locale which deals with character conversion
    const std::ctype<wchar_t> &facet = std::use_facet< std::ctype<wchar_t> >(locale);

    // Use the facet to convert each character of the input string
    *output++ = facet.narrow(static_cast<wchar_t>(codepoint), replacement);
#endif
}

void Game::textInput(sf::Uint32 unicode)
{
    if (unicode == 8) // backspace
    {
        while (g_currentTextInput.length() > 0 && (g_currentTextInput.back() & 0b11000000) == 0b10000000)
        {
            g_currentTextInput.resize(g_currentTextInput.length() - 1u);
        }

        if (g_currentTextInput.length() > 0)
            g_currentTextInput.resize(g_currentTextInput.length() - 1u);

        return;
    }

    encodeAnsi(unicode, std::back_inserter(g_currentTextInput), '?');
}

void Game::draw(sf::RenderWindow& window)
{
    map.draw();
}

void Game::gui(sf::RenderWindow& window)
{
}
