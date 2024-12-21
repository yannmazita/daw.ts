# daw.ts

Work in progress! Very early stage.

Digital Audio Workstation built with [React](https://react.dev/), [tonejs](https://tonejs.github.io/) and [electron](https://www.electronjs.org/)

![image](https://github.com/user-attachments/assets/5d798ab2-17f1-4c88-9834-e2952439a62b)

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

As the source code is fast moving, the documentation may lag behind a bit.

<details>
  <summary>
    High-level components
  </summary>

The DAW application is built with a layered architecture consisting of:

- User Interface Layer: React components and UI logic
- Engine Layer: Core DAW functionality
- Audio Processing Layer: Audio handling via Tone.js
- State Management Layer: Zustand-based state management

The engine layer consists of five main engines:

1. **Transport Engine**: Handles playback, timing, and tempo
2. **Clip Engine**: Manages audio and MIDI clip content
3. **Mix Engine**: Controls audio routing and processing
4. **Automation Engine**: Handles parameter automation
5. **Arrangement Engine**: Coordinates track organization and timeline

```mermaid
graph TB
    UI[User Interface Layer]
    ENG[Engine Layer]
    AUDIO[Audio Processing Layer]
    STATE[State Management Layer]

    UI --> ENG
    ENG --> AUDIO
    ENG --> STATE

    subgraph "Engine Layer"
        TE[Transport Engine]
        CE[Clip Engine]
        ME[Mix Engine]
        AE[Automation Engine]
        ARE[Arrangement Engine]

        ARE --> TE
        ARE --> CE
        ARE --> ME
        ARE --> AE
    end

    subgraph "Audio Processing Layer"
        ToneJS[Tone.js]
        WebAudio[Web Audio API]

        ToneJS --> WebAudio
    end

    subgraph "State Management Layer"
        ZS[Zustand Store]
        PS[Persistent Storage]

        ZS --> PS
    end
```

</details>

<details>
  <summary>
    Engine interaction diagram
  </summary>

Engines communicate through:

- Direct method calls for immediate operations
- State updates
- Planned: event system?

This sequence diagram describes the current state of implementation, a lot is missing.

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant AE as Arrangement Engine
    participant TE as Transport Engine
    participant CE as Clip Engine
    participant ME as Mix Engine
    participant Store as Engine Store

    UI->>AE: Create Track
    AE->>ME: Create Mixer Channel
    ME->>Store: Update Mix State
    AE->>Store: Update Arrangement State

    UI->>AE: Add Clip
    AE->>CE: Schedule Clip
    CE->>TE: Get Transport Time
    CE->>Store: Update Clip State
    AE->>Store: Update Track State
```

</details>

<details>
  <summary>
    State management flow
  </summary>

Work in progress:

- Uses Zustand for centralized state management
- Separates persistent and non-persistent state
- Maintains atomic updates for consistency
- Handles audio buffer and node references separately

```mermaid
graph LR
    subgraph "Engine State"
        TS[Transport State]
        CS[Clip State]
        MS[Mix State]
        AS[Automation State]
        ARS[Arrangement State]
    end

    subgraph "Persistence Layer"
        PS[Persistent State]
        subgraph "Non-Persistable"
            AB[Audio Buffers]
            AN[Audio Nodes]
        end
    end

    TS --> PS
    CS --> PS
    MS --> PS
    AS --> PS
    ARS --> PS

    CS -.-> AB
    MS -.-> AN
```

</details>

<details>
  <summary>
    Audio signal flow
  </summary>

```mermaid
graph LR
    subgraph "Track Chain"
        Input[Track Input]
        PreFX[Pre-FX Chain]
        Channel[Channel Strip]
        PostFX[Post-FX Chain]
        Output[Track Output]

        Input --> PreFX
        PreFX --> Channel
        Channel --> PostFX
        PostFX --> Output
    end

    subgraph "Sends"
        PreS[Pre-Fader Send]
        PostS[Post-Fader Send]

        Channel --> PreS
        PostFX --> PostS
    end

    subgraph "Master Section"
        Master[Master Channel]
        MFX[Master FX]
        Out[Main Output]

        Output --> Master
        PreS --> Master
        PostS --> Master
        Master --> MFX
        MFX --> Out
    end
```

</details>
