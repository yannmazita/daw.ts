# daw.ts

Work in progress! Very early stage.

Digital Audio Workstation built with [React](https://react.dev/), [tonejs](https://tonejs.github.io/) and [electron](https://www.electronjs.org/)

![image](https://github.com/user-attachments/assets/f048b1ee-4f91-4a35-8256-787dfb45cc36)


## Running

- Install dependencies :

```commandline
npm install
```

- Start the UI with :

```commandline
npm run dev
```

The `vite` development server is now accessible `@localhost:5173`.

<details>
  <summary>Electron</summary>
  
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
Currently the electron window needs to have the development server running `@localhost:5173`.

</details>

## Architecture

Fast moving, these diagrams may get outdated quickly.

<details>
  <summary>
    State management flow
  </summary>
    <img src="https://raw.githubusercontent.com/yannmazita/daw.ts/refs/heads/main/docs/state_management_flow.png">
</details>

<details>
  <summary>
    Audio signal flow
  </summary>
    <img src="https://raw.githubusercontent.com/yannmazita/daw.ts/refs/heads/main/docs/audio_signal_flow.png">
</details>

<details>
  <summary>
    Pattern system structure
  </summary>
    <img src="https://raw.githubusercontent.com/yannmazita/daw.ts/refs/heads/main/docs/pattern_system_structure.png">
</details>

<details>
  <summary>
    State update sequence
  </summary>
    <img src="https://raw.githubusercontent.com/yannmazita/daw.ts/refs/heads/main/docs/state_update_sequence.png">
</details>
