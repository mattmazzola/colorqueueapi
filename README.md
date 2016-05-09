# ColorQueue API

REST API for communication with Firebase server and adding color data. The color data in firebase would then be watched by another application such as [ColorQueue-Firebase](https://github.com/mattmazzola/colorqueue-firebase) which would transfer the color data to a physical LED strip.

## Setup

Clone repository
```
git clone https://github.com/mattmazzola/colorqueueapi.git
```

Install Dependencies
```
npm install
typings install
```

Build
```
tsc -p .
```

Add configuration file `config.json` in root directory
```
{
  "firebaseSecret": "<your firebase secret>",
  "firebaseUid": "<your firebase unique id>"
}
```
> This server uses custom token authentication to firebase with this unique id and this allows you to add security rules on your firebase server to protect writes from unintended clients. 

Run Service
```
node dist/index.js
```

## API

Add Color
```
POST /colors

{
  r: 100,
  g: 200,
  b: 255,
  a: 1,
  order: 1462779724666,
  duration: 30000,
  transition: "linear"
}
```

Remove Color
```
DELETE /colors/1462779724666
```

Clear All Colors
```
POST /clear
```
