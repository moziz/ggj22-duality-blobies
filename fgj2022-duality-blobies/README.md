# Duality Blobies
Fend off a growing horde of blood thirsty blobs. Reveal a their weak points with anti-blob bombs (Mouse1) and finish them with a lazer (Mouse2). Dying blobs spread anti-blob effect to their neighbors. Dive into their fractal base to destroy them once and for all... It can't go on forever... Right?

Successfully hitting a weak point with the lazer let's you shoot again faster. Additionally every consequent lazer hit grows a combo multiplier that makes you dive faster towards your destination at the end of infinity.

# Controls
W,A,S,D - Move
Mouse1 - Non-lethal anti-blob bomb
Mouse2 - Lethal lazer
H - Toggle screenshake
R - Reset

# Building on Linux
Just works - I guess

# Building on Windows (Visual Studio 2019)
- In Visual Studio open "local folder"
- Should notice cmake automatically (wait around 10 seconds)
- Add debug config and add "currentDir": "${projectDir}" under "configuration" array
- (OR just copy util/visual-studio/launch.vs.json >> .vs/launch.vs.json)
- Select "ggj22.exe" in the "Show/Hide Debug Targets..." dropdown dialog
- Press F5 ("Start Debugging")

## missing OpenAL32.dll or shader (Windows)
- Select ggj22 (executable) Add debug config and add  "currentDir": "${projectDir}" under "configuration" array

# Building on a Mac

- You need to install SMFL as a framework as pointed in https://www.sfml-dev.org/tutorials/2.5/start-osx.php
- You can find XCode project file inside 
```
\util\fgj2022-duality-blobies\fgj2022-duality-blobies.xcodeproj folder
```
- You might need to sign Frameworks, then use codesigning https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/Procedures/Procedures.html
```
codesign -s <identity> <code-path>
```

You might be able to build without xcode, but I don't know how :)
- tominDayroll325
