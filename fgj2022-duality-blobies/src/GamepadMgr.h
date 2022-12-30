// Copyright(c) 2021 Guido Dev
// https://github.com/GuidoBisocoli/SFML_GamepadSupport/
// See GamepadMgr.cpp for full license

#pragma once

class Gamepad;

class GamepadMgr
{
	public:
		static GamepadMgr& Instance() {
			static GamepadMgr theGamepadMgr;
			return theGamepadMgr;
		}

		void Initialize();

		Gamepad* GamepadOne() { return _gamepadOne; }
		Gamepad* GamepadTwo() { return _gamepadTwo; }

		static bool HasGamepad() { return GamepadMgr::Instance().GamepadOne() != nullptr; }
		static Gamepad& GetGamepad() { return *GamepadMgr::Instance().GamepadOne(); }

	private:
		GamepadMgr(); // ctor hidden
		GamepadMgr(GamepadMgr const&) = delete;
		GamepadMgr& operator=(GamepadMgr const&) = delete;
		~GamepadMgr() {} // dtor hidden

		// Gamepads
		Gamepad* _gamepadOne;		
		Gamepad* _gamepadTwo;
};
