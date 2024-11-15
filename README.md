# daw.ts

Work in progress! Very early stage.

Digital Audio Workstation built with [React](https://react.dev/), [tonejs](https://tonejs.github.io/) and [electron](https://www.electronjs.org/)

![image](https://github.com/user-attachments/assets/a9649ccc-c8d0-4d51-a9a3-464dea30ad52)


## Running
- Install dependencies :
```commandline
npm install
```
- Start the UI with :
```commandline
npm run dev
```
The `vite` development server is now accessible @`localhost:5173`.

- Start the `electron` development app with :
```commandline
npm run app:dev
```
- Build the electron app with:
```commandline
npm run app electron:build
```
- Clean build files with:
```commandline
npm run clean
```

More building commands are defined in `package.json`.
Currently the electron window needs to have the development server running @`localhost:5173`.
