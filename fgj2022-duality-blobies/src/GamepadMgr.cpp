// MIT License
// 
// Copyright(c) 2021 Guido Dev
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this softwareand associated documentation files(the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and /or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions :
// 
// The above copyright noticeand this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// https://github.com/GuidoBisocoli/SFML_GamepadSupport/
//

#include "GamepadMgr.h"
#include "Gamepad.h"
/// XInput
#include "Windows.h"
#include "Xinput.h"
#pragma comment(lib,"XInput.lib") // include libraries
#pragma comment(lib,"Xinput9_1_0.lib") // include libraries

GamepadMgr::GamepadMgr()
{
	_gamepadOne = nullptr;
	_gamepadTwo = nullptr;
}

void GamepadMgr::Initialize()
{
	// Determine connected joysticks and if they are XInput or not
	/*
	Example: 2 gamepads connected, one XInput and another not XInput
	The XInput device will be number 0 for XInput, but for SFML it can be 0 or 1
	- We need to determine how many XInput devices are connected and assign their
	numbers accordingly.
	*/

	int totalJoysticksConnected = 0;
	int numberOfXInputDevices = 0;
	for (int i = 0; i < 2; i++) {
		if (sf::Joystick::isConnected(i)) totalJoysticksConnected++;

		/// XINPUT
		DWORD dwResult;
		XINPUT_STATE state;
		ZeroMemory(&state, sizeof(XINPUT_STATE));
		dwResult = XInputGetState(i, &state);

		if (dwResult == ERROR_SUCCESS) // XBOX Controller is connected
			numberOfXInputDevices++;
	}

	if (totalJoysticksConnected == 0) return;
	if (totalJoysticksConnected == 1 && numberOfXInputDevices == 0) {
		_gamepadOne = new Gamepad(0, false);
	}
	else if (totalJoysticksConnected == 1 && numberOfXInputDevices == 1) {
		_gamepadOne = new Gamepad(0, true);
	}
	else if (totalJoysticksConnected == 2 && numberOfXInputDevices == 2) {
		_gamepadOne = new Gamepad(0, true);
		_gamepadTwo = new Gamepad(1, true);
	}
	else if (totalJoysticksConnected == 2 && numberOfXInputDevices == 0) {
		_gamepadOne = new Gamepad(0, false);
		_gamepadTwo = new Gamepad(1, false);
	}
	else if (totalJoysticksConnected == 2 && numberOfXInputDevices == 1) {
		// The XInput device will be number 0 for XInput, but we don't know the number
		// assigned for SFML, could be 0 or 1.

		// Check db, if vendorID is Microsoft (5e04 -> 0x045e Hex -> 1118 decimal)
		// then that's XInput. It will leave out XBOX controllers by other manufacturers,
		// but they will be handled by SDL's DB

		sf::Joystick::Identification data = sf::Joystick::getIdentification(0);
		int MicrosoftVendorID = 1118;
		if (data.vendorId == MicrosoftVendorID) { // For the XInput Gamepad XInput number and SFML number coincide = 0
			_gamepadOne = new Gamepad(0, true); // XInput Gamepad
			_gamepadTwo = new Gamepad(1, false); // The other Gamepad
		}
		else { // For the XInput Gamepad XInput number is 0 and SFML number is 1
			_gamepadOne = new Gamepad(0, false); // The other Gamepad
			_gamepadTwo = new Gamepad(0, true); // XInput Gamepad
		}
	}
}


