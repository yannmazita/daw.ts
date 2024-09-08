# daw.ts

Work in progress! Very early stage.
Digital Audio Workstation built with [vue](https://vuejs.org/), [tonejs](https://tonejs.github.io/) and [electron](https://www.electronjs.org/)


[demo.mp4](https://github.com/user-attachments/assets/c770a4fd-16d4-4ab7-8394-521e64280193)




## Running
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
